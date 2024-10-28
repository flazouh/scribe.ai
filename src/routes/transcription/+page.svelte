<script lang="ts">
  import { onMount } from 'svelte';
  import { socket } from '$lib/utils/socket';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import ChunkContainer from "$lib/components/ChunkContainer.svelte";
  import type { ChunkProcessingData } from "$lib/types/transcription";
  import { TranscriptionEvents } from "$lib/types/transcription";

  let fileInput: HTMLInputElement;
  let chunks: ChunkProcessingData[] = [];
  let isProcessing = false;

  onMount(() => {
    socket.on(TranscriptionEvents.PROCESSING, (data: { chunks: ChunkProcessingData[] }) => {
      chunks = data.chunks;
    });

    return () => {
      socket.off(TranscriptionEvents.PROCESSING);
    };
  });

  async function handleFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    isProcessing = true;
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/transcription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      isProcessing = false;
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Transcribe Audio</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="space-y-6">
      <div class="space-y-2">
        <input
          type="file"
          accept="audio/*"
          bind:this={fileInput}
          on:change={handleFileSelect}
          class="hidden"
        />
        <Button
          on:click={() => fileInput.click()}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Upload Audio File'}
        </Button>
      </div>

      {#if chunks.length > 0}
        <div class="space-y-4">
          {#each chunks as chunk (chunk.id)}
            <ChunkContainer {chunk} />
          {/each}
        </div>
      {/if}
    </div>
  </CardContent>
</Card>
