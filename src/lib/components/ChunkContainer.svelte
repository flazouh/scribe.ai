<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import type { ChunkProcessingData } from "$lib/types/transcription";
  import { ChunkStatus } from "$lib/types/transcription";

  export let chunk: ChunkProcessingData;
  
  let isEditing = false;
  let editedText = '';

  function getStatusColor(status: ChunkStatus): string {
    switch (status) {
      case ChunkStatus.SPLITTING: return "bg-yellow-500";
      case ChunkStatus.TRANSCRIBING: return "bg-blue-500";
      case ChunkStatus.CORRECTING: return "bg-green-500";
      default: return "bg-gray-500";
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function startEditing(text: string) {
    editedText = text;
    isEditing = true;
  }

  function saveEdit() {
    chunk.correction = editedText;
    isEditing = false;
  }
</script>

<div class="border rounded-lg p-4 mb-4 space-y-4">
  <div class="flex items-center gap-2">
    <div class={`h-3 w-3 rounded-full ${getStatusColor(chunk.status)}`}></div>
    <span class="font-medium">Chunk {chunk.id + 1} - {chunk.status}</span>
  </div>

  {#if chunk.transcription}
    <div class="space-y-2">
      <h4 class="font-medium">Raw Transcription:</h4>
      <p class="text-sm text-gray-700">{chunk.transcription}</p>
      <Button variant="outline" size="sm" on:click={() => copyToClipboard(chunk.transcription)}>
        Copy Raw
      </Button>
    </div>
  {/if}

  {#if chunk.correction}
    <div class="space-y-2">
      <h4 class="font-medium">Corrected Text:</h4>
      {#if isEditing}
        <Textarea bind:value={editedText} rows={4} />
        <div class="space-x-2">
          <Button variant="default" size="sm" on:click={saveEdit}>Save</Button>
          <Button variant="outline" size="sm" on:click={() => isEditing = false}>Cancel</Button>
        </div>
      {:else}
        <p class="text-sm text-gray-700">{chunk.correction}</p>
        <div class="space-x-2">
          <Button variant="outline" size="sm" on:click={() => copyToClipboard(chunk.correction)}>
            Copy Corrected
          </Button>
          <Button variant="outline" size="sm" on:click={() => startEditing(chunk.correction)}>
            Edit
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</div>
