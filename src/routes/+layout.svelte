<script lang="ts">
  import { page } from '$app/stores';
  import '../app.css';
  
</script>

<div class="min-h-screen">
  <header class="border-b">
    <div class="max-w-3xl mx-auto p-4">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center gap-4">
          <img src="/logo.png" alt="ScribeAI" class="size-12" />
          <h1 class="text-2xl font-inter font-bold">ScribeAI</h1>
        </a>
        <nav class="flex gap-4">
          <a 
            href="/splitting" 
            class="px-4 py-2 rounded-md transition-colors {$page.url.pathname === '/splitting' ? 'bg-violet-500 text-white' : 'hover:bg-violet-100'}"
          >
            Split Audio
          </a>
          <a 
            href="/transcription" 
            class="px-4 py-2 rounded-md transition-colors {$page.url.pathname === '/transcription' ? 'bg-violet-500 text-white' : 'hover:bg-violet-100'}"
          >
            Transcribe
          </a>
        </nav>
      </div>
    </div>
  </header>

  <main class="p-8">
    <div class="max-w-3xl mx-auto">
      <slot />
    </div>
  </main>
</div>


