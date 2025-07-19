"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, FileJson, Zap } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { BaseHandle } from "./base-handle";
import { NodeAddButton } from "./node-add-button";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { getConfiguredBaseUrl, replaceUrlVariables, LAYOUT_CONFIG, calculateOptimalLayout } from "@/lib/mcp/constants";

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
  };
  item: PostmanItem[];
  variable?: Array<{
    key: string;
    value: string;
  }>;
}

interface PostmanItem {
  name: string;
  request?: {
    method: string;
    header?: Array<{
      key: string;
      value: string;
    }>;
    url: {
      raw: string;
      host?: string[];
      path?: string[];
      query?: Array<{
        key: string;
        value: string;
        description?: string;
        disabled?: boolean;
      }>;
    } | string;
    body?: {
      mode: string;
      raw?: string;
    };
  };
  item?: PostmanItem[]; // For nested folders
  event?: any[];
}

export default function JsonInputNode({ id, data }: { id: string; data: any }) {
  const { deleteElements, setNodes, setEdges, getEdges, getNodes } = useReactFlow();
  const [jsonInput, setJsonInput] = useState<string>(data?.jsonInput || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDeleteNode = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [deleteElements, id]);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    // Update node data
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, jsonInput: value } } : node
      )
    );
  };

  const validateJsonInput = (): PostmanCollection | null => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Basic validation for Postman collection structure
      if (!parsed.info || !parsed.item || !Array.isArray(parsed.item)) {
        toast.error("Invalid Postman collection format");
        return null;
      }

      return parsed as PostmanCollection;
    } catch (error) {
      toast.error("Invalid JSON format");
      return null;
    }
  };

  const analyzeTools = useCallback(() => {
    const collection = validateJsonInput();
    if (!collection) return;

    setIsAnalyzing(true);
    
    try {
      const sourceNode = getNodes().find(node => node.id === id);
      if (!sourceNode) {
        toast.error("Source node not found");
        return;
      }

      const toolNodes: any[] = [];
      const edges: any[] = [];
      let nodeIndex = 0;

      // Extract base URL from configuration or collection variables
      let baseUrl = getConfiguredBaseUrl();
      
      // Collection variables can override the configured base URL
      if (collection.variable) {
        const baseUrlVar = collection.variable.find(v => v.key === "baseUrl");
        if (baseUrlVar && baseUrlVar.value) {
          baseUrl = baseUrlVar.value;
        }
      }

      // Pre-process to count total nodes for better centering
      let totalNodeCount = 0;
      const countItems = (items: any[]) => {
        items.forEach((item) => {
          if (!item || !item.name) return;
          
          if (item.request && item.request.method && (item.request.url || item.request.url?.raw)) {
            totalNodeCount++;
          } else if (item.item && Array.isArray(item.item)) {
            countItems(item.item);
          }
        });
      };
      countItems(collection.item);

      // Function to calculate position using improved grid layout
      const calculateNodePosition = (index: number, totalNodes: number) => {
        const { rows, cols } = calculateOptimalLayout(totalNodes);
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        // Start from source position and create a cleaner grid
        const startX = sourceNode.position.x + LAYOUT_CONFIG.SOURCE_OFFSET_X;
        const startY = sourceNode.position.y;
        
        // Calculate centered grid position based on optimal layout
        const gridWidth = cols * (LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING) - LAYOUT_CONFIG.HORIZONTAL_SPACING;
        const gridHeight = rows * (LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING) - LAYOUT_CONFIG.VERTICAL_SPACING;
        
        const horizontalOffset = -gridWidth / 2; // Center horizontally if needed
        const verticalOffset = -gridHeight / 2;  // Center the grid vertically
        
        return {
          x: startX + horizontalOffset + (col * (LAYOUT_CONFIG.NODE_WIDTH + LAYOUT_CONFIG.HORIZONTAL_SPACING)),
          y: startY + verticalOffset + (row * (LAYOUT_CONFIG.NODE_HEIGHT + LAYOUT_CONFIG.VERTICAL_SPACING))
        };
      };

      // Function to process individual request items
      const processItem = (item: PostmanItem, parentName = "") => {
        if (!item.request) return; // Skip items without request (folders)
        
        const toolNodeId = `tool-${Date.now()}-${nodeIndex}`;
        
        // Extract URL information
        let url = "";
        let parameters: any[] = [];
        
        if (typeof item.request.url === "string") {
          url = item.request.url;
        } else if (item.request.url && item.request.url.raw) {
          url = item.request.url.raw;
          
          // Extract query parameters if they exist
          if (item.request.url.query) {
            parameters = item.request.url.query.map((query: any) => ({
              name: query.key,
              description: query.description || `Query parameter: ${query.key}`,
              type: "string",
              defaultValue: query.value || "",
              isOptional: query.disabled || false
            }));
          }
        }

        // Replace variables in URL with actual values
        url = replaceUrlVariables(url, baseUrl);

        // Skip if URL is empty or invalid
        if (!url || url.trim() === "") {
          console.warn(`Skipping item "${item.name}" - no valid URL found`);
          return;
        }

        // Extract headers
        const headers = item.request.header?.map(h => ({
          key: h.key,
          value: h.value
        })) || [];

        // Extract body and try to parse for potential parameters
        let requestBody = "";
        if (item.request.body?.mode === "raw" && item.request.body.raw) {
          requestBody = item.request.body.raw;
          
          // If it's JSON, try to extract potential parameters from the structure
          try {
            const bodyObj = JSON.parse(item.request.body.raw);
            if (typeof bodyObj === 'object' && bodyObj !== null) {
              const bodyParams = Object.keys(bodyObj).map(key => ({
                name: `body_${key}`,
                description: `Body parameter: ${key}`,
                type: typeof bodyObj[key] === 'number' ? 'number' : 
                      typeof bodyObj[key] === 'boolean' ? 'boolean' : 'string',
                defaultValue: String(bodyObj[key]),
                isOptional: false
              }));
              parameters = [...parameters, ...bodyParams];
            }
          } catch (e) {
            // Not valid JSON, keep as is
          }
        }

        // Create a meaningful name
        const nodeName = parentName ? `${parentName} - ${item.name}` : item.name;

        // Generate a prompt description based on the endpoint
        const generatePromptDescription = (name: string, method: string, url: string) => {
          const cleanUrl = url.replace(/{{.*?}}/g, '[variable]').replace(/\?.*$/, '');
          return `Use this tool when the user needs to ${method.toLowerCase()} ${name.toLowerCase()}. This endpoint: ${cleanUrl}`;
        };

        const method = item.request.method || "GET";

        // Calculate position using auto-layout
        const position = calculateNodePosition(nodeIndex, totalNodeCount);

        // Create tool node
        const toolNode = {
          id: toolNodeId,
          type: "tool-node",
          position: position,
          data: {
            method: method,
            url: url,
            headers: headers,
            requestBody: requestBody,
            name: nodeName,
            parameters: parameters,
            promptDescription: generatePromptDescription(nodeName, method, url)
          },
        };

        toolNodes.push(toolNode);

        // Create edge from json-input node to tool node
        const edge = {
          id: `edge-${nanoid()}`,
          source: id,
          sourceHandle: `${id}-output`,
          target: toolNodeId,
          targetHandle: `${toolNodeId}-input`,
          type: 'deletable',
        };

        edges.push(edge);
        nodeIndex++;
      };

      // Function to recursively process collection items (handles nested folders)
      const processItems = (items: any[], parentName = "") => {
        items.forEach((item) => {
          // Validate item structure
          if (!item || !item.name) {
            console.warn("Skipping invalid item:", item);
            return;
          }
          
          if (item.request) {
            // This is a request item - validate it has proper structure
            if (item.request.method && (item.request.url || item.request.url?.raw)) {
              processItem(item, parentName);
            } else {
              console.warn(`Skipping request item "${item.name}" - missing method or URL`);
            }
          } else if (item.item && Array.isArray(item.item)) {
            // This is a folder with sub-items
            processItems(item.item, item.name);
          } else {
            console.warn(`Skipping item "${item.name}" - not a request or folder`);
          }
        });
      };

      // Process all items in the collection
      processItems(collection.item);

      // Add nodes and edges to the flow
      setNodes(nodes => [...nodes, ...toolNodes]);
      setEdges(currentEdges => [...currentEdges, ...edges]);

      // Auto-fit the view after adding nodes with improved timing
      setTimeout(() => {
        // Trigger a re-render to ensure fitView works properly
        setNodes(nodes => [...nodes]);
      }, 300);

      toast.success(`Generated ${toolNodes.length} tool nodes from collection`);
    } catch (error) {
      console.error("Error analyzing tools:", error);
      toast.error("Failed to analyze tools");
    } finally {
      setIsAnalyzing(false);
    }
  }, [id, jsonInput, getNodes, setNodes, setEdges]);

  // Check if the output handle is connected
  const isOutputConnected = useCallback(() => {
    const edges = getEdges();
    return edges.some(edge => edge.source === id && edge.sourceHandle === `${id}-output`);
  }, [getEdges, id]);

  return (
    <Card className="w-[500px] shadow-[0px_1px_3px_0px_#00000024]" style={{ transition: 'border-color 0.2s, border-width 0.1s' }}>
      <CardHeader className="flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-900 px-5 py-1">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          <CardTitle className="text-md grow">JSON Input</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteNode}
            className="h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>

      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <BaseHandle
          type="target"
          position={Position.Left}
          id={`${id}-input`}
          className="w-3 h-3 bg-muted-foreground"
        />
      </div>

      <div className="absolute right-0 top-1/2 translate-x-1/4 -translate-y-1/2 flex flex-col items-center gap-3">
        <BaseHandle
          type="source"
          position={Position.Right}
          id={`${id}-output`}
          className="w-3 h-3 bg-muted-foreground"
        />
        {!isOutputConnected() && (
          <NodeAddButton
            sourceNodeId={id}
            sourceNodeType="json-input-node"
            sourceHandleId={`${id}-output`}
          />
        )}
      </div>

      <CardContent className="px-5 py-4">
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Postman Collection JSON</Label>
            <Textarea
              placeholder="Paste your Postman collection JSON here..."
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="min-h-[200px] font-mono text-xs"
            />
          </div>

          <Button
            onClick={analyzeTools}
            disabled={!jsonInput.trim() || isAnalyzing}
            className="w-full"
            variant="default"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Analyze Tools"}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p>Paste a Postman collection JSON to automatically generate tool nodes for each endpoint.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 