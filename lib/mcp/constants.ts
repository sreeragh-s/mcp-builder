import type { Node } from "@xyflow/react";

// Node type mappings
export const NODE_TYPE_MAP: Record<string, string> = {
  'tool': 'tool-node',
  'json-input': 'json-input-node',
};

// Connection rules - what each node type can connect to
export const CONNECTION_RULES: Record<string, string[]> = {
  "tool-node": ["json-input-node"],
  "json-input-node": ["tool-node"],
};

// Custom node type with proper typing
export type NodeData = Record<string, any>;
export type CustomNode = Node<NodeData>; 