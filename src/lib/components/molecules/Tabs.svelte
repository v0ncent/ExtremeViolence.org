<script lang="ts">
    import TabButton from "../atoms/Tab.svelte";
  
    export let tabs: { label: string; href: string }[] = [];
  </script>
  
  <nav class="tab-list">
    {#each tabs as tab}
      <TabButton label={tab.label} href={tab.href} />
    {/each}
  </nav>
  
  <style>
    .tab-list {
      display: flex;
      gap: 2rem;
      border-bottom: 2px solid #ccc;
      padding: 1rem 2rem;
      justify-content: center;
    }
  </style>
  