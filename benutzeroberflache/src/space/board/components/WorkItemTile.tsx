import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { Color, RowWithStatusColor } from "../../components/RowWithStatusColor";
import { WorkItem } from "../workItem";

interface WorkItemProps {
  item: WorkItem;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export const WorkItemTile: React.FC<WorkItemProps> = ({ provided, snapshot, item }) => {
  console.log("Drag", snapshot.isDragging);
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={provided.draggableProps.style}
    >
      <RowWithStatusColor statusColor={item.riskLevel > 1 ? Color.RED : Color.GREEN}>
        <div className="flex content-around">
          <h3 className="font-semibold text-xl">{item.title}</h3>
        </div>
      </RowWithStatusColor>
    </div>
  );
};
