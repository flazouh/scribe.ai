<script lang="ts">
  import { Switch } from 'radix-svelte';
  import { onMount } from 'svelte';

  export let checked = false;
  export let onChange: (value: boolean) => void;
  export let soundUrl = 'assets/sounds/toggler-sound.wav';
  export let disabled = false;
  export let name: string | undefined = undefined;
  export let value: string | undefined = undefined;

  let audio: HTMLAudioElement;
  let isReady = false;

  onMount(() => {
    audio = new Audio(soundUrl);
    audio.addEventListener('canplaythrough', () => {
      isReady = true;
    });

    return () => {
      audio.removeEventListener('canplaythrough', () => {
        isReady = false;
      });
    };
  });

  function play() {
    if (isReady && audio) {
      audio.play();
    }
  }

  function handleChange(event: CustomEvent<boolean>) {
    checked = event.detail;
    onChange(checked);
    play();
  }
</script>

<Switch.Root
  bind:checked
  on:checked-change={handleChange}
  {disabled}
  {name}
  {value}
  class="relative h-6 w-11 cursor-default rounded-full
         bg-black/40 shadow-[0_2px_10px] shadow-black/10 outline-none
         focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black
         {$$props.class ?? ''}"
>
  <Switch.Thumb
    class="block h-5 w-5 translate-x-0.5 rounded-full bg-white
           shadow-[0_2px_2px] shadow-black/10 transition-transform duration-100
           will-change-transform data-[state=checked]:translate-x-[22px]"
  />
</Switch.Root>
