"use client";

import clsx from "clsx";
import { useState } from "react";

type Coords = {
  x: number;
  y: number;
};

type Node = {
  coords: Coords;
  color: string;
};

export default function GridSystem() {
  const [nodes, setNodes] = useState<Node[]>([]);

  function getCursorCoords(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): Coords {
    return { x: e.clientX, y: e.clientY };
  }

  function placeNode(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const cursorCoords = getCursorCoords(e);

    setNodes((prevNodes) => [
      ...prevNodes,
      {
        coords: cursorCoords,
        color: "bg-orange-500",
      },
    ]);
  }

  return (
    <div className="w-screen h-screen bg-purple-100" onClick={placeNode}>
      {nodes.map((node) => (
        <div
          className={clsx(
            "h-10 aspect-square rounded-full absolute",
            node.color
          )}
          style={{ left: node.coords.x, top: node.coords.y }}
          key={node.coords.toString()}
        ></div>
      ))}
    </div>
  );
}
