import { useState, useEffect, useRef } from 'react';
import MP4Box, { MP4ArrayBuffer, MP4Info, MP4Sample } from 'mp4box';

const LERP_TAU = 8;
const SNAP = 0.002;
const LRU_MAX = 24;
const LEAD = 24;
const WATCHDOG_MS = 60000;

interface BankFrame {
  ts: number;
  blob: Blob;
}

export function useVideoScrub(videoSrc: string) {
  const [ready, setReady] = useState(false);
  const [painted, setPainted] = useState(false);
  const [reverted, setReverted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const bankRef = useRef<BankFrame[]>([]);
  const lruRef = useRef<Map<number, ImageBitmap>>(new Map());
  
  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const durRef = useRef(0);

  useEffect(() => {
    let unmounted = false;
    let watchdogTimer: NodeJS.Timeout;

    async function loadVideo() {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion || !('VideoDecoder' in window)) {
        setReverted(true);
        return;
      }

      watchdogTimer = setTimeout(() => {
        if (!unmounted && !ready) {
          console.warn('Video hardware decode watchdog timeout, reverting to native video seeking.');
          setReverted(true);
        }
      }, WATCHDOG_MS);

      try {
        const response = await fetch(videoSrc, { mode: 'cors' });
        const arrayBuffer = await response.arrayBuffer();
        if (unmounted) return;

        const mp4boxfile = MP4Box.createFile();
        (arrayBuffer as MP4ArrayBuffer).fileStart = 0;
        
        let videoTrackId = -1;
        let codecStr = '';

        mp4boxfile.onReady = (info: MP4Info) => {
          const vTrack = info.tracks.find((t) => t.codec.startsWith('avc') || t.codec.startsWith('hvc') || t.codec.startsWith('vp'));
          if (vTrack) {
            videoTrackId = vTrack.id;
            codecStr = vTrack.codec;
            // Provide a WebCodecs compatible string if needed
            if (codecStr.startsWith('avc1')) {
              codecStr = 'avc1.640028'; // Fallback H264 high profile
            }
            mp4boxfile.setExtractionOptions(videoTrackId);
            mp4boxfile.start();
          } else {
            setReverted(true);
          }
        };

        let offscreenCanvas = new OffscreenCanvas(1920, 1080);
        let ctx = offscreenCanvas.getContext('2d');
        let decodeQueue = 0;

        const decoder = new VideoDecoder({
          output: async (frame) => {
            if (unmounted) {
              frame.close();
              return;
            }
            if (ctx) {
              ctx.drawImage(frame, 0, 0, 1920, 1080);
              const blob = await offscreenCanvas.convertToBlob({ type: 'image/webp', quality: 0.82 });
              bankRef.current.push({ ts: frame.timestamp, blob });
              bankRef.current.sort((a, b) => a.ts - b.ts);
            }
            frame.close();
            decodeQueue--;
            
            if (bankRef.current.length > 30 && !ready) {
              setReady(true);
              clearTimeout(watchdogTimer);
            }
          },
          error: (e) => {
            console.error('VideoDecoder error', e);
            setReverted(true);
            clearTimeout(watchdogTimer);
          }
        });

        let seenKeyFrame = false;

        mp4boxfile.onSamples = (id, user, samples) => {
          if (id === videoTrackId) {
            if (decoder.state === 'unconfigured') {
              decoder.configure({
                codec: codecStr,
                hardwareAcceleration: 'prefer-hardware'
              });
            }

            const processSamples = async () => {
              for (const sample of samples) {
                if (unmounted) return;
                
                if (!seenKeyFrame) {
                  if (sample.is_sync) {
                    seenKeyFrame = true;
                  } else {
                    continue; // Drop delta frames until first keyframe
                  }
                }

                while (decodeQueue > LEAD) {
                  await new Promise(r => setTimeout(r, 10));
                }

                const chunk = new EncodedVideoChunk({
                  type: sample.is_sync ? 'key' : 'delta',
                  timestamp: (sample.cts * 1000000) / sample.timescale,
                  duration: (sample.duration * 1000000) / sample.timescale,
                  data: sample.data,
                });
                decodeQueue++;
                try {
                  decoder.decode(chunk);
                } catch (e) {
                  // Ignore DataError (key frame required), the decoder will recover when it hits the next keyframe
                }
              }
            };
            processSamples();
          }
        };

        mp4boxfile.appendBuffer(arrayBuffer as MP4ArrayBuffer);
        mp4boxfile.flush();
      } catch (e) {
        console.error(e);
        setReverted(true);
      }
    }

    loadVideo();

    return () => {
      unmounted = true;
      clearTimeout(watchdogTimer);
    };
  }, [videoSrc]);

  useEffect(() => {
    let unmounted = false;
    let lastTime = performance.now();

    const drawFrame = async () => {
      if (!canvasRef.current || !ready || reverted) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const bank = bankRef.current;
      if (bank.length === 0) return;

      const currentTs = currentRef.current * 1000000;
      
      let low = 0, high = bank.length - 1;
      let nearestIndex = 0;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (bank[mid].ts < currentTs) {
          low = mid + 1;
          nearestIndex = mid;
        } else {
          high = mid - 1;
        }
      }

      if (low < bank.length && Math.abs(bank[low].ts - currentTs) < Math.abs(bank[nearestIndex].ts - currentTs)) {
        nearestIndex = low;
      }

      const lru = lruRef.current;
      
      for (let i = Math.max(0, nearestIndex - 1); i <= Math.min(bank.length - 1, nearestIndex + 2); i++) {
        if (!lru.has(i)) {
          const bitmap = await createImageBitmap(bank[i].blob);
          if (unmounted) return;
          lru.set(i, bitmap);
          if (lru.size > LRU_MAX) {
            const firstKey = lru.keys().next().value;
            if (firstKey !== undefined) {
              lru.get(firstKey)?.close();
              lru.delete(firstKey);
            }
          }
        }
      }

      const img = lru.get(nearestIndex);
      if (img) {
        ctx.clearRect(0, 0, 1920, 1080);
        ctx.drawImage(img, 0, 0, 1920, 1080);
        if (!painted) setPainted(true);
      }
    };

    const onFrame = (time: number) => {
      if (unmounted) return;
      
      const deltaSeconds = (time - lastTime) / 1000;
      lastTime = time;
      const dt = Math.min(0.1, deltaSeconds);

      // Recompute span
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollMax > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollMax)) : 0;
      setScrollProgress(p);

      const dur = videoRef.current?.duration || 0;
      durRef.current = dur;

      if (dur > 0) {
        targetRef.current = p * dur;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
          currentRef.current = targetRef.current;
        } else {
          currentRef.current += (targetRef.current - currentRef.current) * (1 - Math.exp(-dt * LERP_TAU));
          if (Math.abs(targetRef.current - currentRef.current) < SNAP) {
            currentRef.current = targetRef.current;
          }
        }

        if (ready && !reverted) {
          drawFrame();
        } else if (videoRef.current) {
          if (Math.abs(videoRef.current.currentTime - currentRef.current) > 0.05) {
            videoRef.current.currentTime = currentRef.current;
          }
        }
      }

      requestAnimationFrame(onFrame);
    };

    const rAF = requestAnimationFrame(onFrame);
    return () => {
      unmounted = true;
      cancelAnimationFrame(rAF);
    };
  }, [ready, reverted, painted]);

  return { scrollProgress, canvasRef, videoRef, ready, painted, reverted };
}
