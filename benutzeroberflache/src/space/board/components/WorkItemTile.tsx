import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { generatePath, Link, useParams } from "react-router-dom";
import { Color, RowWithStatusColor } from "../../components/RowWithStatusColor";
import { SpaceRoutes } from "../../Router";
import { WorkItem } from "../workItem";

interface WorkItemProps {
  item: WorkItem;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export const WorkItemTile: React.FC<WorkItemProps> = ({
  provided,
  snapshot,
  item,
}) => {
  const { name } = useParams<{ name: string }>();
  console.log("Drag", snapshot.isDragging);
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={provided.draggableProps.style}
    >
      <Link
        to={{
          pathname: generatePath(SpaceRoutes.WORK_ITEM, {
            name,
            workItemId: item.id,
          }),
        }}
      >
        <RowWithStatusColor
          statusColor={item.riskLevel > 1 ? Color.RED : Color.GREEN}
        >
          <div className="flex content-around">
            <h3 className="font-semibold text-xl">
              #{item.shortId} {item.title}
            </h3>
          </div>
        </RowWithStatusColor>
      </Link>
    </div>
  );
};
