"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CircleHelpIcon, Plus, Trash2, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReactFlow } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { BaseHandle } from "./base-handle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { StreamLanguage } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Parameter {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
  isOptional: boolean;
}

interface Header {
  key: string;
  value: string;
}

const promptTheme = createTheme({
  theme: "dark",
  settings: {
    background: "transparent",
    foreground: "hsl(var(--foreground))",
    caret: "hsl(var(--foreground))",
    selection: "#3B82F6",
    lineHighlight: "transparent",
  },
  styles: [
    { tag: t.variableName, color: "#10c43d" },
    { tag: t.string, color: "hsl(var(--foreground))" },
    { tag: t.invalid, color: "#DC2626" },
  ],
});

const createPromptLanguage = (validInputs: string[] = []) =>
  StreamLanguage.define({
    token(stream) {
      if (stream.match(/{{[^}]*}}/)) {
        const match = stream.current();
        const inputName = match.slice(2, -2);
        if (validInputs.includes(inputName)) {
          return "variableName";
        }
        return "invalid";
      }
      stream.next();
      return null;
    },
  });

export default function ToolNode({ id, data }: { id: string; data: any }) {
  const { deleteElements, setNodes } = useReactFlow();
  const [parameters, setParameters] = useState<Parameter[]>(
    data?.parameters || []
  );
  const [headers, setHeaders] = useState<Header[]>(data?.headers || []);
  const [method, setMethod] = useState(data?.method || "GET");
  const [url, setUrl] = useState(data?.url || "");
  const [requestBody, setRequestBody] = useState(data?.requestBody || "");
  const [promptDescription, setPromptDescription] = useState(data?.promptDescription || "");
  const hello = "{Hello, World}";
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const editorViewRef = useRef<EditorView | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleDeleteNode = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [deleteElements, id]);

  // Update node data when state changes
  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                parameters,
                headers,
                method,
                url,
                requestBody,
                promptDescription,
              },
            }
          : node
      )
    );
  }, [id, parameters, headers, method, url, requestBody, promptDescription, setNodes]);

  const addParameter = () => {
    setParameters([
      ...parameters,
      {
        name: "",
        description: "",
        type: "string",
        defaultValue: "",
        isOptional: false,
      },
    ]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const validateAndSetRequestBody = (value: string) => {
    try {
      if (value.trim()) {
        JSON.parse(value);
        setJsonError(null);
      } else {
        setJsonError(null);
      }
    } catch (e) {
      setJsonError("Invalid JSON format");
    }
    setRequestBody(value);
  };

  return (
    <Card className="w-[800px] shadow-[0px_1px_3px_0px_#00000024]" style={{ transition: 'border-color 0.2s, border-width 0.1s' }}>
      <CardHeader className="flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-900 px-5 py-1">
        <CardTitle className="text-md grow">Tool Node</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteNode}
          className="h-8 w-8 text-destructive"
          
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardHeader>

      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <BaseHandle
          type="target"
          position={Position.Left}
          id={`${id}-input`}
          className="w-3 h-3 bg-muted-foreground"
        />
      </div>

  

      <CardContent className="px-5 py-4">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-[100px]">
              <Label htmlFor="method" className="text-muted-foreground text-xs">
                Method
              </Label>
              <Select  value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-9" id="method">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="url" className="text-muted-foreground text-xs">
                URL
              </Label>
              <Input
                className="w-full"
                id="url"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="params">
            <TabsList>
              <TabsTrigger value="params">Parameters</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
            </TabsList>

            <TabsContent value="params" className="space-y-2">
              {parameters.length > 0 && (
                <div className="grid grid-cols-6 gap-4">
                  <Label className="text-muted-foreground text-xs">Name</Label>
                  <Label className="text-muted-foreground text-xs col-span-2">
                    Description
                  </Label>
                  <Label className="text-muted-foreground text-xs">Type</Label>
                  <Label className="text-muted-foreground text-xs">
                    Default Value
                  </Label>
                  <Label className="text-muted-foreground text-xs">
                    Optional
                  </Label>
                </div>
              )}
              {parameters.map((param, index) => (
                <div key={index} className="grid grid-cols-6 gap-4">
                  <Input
                    placeholder="Name"
                    value={param.name}
                    onChange={(e) => {
                      const newParams = [...parameters];
                      newParams[index].name = e.target.value;
                      setParameters(newParams);
                    }}
                  />
                  <Input
                    className="col-span-2"
                    placeholder="Description"
                    value={param.description}
                    onChange={(e) => {
                      const newParams = [...parameters];
                      newParams[index].description = e.target.value;
                      setParameters(newParams);
                    }}
                  />
                  <Select
                    value={param.type}
                    onValueChange={(value) => {
                      const newParams = [...parameters];
                      newParams[index].type = value;
                      setParameters(newParams);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Default"
                    value={param.defaultValue}
                    onChange={(e) => {
                      const newParams = [...parameters];
                      newParams[index].defaultValue = e.target.value;
                      setParameters(newParams);
                    }}
                  />
                  <div className="flex items-center ml-6">
                    <Checkbox
                      checked={param.isOptional}
                      onCheckedChange={(checked) => {
                        const newParams = [...parameters];
                        newParams[index].isOptional = checked as boolean;
                        setParameters(newParams);
                      }}
                    />
                    <Button
                      className="ml-5"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParameter(index)}
                    >
                      <XIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={addParameter}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
              </Button>
            </TabsContent>

            <TabsContent value="headers" className="space-y-2">
              {headers.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_auto] gap-4 ">
                  <Label className="text-muted-foreground text-xs">Key</Label>
                  <Label className="text-muted-foreground text-xs">Value</Label>
                </div>
              )}
              {headers.map((header, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4"
                >
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => {
                      const newHeaders = [...headers];
                      newHeaders[index].key = e.target.value;
                      setHeaders(newHeaders);
                    }}
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => {
                      const newHeaders = [...headers];
                      newHeaders[index].value = e.target.value;
                      setHeaders(newHeaders);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeader(index)}
                  >
                    <XIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button onClick={addHeader} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </TabsContent>

            <TabsContent value="body">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Insert Parameter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search parameters..." />
                        <CommandList>
                          <CommandEmpty>No parameters found.</CommandEmpty>
                          <CommandGroup>
                            {parameters.map((param) => (
                              <CommandItem
                                key={param.name}
                                onSelect={() => {
                                  const view = editorViewRef.current;
                                  if (!view) return;
                                  const inputTag = `{{${param.name}}}`;
                                  const from = view.state.selection.main.from;
                                  view.dispatch({
                                    changes: { from, insert: inputTag },
                                    selection: { anchor: from + inputTag.length },
                                  });
                                  setIsPopoverOpen(false);
                                }}
                              >
                                {param.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-body" className="text-xs text-muted-foreground">
                    Request Body (JSON)
                  </Label>
                  <CodeMirror
                    value={requestBody}
                    height="200px"
                    theme={promptTheme}
                    extensions={[createPromptLanguage(parameters.map(p => p.name))]}
                    onChange={validateAndSetRequestBody}
                    onCreateEditor={(view) => {
                      editorViewRef.current = view;
                    }}
                    className="border rounded-md overflow-hidden"
                    placeholder="Enter JSON request body"
                    basicSetup={{
                      lineNumbers: false,
                      foldGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: false,
                    }}
                  />
                  {jsonError && (
                    <p className="text-sm text-destructive mt-1">{jsonError}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompt">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-description" className="text-xs text-muted-foreground">
                    AI Prompt Description
                  </Label>
                  <Textarea
                    id="prompt-description"
                    placeholder="Describe when the AI should trigger this tool (e.g., 'Use this tool when the user asks about weather information for a specific city')"
                    value={promptDescription}
                    onChange={(e) => setPromptDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    This description helps the AI understand when to use this tool. Be specific about the scenarios and user inputs that should trigger this tool.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
