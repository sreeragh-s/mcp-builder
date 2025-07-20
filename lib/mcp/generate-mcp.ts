// Types for MCP server generation
import { replaceUrlVariables } from './constants';

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    optional?: boolean;
  }>;
  implementation: string;
}

export interface ServerConfig {
  name: string;
  version: string;
  description: string;
  transport: string;
  tools: Tool[];
  resources: any[];
  prompts: any[];
}

// Helper function to convert tool node data to MCP parameters format
function convertToMcpParameters(parameters: any[]): Record<string, { type: string; description: string; optional?: boolean }> {
  const mcpParams: Record<string, { type: string; description: string; optional?: boolean }> = {};
  
  if (!parameters || !Array.isArray(parameters)) {
    return mcpParams;
  }
  
  parameters.forEach(param => {
    if (param.name && param.type) {
      mcpParams[param.name] = {
        type: param.type,
        description: param.description || `Parameter ${param.name}`,
        optional: param.required !== true
      };
    }
  });
  
  return mcpParams;
}

// Helper function to generate parameter destructuring for function signature
function generateParameterSignature(parameters: Record<string, any>): string {
  const paramNames = Object.keys(parameters);
  return paramNames.length > 0 ? `{ ${paramNames.join(', ')} }` : '{}';
}

// Helper function to generate URL with query parameters
function generateUrlWithParams(baseUrl: string, method: string, parameters: Record<string, any>): string {
  const paramNames = Object.keys(parameters);
  
  if (method === 'GET' && paramNames.length > 0) {
    const queryParams = paramNames
      .filter(name => parameters[name].optional)
      .map(name => `${name} ? \`${name}=\${${name}}\` : null`)
      .join(', ');
    
    if (queryParams) {
      return `\`${baseUrl}?\${[${queryParams}].filter(Boolean).join('&')}\``;
    }
  }
  
  return `"${baseUrl}"`;
}

// Generate MCP tool implementation based on node data
function generateToolImplementation(nodeData: any, baseUrl?: string): string {
  const method = nodeData.method || 'GET';
  const rawUrl = nodeData.url || '';
  const url = replaceUrlVariables(rawUrl, baseUrl); // Replace {{baseUrl}} and other variables
  const parameters = convertToMcpParameters(nodeData.parameters || []);
  const paramSignature = generateParameterSignature(parameters);
  const headers = nodeData.headers || [];
  const requestBody = nodeData.requestBody;
  
  // Generate headers string
  const headersStr = headers
    .map((h: any) => `        "${h.key}": "${h.value}"`)
    .join(',\n');
  
  // Generate the URL (with query params for GET requests)
  const urlExpression = generateUrlWithParams(url, method, parameters);
  
  return `async (${paramSignature}) => {
    try {
      const url = ${urlExpression};
      ${method === 'GET' ? `
      const response = await axios.get(url);` : `
      const response = await axios.${method.toLowerCase()}(url, ${requestBody ? JSON.stringify(requestBody, null, 6) : 'undefined'}, {
        headers: {
          "Content-Type": "application/json",${headersStr ? '\n' + headersStr : ''}
        }
      });`}
      
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    } catch (error) {
      throw new Error(\`Failed to ${method.toLowerCase()} ${url.replace(/\$\{.*?\}/g, '[param]')}: \${error.message}\`);
    }
  }`;
}

// Convert tool node to MCP tool format
export function convertNodeToTool(node: any, baseUrl?: string): Tool {
  const nodeData = node.data || {};
  
  // Generate a more unique tool name by combining URL path and method
  let toolName = '';
  if (nodeData.url) {
    try {
      const processedUrl = replaceUrlVariables(nodeData.url, baseUrl);
      const url = new URL(processedUrl);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      const method = (nodeData.method || 'GET').toLowerCase();
      
      if (pathParts.length > 0) {
        // Use the last meaningful part of the path + method
        const lastPart = pathParts[pathParts.length - 1];
        toolName = `${method}-${lastPart}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      } else {
        // Fallback to method + domain
        const domain = url.hostname.replace(/[^a-zA-Z0-9]/g, '-');
        toolName = `${method}-${domain}`.toLowerCase();
      }
    } catch (error) {
      // If URL parsing fails, create a safe name from the processed URL string
      const processedUrl = replaceUrlVariables(nodeData.url, baseUrl);
      const safeUrl = processedUrl.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const method = (nodeData.method || 'GET').toLowerCase();
      toolName = `${method}-${safeUrl}`.substring(0, 50); // Limit length
    }
  } else {
    // Fallback to node ID
    toolName = `tool-${node.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  }
  
  return {
    name: toolName,
    description: nodeData.promptDescription || `Generated tool for ${replaceUrlVariables(nodeData.url || 'endpoint', baseUrl)}`,
    parameters: convertToMcpParameters(nodeData.parameters || []),
    implementation: generateToolImplementation(nodeData, baseUrl)
  };
}

// Generate complete MCP server code
export function generateServerCode(config: ServerConfig, baseUrl?: string): { serverCode: string; packageJson: string } {
  const serverCode = `#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";

const server = new McpServer({
  name: "${config.name}",
  version: "${config.version}",
});

${config.tools.map(tool => `server.tool(
  "${tool.name}",
  ${JSON.stringify(tool.parameters, null, 2)},
  ${tool.implementation}
);`).join('\n\n')}

const transport = new StdioServerTransport();
await server.connect(transport);
`;

  const packageJson = `{
  "name": "${config.name}",
  "version": "${config.version}",
  "description": "${config.description}",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "axios": "^1.9.0",
    "dotenv": "^16.4.5",
    "node-fetch": "^3.3.2"
  }
}`;

  return { serverCode, packageJson };
} 