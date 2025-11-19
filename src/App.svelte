<script>
  // Root layout: shows title and the Game component.
  import Game from './Game.svelte';
</script>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: linear-gradient(180deg, #f7f7fb 0%, #e7f4ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .container {
    width: 900px;
    max-width: 95vw;
    padding: 18px;
  }

  header {
    text-align: center;
    margin-bottom: 10px;
  }

  h1 {
    margin: 0;
    font-size: 1.4rem;
    letter-spacing: 0.4px;
  }

  p.subtitle {
    margin: 6px 0 0;
    color: #444;
    font-size: 0.9rem;
  }
</style>

<div class="container">
  <header>
    <h1>Skibidi Bang Toyib</h1>
    <p class="subtitle">A tiny Svelte 5 game — move the toilet, collect skibidi, avoid trouble!</p>
  </header>

  <Game />
</div>
