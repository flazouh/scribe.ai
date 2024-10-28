<script lang="ts">
    import { onMount } from "svelte";
    import { FFmpeg } from "@ffmpeg/ffmpeg";
    import { fetchFile, toBlobURL } from "@ffmpeg/util";
    import JSZip from "jszip";
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import ProProgress from "$lib/components/ui/progress/ProProgress.svelte";
    import { Loader2 } from "lucide-svelte";
    import ProSlider from "$lib/components/ui/slider/ProSlider.svelte";

    let audioFile: File | null = null;
    let chunkSize = 60 * 10; // This will be updated when a file is selected
    let ffmpeg: FFmpeg;
    let loaded = false;
    let loading = false;
    let message = "";
    let error = "";
    let progress = 0;
    let loadingProgress = 0; // New variable for FFmpeg loading progress
    $: isProcessing = progress > 0 && progress < 100;

    let audioDuration = 0;
    let chunkInfo = "";

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

    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            audioFile = target.files[0];
            audioDuration = await getAudioDuration(audioFile);
            chunkSize = Math.floor(audioDuration / 2); // Set chunk size to half the duration
            updateChunkInfo();
        }
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer?.files) {
            audioFile = event.dataTransfer.files[0];
            getAudioDuration(audioFile).then((duration) => {
                audioDuration = duration;
                chunkSize = Math.floor(duration / 2); // Set chunk size to half the duration
                updateChunkInfo();
            });
        }
    }

    function updateChunkInfo() {
        if (audioFile && audioDuration > 0) {
            const effectiveChunkSize = Math.min(chunkSize, audioDuration);
            const chunks = Math.ceil(audioDuration / effectiveChunkSize);
            const lastChunkSize =
                audioDuration % effectiveChunkSize || effectiveChunkSize;
            chunkInfo =
                `This audio will be split into ${chunks} chunk${chunks > 1 ? "s" : ""}. ` +
                `${chunks > 1 ? `The first ${chunks - 1} chunk${chunks > 2 ? "s" : ""} will be ${toMinutesAndSeconds(effectiveChunkSize)} long. ` : ""}` +
                `The ${chunks > 1 ? "last" : "only"} chunk will be ${toMinutesAndSeconds(lastChunkSize)} long.`;
        } else {
            chunkInfo = "";
        }
    }

    $: {
        chunkSize;
        updateChunkInfo();
    }

    async function splitAudio() {
        if (!audioFile || !loaded) return;

        progress = 0;
        const inputFileName =
            "input" + audioFile.name.substring(audioFile.name.lastIndexOf("."));
        await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile));

        const duration = await getAudioDuration(audioFile);
        const chunks = Math.ceil(duration / chunkSize);
        let totalProgress = 0;

        ffmpeg.on("log", ({ message: msg }) => {
            console.log(msg);
            const timeMatch = msg.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
            if (timeMatch) {
                const [, hours, minutes, seconds] = timeMatch;
                const currentTime =
                    parseInt(hours) * 3600 +
                    parseInt(minutes) * 60 +
                    parseFloat(seconds);
                // Calculate the actual chunk duration for the current chunk
                const actualChunkDuration = Math.min(
                    chunkSize,
                    duration - totalProgress * chunkSize,
                );
                const chunkProgress = Math.min(
                    currentTime / actualChunkDuration,
                    1,
                );
                const overallProgress =
                    (totalProgress + chunkProgress) / chunks;
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
                    class="border border-setting-item hover:border-violet-500 flex items-center justify-center gap-2 px-2 py-1 cursor-pointer w-full rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
            </div>

            {#if audioDuration > 0}
                <div class="mb-4">
                    <label for="chunkSize" class="block mb-2">
                        Chunk size: {toMinutesAndSeconds(chunkSize)}
                    </label>
                    <ProSlider
                        min={30}
                        max={audioDuration}
                        step={5}
                        bind:value={chunkSize}
                    />
                </div>
            {/if}

            {#if chunkInfo}
                <p class="mb-4 text-sm text-muted-foreground">{chunkInfo}</p>
            {/if}

            <Button
                disabled={!audioFile || isProcessing}
                on:click={splitAudio}
                variant="border"
                class="relative"
            >
                {#if isProcessing}
                    <Loader2
                        class="mr-2 h-4 w-4 animate-spin text-violet-500"
                    />
                {/if}
                {isProcessing ? "Processing..." : "Split and Download"}
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
