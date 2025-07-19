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

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
  };
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  request: {
    method: string;
    header?: Array<{
      key: string;
      value: string;
    }>;
    url: {
      raw: string;
      host?: string[];
      path?: string[];
    } | string;
    body?: {
      mode: string;
      raw?: string;
    };
  };
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

      // Process each item in the collection
      collection.item.forEach((item) => {
        const toolNodeId = `tool-${Date.now()}-${nodeIndex}`;
        
        // Extract URL information
        let url = "";
        if (typeof item.request.url === "string") {
          url = item.request.url;
        } else if (item.request.url && item.request.url.raw) {
          url = item.request.url.raw;
        }

        // Extract headers
        const headers = item.request.header?.map(h => ({
          key: h.key,
          value: h.value
        })) || [];

        // Extract body
        let requestBody = "";
        if (item.request.body?.mode === "raw" && item.request.body.raw) {
          requestBody = item.request.body.raw;
        }

        // Create tool node
        const toolNode = {
          id: toolNodeId,
          type: "tool-node",
          position: {
            x: sourceNode.position.x + 450,
            y: sourceNode.position.y + (nodeIndex * 300), // Stack vertically
          },
          data: {
            method: item.request.method || "GET",
            url: url,
            headers: headers,
            requestBody: requestBody,
            name: item.name,
            parameters: [], // Empty initially
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
      });

      // Add nodes and edges to the flow
      setNodes(nodes => [...nodes, ...toolNodes]);
      setEdges(currentEdges => [...currentEdges, ...edges]);

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