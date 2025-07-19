import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, FileIcon, Settings } from "lucide-react";
import { DragEvent } from "react";



import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  calendars: [
    {
      name: "My Calendars",
      items: ["Personal", "Work", "Family"],
    },
    {
      name: "Favorites",
      items: ["Holidays", "Birthdays"],
    },
    {
      name: "Other",
      items: ["Travel", "Reminders", "Deadlines"],
    },
  ],
}

interface SidebarProps {
    saveFlow: () => Promise<void>;
    active: boolean;
    handleFlowSwitch: () => Promise<void>;
    onDragStart: (event: DragEvent<HTMLDivElement>, nodeType: string) => void;
  }

export function Sidebar({
    saveFlow,
    active,
    handleFlowSwitch, 
    onDragStart,
  ...props
}: SidebarProps) {
  return (
    <SidebarPrimitive
      collapsible="none"
      className="hidden h-screen border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-24 border-b p-4 flex flex-col justify-between items-center">
      <Button
        onClick={saveFlow}
        variant="default"
        size="sm"
        className="flex items-center gap-2 w-full"
      >
        <Save className="w-4 h-4" />
        Save Flow
      </Button>

      <div className="flex justify-between w-full items-center">
        <Label htmlFor="enable-flow">Enable Flow</Label>
        <Switch
          id="enable-flow"
          checked={active}
          onCheckedChange={handleFlowSwitch}
        />
      </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarSeparator className="mx-0" />




      <div
        className="flex items-center space-x-4 rounded-md border p-4 cursor-pointer hover:border-foreground"
        onDragStart={(event) => onDragStart(event, 'json-input')}
        draggable
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-medium leading-none">
              JSON Input
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Add a JSON input node to analyze Postman collections.
          </p>
        </div>
      </div>

       <div
        className="flex items-center space-x-4 rounded-md border p-4 cursor-pointer hover:border-foreground"
        draggable
        onDragStart={(event) => onDragStart(event, 'tool')}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-medium leading-none">
              Tool
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Add a tool node to make API calls and external integrations.
          </p>
        </div>
      </div> 

      {/* <div
        className="flex items-center space-x-4 rounded-md border p-4 cursor-pointer hover:border-foreground"
        draggable
        onDragStart={(event) => onDragStart(event, 'form')}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <FormInputIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-medium leading-none">
              Form
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Add a new form builder node to collect user information.
          </p>
        </div>
      </div> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}
