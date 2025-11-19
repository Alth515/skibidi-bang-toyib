// Entry point: create the App and mount it to #app
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app')
});

export default app;
