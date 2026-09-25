// The check_writing tool: its description for the agent and the code that runs it.
// No imports, so the tests can run it without installing the MCP SDK. server.js passes in lint().

const LANGUAGES = ['auto', 'en', 'fr', 'es', 'de', 'pt'];

export const TOOL = {
  name: 'check_writing',
  title: 'Check writing for AI tells',
  description:
    'Points out phrases in a draft that might read as AI, with why each one stands out and how to fix it. ' +
    'Use it on anything you write for someone to publish or send, then rewrite the flagged phrases. ' +
    'It is a linter, not a detector: people use these phrases too. Runs on the device, the text is not sent anywhere.',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'The draft to check.' },
      strict: { type: 'boolean', description: 'Also use the strict style rules (more findings). Default false.' },
      lang: {
        type: 'string',
        enum: LANGUAGES,
        description: 'Language of the text. Default auto (guessed from the text).',
      },
    },
    required: ['text'],
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
};

// Turns a character offset into a 1-based line and column.
function position(text, offset) {
  const before = text.slice(0, offset);
  const line = before.split('\n').length;
  return { line, column: offset - before.lastIndexOf('\n') };
}

function error(message) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

/** Runs check_writing. `lint` is the lint() function from the tellbuster package. */
export function checkWriting(lint, args = {}) {
  const { text, strict = false, lang = 'auto' } = args;
  if (typeof text !== 'string') return error('"text" must be a string.');
  if (typeof strict !== 'boolean') return error('"strict" must be true or false.');
  if (!LANGUAGES.includes(lang)) return error(`"lang" must be one of: ${LANGUAGES.join(', ')}.`);

  const findings = lint(text, { strictStyle: strict, language: lang }).map((f) => ({
    ruleId: f.ruleId,
    name: f.name,
    severity: f.severity,
    match: f.match,
    ...position(text, f.start),
    start: f.start,
    end: f.end,
    message: f.message,
    why: f.why,
    fix: f.fix,
    ...(f.alsoMatched ? { alsoMatched: f.alsoMatched.map(({ ruleId, name }) => ({ ruleId, name })) } : {}),
  }));

  const count = findings.length;
  const lines =
    count === 0
      ? ['No tells found.']
      : [
          `${count} ${count === 1 ? 'phrase might' : 'phrases might'} read as AI. Rewrite them in your own words, then check again.`,
          ...findings.map(
            (f, i) =>
              `${i + 1}. "${f.match}" (line ${f.line}, column ${f.column}, ${f.severity}) ${f.name}: ${f.why} Fix: ${f.fix}${f.alsoMatched ? ` Also: ${f.alsoMatched.map((o) => o.name).join(', ')}.` : ''}`
          ),
        ];

  return {
    content: [{ type: 'text', text: lines.join('\n') }],
    structuredContent: { count, findings },
  };
}
