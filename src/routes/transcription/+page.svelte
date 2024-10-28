<script lang="ts">
  import WebSocketManager, { TranscriptionWebsocketMessages, TranscriptionWebsocketNamespaces } from "$lib/utils/socket";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Loader2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import ChunkContainer from "$lib/components/ChunkContainer.svelte";
    import { ChunkStatus, TranscriptionEvents, type ChunkProcessingData, type TranscripEventCallbacks } from "./types";

  let chunks: ChunkProcessingData[] = [];
  let isProcessing = false;
  let audioFile: File | null = null;
  let errorMessage: string | null = null;


  const socket = new WebSocketManager<TranscripEventCallbacks>({
    namespace: TranscriptionWebsocketNamespaces.TRANSCRIPTION,
    callbacks: {
      [TranscriptionEvents.PROCESS_STARTED]: () => {
        isProcessing = true;
      },
      [TranscriptionEvents.PROCESSING]: (data) => {
        chunks = data.chunks;
      },
      [TranscriptionEvents.PROCESS_FINISHED]: ({ error, message }) => {
        isProcessing = false;
        if (error) {
          errorMessage = error;
        }
      },
    },
  });

  async function transcribeAudio() {
    if (!audioFile) return;
    const arrayBuffer = await audioFile.arrayBuffer();
    const int8array = new Uint8Array(arrayBuffer);
    socket.send({
      payload: { buffer: int8array },
      message: TranscriptionWebsocketMessages.REQUEST_TRANSCRIPTION,
    });
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    audioFile = file;
  }
  async function handleFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    audioFile = file;
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Transcribe Audio</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="space-y-6">
      <div class="space-y-2">
        <div
          class="border-2 border-dashed border-muted rounded-lg p-8 mb-4"
          on:dragover|preventDefault
          on:drop|preventDefault={handleDrop}
        >
          <input
            type="file"
            accept="audio/*"
            on:change={handleFileSelect}
            class="border border-setting-item hover:border-violet-500 flex items-center justify-center gap-2 px-2 py-1 cursor-pointer w-full rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <Button
          disabled={!audioFile || isProcessing}
          on:click={transcribeAudio}
          variant="border"
          class="relative"
        >
          {#if isProcessing}
            <Loader2 class="mr-2 h-4 w-4 animate-spin text-violet-500" />
          {/if}
          {isProcessing ? "Processing..." : "Transcribe Audio"}
        </Button>
        {#if errorMessage}
          <p class="text-red-500">{errorMessage}</p>
        {/if}
      </div>

      {#if chunks.length > 0}
        <div class="space-y-4">
          {#each chunks as chunk (chunk.id)}
            <ChunkContainer {chunk} />
          {/each}
        </div>
      {/if}

      {#if chunks.some(chunk => chunk.correction)}
        <div class="mt-4 p-4 border border-gray-300 rounded">
          <h3 class="font-bold">Concatenated Text:</h3>
          {#each chunks.map(chunk => chunk.correction) as text}
            <p class="text-sm text-gray-700">{text}</p>
          {/each}
        </div>
      {/if}
      
    </div>
  </CardContent>
</Card>
