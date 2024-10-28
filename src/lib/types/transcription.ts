export enum ChunkStatus {
  SPLITTING = 'SPLITTING',
  TRANSCRIBING = 'TRANSCRIBING',
  CORRECTING = 'CORRECTING'
}

export interface ChunkProcessingData {
  id: number;
  status: ChunkStatus;
  transcription?: string;
  correction?: string;
}

export enum TranscriptionEvents {
  PROCESSING = 'transcription:processing'
}
