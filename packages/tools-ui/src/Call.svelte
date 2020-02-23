<script>
  import { fly } from 'svelte/transition';
  import { format } from './utils/format.ts';

  export let isAsync = false;
  export let model;
  export let method;
  export let input;
  export let output;
</script>

<style>
  .container {
    padding: 4px 0;
    display: flex;
  }
  .async {
    color: #9854e8;
  }
  .invisible {
    opacity: 0;
  }
  .model:hover {
    border-bottom: 1px dashed;
    cursor: pointer;
  }
  .method {
    color: #61afef;
  }
  .args {
    color: #f7ca18;
  }
  .return {
    color: #49aca9;
  }
</style>

<div transition:fly={{ y: -10 }} class="container">
  <span class="async" class:invisible={!isAsync}>async&nbsp;</span>
  <span class="model">{model}</span>
  <span>.</span>
  <span class="method">{method}</span>
  <span>(</span>
  <span class="args">{input.map(format).join(', ')}</span>
  <span>):&nbsp;</span>
  <span class="return">{format(output)}</span>
</div>
