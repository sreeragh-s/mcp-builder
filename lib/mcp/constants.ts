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

// Layout constants for auto-layout functionality
export const LAYOUT_CONFIG = {
  NODE_WIDTH: 520,
  NODE_HEIGHT: 300,
  HORIZONTAL_SPACING: 150, // Increased horizontal spacing
  VERTICAL_SPACING: 120,   // Increased vertical spacing
  NODES_PER_ROW: 2,        // Reduced nodes per row for better readability
  BASE_X: 100,
  BASE_Y: 100,
  SOURCE_OFFSET_X: 700,    // Increased offset for better separation
  TOOL_GRID_OFFSET_X: 800, // Increased offset
  OTHER_NODES_OFFSET_X: 1800, // Increased offset
  INPUT_NODE_SPACING: 400, // Spacing between input nodes vertically
  MIN_GRID_PADDING: 50,    // Minimum padding around the grid
} as const;

// Utility function to calculate optimal grid dimensions
export function calculateOptimalLayout(nodeCount: number, maxNodesPerRow = LAYOUT_CONFIG.NODES_PER_ROW) {
  if (nodeCount <= maxNodesPerRow) {
    return { rows: 1, cols: nodeCount };
  }
  
  const rows = Math.ceil(nodeCount / maxNodesPerRow);
  const cols = Math.min(nodeCount, maxNodesPerRow);
  
  return { rows, cols };
}

// Custom node type with proper typing
export type NodeData = Record<string, any>;
export type CustomNode = Node<NodeData>;

// MCP Flow Configuration utilities

export const DEFAULT_BASE_URL = "http://localhost:3000";
export const BASE_URL_STORAGE_KEY = "mcp-flow-base-url";

/**
 * Get the configured base URL from localStorage or return default
 */
export function getConfiguredBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedBaseUrl = localStorage.getItem(BASE_URL_STORAGE_KEY);
    if (savedBaseUrl) {
      return savedBaseUrl;
    }
  }
  return DEFAULT_BASE_URL;
}

/**
 * Save base URL to localStorage
 */
export function saveBaseUrl(baseUrl: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BASE_URL_STORAGE_KEY, baseUrl);
  }
}

/**
 * Replace {{baseUrl}} and other common variables in a URL
 */
export function replaceUrlVariables(url: string, customBaseUrl?: string): string {
  let processedUrl = url;
  
  // Replace {{baseUrl}} with configured or provided base URL
  const baseUrl = customBaseUrl || getConfiguredBaseUrl();
  processedUrl = processedUrl.replace(/\{\{baseUrl\}\}/g, baseUrl);
  
  // You can add more variable replacements here as needed
  // processedUrl = processedUrl.replace(/\{\{apiKey\}\}/g, getApiKey());
  
  return processedUrl;
} 