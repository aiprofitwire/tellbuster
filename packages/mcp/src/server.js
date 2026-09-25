#!/usr/bin/env node
// The Tellbuster MCP server: one tool, check_writing, over standard input and output.
// Nothing is sent over the network. The text is checked on this device and forgotten.
import { readFileSync } from 'node:fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { lint } from 'tellbuster';
import { TOOL, checkWriting } from './tool.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const server = new Server({ name: 'tellbuster', version }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [TOOL] }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== TOOL.name) {
    return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }] };
  }
  return checkWriting(lint, request.params.arguments);
});

await server.connect(new StdioServerTransport());
