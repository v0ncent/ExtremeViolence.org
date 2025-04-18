<script lang="ts">
  export let label: string;
  export let href: string;
</script>

<a href={href} class="tab-button">
  {label}
</a>

<style>
  .tab-button {
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    text-decoration: none;
    color: #333;
    border-bottom: 2px solid transparent;
  }

  .tab-button:hover {
    border-bottom: 2px solid #555;
  }
</style>