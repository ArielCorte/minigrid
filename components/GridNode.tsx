import clsx from "clsx";
import React, { useRef, useState } from "react";
import { NodeData } from "./GridSystem";

export default function GridNode({
  nodeData,
  updateNodeData,
  dragUpdateNode,
}: {
  nodeData: NodeData;
  updateNodeData: (nodeData: NodeData) => void;
  dragUpdateNode: (nodeData: NodeData) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const targetDiv = useRef<HTMLDivElement>(null);

  function stopDrag(e: MouseEvent) {
    setIsDragging(false);
    window.removeEventListener("mousemove", followCursor);
    window.removeEventListener("mouseup", stopDrag);
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
    if (!targetDiv.current) return;
    targetDiv.current.style.left = `${e.clientX - nodeData.size / 2}px`;
    targetDiv.current.style.top = `${e.clientY - nodeData.size / 2}px`;
    dragUpdateNode({
      ...nodeData,
      coords: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }

  return (
    <div
      ref={targetDiv}
      className={clsx(
        "aspect-square rounded-full absolute cursor-grab flex items-center justify-center z-10 select-none",
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
