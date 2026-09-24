// Gives app.js the text picked with "Check with Tellbuster", then forgets it.
window.tellbusterStartText = async () => {
  const { startText = '' } = await chrome.storage.session.get('startText');
  if (startText) await chrome.storage.session.remove('startText');
  return startText;
};

// Tells app.js whether to add the strict pack. Off unless the user turns it on in settings.
window.tellbusterStrictStyle = async () => {
  const { strictStyle } = await chrome.storage.sync.get({ strictStyle: false });
  return strictStyle === true;
};
