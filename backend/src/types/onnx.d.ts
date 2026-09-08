declare module 'onnxruntime-node' {
  export class InferenceSession {
    static create(uriOrBuffer: string | ArrayBuffer, options?: any): Promise<InferenceSession>;
    run(feeds: Record<string, any>, options?: any): Promise<Record<string, any>>;
  }
  export class Tensor {
    constructor(type: string, data: Float32Array | number[], dims: number[]);
    readonly data: any;
    readonly dims: readonly number[];
    readonly type: string;
  }
}
