// Tellbuster interface text, one block per language. English is the default, and any
// text missing from another language falls back to English.
// To add a language: copy the "fr" block, rename it (for example "es"), and translate each line.
// Only the text in quotes changes. The (n) => ... lines pick the right words for a number.
// This is a plain script (not a module) so the web demo, the popup, the settings page,
// the badge on other sites and the background script can all load it. No network calls.
(() => {
  const STRINGS = {
    en: {
      // Language names, used in "Checked as French." and on the settings page.
      languageNames: { en: 'English', fr: 'French', es: 'Spanish', de: 'German', pt: 'Portuguese' },

      // Findings: summary line, badge and cards
      severity: { high: 'High', medium: 'Medium', low: 'Low' },
      summaryNone: 'No tells found. Nice work.',
      summary: (n, counts) => `${n} ${n === 1 ? 'phrase might' : 'phrases might'} read as AI (${counts.map(([sev, c]) => `${c} ${sev}`).join(', ')})`,
      checkedAs: (name) => `Checked as ${name}.`,
      tells: (n) => (n ? `${n} ${n === 1 ? 'tell' : 'tells'}` : 'No tells'),
      seeAll: (n) => `See all ${n} ${n === 1 ? 'note' : 'notes'}`,
      tryThis: 'Try this:',
      also: 'Also:',
      turnOffRule: 'Turn off this rule',
      turnOffRuleOnPage: 'Turn off this rule on this page',
      report: 'Report a wrong flag',
      turnedOffVisit: (n) => `${n} ${n === 1 ? 'rule is' : 'rules are'} turned off for this visit.`,
      turnedOffPage: (n) => `${n} ${n === 1 ? 'rule is' : 'rules are'} turned off on this page.`,
      turnBackOn: (n) => `Turn ${n === 1 ? 'it' : 'them'} back on`,
      note: 'These are style notes, not proof of anything. People use these phrases too.',
      legend: 'Legend',
      legendHigh: 'strong tell',
      legendMedium: 'common tell',
      legendLow: 'style note',

      // The writing box
      yourWriting: 'Your writing',
      results: 'Results',
      placeholder: 'Paste or type your writing here.',
      emptyHint: 'Paste some writing to see which phrases might read as AI.',
      emptyHintShort: 'Paste or type some writing to check it.',
      tryExample: 'Try an example',
      copy: 'Copy text',
      copied: 'Copied',
      clear: 'Clear',
      loadError: 'The checker could not load its rules. Please reload the page.',
      // Built from escapes so this file never contains the long dash itself.
      example: [
        "Certainly! In today's fast-paced world, small business owners must navigate the complex landscape of social media.",
        " It's not just a trend, it's a movement.",
        " Let's dive into how you can harness the power of storytelling to unleash your full potential.",
        ' This approach is a game-changer: it plays a crucial role in helping you foster a sense of community \u2014 and it stands as a testament to what is possible.',
        ' Moreover, it brings clarity, alignment, and resilience to your brand.',
        ' Let that sink in.',
        '\n\nI hope this helps!',
      ].join(''),

      // Popup footer
      nothingLeaves: 'Nothing leaves your device.',
      settings: 'Settings',
      about: 'About Tellbuster',

      // Badge on other sites
      badgeTitle: 'Tellbuster (Alt+Shift+T)',
      showDetails: (summary) => `${summary}. Show details.`,
      noTellsFound: 'No tells found',
      close: 'Close',
      checkedOnDevice: 'Checked on your device. Nothing is sent anywhere.',
      badgeOffOn: (site) => `Turn off the badge on ${site}`,

      // Right-click menu
      menuCheck: 'Check with Tellbuster',

      // Settings page
      settingsTitle: 'Tellbuster settings',
      settingsTagline: 'Changes save on their own. They are kept in your Chrome profile, and nothing else is stored.',
      saved: 'Saved.',
      typeTitle: 'Check as you type',
      typeLabel: 'Check as I type',
      typeHint: 'Chrome will ask to let Tellbuster read the sites you visit so it can check what you type, and your text never leaves this device.',
      typeDenied: 'Chrome did not allow it, so check as you type stays off. The popup and the right-click menu still work.',
      typeOn: 'Check as I type is on.',
      typeOff: 'Check as I type is off.',
      offSitesTitle: 'Sites where the badge is off',
      website: 'Website',
      turnOffHere: 'Turn off here',
      siteError: 'That does not look like a website. Try something like linkedin.com.',
      noSites: 'The badge is on for every site.',
      badgeBackOn: 'Turn the badge back on',
      badgeBackOnFor: (site) => `Turn the badge back on for ${site}`,
      badgeIsBackOn: (site) => `The badge is back on for ${site}.`,
      badgeIsOff: (site) => `The badge is off on ${site}.`,
      languagesTitle: 'Languages',
      languagesHint: 'Check writing in these languages.',
      noLanguage: 'No language is picked, so nothing will be checked.',
      guessTitle: 'Which language is my text in?',
      guessHint: 'Tellbuster guesses from the words you use. If it guesses wrong, pick your language here.',
      guess: 'Guess from the text (recommended)',
      always: (name) => `Always ${name}`,
      strictTitle: 'Strict mode',
      strictLabel: 'Strict mode: also flag common filler words',
      strictHint: 'Words like "crucial" or "robust" that people use every day, but that show up a lot in AI writing. Off by default.',
      strictTag: 'Strict mode',
      rulesTitle: 'Rules',
      rulesHint: 'Turn off a whole group, or open it to turn off single rules.',
      rulesLoading: 'Loading the rules...',
      rulesError: 'The rules could not load. Please reload this page.',
      ruleCount: (n) => `(${n} ${n === 1 ? 'rule' : 'rules'})`,
      showGroup: (name) => `Show the ${name.toLowerCase()} rules`,
      categories: {
        phrase: 'Stock phrases',
        filler: 'Filler and hedges',
        structure: 'Sentence patterns',
        'word-choice': 'Word choice',
        punctuation: 'Punctuation',
      },
      reset: 'Put all settings back to how they started',
      resetDone: 'All settings are back to how they started.',
    },

    fr: {
      languageNames: { en: 'anglais', fr: 'français', es: 'espagnol', de: 'allemand', pt: 'portugais' },

      severity: { high: 'Forte', medium: 'Moyenne', low: 'Légère' },
      summaryNone: 'Aucun tic trouvé. Beau travail.',
      summary: (n, counts) => {
        const word = { high: ['forte', 'fortes'], medium: ['moyenne', 'moyennes'], low: ['légère', 'légères'] };
        const parts = counts.map(([sev, c]) => `${c} ${word[sev][c === 1 ? 0 : 1]}`).join(', ');
        return `${n} ${n === 1 ? 'formule peut' : 'formules peuvent'} faire penser à une IA (${parts})`;
      },
      checkedAs: (name) => `Vérifié en ${name}.`,
      tells: (n) => (n ? `${n} ${n === 1 ? 'tic' : 'tics'}` : 'Aucun tic'),
      seeAll: (n) => (n === 1 ? 'Voir la note' : `Voir les ${n} notes`),
      tryThis: 'Essayez plutôt :',
      also: 'Aussi :',
      turnOffRule: 'Désactiver cette règle',
      turnOffRuleOnPage: 'Désactiver cette règle sur cette page',
      report: 'Signaler une erreur',
      turnedOffVisit: (n) => (n === 1 ? '1 règle est désactivée pour cette visite.' : `${n} règles sont désactivées pour cette visite.`),
      turnedOffPage: (n) => (n === 1 ? '1 règle est désactivée sur cette page.' : `${n} règles sont désactivées sur cette page.`),
      turnBackOn: (n) => (n === 1 ? 'La réactiver' : 'Les réactiver'),
      note: 'Ce sont des notes de style, pas des preuves. Les gens utilisent aussi ces formules.',
      legend: 'Légende',
      legendHigh: 'tic marqué',
      legendMedium: 'tic courant',
      legendLow: 'note de style',

      yourWriting: 'Votre texte',
      results: 'Résultats',
      placeholder: 'Collez ou tapez votre texte ici.',
      emptyHint: 'Collez un texte pour voir quelles formules peuvent faire penser à une IA.',
      emptyHintShort: 'Collez ou tapez un texte pour le vérifier.',
      tryExample: 'Essayer un exemple',
      copy: 'Copier le texte',
      copied: 'Copié',
      clear: 'Effacer',
      loadError: 'Le vérificateur n’a pas pu charger ses règles. Rechargez la page.',
      example: [
        'Bien sûr ! Dans le monde d’aujourd’hui, les petites entreprises doivent se démarquer dans le paysage numérique.',
        ' Il est important de noter que les réseaux sociaux sont incontournables.',
        ' Plongeons dans le sujet : ce n’est pas seulement un outil, c’est un véritable levier de croissance.',
        ' La constance joue un rôle crucial et reste la clé du succès.',
        '\n\nJ’espère que cela vous aide ! N’hésitez pas à me contacter.',
      ].join(''),

      nothingLeaves: 'Rien ne quitte votre appareil.',
      settings: 'Réglages',
      about: 'À propos de Tellbuster',

      badgeTitle: 'Tellbuster (Alt+Maj+T)',
      showDetails: (summary) => `${summary}. Voir le détail.`,
      noTellsFound: 'Aucun tic trouvé',
      close: 'Fermer',
      checkedOnDevice: 'Vérifié sur votre appareil. Rien n’est envoyé nulle part.',
      badgeOffOn: (site) => `Désactiver le badge sur ${site}`,

      menuCheck: 'Vérifier avec Tellbuster',

      settingsTitle: 'Réglages de Tellbuster',
      settingsTagline: 'Les changements s’enregistrent tout seuls. Ils sont gardés dans votre profil Chrome, et rien d’autre n’est conservé.',
      saved: 'Enregistré.',
      typeTitle: 'Vérifier pendant la frappe',
      typeLabel: 'Vérifier pendant que je tape',
      typeHint: 'Chrome vous demandera de laisser Tellbuster lire les sites que vous visitez pour vérifier ce que vous tapez. Votre texte ne quitte jamais cet appareil.',
      typeDenied: 'Chrome ne l’a pas permis, alors la vérification pendant la frappe reste désactivée. La fenêtre de Tellbuster et le menu du clic droit fonctionnent quand même.',
      typeOn: 'La vérification pendant la frappe est activée.',
      typeOff: 'La vérification pendant la frappe est désactivée.',
      offSitesTitle: 'Sites où le badge est désactivé',
      website: 'Site Web',
      turnOffHere: 'Désactiver ici',
      siteError: 'Ça ne ressemble pas à un site Web. Essayez par exemple linkedin.com.',
      noSites: 'Le badge est activé sur tous les sites.',
      badgeBackOn: 'Réactiver le badge',
      badgeBackOnFor: (site) => `Réactiver le badge sur ${site}`,
      badgeIsBackOn: (site) => `Le badge est réactivé sur ${site}.`,
      badgeIsOff: (site) => `Le badge est désactivé sur ${site}.`,
      languagesTitle: 'Langues',
      languagesHint: 'Vérifier les textes dans ces langues.',
      noLanguage: 'Aucune langue n’est choisie, alors rien ne sera vérifié.',
      guessTitle: 'Dans quelle langue est mon texte ?',
      guessHint: 'Tellbuster devine d’après les mots que vous utilisez. S’il se trompe, choisissez votre langue ici.',
      guess: 'Deviner d’après le texte (conseillé)',
      always: (name) => `Toujours en ${name}`,
      strictTitle: 'Mode strict',
      strictLabel: 'Mode strict : signaler aussi les mots de remplissage courants',
      strictHint: 'Des mots comme « crucial » ou « robuste » que les gens utilisent tous les jours, mais qu’on voit beaucoup dans les textes d’IA. Désactivé au départ.',
      strictTag: 'Mode strict',
      rulesTitle: 'Règles',
      rulesHint: 'Désactivez un groupe entier, ou ouvrez-le pour désactiver une seule règle.',
      rulesLoading: 'Chargement des règles...',
      rulesError: 'Les règles n’ont pas pu se charger. Rechargez cette page.',
      ruleCount: (n) => `(${n} ${n === 1 ? 'règle' : 'règles'})`,
      showGroup: (name) => `Voir les règles : ${name.toLowerCase()}`,
      categories: {
        phrase: 'Formules toutes faites',
        filler: 'Remplissage et précautions',
        structure: 'Formes de phrases',
        'word-choice': 'Choix des mots',
        punctuation: 'Ponctuation',
      },
      reset: 'Remettre tous les réglages comme au départ',
      resetDone: 'Tous les réglages sont revenus comme au départ.',
    },
  };

  // The interface language: "?lang=fr" in the address wins. Otherwise pages that follow the
  // browser (the extension) use the browser's language when we have it, and the rest use English.
  // The badge on other sites passes useAddress: false, since their addresses are not ours.
  function pick({ followBrowser = false, useAddress = true } = {}) {
    const asked = [];
    if (useAddress) {
      try { asked.push(new URLSearchParams(globalThis.location?.search).get('lang')); } catch { /* no address */ }
    }
    if (followBrowser) asked.push(...(globalThis.navigator?.languages || [globalThis.navigator?.language]));
    for (const tag of asked) {
      const code = String(tag || '').toLowerCase().split('-')[0];
      if (STRINGS[code]) return code;
    }
    return 'en';
  }

  // The text for one language, with English filling any gaps.
  function strings(code) {
    return { ...STRINGS.en, ...STRINGS[code], code: STRINGS[code] ? code : 'en' };
  }

  // Fills elements marked data-i18n="key" (their text), data-i18n-placeholder and data-i18n-aria-label.
  function translatePage(s, root = document) {
    // A key like "severity.high" reads one level down.
    const get = (key) => key.split('.').reduce((o, k) => o?.[k], s);
    for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = get(el.dataset.i18n);
    for (const el of root.querySelectorAll('[data-i18n-placeholder]')) el.placeholder = get(el.dataset.i18nPlaceholder);
    for (const el of root.querySelectorAll('[data-i18n-aria-label]')) el.setAttribute('aria-label', get(el.dataset.i18nAriaLabel));
    if (root === document && s.code !== 'en') document.documentElement.lang = s.code;
  }

  globalThis.tellbusterI18n = { STRINGS, pick, strings, translatePage };
})();
