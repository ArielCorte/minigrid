"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hud from "./Hud";
import GridNode from "./GridNode";

export type Coords = {
  x: number;
  y: number;
};

export type NodeData = {
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

  const resizeCanvas = useCallback((nodes: NodeData[]) => {
    if (!canvasRef.current) return;
    canvasRef.current.height = window.innerHeight;
    canvasRef.current.width = window.innerWidth;
    drawLines(canvasRef.current, nodes);
  }, []);

  useEffect(() => {
    resizeCanvas(nodes);

    window.addEventListener("resize", () => resizeCanvas(nodes));

    return () => {
      window.removeEventListener("resize", () => resizeCanvas(nodes));
    };
  }, [nodes, resizeCanvas]);

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
    const prevNodes = nodes;
    const newNodes = [
      ...prevNodes,
      {
        id: nodes.length.toString(),
        coords: cursorCoords,
        color: "bg-orange-500",
        size: 30,
        content: nodes.length.toString(),
      },
    ];

    updateClosestNeighbors(newNodes);
    setNodes(() => newNodes);
    if (!canvasRef.current) return;
    drawLines(canvasRef.current, newNodes);
  }

  function resetGrid() {
    setNodes([]);
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  function getClosesNeighborID(
    id: string,
    nodes: NodeData[]
  ): string | undefined {
    const node = nodes.find((node) => node.id === id);
    if (!node) return;
    const closestNode = nodes.reduce((prevNode, currNode) => {
      if (currNode.id === id) return prevNode;
      if (prevNode.id === id) return currNode;
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
    const updatedNodes = nodes;
    const nodeIndex = updatedNodes.findIndex((node) => node.id === nodeData.id);
    updatedNodes[nodeIndex] = nodeData;

    updateClosestNeighbors(updatedNodes);
    setNodes(() => updatedNodes);
    if (!canvasRef.current) return;
    drawLines(canvasRef.current, updatedNodes);
  }

  function dragUpdateNode(nodeData: NodeData) {
    const updatedNodes = nodes;
    const nodeIndex = updatedNodes.findIndex((node) => node.id === nodeData.id);
    updatedNodes[nodeIndex] = nodeData;

    updateClosestNeighbors(updatedNodes);
    if (!canvasRef.current) return;
    drawLines(canvasRef.current, updatedNodes);
  }

  function updateClosestNeighbors(nodes: NodeData[]) {
    nodes.forEach((node) => {
      node.closestNeighborID = getClosesNeighborID(node.id, nodes);
    });
  }

  function drawLines(canvas: HTMLCanvasElement, nodes: NodeData[]) {
    const alreadyDrawn: Map<string, string> = new Map();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach((node) => {
      if (!node.closestNeighborID) return;
      const closestNeighbor = nodes.find(
        (neighbor) => neighbor.id === node.closestNeighborID
      );
      if (!closestNeighbor) return;
      if (alreadyDrawn.get(node.id) === closestNeighbor.id) return;
      ctx.beginPath();
      ctx.moveTo(node.coords.x, node.coords.y);
      ctx.lineTo(closestNeighbor.coords.x, closestNeighbor.coords.y);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
      alreadyDrawn.set(closestNeighbor.id, node.id);
    });
  }

  return (
    <div className="w-screen h-screen bg-purple-100" onMouseDown={placeNode}>
      <Hud {...{ resetGrid }} />
      {nodes.map((node) => (
        <GridNode
          nodeData={node}
          updateNodeData={(updatedNode) => updateNode(updatedNode)}
          dragUpdateNode={(updatedNode) => dragUpdateNode(updatedNode)}
          key={node.id}
        />
      ))}
      <canvas className="absolute w-full h-full z-0" ref={canvasRef}></canvas>
    </div>
  );
}
