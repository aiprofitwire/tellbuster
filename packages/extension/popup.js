// Gives app.js the text picked with "Check with Tellbuster", then forgets it.
window.tellbusterStartText = async () => {
  const { startText = '' } = await chrome.storage.session.get('startText');
  if (startText) await chrome.storage.session.remove('startText');
  return startText;
};
