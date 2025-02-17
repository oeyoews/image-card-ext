import { defineConfig } from 'wxt';
// import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import path from 'path';
import vueDevTools from 'vite-plugin-vue-devtools';

// @ts-ignore
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  // https://github.com/wxt-dev/wxt/pull/716/files
  vue: {
    vite: {
      script: {
        // propsDestructure: true,
        // defineModel: true,
      },
    },
  },
  imports: {
    addons: {
      vueTemplate: true,
    },
    presets: ['vue'],
  },

  vite: () => ({
    resolve: {
      alias: {
        '@/': `${path.resolve(__dirname)}/`,
      },
    },
    plugins: [
      // vue(),
      vueDevTools({
        appendTo: '/entrypoints/sidepanel/main.ts',
      }),
      Icons({
        autoInstall: true,
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }),
  manifest: {
    web_accessible_resources: [
      {
        resources: ['injected.js'],
        matches: ['<all_urls>'],
      },
    ],
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
    name: 'ImageCard',
    description: 'ImageCard的浏览器扩展',
    permissions: [
      'sidePanel',
      'contextMenus',
      'notifications',
      'activeTab',
      'contextMenus',
      'storage',
      'tabs',
      'scripting',
      'declarativeNetRequestWithHostAccess',
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    host_permissions: ['<all_urls>'],
    sidebar_action: {
      default_panel: 'sidepanel.html',
      default_icon: 'icons/icon48.png',
    },

    action: {
      default_title: 'ImageCard 的浏览器扩展',
    },
    browser_action: {
      default_title: 'ImageCard',
    },
  },
});
