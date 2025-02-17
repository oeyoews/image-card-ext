import { type Menus } from 'wxt/browser';
export default defineBackground({
  type: 'module', // !code ++
  main() {
    // 单击打开侧边栏
    browser.runtime.onInstalled.addListener(function (details) {
      if (details.reason === 'install') {
        chrome.sidePanel
          .setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error(error));
      }
    });
  },
});
