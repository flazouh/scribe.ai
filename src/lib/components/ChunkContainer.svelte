<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Loader2 } from "lucide-svelte";
  import {
    ChunkStatus,
    type ChunkProcessingData,
  } from "../../routes/transcription/types";

  export let chunk: ChunkProcessingData;

  let isEditing = false;
  let editedText = "";


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
    {#if chunk.status !== ChunkStatus.FINISHED}
      <Loader2 class="mr-2 h-4 w-4 animate-spin text-violet-500" />
    {/if}
    <span class="font-medium">
      Chunk {chunk.id + 1} - {chunk.status}
    </span>
  </div>

  {#if chunk.transcription}
    <div class="space-y-2">
      <h4 class="font-medium">Raw Transcription:</h4>
      <p class="text-sm text-gray-700">{chunk.transcription}</p>
      <Button
        variant="outline"
        size="sm"
        on:click={() => copyToClipboard(chunk.transcription || "")}
      >
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
          <Button
            variant="outline"
            size="sm"
            on:click={() => (isEditing = false)}>Cancel</Button
          >
        </div>
      {:else}
        <p class="text-sm text-gray-700">{chunk.correction}</p>
        <div class="space-x-2">
          <Button
            variant="outline"
            size="sm"
            on:click={() => copyToClipboard(chunk.correction || "")}
          >
            Copy Corrected
          </Button>
          <Button
            variant="outline"
            size="sm"
            on:click={() => startEditing(chunk.correction || "")}
          >
            Edit
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</div>
