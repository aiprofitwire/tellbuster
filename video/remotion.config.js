import { Config } from '@remotion/cli/config';

// Fonts come straight from the landing page, so there is only one copy in the repo.
Config.setPublicDir('../docs/fonts');
Config.setEntryPoint('src/index.js');
// Only needed where Chrome for rendering cannot be downloaded: point this at a local copy.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
