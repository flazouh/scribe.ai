<script lang="ts">
  export let progress: number;

  // Ensure progress is between 0 and 100
  $: clampedProgress = Math.min(Math.max(progress, 0), 100);
</script>

<div class="w-full bg-violet-200 rounded-full h-2.5">
  <div
    class="bg-violet-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
    style="width: {clampedProgress}%"
    role="progressbar"
    aria-valuenow={clampedProgress}
    aria-valuemin="0"
    aria-valuemax="100"
  ></div>
</div>

