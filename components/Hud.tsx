export default function Hud({ resetGrid }: { resetGrid: () => void }) {
  return (
    <div
      className="absolute top-4 left-4 p-8 pl-4 bg-blue-500 rounded-md z-50"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
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
