// Entry point: create the App and mount it to #app
import { mount } from 'svelte'
import App from './App.svelte';

const app = mount(App, {target: document.getElementById('app')});

export default app;
