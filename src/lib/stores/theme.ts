import { writable } from 'svelte/store';

function createTheme() {
  // Always return dark theme, no localStorage needed
  const { subscribe, set } = writable<string>('dark');

  return {
    subscribe,
    set: () => {
      // Do nothing - theme is locked to dark
    }
  };
}

export const theme = createTheme();