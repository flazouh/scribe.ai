<script lang="ts">
  import { onMount } from 'svelte';
  import { FFmpeg } from '@ffmpeg/ffmpeg';
  import { fetchFile, toBlobURL } from '@ffmpeg/util';
  import JSZip from 'jszip';

  let audioFile: File | null = null;
  let chunkSize = 60; // Default chunk size in seconds
  let ffmpeg: FFmpeg;
  let loaded = false;
  let loading = false;
  let message = '';
  let error = '';

  onMount(async () => {
    ffmpeg = new FFmpeg();
    ffmpeg.on('log', ({ message: msg }) => {
      message = msg;
      console.log(msg);
    });
  });

  async function load() {
    loading = true;
    error = '';
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      loaded = true;
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      error = `Failed to load FFmpeg: ${err.message}`;
    } finally {
      loading = false;
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      audioFile = target.files[0];
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      audioFile = event.dataTransfer.files[0];
    }
  }

  async function splitAudio() {
    if (!audioFile || !loaded) return;

    const inputFileName = 'input' + audioFile.name.substring(audioFile.name.lastIndexOf('.'));
    await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile));

    const duration = await getAudioDuration(audioFile);
    const chunks = Math.ceil(duration / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const outputFileName = `output_${i}.mp3`;

      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', start.toString(),
        '-t', chunkSize.toString(),
        '-acodec', 'libmp3lame',
        outputFileName
      ]);
    }

    // Create a zip file containing all the chunks
    const zip = new JSZip();
    for (let i = 0; i < chunks; i++) {
      const outputFileName = `output_${i}.mp3`;
      const data = await ffmpeg.readFile(outputFileName);
      zip.file(outputFileName, data);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audio_chunks.zip';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.src = URL.createObjectURL(file);
    });
  }
</script>

<main class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4">Audio Splitter</h1>

  {#if !loaded}
    <button
      on:click={load}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      disabled={loading}
    >
      {#if loading}
        Loading FFmpeg Core...
      {:else}
        Load FFmpeg Core (~31 MB)
      {/if}
    </button>
    {#if error}
      <p class="text-red-500 mt-2">{error}</p>
    {/if}
  {:else}
    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4"
      on:dragover|preventDefault
      on:drop|preventDefault={handleDrop}
    >
      <input
        type="file"
        accept="audio/*"
        on:change={handleFileSelect}
        class="mb-2"
      />
      <p class="text-gray-500">or drag and drop an audio file here</p>
    </div>

    {#if audioFile}
      <div class="mb-4">
        <label for="chunkSize" class="block mb-2">Chunk size (seconds):</label>
        <input
          type="range"
          id="chunkSize"
          bind:value={chunkSize}
          min="1"
          max="300"
          class="w-full"
        />
        <span>{chunkSize} seconds</span>
      </div>

      <button
        on:click={splitAudio}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Split and Download
      </button>
    {/if}
  {/if}

  <p class="mt-4">{message}</p>
  <p class="mt-2">Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
</main>
