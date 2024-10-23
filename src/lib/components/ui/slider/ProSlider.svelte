<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from '$lib/utils';

  export let value: number = 0;
  export let min: number = 0;
  export let max: number = 100;
  export let step: number = 1;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseFloat(target.value);
    dispatch('input', { value });
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseFloat(target.value);
    dispatch('change', { value });
  }

  $: value = Math.max(min, Math.min(max, value));
  $: percentage = ((value - min) / (max - min)) * 100;
</script>

<div class="relative w-full h-6">
  <div class="absolute inset-0 h-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full">
    <div
      class="absolute h-full bg-violet-500 rounded-full pointer-events-none"
      style:width="{percentage}%"
    ></div>
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    {disabled}
    bind:value
    on:input={handleInput}
    on:change={handleChange}
    class={cn(
      'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
      disabled && 'cursor-not-allowed'
    )}
  />
  <div
    class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
    style:left="calc({percentage}% - 8px)"
  ></div>
</div>
