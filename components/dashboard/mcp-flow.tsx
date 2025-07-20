"use client";

import "@xyflow/react/dist/style.css";
import React from "react";
import JSZip from "jszip";

import {
  Background,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeTypes,
  type Edge,
  type EdgeTypes,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  useReactFlow,
  ReactFlowInstance,
  FitViewOptions,
} from "@xyflow/react";
import { useCallback, useEffect, useState, DragEvent, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Components
import CustomDeletableEdge from "../mcp-flow/custom-deletable-edge";
import ToolNode from "../mcp-flow/tool-node";
import JsonInputNode from "../mcp-flow/json-input-node";
import { FloatingMenu } from "../mcp-flow/floating-menu";
import { FloatingButton } from "../mcp-flow/floating-button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertMessage } from "./alert-message";
import { useConnectionHighlight } from "../mcp-flow/hooks/use-connection-highlight";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
// Utils
import { createClient } from "@/lib/supabase/client";
import { LAYOUT_CONFIG, getConfiguredBaseUrl } from "@/lib/mcp/constants";
import { Tool, ServerConfig, generateServerCode, convertNodeToTool } from "@/lib/mcp/generate-mcp";

// Type definitions
type NodeData = Record<string, any>;
type CustomNode = Node<NodeData>;
type NodeTypesMap = {
  "tool-node": React.ComponentType<any>;
  "json-input-node": React.ComponentType<any>;
};

interface FlowWrapperProps {
  nodes: CustomNode[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  nodeTypes: NodeTypesMap;
  edgeTypes: EdgeTypes;
  isValidConnection: (connection: Edge | Connection) => boolean;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
}

interface FlowData {
  nodes: CustomNode[];
  edges: Edge[];
}

interface McpFlowData {
  user_id: string;
  active: boolean;
  flow: FlowData;
}

// Constants
const supabase = createClient();

const initialNodes: CustomNode[] = [
  {
    id: "node-1",
    type: "json-input-node",
    position: { x: 100, y: 100 },
    data: {},
  },
];
const CENTER_FLOW_TIMEOUT = 200;
const NODE_TYPE_MAP: Record<string, string> = {
  'tool': 'tool-node',
  'json-input': 'json-input-node'
};

const DEFAULT_FIT_VIEW_OPTIONS: FitViewOptions = {
  padding: 0.2,
  includeHiddenNodes: false,
  duration: 0
};

// FlowWrapper component with proper TypeScript typing
function FlowWrapper({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes,
  edgeTypes,
  isValidConnection,
  onDrop,
  onDragOver
}: FlowWrapperProps): React.JSX.Element {
  const reactFlowInstance = useReactFlow();
  const centeringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);
  
  // Use the connection highlight hook
  const { onConnectStart, onConnectEnd } = useConnectionHighlight(isValidConnection);
  
  // Center the flow content after nodes and edges are loaded
  useEffect(() => {
    if (nodes.length > 0) {
      // Clear any existing timeout
      if (centeringTimeoutRef.current) {
        clearTimeout(centeringTimeoutRef.current);
      }
      
      // Set a timeout to ensure nodes are properly rendered
      centeringTimeoutRef.current = setTimeout(() => {
        // Only auto-fit on initial load or when nodes are significantly changed
        if (initialLoadRef.current || nodes.length > 1) {
          reactFlowInstance.fitView(DEFAULT_FIT_VIEW_OPTIONS);
          if (initialLoadRef.current) {
            initialLoadRef.current = false; // Mark initial load as complete
          }
        }
      }, CENTER_FLOW_TIMEOUT);
    }
    
    return () => {
      if (centeringTimeoutRef.current) {
        clearTimeout(centeringTimeoutRef.current);
      }
    };
  }, [nodes.length, reactFlowInstance]); // Changed dependency to nodes.length to trigger on significant changes

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={{ type: "deletable" }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      isValidConnection={isValidConnection}
      minZoom={0.3}
      maxZoom={1.5}
      className="w-full h-full bg-slate-50/50"
    >
      <Background />
      <Controls className="text-black" />
    </ReactFlow>
  );
}

export default function McpFlow(): React.JSX.Element {
  const [nodes, setNodes] = useState<CustomNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [active, setActive] = useState<boolean>(false);
  const [upgradeDialog, setUpgradeDialog] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSavedState, setLastSavedState] = useState<{ nodes: CustomNode[]; edges: Edge[] }>({ nodes: [], edges: [] });

  const checkUnsavedChanges = useCallback(() => {
    // Helper function to compare arrays by stringifying them
    const compareArrays = (arr1: any[], arr2: any[]) => {
      const stringify = (arr: any[]) => arr.map(item => {
        // For nodes, only compare id, type, position and data
        if ('type' in item) {
          return JSON.stringify({
            id: item.id,
            type: item.type,
            position: item.position,
            data: item.data
          });
        }
        // For edges, compare all properties
        return JSON.stringify(item);
      }).sort();
      
      return JSON.stringify(stringify(arr1)) === JSON.stringify(stringify(arr2));
    };

    return !compareArrays(nodes, lastSavedState.nodes) || !compareArrays(edges, lastSavedState.edges);
  }, [nodes, edges, lastSavedState]);

  const navGuard = useNavigationGuard({ enabled: checkUnsavedChanges() });
  
  const theme = useTheme();
  const router = useRouter();

  const nodeTypes = useMemo<NodeTypesMap>(() => ({
    "tool-node": ToolNode,
    "json-input-node": JsonInputNode,
  }), []);

  const edgeTypes = useMemo<EdgeTypes>(() => ({
    deletable: CustomDeletableEdge,
  }), []);


  useEffect(() => {
    const fetchFlow = async (): Promise<void> => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("mcp")
          .select("*")
          .eq('user_id', user.id)
          .single<McpFlowData>();
          
        if (error) throw error;
        
        if (data && data.flow) {
          setNodes(data.flow.nodes);
          setActive(data.active);
          setLastSavedState({ nodes: data.flow.nodes, edges: data.flow.edges });
          
          // Set edges with small delay to ensure nodes are rendered first
          setTimeout(() => {
            setEdges(data.flow.edges);
            setIsLoading(false);
          }, 100);
        } else {
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error.code === 'PGRST116') {
          setIsLoading(false);
        } else {
          console.error("Error fetching flow:", error);
          toast.error("Failed to load flow");
        }
        setIsLoading(false);
      }
    };
    
    fetchFlow();
  }, []);

  // Node and edge change handlers with proper typing
  const onNodesChange = useCallback(
    (changes: NodeChange[]): void => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]): void => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Connection validation with improved typing
  const isValidConnection = useCallback(
    (connection: Edge | Connection): boolean => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);

      if (!sourceNode?.type || !targetNode?.type) return false;

      // Check if the source is a suggestion node and the handle is already connected
      if (sourceNode.type === "suggestion-node" && connection.sourceHandle) {
        const isHandleConnected = edges.some(edge => 
          edge.source === connection.source && 
          edge.sourceHandle === connection.sourceHandle
        );
        if (isHandleConnected) return false;
      }

      // Default JSON input node can connect to tool nodes
      if (sourceNode.id === "node-1") {
        return ["tool-node"].includes(targetNode.type);
      }

      // Connection rules based on node types
      const connectionRules: Record<string, string[]> = {
        "tool-node": ["json-input-node"],
        "json-input-node": ["tool-node"],
      };

      // Check if connection is allowed based on source and target types
      if (connectionRules[sourceNode.type]) {
        if (connectionRules[sourceNode.type].includes(targetNode.type)) {
          // Additional check to prevent connecting back to the default node
          if (
            sourceNode.type === "tool-node" && 
            targetNode.id === "node-1"
          ) {
            return false;
          }
          return true;
        }
      }

      return false;
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (connection: Connection): void => {
      if (isValidConnection(connection)) {
        setEdges(eds => addEdge({ ...connection, type: 'deletable' }, eds));
      }
    },
    [isValidConnection]
  );

  // Flow state toggle
  const handleFlowSwitch = useCallback(async (): Promise<void> => {
    const newActive = !active;
    setActive(newActive);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("You must be logged in to update flow status");
        setActive(!newActive); // Revert on error
        return;
      }

      const { error } = await supabase
        .from("mcp")
        .update({ active: newActive })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      toast.error("Failed to update flow status");
      setActive(!newActive); // Revert on error
    }
  }, [active]);

  // Save flow with proper type annotations
  const saveFlow = useCallback(async (): Promise<void> => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("You must be logged in to save flows");
        return;
      }

      // Get connected form nodes
      const formNodes = nodes.filter(node => node.type === "form-node");
      const connectedFormIds = formNodes
        .filter(node => edges.some(edge => edge.target === node.id))
        .map(node => node.data?.formId)
        .filter(Boolean) as string[];

      // Save flow data
      const { error: flowError } = await supabase.from("mcp").upsert(
        {
          user_id: user.id,
          active: active,
          flow: { nodes, edges },
        },
        { onConflict: "user_id" }
      );

      if (flowError) throw flowError;

      // Update last saved state after successful save
      setLastSavedState({ nodes, edges });
      toast.success("Flow saved successfully");
    } catch (error) {
      console.error("Error saving flow:", error);
      toast.error("Failed to save flow");
    }
  }, [nodes, edges, active]);

  // Drag and drop handlers with proper typings
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    
    const reactFlowBounds = document.querySelector('.react-flow-wrapper')?.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    
    if (!reactFlowBounds || !type) return;

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode: CustomNode = {
      id: `${type}-${nodes.length + 1}`,
      type: NODE_TYPE_MAP[type] || 'tool-node',
      position,
      data: {},
    };

    setNodes(nds => [...nds, newNode]);
  }, [nodes]);

  const onDragStart = useCallback((event: DragEvent<HTMLDivElement>, nodeType: string): void => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const generateMcpServer = useCallback(async () => {
    // Get only tool nodes that are connected to json-input nodes
    const connectedToolNodes = nodes.filter(node => {
      if (node.type !== 'tool-node') return false;
      
      // Check if this tool node has an incoming connection from a json-input node
      return edges.some(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        return edge.target === node.id && sourceNode?.type === 'json-input-node';
      });
    });
    
    if (connectedToolNodes.length === 0) {
      toast.error("No connected tool nodes found. Please connect tool nodes to JSON input nodes to generate MCP server.");
      return;
    }

    try {
      // Get current user ID for naming
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id?.slice(0, 8) || 'user';
      const serverName = `mcp-server-${userId}`;

      // Get the current base URL configuration
      const currentBaseUrl = getConfiguredBaseUrl();

      // Convert connected tool nodes to the proper Tool format
      const tools: Tool[] = [];
      const usedNames = new Set<string>();
      
      connectedToolNodes.forEach(node => {
        const tool = convertNodeToTool(node, currentBaseUrl);
        const originalName = tool.name;
        let counter = 1;
        
        // Ensure unique tool names
        while (usedNames.has(tool.name)) {
          tool.name = `${originalName}-${counter}`;
          counter++;
        }
        
        usedNames.add(tool.name);
        tools.push(tool);
      });

      // Create server configuration
      const serverConfig: ServerConfig = {
        name: serverName,
        version: "1.0.0",
        description: `Generated MCP server with ${tools.length} tools`,
        transport: 'stdio',
        tools,
        resources: [],
        prompts: []
      };

      // Generate server code and package.json
      const { serverCode, packageJson } = generateServerCode(serverConfig, currentBaseUrl);

      // Create ZIP file
      const zip = new JSZip();
      zip.file("index.js", serverCode);
      zip.file("package.json", packageJson);
      zip.file("README.md", `# ${serverName}

Generated MCP server with the following tools:
${tools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Make the server executable (if needed):
   \`\`\`bash
   chmod +x index.js
   \`\`\`

3. Run the server:
   \`\`\`bash
   npm start
   \`\`\`

## Usage

This MCP server can be used with any MCP-compatible client. The server runs on stdio transport by default.

### Configuration Examples

#### Claude Desktop
Add to your \`claude_desktop_config.json\`:
\`\`\`json
{
  "mcpServers": {
    "${serverName}": {
      "command": "node",
      "args": ["path/to/${serverName}/index.js"]
    }
  }
}
\`\`\`

#### Continue.dev
Add to your MCP configuration:
\`\`\`json
{
  "command": "node",
  "args": ["path/to/${serverName}/index.js"]
}
\`\`\`

#### Using npx (if published)
\`\`\`json
{
  "command": "npx",
  "args": ["-y", "${serverName}"]
}
\`\`\`

## Available Tools

${tools.map(tool => `### ${tool.name}
${tool.description}

Parameters:
${Object.entries(tool.parameters).map(([name, param]) => `- **${name}** (${param.type}${param.optional ? ', optional' : ''}): ${param.description}`).join('\n') || 'No parameters'}
`).join('\n')}

## Troubleshooting

If you get "Command not found" errors:

1. Ensure Node.js is installed and accessible in your PATH
2. Verify the path to \`index.js\` is correct in your configuration
3. Check that the file has execute permissions: \`chmod +x index.js\`
4. For Windows, you may need to use the full path to node.exe

## Development

To test the server manually:
\`\`\`bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' | node index.js
\`\`\`
`);

      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const linkElement = document.createElement('a');
      linkElement.href = zipUrl;
      linkElement.download = `${serverName}.zip`;
      linkElement.click();
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
      
      toast.success(`MCP server generated with ${tools.length} connected tools and downloaded as ZIP`);
    } catch (error) {
      console.error("Error generating MCP server:", error);
      toast.error("Failed to generate MCP server");
    }
  }, [nodes, edges]);

  // Auto-layout function to arrange nodes in a proper grid
  const handleAutoLayout = useCallback(() => {
    toast.info("Arranging nodes...");
    
    setNodes(currentNodes => {
      // Separate different types of nodes
      const inputNodes = currentNodes.filter(node => node.type === 'json-input-node');
      const toolNodes = currentNodes.filter(node => node.type === 'tool-node');
      const otherNodes = currentNodes.filter(node => 
        node.type !== 'json-input-node' && node.type !== 'tool-node'
      );

      // Use centralized layout configuration
      const updatedNodes = [...currentNodes];

      // Position input nodes first (left column, well-spaced vertically)
      inputNodes.forEach((node, index) => {
        const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          updatedNodes[nodeIndex] = {
            ...node,
            position: {
              x: LAYOUT_CONFIG.BASE_X,
              y: LAYOUT_CONFIG.BASE_Y + (index * LAYOUT_CONFIG.INPUT_NODE_SPACING)
            }
          };
        }
      });

      // Group tool nodes by their source connections for better organization
      const getConnectedInputNode = (toolNode: any) => {
        return edges.find(edge => edge.target === toolNode.id)?.source || null;
      };

      // Group tool nodes by their input source
      const toolGroups: { [key: string]: any[] } = {};
      const ungroupedTools: any[] = [];

      toolNodes.forEach(toolNode => {
        const sourceId = getConnectedInputNode(toolNode);
        if (sourceId && inputNodes.find(n => n.id === sourceId)) {
          if (!toolGroups[sourceId]) {
            toolGroups[sourceId] = [];
          }
          toolGroups[sourceId].push(toolNode);
        } else {
          ungroupedTools.push(toolNode);
        }
      });

      // Position tool nodes in groups relative to their input nodes
      let globalToolIndex = 0;
      
      // Position grouped tools first
      inputNodes.forEach((inputNode, inputIndex) => {
        const connectedTools = toolGroups[inputNode.id] || [];
        
        connectedTools.forEach((toolNode, toolIndex) => {
          const row = Math.floor(toolIndex / LAYOUT_CONFIG.NODES_PER_ROW);
          const col = toolIndex % LAYOUT_CONFIG.NODES_PER_ROW;
          
          const nodeIndex = updatedNodes.findIndex(n => n.id === toolNode.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...toolNode,
              position: {
                x: LAYOUT_CONFIG.BASE_X + LAYOUT_CONFIG.TOOL_GRID_OFFSET_X + (col * (LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING)),
                y: LAYOUT_CONFIG.BASE_Y + (inputIndex * LAYOUT_CONFIG.INPUT_NODE_SPACING) + (row * (LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING))
              }
            };
          }
        });
        
        globalToolIndex += connectedTools.length;
      });

      // Position ungrouped tool nodes in a separate area
      ungroupedTools.forEach((toolNode, index) => {
        const row = Math.floor(index / LAYOUT_CONFIG.NODES_PER_ROW);
        const col = index % LAYOUT_CONFIG.NODES_PER_ROW;
        
        const nodeIndex = updatedNodes.findIndex(n => n.id === toolNode.id);
        if (nodeIndex !== -1) {
          updatedNodes[nodeIndex] = {
            ...toolNode,
            position: {
              x: LAYOUT_CONFIG.BASE_X + LAYOUT_CONFIG.TOOL_GRID_OFFSET_X + (col * (LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING)),
              y: LAYOUT_CONFIG.BASE_Y + (inputNodes.length * LAYOUT_CONFIG.INPUT_NODE_SPACING) + 200 + (row * (LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING))
            }
          };
        }
      });

      // Position other nodes if any (far right)
      otherNodes.forEach((node, index) => {
        const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          updatedNodes[nodeIndex] = {
            ...node,
            position: {
              x: LAYOUT_CONFIG.BASE_X + LAYOUT_CONFIG.OTHER_NODES_OFFSET_X,
              y: LAYOUT_CONFIG.BASE_Y + (index * (LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING))
            }
          };
        }
      });

      return updatedNodes;
    });

    // Auto-fit the view after layout with a slight delay
    setTimeout(() => {
      // This will trigger the fitView in the FlowWrapper useEffect
      setNodes(nodes => [...nodes]);
    }, 150);

    toast.success("Nodes arranged automatically");
  }, [setNodes, edges]); // Added edges as dependency to consider connections


  return (
    <div className="w-full h-[calc(100vh-6rem)] relative">
      <div className="w-full h-full react-flow-wrapper">
        <ReactFlowProvider>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <FlowWrapper
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              isValidConnection={isValidConnection}
              onDrop={onDrop}
              onDragOver={onDragOver}
            />
          )}
        </ReactFlowProvider>
      </div>
      
      {navGuard.active && (
        <AlertDialog open={navGuard.active}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={navGuard.reject}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={navGuard.accept}>Leave Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      <FloatingButton 
        saveFlow={saveFlow}
        onGenerateMcpServer={generateMcpServer}
        onAutoLayout={handleAutoLayout}
      />

      <FloatingMenu 
        onDragStart={onDragStart}
      />
      
      <div className="absolute top-0 ml-4">
        <AlertMessage />
      </div>
    </div>
  );
}