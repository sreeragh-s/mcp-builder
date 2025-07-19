
"use client";

import React from "react";
import { Button } from "../ui/button";
import { Save, Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  saveFlow: () => Promise<void>;
  onGenerateMcpServer: () => void;
  className?: string;
}

export function FloatingButton({
  saveFlow,
  onGenerateMcpServer,
  className,
}: FloatingButtonProps) {
  return (
    <div className={cn("fixed top-20 right-8 z-50 flex gap-2", className)}>
      <Button
        onClick={saveFlow}
        variant="secondary"
        size="sm"
        className="flex items-center gap-2 shadow-lg"
      >
        <Save className="w-4 h-4" />
        Save Flow
      </Button>
      
      <Button
        onClick={onGenerateMcpServer}
        variant="default"
        size="sm"
        className="flex items-center gap-2 shadow-lg"
      >
        <Server className="w-4 h-4" />
        Generate MCP Server
      </Button>
    </div>
  );
}
