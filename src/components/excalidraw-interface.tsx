"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Square,
  Circle,
  Type,
  Pencil,
  Image,
  Hand,
  Undo,
  Redo,
  Download,
  Eraser,
  Palette,
} from "lucide-react";
import { Slider } from "./ui/slider";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ExcalidrawInterface() {
  const [activeTool, setActiveTool] = useState("select");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("black");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [size, setSize] = useState(5);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      const container = canvas?.parentElement;
      if (canvas && tempCanvas && container) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        tempCanvas.width = width;
        tempCanvas.height = height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const tools = [
    { name: "Select", icon: Hand },
    { name: "Rectangle", icon: Square },
    { name: "Ellipse", icon: Circle },
    { name: "Text", icon: Type },
    { name: "Draw", icon: Pencil },
    { name: "Erase", icon: Eraser },
    { name: "Image", icon: Image },
    { name: "Palette", icon: Palette },
  ];

  const actions = [
    { name: "Undo", icon: Undo },
    { name: "Redo", icon: Redo },
    { name: "Export", icon: Download },
  ];

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setStartPoint({ x, y });

      if (activeTool === "draw" || activeTool === "erase") {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        }
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startPoint) return;
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (canvas && tempCanvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeTool === "erase") {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.strokeStyle = "white";
          ctx.lineWidth = size;
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      } else if (activeTool === "draw") {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = size;
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      } else if (activeTool === "rectangle") {
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.beginPath();
          tempCtx.strokeStyle = strokeColor;
          tempCtx.lineWidth = size;
          tempCtx.rect(
            startPoint.x,
            startPoint.y,
            x - startPoint.x,
            y - startPoint.y
          );
          tempCtx.stroke();
        }
      }
    }
  };

  const stopDraw = () => {
    if (drawing && activeTool === "rectangle") {
      const canvas = canvasRef.current;
      const tempCanvas = tempCanvasRef.current;
      if (canvas && tempCanvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(tempCanvas, 0, 0);
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          }
        }
      }
    }
    setDrawing(false);
    setStartPoint(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-card">
        <div className="flex space-x-1">
          <TooltipProvider>
            {tools.map((tool) => (
              <Tooltip key={tool.name}>
                <TooltipTrigger asChild>
                  {tool.name === "Palette" ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={
                            activeTool === "palette" ? "secondary" : "ghost"
                          }
                          size="icon"
                        >
                          <tool.icon className="h-4 w-4" />
                          <span className="sr-only">{tool.name}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="grid grid-cols-5 gap-2">
                          <HexColorPicker
                            color={strokeColor}
                            onChange={setStrokeColor}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Button
                      variant={
                        activeTool === tool.name.toLowerCase()
                          ? "secondary"
                          : "ghost"
                      }
                      size="icon"
                      onClick={() => setActiveTool(tool.name.toLowerCase())}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="sr-only">{tool.name}</span>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Size:</span>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[size]}
              onValueChange={(value) => setSize(value[0])}
              className="w-[100px]"
            />
            <div
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              style={{
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          </div>
        </div>

        <div className="flex space-x-1">
          <TooltipProvider>
            {actions.map((action) => (
              <Tooltip key={action.name}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <action.icon className="h-4 w-4" />
                    <span className="sr-only">{action.name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <div className="flex-grow p-4 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseUp={stopDraw}
          onMouseMove={draw}
          onMouseOut={stopDraw}
          className="w-full h-full bg-white rounded-lg border-2 border-dashed border-gray-300"
        />
        <canvas
          ref={tempCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
}
