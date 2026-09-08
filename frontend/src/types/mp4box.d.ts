declare module 'mp4box' {
  export interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number;
  }

  export interface MP4Track {
    id: number;
    codec: string;
    description: any;
  }

  export interface MP4Info {
    tracks: MP4Track[];
  }

  export interface MP4Sample {
    is_sync: boolean;
    data: ArrayBuffer;
    cts: number;
    timescale: number;
    duration: number;
  }

  export interface MP4File {
    appendBuffer(data: MP4ArrayBuffer): number;
    onReady: (info: MP4Info) => void;
    onSamples: (id: number, user: any, samples: MP4Sample[]) => void;
    onError: (e: string) => void;
    setExtractionOptions(id: number, user?: any, options?: any): void;
    start(): void;
    stop(): void;
    flush(): void;
  }

  export function createFile(): MP4File;
}
