
"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Save, Server, Settings, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getConfiguredBaseUrl, saveBaseUrl } from "@/lib/mcp/constants";

interface FloatingButtonProps {
  saveFlow: () => Promise<void>;
  onGenerateMcpServer: () => void;
  onAutoLayout?: () => void;
  className?: string;
}

export function FloatingButton({
  saveFlow,
  onGenerateMcpServer,
  onAutoLayout,
  className,
}: FloatingButtonProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(() => getConfiguredBaseUrl());

  const handleSaveConfig = () => {
    saveBaseUrl(baseUrl);
    setIsConfigOpen(false);
    toast.success("Configuration saved successfully");
  };

  return (
    <div className={cn("fixed top-20 right-8 z-50 flex gap-2", className)}>
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 shadow-lg"
          >
            <Settings className="w-4 h-4" />
            Config
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Flow Configuration</DialogTitle>
            <DialogDescription>
              Configure global settings for your MCP flow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="base-url" className="text-right">
                Base URL
              </Label>
              <Input
                id="base-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:3000"
                className="col-span-3"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>This base URL will be used to replace {`{{baseUrl}}`} variables when analyzing Postman collections.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {onAutoLayout && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onAutoLayout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 shadow-lg"
              >
                <LayoutGrid className="w-4 h-4" />
                Auto Layout
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Automatically arrange nodes in the graph for better readability.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

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
