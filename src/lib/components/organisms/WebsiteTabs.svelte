<script lang="ts">
    import TabList from "../molecules/Tabs.svelte";
  
    const tabs = [
      { label: 'News', href: '/' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Comics', href: '/contact' },
      { label: 'About', href: '/about' }
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
  