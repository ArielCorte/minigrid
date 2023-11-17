"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

type Coords = {
  x: number;
  y: number;
};

type NodeData = {
  id: string;
  coords: Coords;
  color: string;
  size: number;
  closestNeighborID?: string;
  content: string;
};

export default function GridSystem() {
  const [nodes, setNodes] = useState<NodeData[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.height = window.innerHeight;
    canvasRef.current.width = window.innerWidth;
  }, []);

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
        id: nodes.length.toString(),
        coords: cursorCoords,
        color: "bg-orange-500",
        size: 30,
        content: nodes.length.toString(),
      },
    ]);

    updateClosestNeighbors();

    console.log(nodes);
  }

  function resetGrid() {
    setNodes([]);
  }

  function getClosesNeighborID(
    id: string,
    nodes: NodeData[]
  ): string | undefined {
    const node = nodes.find((node) => node.id === id);
    if (!node) return;
    const closestNode = nodes.reduce((prevNode, currNode) => {
      if (currNode.id === id) return prevNode;
      const prevNodeDistance = Math.sqrt(
        Math.pow(prevNode.coords.x - node.coords.x, 2) +
          Math.pow(prevNode.coords.y - node.coords.y, 2)
      );
      const currNodeDistance = Math.sqrt(
        Math.pow(currNode.coords.x - node.coords.x, 2) +
          Math.pow(currNode.coords.y - node.coords.y, 2)
      );
      return prevNodeDistance < currNodeDistance ? prevNode : currNode;
    });
    return closestNode.id;
  }

  function updateNode(nodeData: NodeData) {
    setNodes((prevNodes) => {
      const nodeIndex = prevNodes.findIndex((node) => node.id === nodeData.id);
      const newNodes = [...prevNodes];
      newNodes[nodeIndex] = nodeData;

      updateClosestNeighbors();
      return newNodes;
    });
  }

  function updateClosestNeighbors() {
    setNodes((prevNodes) => {
      const newNodes = [...prevNodes];
      newNodes.forEach((node) => {
        node.closestNeighborID = getClosesNeighborID(node.id, prevNodes);
      });
      return newNodes;
    });

    drawLines();
  }

  function drawLines() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    nodes.forEach((node) => {
      if (!node.closestNeighborID) return;
      const closestNeighbor = nodes.find(
        (neighbor) => neighbor.id === node.closestNeighborID
      );
      if (!closestNeighbor) return;
      console.log(node.coords, closestNeighbor.coords);
      ctx.beginPath();
      ctx.moveTo(node.coords.x, node.coords.y);
      ctx.lineTo(closestNeighbor.coords.x, closestNeighbor.coords.y);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  return (
    <div className="w-screen h-screen bg-purple-100" onMouseDown={placeNode}>
      <Hud {...{ resetGrid }} />
      {nodes.map((node) => (
        <GridNode nodeData={node} updateNodeData={updateNode} key={node.id} />
      ))}
      <canvas className="absolute w-full h-full z-0" ref={canvasRef}></canvas>
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

function GridNode({
  nodeData,
  updateNodeData,
}: {
  nodeData: NodeData;
  updateNodeData: (nodeData: NodeData) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const targetDiv = useRef<HTMLDivElement>(null);

  function stopDrag(e: MouseEvent) {
    console.log("stopDrag");
    setIsDragging(false);
    window.removeEventListener("mousemove", followCursor);
    window.removeEventListener("mouseup", stopDrag);
    console.log(e.clientX, e.clientY);
    updateNodeData({
      ...nodeData,
      coords: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }

  function startDrag(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    setIsDragging(true);
    window.addEventListener("mousemove", followCursor);
    window.addEventListener("mouseup", stopDrag);
  }

  function followCursor(e: MouseEvent) {
    console.log(e.clientX, e.clientY);
    if (!targetDiv.current) return;
    targetDiv.current.style.left = `${e.clientX - nodeData.size / 2}px`;
    targetDiv.current.style.top = `${e.clientY - nodeData.size / 2}px`;
  }

  return (
    <div
      ref={targetDiv}
      className={clsx(
        "aspect-square rounded-full absolute cursor-grab flex items-center justify-center z-10",
        nodeData.color,
        isDragging && "cursor-grabbing"
      )}
      style={{
        width: `${nodeData.size}px`,
        left: nodeData.coords.x - nodeData.size / 2,
        top: nodeData.coords.y - nodeData.size / 2,
      }}
      onMouseDown={startDrag}
    >
      {nodeData.content}
    </div>
  );
}
