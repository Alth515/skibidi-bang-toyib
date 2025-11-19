<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import HUD from './components/HUD.svelte';

  // Game constants — tweak these to change difficulty/feel
  const GAME_WIDTH = 720;   // game area width in px
  const GAME_HEIGHT = 420;  // game area height in px
  const PLAYER_W = 72;      // player width
  const PLAYER_H = 72;      // player height
  const PLAYER_SPEED = 380; // pixels per second
  const ITEM_SPAWN_INTERVAL = 1100; // ms
  const OBSTACLE_SPAWN_INTERVAL = 2400; // ms

  let score = 0;
  let lives = 3;
  let running = false;
  let gameEl; // reference to game container

  // Player state
  let player = {
    x: (GAME_WIDTH - PLAYER_W) / 2, // start centered
    y: GAME_HEIGHT - PLAYER_H - 6,
    w: PLAYER_W,
    h: PLAYER_H
  };

  // Entities falling down (both collectibles and obstacles)
  // entity: { id, x, y, w, h, vy, type }
  // type: 'skibidi' or 'bad'
  let entities = [];
  let nextEntityId = 1;

  // Input state
  const keys = { left: false, right: false };

  // Game loop internal variables
  let raf = null;
  let lastTime = null;
  let spawnItemTimer = 0;
  let spawnObstacleTimer = 0;

  const dispatch = createEventDispatcher();

  // Utility: simple AABB collision check
  function collide(a, b) {
    return !(
      a.x + a.w < b.x ||
      a.x > b.x + b.w ||
      a.y + a.h < b.y ||
      a.y > b.y + b.h
    );
  }

  // Spawn helpers
  function spawnSkibidi() {
    const size = 42 + Math.random() * 28; // variable size
    const x = Math.random() * (GAME_WIDTH - size);
    entities.push({
      id: nextEntityId++,
      x,
      y: -size,
      w: size,
      h: size,
      vy: 80 + Math.random() * 120,
      type: 'skibidi'
    });
  }

  function spawnBad() {
    const size = 48 + Math.random() * 40;
    const x = Math.random() * (GAME_WIDTH - size);
    entities.push({
      id: nextEntityId++,
      x,
      y: -size,
      w: size,
      h: size,
      vy: 130 + Math.random() * 160,
      type: 'bad'
    });
  }

  // Start or restart the game
  function startGame() {
    // reset state
    score = 0;
    lives = 3;
    player.x = (GAME_WIDTH - PLAYER_W) / 2;
    entities = [];
    running = true;
    lastTime = null;
    spawnItemTimer = 0;
    spawnObstacleTimer = 0;
    // Start the loop using requestAnimationFrame
    raf = requestAnimationFrame(loop);
  }

  function pauseGame() {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  // Game loop (uses requestAnimationFrame)
  function loop(timestamp) {
    if (!running) return;
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000; // seconds
    lastTime = timestamp;

    // update player based on keys
    if (keys.left && !keys.right) {
      player.x -= PLAYER_SPEED * dt;
    } else if (keys.right && !keys.left) {
      player.x += PLAYER_SPEED * dt;
    }
    // keep inside bounds
    player.x = Math.max(0, Math.min(GAME_WIDTH - player.w, player.x));

    // accumulate timers in milliseconds
    spawnItemTimer += dt * 1000;
    spawnObstacleTimer += dt * 1000;

    // spawn items on their own timers (using millisecond accumulation)
    if (spawnItemTimer >= ITEM_SPAWN_INTERVAL) {
      spawnItemTimer = 0;
      spawnSkibidi();
    }
    if (spawnObstacleTimer >= OBSTACLE_SPAWN_INTERVAL) {
      spawnObstacleTimer = 0;
      spawnBad();
    }

    // update entities
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      e.y += e.vy * dt;

      // check collision with player
      if (collide(e, player)) {
        if (e.type === 'skibidi') {
          score += 1;
        } else if (e.type === 'bad') {
          lives -= 1;
        }
        // remove entity after collision
        entities.splice(i, 1);
        continue;
      }

      // remove off-screen
      if (e.y > GAME_HEIGHT + 100) {
        entities.splice(i, 1);
      }
    }

    // check game over
    if (lives <= 0) {
      running = false;
      dispatch('gameover', { score });
      // leave loop; raf not scheduled
      return;
    }

    // schedule next frame
    raf = requestAnimationFrame(loop);
  }

  // Input handlers
  function onKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    // space toggles pause/run
    if (e.key === ' ') {
      if (running) pauseGame(); else startGame();
    }
  }
  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  }

  // lifecycle hooks: attach window listeners when component mounts
  onMount(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Auto-start a short demo so user sees things moving
    startGame();
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (raf) cancelAnimationFrame(raf);
  });

  // HUD actions
  function handleHUDStart() {
    startGame();
  }
  function handleHUDPause() {
    pauseGame();
  }
  function handleHUDRestart() {
    startGame();
  }
</script>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .game-area {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    background: linear-gradient(180deg,#ffffff 0%, #e8fff7 100%);
    box-shadow: 0 8px 30px rgba(31,41,55,0.12);
    overflow: hidden;
    width: 720px;
    height: 420px;
  }

  /* Score and top info is in HUD component (imported) */

  .player {
    position: absolute;
    width: var(--w);
    height: var(--h);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44px;
    transform: translateZ(0);
    user-select: none;
    pointer-events: none;
  }

  .entity {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border-radius: 8px;
    color: #111;
    user-select: none;
    pointer-events: none;
    box-shadow: 0 6px 18px rgba(8,8,16,0.08);
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(4px);
  }

  .skibidi {
    font-size: 28px;
  }

  .bad {
    font-size: 24px;
    background: linear-gradient(180deg,#fff6f6,#fff0f0);
    border: 1px solid rgba(220,40,40,0.1);
  }

  .footer {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .hint {
    font-size: 0.9rem;
    color: #333;
  }

  button.small {
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: #3168ff;
    color: white;
    cursor: pointer;
  }
</style>

<div class="wrapper">
  <HUD {score} {lives} {running}
    on:start={handleHUDStart}
    on:pause={handleHUDPause}
    on:restart={handleHUDRestart} />

  <div class="game-area" bind:this={gameEl} style="width: {GAME_WIDTH}px; height: {GAME_HEIGHT}px;">
    <!-- Render player (toilet emoji) -->
    <div
      class="player"
      style="left: {player.x}px; top: {player.y}px; --w: {player.w}px; --h: {player.h}px; width: {player.w}px; height: {player.h}px;"
      aria-hidden="true"
      title="Player (you)">
      <!-- Toilet emoji represents the player -->
      <span style="font-size: 44px;">🚽</span>
    </div>

    <!-- Render falling entities -->
    {#each entities as e (e.id)}
      <div
        class="entity {e.type === 'skibidi' ? 'skibidi' : 'bad'}"
        style="left: {e.x}px; top: {e.y}px; width: {e.w}px; height: {e.h}px;"
        aria-hidden="true">
        {#if e.type === 'skibidi'}
          <!-- skibidi collectible: toilet paper / music note combo -->
          <div style="font-size: calc({e.w}px / 2.2);">🧻🎶</div>
        {:else}
          <!-- obstacle -->
          <div style="font-size: calc({e.w}px / 2.8);">⚠️</div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="footer">
    <div class="hint">Use ← → or A / D to move. Press Space to pause/start.</div>
  </div>
</div>
