// Adds "Check with Tellbuster" to the right-click menu for selected text.
// The selection is kept in session storage (memory only, never synced) until the popup reads it.

const MENU_ID = 'tellbuster-check';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: MENU_ID, title: 'Check with Tellbuster', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;
  await chrome.storage.session.set({ startText: info.selectionText || '' });
  try {
    await chrome.action.openPopup();
  } catch {
    // Older Chrome versions cannot open the popup from here, so open it in a small window.
    await chrome.windows.create({ url: 'popup.html', type: 'popup', width: 460, height: 640 });
  }
});
