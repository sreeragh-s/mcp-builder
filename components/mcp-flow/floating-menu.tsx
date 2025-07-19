"use client";

import React, { useState, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { FileIcon, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  onDragStart: (event: DragEvent<HTMLDivElement>, nodeType: string) => void;
  className?: string;
}

export function FloatingMenu({
  onDragStart,
  className,
}: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("fixed bottom-8 right-8 z-50", className)}>
      {/* Main toggle button */}
      <Button
        onClick={toggleMenu}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 45 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
 <X className="w-6 h-6" /> 
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="absolute bottom-16 right-0 w-80 bg-background border rounded-lg shadow-xl p-4 space-y-4"
          >


            <div>
              <h4 className="text-sm font-medium mb-3">Add Nodes</h4>
              
              {/* JSON Input Node */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-3"
              >
                <div
                  className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  onDragStart={(event) => onDragStart(event, 'json-input')}
                  draggable
                >
                  <FileIcon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium leading-none">
                      JSON Input
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add a JSON input node to analyze Postman collections.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Tool Node */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  draggable
                  onDragStart={(event) => onDragStart(event, 'tool')}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium leading-none">
                      Tool
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add a tool node to make API calls and external integrations.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Instructions */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Drag nodes onto the canvas to add them to your flow.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 