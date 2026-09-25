// Checks the MCP server's tool (packages/mcp) and the Claude Code skill (skills/tellbuster).
// The tool code has no imports, so it runs here without installing the MCP SDK.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lint } from '../packages/core/src/main.js';
import { TOOL, checkWriting } from '../packages/mcp/src/tool.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

test('the tool is described with a JSON schema that needs only text', () => {
  assert.equal(TOOL.name, 'check_writing');
  assert.equal(TOOL.inputSchema.type, 'object');
  assert.deepEqual(TOOL.inputSchema.required, ['text']);
  assert.deepEqual(Object.keys(TOOL.inputSchema.properties).sort(), ['lang', 'strict', 'text']);
  assert.doesNotMatch(TOOL.description, /is AI|written by AI|AI detected/i);
});

test('findings come back as text and as data, with the why and the fix', () => {
  const text = "Hello.\nLet's delve into this.";
  const result = checkWriting(lint, { text });
  assert.equal(result.isError, undefined);
  assert.equal(result.content[0].type, 'text');
  assert.match(result.content[0].text, /phrases might read as AI/);

  const { count, findings } = result.structuredContent;
  assert.equal(count, findings.length);
  const delve = findings.find((f) => f.ruleId === 'en-delve');
  assert.ok(delve, 'en-delve should be found');
  for (const key of ['ruleId', 'name', 'severity', 'match', 'line', 'column', 'start', 'end', 'message', 'why', 'fix']) {
    assert.ok(key in delve, `missing ${key}`);
  }
  assert.equal(delve.match, 'delve');
  assert.equal(delve.line, 2);
  assert.equal(delve.column, 7);
  assert.equal(text.slice(delve.start, delve.end), 'delve');
  assert.ok(result.content[0].text.includes(delve.fix));
});

test('one finding reads "phrase", clean text reads "No tells found."', () => {
  assert.match(checkWriting(lint, { text: 'We should delve deeper.' }).content[0].text, /^1 phrase might read as AI/);
  const clean = checkWriting(lint, { text: 'We shipped the fix on Tuesday.' });
  assert.equal(clean.content[0].text, 'No tells found.');
  assert.deepEqual(clean.structuredContent, { count: 0, findings: [] });
});

test('strict and lang are passed to the engine', () => {
  const text = 'Il est important de noter que le projet avance.';
  assert.deepEqual(
    checkWriting(lint, { text, lang: 'fr' }).structuredContent.findings.map((f) => f.ruleId),
    lint(text, { language: 'fr' }).map((f) => f.ruleId)
  );
  const strictCount = (strict) => checkWriting(lint, { text: 'We moved fast; it worked.', strict }).structuredContent.count;
  assert.equal(strictCount(false), lint('We moved fast; it worked.').length);
  assert.equal(strictCount(true), lint('We moved fast; it worked.', { strictStyle: true }).length);
});

test('bad input returns an error result instead of throwing', () => {
  assert.equal(checkWriting(lint, {}).isError, true);
  assert.equal(checkWriting(lint, { text: 'Hi', strict: 'yes' }).isError, true);
  assert.equal(checkWriting(lint, { text: 'Hi', lang: 'xx' }).isError, true);
});

test('the package depends only on the MCP SDK and the tellbuster engine', () => {
  const pkg = JSON.parse(read('packages/mcp/package.json'));
  assert.equal(pkg.name, 'tellbuster-mcp');
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['@modelcontextprotocol/sdk', 'tellbuster']);
  assert.equal(pkg.bin['tellbuster-mcp'], './src/server.js');
  assert.match(read('packages/mcp/src/server.js'), /^#!\/usr\/bin\/env node/);
  // The engine's text never leaves the device: no network code in the server.
  for (const file of ['server.js', 'tool.js']) {
    assert.doesNotMatch(read(`packages/mcp/src/${file}`), /fetch\(|node:http|node:https|node:net|XMLHttpRequest/);
  }
});

test('the README covers Claude Code, Claude Desktop and Cursor', () => {
  const readme = read('packages/mcp/README.md');
  for (const heading of ['## Set it up in Claude Code', '## Set it up in Claude Desktop', '## Set it up in Cursor']) {
    assert.ok(readme.includes(heading), `missing "${heading}"`);
  }
});

test('the skill has a name and a description and runs npx tellbuster', () => {
  const skill = read('skills/tellbuster/SKILL.md');
  assert.match(skill, /^---\nname: tellbuster\ndescription: .+\n---\n/);
  assert.match(skill, /npx -y tellbuster/);
});

test('the new docs have no em dashes', () => {
  for (const file of ['packages/mcp/README.md', 'skills/tellbuster/SKILL.md', 'packages/mcp/src/tool.js']) {
    assert.ok(!read(file).includes('—'), `${file} has an em dash`);
  }
});
