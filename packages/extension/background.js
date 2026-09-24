// Tellbuster background worker. It only adds the right-click menu item.
// Nothing here reads pages or sends anything over the network.

const MENU_ID = 'tellbuster-check';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: MENU_ID, title: 'Check with Tellbuster', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;
  // Session storage lives in memory only and is wiped when the browser closes.
  await chrome.storage.session.set({ draft: info.selectionText });
  try {
    await chrome.action.openPopup();
  } catch {
    // Older Chrome versions cannot open the popup from here, so open it in a small window.
    await chrome.windows.create({ url: 'popup.html', type: 'popup', width: 440, height: 620 });
  }
});
