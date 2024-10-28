import { io, Socket } from 'socket.io-client';
import { getAPIEndpoint } from '$lib/utils/api';

export interface TranscriptionPayload {
    buffer: ArrayBuffer;
}

export enum TranscriptionWebsocketMessages {
    REQUEST_TRANSCRIPTION = "request_transcription",
    TEST = "test",
}

export enum TranscriptionWebsocketNamespaces {
    TRANSCRIPTION = "transcription",
}

export type WebSocketPayloads = {
    [TranscriptionWebsocketMessages.REQUEST_TRANSCRIPTION]: TranscriptionPayload;
    [TranscriptionWebsocketMessages.TEST]: { message: string };
};

export interface WebSocketConfig<C> {
    namespace: string;
    callbacks: C;
}

interface AuthenticatedWebSocketMessageBody<T> {
    payload: T;
}


class WebSocketManager<C> {
    connect() {
        this.socket.connect();
    }
    isConnected() {
        return this.socket.connected;
    }
    private socket!: Socket;
    private config: WebSocketConfig<C>;

    constructor(config: WebSocketConfig<C>) {
        this.config = config;
        this.initializeSocket();
    }

    private async initializeSocket() {
        const url = getAPIEndpoint(this.config.namespace);

        this.socket = io(url, {
            transports: ["websocket"],
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.socket.on("connect", () => {
            console.log(`Connected to WebSocket at ${this.config.namespace}`);
        });

        this.socket.on("disconnect", () => {
            console.log(`Disconnected from WebSocket at ${this.config.namespace}`);
        });

        this.socket.on("connect_error", (error) => {
            console.error(`Failed to connect to WebSocket at ${this.config.namespace}:`, error);
        });

        for (const [event, callback] of Object.entries(this.config.callbacks)) {
            if (callback) {
                this.socket.on(event, (payload: WebSocketPayloads[T]) => callback(payload));
            }
        }
    }

    async send({ payload, message }: { payload: WebSocketPayloads[T]; message: T; }) {
        const messageBody: AuthenticatedWebSocketMessageBody<WebSocketPayloads[T]> = {
            payload,
        };


        this.socket.emit(message, messageBody);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

export default WebSocketManager;