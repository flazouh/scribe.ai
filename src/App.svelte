<script lang="ts">
  import { onMount } from "svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { fetchFile, toBlobURL } from "@ffmpeg/util";
  import JSZip from "jszip";
  import { Button } from "$lib/components/ui/button";
  import { Progress } from "$lib/components/ui/progress";
  import { Slider } from "$lib/components/ui/slider";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
    import ProProgress from "$lib/components/ui/progress/ProProgress.svelte";

  let audioFile: File | null = null;
  let chunkSize = 60 * 10; // Default chunk size in seconds
  let ffmpeg: FFmpeg;
  let loaded = false;
  let loading = false;
  let message = "";
  let error = "";
  let progress = 0;
  let loadingProgress = 0; // New variable for FFmpeg loading progress

  onMount(async () => {
    ffmpeg = new FFmpeg();
    // Load FFmpeg on mount
    await load();
  });

  async function load() {
    loading = true;
    error = "";
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
      loaded = true;
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to load FFmpeg:", err);
        error = `Failed to load FFmpeg: ${err.message}`;
      } else {
        console.error("Failed to load FFmpeg:", err);
        error = "Failed to load FFmpeg: Unknown error";
      }
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

    progress = 0;
    const inputFileName = "input" + audioFile.name.substring(audioFile.name.lastIndexOf("."));
    await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile));

    const duration = await getAudioDuration(audioFile);
    const chunks = Math.ceil(duration / chunkSize);
    let totalProgress = 0;

    ffmpeg.on("log", ({ message: msg }) => {
      console.log(msg);
      const timeMatch = msg.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      if (timeMatch) {
        const [, hours, minutes, seconds] = timeMatch;
        const currentTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
        // Calculate the actual chunk duration for the current chunk
        const actualChunkDuration = Math.min(chunkSize, duration - totalProgress * chunkSize);
        const chunkProgress = Math.min(currentTime / actualChunkDuration, 1);
        const overallProgress = (totalProgress + chunkProgress) / chunks;
        progress = Math.round(overallProgress * 100);
        console.log(progress);
      }
    });

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const outputFileName = `output_${i}.mp3`;
      // Calculate the actual chunk duration for this iteration
      const actualChunkDuration = Math.min(chunkSize, duration - start);

      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-ss",
        start.toString(),
        "-t",
        actualChunkDuration.toString(),
        "-acodec",
        "libmp3lame",
        outputFileName,
      ]);

      totalProgress++;
    }

    // Create a zip file containing all the chunks
    const zip = new JSZip();
    for (let i = 0; i < chunks; i++) {
      const outputFileName = `output_${i}.mp3`;
      const data = await ffmpeg.readFile(outputFileName);
      zip.file(outputFileName, data);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio_chunks.zip";
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


  function toMinutesAndSeconds(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m${remainingSeconds ? `${remainingSeconds}s` : ""}`;
  }
</script>

<main class=" text-foreground min-h-screen p-8">
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-center mb-8">
      <img src="/logo.png" alt="TranscriptAI" class="w-16 h-16" />
      <h1 class="text-3xl font-bold">Audio Splitter</h1>
    </div>
    {#if !loaded}
      <Card>
        <CardHeader>
          <CardTitle>Loading FFmpeg Core</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="mb-2">Please wait while FFmpeg is being loaded...</p>
          {#if error}
            <p class="text-destructive mt-2">{error}</p>
          {/if}
        </CardContent>
      </Card>
    {:else}
      <Card>
        <CardHeader>
          <CardTitle>Audio File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            class="border-2 border-dashed border-muted rounded-lg p-8 mb-4"
            on:dragover|preventDefault
            on:drop|preventDefault={handleDrop}
          >
            <input
              type="file"
              accept="audio/*"
              on:change={handleFileSelect}
              class="mb-2"
            />
          </div>

            <div class="mb-4">
              <label for="chunkSize" class="block mb-2">
                Chunk size: {toMinutesAndSeconds(chunkSize)}
              </label>
            </div>

            <Button disabled={!audioFile} on:click={splitAudio} variant="border">
              Split and Download
            </Button>

            {#if progress > 0 && progress < 100}

              <div class="mt-4">
                <ProProgress bind:progress />
                <p class="text-center mt-2">{progress}%</p>
              </div>
            {/if}
        </CardContent>
      </Card>
    {/if}
  </div>
</main>
