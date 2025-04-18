<script lang="ts">
    import TabList from "../molecules/Tabs.svelte";
  
    const tabs = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ];
  </script>
  
  <section class="tab-nav-container">
    <TabList {tabs} />
  </section>
  
  <style>
    .tab-nav-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
  