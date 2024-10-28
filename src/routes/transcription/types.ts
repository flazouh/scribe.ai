export interface TranscriptionPayload {
    buffer: ArrayBuffer;
}

export interface ProcessStartedPayload {
    message: string;
}

export enum ChunkStatus {
    SPLITTING = 'splitting',
    TRANSCRIBING = 'transcribing',
    CORRECTING = 'correcting',
    FINISHED = "finished",
}

export interface ChunkProcessingData {
    id: number;
    status: ChunkStatus;
    transcription?: string;
    correction?: string;
}

export interface ProcessingPayload {
    chunks: ChunkProcessingData[];
}

export interface ProcessFinishedPayload {
    message: string;
    error?: string;
}

export interface ErrorPayload {
    message: string;
}


export enum TranscriptionEvents {
    PROCESS_STARTED = 'transcription:process_started',
    PROCESSING = 'transcription:processing',
    PROCESS_FINISHED = 'transcription:process_finished',
}

export interface TranscripEventCallbacks {
    [TranscriptionEvents.PROCESS_STARTED]: (payload: ProcessStartedPayload) => void;
    [TranscriptionEvents.PROCESSING]: (payload: ProcessingPayload) => void;
    [TranscriptionEvents.PROCESS_FINISHED]: (payload: ProcessFinishedPayload) => void;
}




