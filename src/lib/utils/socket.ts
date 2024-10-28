import { io, Socket } from 'socket.io-client';
import { getAPIEndpoint } from '$lib/utils/api';

export enum WebSocketMessages {
    REQUEST_TRANSCRIPTION = 'REQUEST_TRANSCRIPTION',
}

export interface TranscriptionPayload {
    buffer: Buffer;
}

export type WebSocketPayloads = {
    [WebSocketMessages.REQUEST_TRANSCRIPTION]: TranscriptionPayload;
};

export interface WebSocketConfig<T extends WebSocketMessages, C> {
    route: string;
    outgoingMessage: T;
    callbacks: C;
}

interface AuthenticatedWebSocketMessageBody<T> {
    payload: T;
}

class WebSocketManager<T extends WebSocketMessages, C> {
    connect() {
        this.socket.connect();
    }
    isConnected() {
        return this.socket.connected;
    }
    private socket!: Socket;
    private config: WebSocketConfig<T, C>;

    constructor(config: WebSocketConfig<T, C>) {
        this.config = config;
        this.initializeSocket();
    }

    private async initializeSocket() {
        const url = getAPIEndpoint(this.config.route);

        this.socket = io(url, {
            transports: ["websocket"],
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.socket.on("connect", () => {
            console.log(`Connected to WebSocket at ${this.config.route}`);
        });

        this.socket.on("disconnect", () => {
            console.log(`Disconnected from WebSocket at ${this.config.route}`);
        });

        this.socket.on("connect_error", (error) => {
            console.error(`Failed to connect to WebSocket at ${this.config.route}:`, error);
        });

        for (const [event, callback] of Object.entries(this.config.callbacks)) {
            if (callback) {
                this.socket.on(event, (payload: WebSocketPayloads[T]) => callback(payload));
            }
        }
    }

    async send(payload: WebSocketPayloads[T]) {
        const messageBody: AuthenticatedWebSocketMessageBody<WebSocketPayloads[T]> = {
            payload,
        };


        this.socket.emit(this.config.outgoingMessage, messageBody);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

export default WebSocketManager;