<script>
  import Call from './Call.svelte';
  let calls = [];

  export function addCall(call) {
    calls = [...calls, call];
  }

  export function clearCalls() {
    calls = [];
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Fira+Code&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/tippy.js/5.2.1/tippy.css');

  :global(html) {
    height: 100%;
  }

  :global(body) {
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    background-color: #242424;
    color: #e4f1fe;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 24px 12px;
    box-sizing: border-box;
  }

  .callsContainer {
    display: flex;
    flex-direction: column-reverse;
    height: 100%;
    justify-content: end;
    overflow: auto;
  }
</style>

<div class="callsContainer">
  {#each calls as call (call.timestamp)}
    <Call {...call} />
  {/each}
</div>
