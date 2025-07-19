"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, FormInputIcon, Settings } from "lucide-react";
import { useReactFlow, Node } from "@xyflow/react";
import { CONNECTION_RULES, NODE_TYPE_MAP, type CustomNode } from "@/lib/mcp/constants";
import { nanoid } from "nanoid";

interface NodeAddButtonProps {
  sourceNodeId: string;
  sourceNodeType: string;
  sourceHandleId?: string;
  className?: string;
}

interface NodeOption {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

// Memoize static node options
const NODE_OPTIONS: readonly NodeOption[] = [
  {
    type: "tool",
    label: "Tool",
    description: "Make API calls and external integrations",
    icon: Settings,
  },
  {
    type: "json-input",
    label: "JSON Input",
    description: "Analyze Postman collections and generate tools",
    icon: FormInputIcon,
  },
] as const;

// Extract NodeOption button into a separate component for better performance
const NodeOptionButton = ({ 
  option, 
  onClick 
}: { 
  option: NodeOption; 
  onClick: (type: string) => void;
}) => {
  const Icon = option.icon;
  return (
    <button
      onClick={() => !option.disabled && onClick(option.type)}
      disabled={option.disabled}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
        option.disabled
          ? 'opacity-50 cursor-not-allowed bg-muted/50'
          : 'hover:bg-muted/50 hover:border-primary/50'
      }`}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{option.label}</div>
        <div className="text-xs text-muted-foreground">
          {option.description}
          {option.disabled && (
            <span className="text-red-500 ml-1">(coming soon)</span>
          )}
        </div>
      </div>
    </button>
  );
};

export function NodeAddButton({
  sourceNodeId,
  sourceNodeType,
  sourceHandleId,
  className,
}: NodeAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { setNodes, setEdges, getNodes } = useReactFlow();

  // Memoize compatible node types
  const compatibleNodes = useMemo(() => {
    const allowedTargets = CONNECTION_RULES[sourceNodeType] || [];
    return NODE_OPTIONS.filter(option => {
      const targetNodeType = NODE_TYPE_MAP[option.type];
      return allowedTargets.includes(targetNodeType);
    });
  }, [sourceNodeType]);

  const handleAddNode = useCallback((nodeType: string) => {
    if (!nodeType) return;

    const targetNodeType = NODE_TYPE_MAP[nodeType];
    if (!targetNodeType) return;

    setNodes(nodes => {
      const sourceNode = nodes.find(node => node.id === sourceNodeId);
      if (!sourceNode) return nodes;

      const newNodeId = `${nodeType}-${Date.now()}`;
      const newNode: CustomNode = {
        id: newNodeId,
        type: targetNodeType,
        position: {
          x: sourceNode.position.x + 450,
          y: sourceNode.position.y,
        },
        data: {},
      };

      return [...nodes, newNode];
    });

    setEdges(edges => {
      const newEdge = {
        id: `edge-${nanoid()}`,
        source: sourceNodeId,
        sourceHandle: sourceHandleId,
        target: `${nodeType}-${Date.now()}`,
        targetHandle: `${nodeType}-${Date.now()}-input`,
        type: 'deletable',
      };

      return [...edges, newEdge];
    });

    setIsOpen(false);
  }, [sourceNodeId, sourceHandleId, setNodes, setEdges]);

  if (compatibleNodes.length === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-6 w-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-md ${className}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <div className="p-3">
          <h4 className="text-sm font-medium mb-3">Add Node</h4>
          <div className="space-y-2">
            {compatibleNodes.map((option) => (
              <NodeOptionButton
                key={option.type}
                option={option}
                onClick={handleAddNode}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 