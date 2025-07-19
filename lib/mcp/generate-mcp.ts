export interface Parameter {
    name: string
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    description?: string
    required: boolean
    defaultValue?: string
  }
  
  export interface Tool {
    name: string
    description: string
    parameters: Parameter[]
    implementation: string
  }
  
  export interface Resource {
    name: string
    uri: string
    description: string
    isDynamic: boolean
    parameters: Parameter[]
    implementation: string
  }
  
  export interface Prompt {
    name: string
    description: string
    parameters: Parameter[]
    template: string
  }
  
  export interface ServerConfig {
    name: string
    version: string
    description?: string
    transport: 'stdio' | 'http'
    tools: Tool[]
    resources: Resource[]
    prompts: Prompt[]
  }
  
  export function generateServerCode(config: ServerConfig): { serverCode: string; packageJson: string } {
    const serverCode = generateServerJS(config)
    const packageJson = generatePackageJSON(config)
    
    return { serverCode, packageJson }
  }
  
  function generateServerJS(config: ServerConfig): string {
    const imports = generateImports(config)
    const serverSetup = generateServerSetup(config)
    const toolsCode = generateToolsCode(config.tools)
    const resourcesCode = generateResourcesCode(config.resources)
    const promptsCode = generatePromptsCode(config.prompts)
    const transportCode = generateTransportCode(config.transport)
  
    return `${imports}
  
  ${serverSetup}
  
  ${toolsCode}
  
  ${resourcesCode}
  
  ${promptsCode}
  
  ${transportCode}
  `
  }
  
  function generateImports(config: ServerConfig): string {
    const imports = [
      `import { McpServer${config.resources.some(r => r.isDynamic) ? ', ResourceTemplate' : ''} } from "@modelcontextprotocol/sdk/server/mcp.js";`,
    ]
  
    if (config.transport === 'stdio') {
      imports.push(`import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";`)
    } else {
      imports.push(`import express from "express";`)
      imports.push(`import { randomUUID } from "node:crypto";`)
      imports.push(`import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";`)
      imports.push(`import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";`)
    }
  
    if (config.tools.length > 0 || config.resources.length > 0 || config.prompts.length > 0) {
      imports.push(`import { z } from "zod";`)
    }
  
    return imports.join('\n')
  }
  
  function generateServerSetup(config: ServerConfig): string {
    return `// Create MCP server
  const server = new McpServer({
    name: "${config.name}",
    version: "${config.version}"${config.description ? `,\n  description: "${config.description}"` : ''}
  });`
  }
  
  function generateToolsCode(tools: Tool[]): string {
    if (tools.length === 0) return ''
  
    const toolsCode = tools.map(tool => {
      const paramsSchema = generateParametersSchema(tool.parameters)
      const implementation = tool.implementation.trim()
      
      return `// ${tool.description}
  server.tool(
    "${tool.name}",
    ${paramsSchema},
    ${implementation}
  );`
    }).join('\n\n')
  
    return `// Tools
  ${toolsCode}`
  }
  
  function generateResourcesCode(resources: Resource[]): string {
    if (resources.length === 0) return ''
  
    const resourcesCode = resources.map(resource => {
      const implementation = resource.implementation.trim()
      
      if (resource.isDynamic) {
        return `// ${resource.description}
  server.resource(
    "${resource.name}",
    new ResourceTemplate("${resource.uri}", { list: undefined }),
    ${implementation}
  );`
      } else {
        return `// ${resource.description}
  server.resource(
    "${resource.name}",
    "${resource.uri}",
    ${implementation}
  );`
      }
    }).join('\n\n')
  
    return `// Resources
  ${resourcesCode}`
  }
  
  function generatePromptsCode(prompts: Prompt[]): string {
    if (prompts.length === 0) return ''
  
    const promptsCode = prompts.map(prompt => {
      const paramsSchema = generateParametersSchema(prompt.parameters)
      const template = prompt.template.replace(/\{\{(\w+)\}\}/g, '${$1}')
      
      return `// ${prompt.description}
  server.prompt(
    "${prompt.name}",
    ${paramsSchema},
    (${prompt.parameters.length > 0 ? `{ ${prompt.parameters.map(p => p.name).join(', ')} }` : ''}) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: \`${template}\`
        }
      }]
    })
  );`
    }).join('\n\n')
  
    return `// Prompts
  ${promptsCode}`
  }
  
  function generateParametersSchema(parameters: Parameter[]): string {
    if (parameters.length === 0) return '{}'
  
    const schemaEntries = parameters.map(param => {
      let zodType = ''
      switch (param.type) {
        case 'string':
          zodType = 'z.string()'
          break
        case 'number':
          zodType = 'z.number()'
          break
        case 'boolean':
          zodType = 'z.boolean()'
          break
        case 'array':
          zodType = 'z.array(z.any())'
          break
        case 'object':
          zodType = 'z.object({})'
          break
      }
  
      if (!param.required) {
        zodType += '.optional()'
      }
  
      if (param.defaultValue) {
        zodType += `.default(${JSON.stringify(param.defaultValue)})`
      }
  
      return `${param.name}: ${zodType}`
    })
  
    return `{\n    ${schemaEntries.join(',\n    ')}\n  }`
  }
  
  function generateTransportCode(transport: 'stdio' | 'http'): string {
    if (transport === 'stdio') {
      return `// Start the server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.log("MCP server running on stdio");`
    } else {
      return `// HTTP Server Setup
  const app = express();
  app.use(express.json());
  
  // Map to store transports by session ID
  const transports = {};
  
  // Handle POST requests for client-to-server communication
  app.post('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    let transport;
  
    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          transports[sessionId] = transport;
        }
      });
  
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
  
      await server.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }
  
    await transport.handleRequest(req, res, req.body);
  });
  
  // Handle GET requests for server-to-client notifications via SSE
  app.get('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });
  
  // Handle DELETE requests for session termination
  app.delete('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(\`MCP server running on HTTP port \${PORT}\`);
  });`
    }
  }
  
  function generatePackageJSON(config: ServerConfig): string {
    const dependencies: Record<string, string> = {
      "@modelcontextprotocol/sdk": "^1.0.0",
      "zod": "^3.25.0"
    }
  
    if (config.transport === 'http') {
      dependencies["express"] = "^4.18.0"
    }
  
    const packageJson = {
      name: config.name,
      version: config.version,
      description: config.description || `MCP server: ${config.name}`,
      main: "server.js",
      type: "module",
      scripts: {
        start: "node server.js",
        dev: "node --watch server.js"
      },
      dependencies,
      keywords: ["mcp", "model-context-protocol", "ai", "llm"],
      author: "",
      license: "MIT"
    }
  
    return JSON.stringify(packageJson, null, 2)
  } 