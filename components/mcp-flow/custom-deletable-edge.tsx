import {
  SmoothStepEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  useReactFlow,
  getSmoothStepPath
} from "@xyflow/react";
import { X } from "lucide-react";

export default function CustomDeletableEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  const { setEdges } = useReactFlow();

    const [_, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14, 
  });

  return (
    <>
      <SmoothStepEdge {...props} />
      <EdgeLabelRenderer>
        <button
          type="button"
          className="group pointer-events-auto  text-white absolute size-4 flex items-center justify-center border bg-red-400 dark:bg-red-800  rounded-full bg-backgroun "
          style={{
            transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
          }}
          onClick={() =>
            setEdges((edges) => edges.filter((edge) => edge.id !== id))
          }
        >
          <X className="size-3 transition group-hover:scale-75" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
} 