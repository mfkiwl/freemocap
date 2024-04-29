export type OnMessageHandler = (ev: MessageEvent<Blob>, data_url: string) => Promise<void>;

export enum CaptureType {
    BoardDetection = "board_detection", SkeletonDetection = "skeleton_detection", ConnectCameras = "connect"
}

export class FrameCapture {
    private _ws_connection!: WebSocket;
    private readonly _host: string;
    private readonly _base_host: string;


    constructor(private readonly _captureType: CaptureType = CaptureType.BoardDetection,
                private readonly _port: number = 8000) {
        this._base_host = `ws://localhost:${_port}/ws`;
        this._host = `${this._base_host}/${this._captureType}`
        console.log(`FrameCapture: ${this._host}`)
    }

    private _current_data_url!: string;

    public get current_data_url(): string {
        return this._current_data_url;
    }

    public get isConnectionClosed(): boolean {
        return this._ws_connection.readyState === this._ws_connection.CLOSED;
    }

    public start_frame_capture(onMessageHandler: OnMessageHandler) {
        console.log(`FrameCapture: start_frame_capture: ${this._host}`)
        this._ws_connection = new WebSocket(this._host);
        this._ws_connection.onmessage = async (ev: MessageEvent<Blob>) => {
            console.debug(`FrameCapture: onmessage: ${ev.data}`)
            if (this._current_data_url) {
                URL.revokeObjectURL(this._current_data_url);
            }
            const new_data_url = URL.createObjectURL(ev.data);
            this._current_data_url = new_data_url;
            await onMessageHandler(ev, new_data_url);
        }
    }

    public cleanup() {
        this._ws_connection.close();
    }
}

