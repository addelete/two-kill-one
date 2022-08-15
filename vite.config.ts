import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteExternalsPlugin } from 'vite-plugin-externals';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    viteExternalsPlugin(
      {
        // vue: 'Vue',
        konva: 'Konva',
        "agora-rtm-sdk": 'AgoraRTM',
      },
      { disableInServe: true }
    ),
  ],
});
