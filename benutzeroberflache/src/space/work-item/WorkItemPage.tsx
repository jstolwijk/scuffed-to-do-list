import { XIcon } from "@heroicons/react/solid";
import { FC, useEffect } from "react";
import { generatePath, Link, useHistory, useParams } from "react-router-dom";
import socket from "../../Socket";
import { State, WorkItem } from "../board/workItem";
import { SpaceRoutes } from "../Router";
import { useSocketRequest } from "../useSocketRequest";
import { CreateRelationInput } from "./components/CreateRelationInput";

export interface WorkItemSummary {
  id: string;
  title: string;
  shortId: number;
  state: State;
}

export enum RelationType {
  BLOCKED_BY = "BLOCKED_BY",
  BLOCKS = "BLOCKS",
}
// TODO: clean up this shit
interface ExtendedWorkItem extends WorkItem {
  blockedBy: WorkItemSummary[];
  blocks: WorkItemSummary[];
}

export const WorkItemPage = () => {
  const { workItemId, name } = useParams<{ workItemId: string; name: string }>();
  const history = useHistory();
  const response = useSocketRequest<ExtendedWorkItem | null>("workItem", {
    workItemId,
  });

  useEffect(() => {
    socket.on("workItemRelationCreated", (data: any) => {
      // TODO use global state shite to make stuff like this easier
    });
  }, [workItemId]);

  if (!response) {
    return null;
  }

  return (
    <div className="mx-auto container">
      {/* Currently the close button will go back one page, this behaviour is strange when clicking from one work item to another */}
      {/* TODO: FIX */}
      <button onClick={history.goBack} className="flex mb-4">
        <XIcon className="w-5" />
        <p className="font-medium">Close</p>
      </button>
      <div className="rounded bg-white px-4 py-2">
        <h1 className="font-bold text-4xl">
          #{response.shortId} {response.title}
        </h1>
        {/* <div>
          <h2 className="font-bold text-2xl">Description</h2>
          <div></div>
        </div> */}
        <div>This work item has a risk level of: {response.riskLevel}</div>
        <div>
          <h2 className="font-bold text-2xl">Relations</h2>
          <CreateRelationInput workItemId={workItemId} />
          <div className="pt-8 divide-y">
            {response.blockedBy.map((workItem) => (
              <RelationItem workItem={workItem} relationType={RelationType.BLOCKED_BY} spaceName={name} />
            ))}
            {response.blocks.map((workItem) => (
              <RelationItem workItem={workItem} relationType={RelationType.BLOCKS} spaceName={name} />
            ))}
          </div>
        </div>
        {/* <div>
          <h2 className="font-bold text-2xl">Events</h2>
          <pre>{JSON.stringify([], null, 2)}</pre>
        </div> */}
      </div>
    </div>
  );
};

const RelationItem: FC<{
  workItem: WorkItemSummary;
  relationType: RelationType;
  spaceName: string;
}> = ({ workItem, relationType, spaceName }) => {
  return (
    <Link
      key={relationType + workItem.id}
      to={{
        pathname: generatePath(SpaceRoutes.WORK_ITEM, {
          name: spaceName,
          workItemId: workItem.id,
        }),
      }}
      className="p-2 flex"
    >
      <div className="w-24 font-bold">{relationType === RelationType.BLOCKED_BY ? "Blocked by" : "Blocks"}</div> #
      <p className={workItem.state === State.DONE ? "line-through" : ""}>
        {workItem.shortId} - {workItem.title} - {workItem.state}
      </p>
    </Link>
  );
};
