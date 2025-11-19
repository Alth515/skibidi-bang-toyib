<script>
  import { createEventDispatcher } from 'svelte';

  // HUD shows score, lives and basic controls for start/pause/restart.
  export let score = 0;
  export let lives = 3;
  export let running = false;

  const dispatch = createEventDispatcher();

  function onStart() {
    dispatch('start');
  }
  function onPause() {
    dispatch('pause');
  }
  function onRestart() {
    dispatch('restart');
  }
</script>

<style>
  .hud {
    width: 100%;
    max-width: 720px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 12px;
  }

  .left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .pill {
    background: white;
    padding: 8px 12px;
    border-radius: 999px;
    box-shadow: 0 6px 18px rgba(8,8,16,0.06);
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
    color: #111;
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: #0ea5a5;
    color: white;
    cursor: pointer;
    font-weight: 600;
  }

  button.secondary {
    background: #e2e8f0;
    color: #0f172a;
  }

  .lives {
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>

<div class="hud">
  <div class="left">
    <div class="pill">Score: {score}</div>
    <div class="pill lives">Lives:
      <!-- show little toilet icons for lives -->
      <span style="margin-left:6px;">{#each Array(lives) as _, i}<span style="margin-right:3px">🚽</span>{/each}</span>
    </div>
  </div>

  <div class="controls">
    {#if running}
      <button on:click={onPause} class="secondary">Pause</button>
    {:else}
      <button on:click={onStart}>Start</button>
    {/if}
    <button on:click={onRestart}>Restart</button>
  </div>
</div>
