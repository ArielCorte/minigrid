"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

type Coords = {
  x: number;
  y: number;
};

type NodeData = {
  coords: Coords;
  color: string;
  size: number;
};

export default function GridSystem() {
  const [nodes, setNodes] = useState<NodeData[]>([]);

  function getCursorCoords(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): Coords {
    return { x: e.clientX, y: e.clientY };
  }

  function nodeCoordsExists(coords: Coords): boolean {
    return nodes.some(
      (node) => node.coords.x === coords.x && node.coords.y === coords.y
    );
  }

  function placeNode(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const cursorCoords = getCursorCoords(e);
    if (nodeCoordsExists(cursorCoords)) return;

    setNodes((prevNodes) => [
      ...prevNodes,
      {
        coords: cursorCoords,
        color: "bg-orange-500",
        size: 30,
      },
    ]);
  }

  function resetGrid() {
    setNodes([]);
  }

  return (
    <div className="w-screen h-screen bg-purple-100" onMouseDown={placeNode}>
      <Hud {...{ resetGrid }} />
      {nodes.map((node) => (
        <GridNode
          nodeData={node}
          key={node.coords.x.toString() + "," + node.coords.y.toString()}
        />
      ))}
    </div>
  );
}

function Hud({ resetGrid }: { resetGrid: () => void }) {
  return (
    <div
      className="absolute top-4 left-4 p-8 pl-4 bg-blue-500 rounded-md z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="bg-blue-200 p-2 rounded-md select-none"
        onClick={resetGrid}
      >
        Reset Grid
      </button>
    </div>
  );
}

function GridNode({ nodeData }: { nodeData: NodeData }) {
  const [isDragging, setIsDragging] = useState(false);

  const targetDiv = useRef<HTMLDivElement>(null);

  function stopDrag() {
    console.log("stopDrag");
    setIsDragging(false);
    window.removeEventListener("mousemove", followCursor);
    window.removeEventListener("mouseup", stopDrag);
  }

  function startDrag(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    setIsDragging(true);
    window.addEventListener("mousemove", followCursor);
    window.addEventListener("mouseup", stopDrag);
  }

  function followCursor(e: MouseEvent) {
    console.log("followCursor");
    if (!targetDiv.current) return;
    targetDiv.current.style.left = `${e.clientX - nodeData.size / 2}px`;
    targetDiv.current.style.top = `${e.clientY - nodeData.size / 2}px`;
  }

  return (
    <div
      ref={targetDiv}
      className={clsx(
        "aspect-square rounded-full absolute cursor-grab",
        nodeData.color,
        isDragging && "cursor-grabbing"
      )}
      style={{
        width: `${nodeData.size}px`,
        left: nodeData.coords.x - nodeData.size / 2,
        top: nodeData.coords.y - nodeData.size / 2,
      }}
      onMouseDown={startDrag}
    ></div>
  );
}
