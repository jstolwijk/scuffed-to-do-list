import { XIcon } from "@heroicons/react/solid";
import { generatePath, Link, useHistory, useParams } from "react-router-dom";
import { WorkItem } from "../board/workItem";
import { SpaceRoutes } from "../Router";
import { useSocketRequest } from "../useSocketRequest";

interface WorkItemSummary {
  id: string;
  title: string;
  shortId: number;
}

// TODO: clean up this shit
interface ExtendedWorkItem extends WorkItem {
  blockedBy: WorkItemSummary[];
  blocks: WorkItemSummary[];
}

export const WorkItemPage = () => {
  const { workItemId, name } =
    useParams<{ workItemId: string; name: string }>();
  const history = useHistory();
  const response = useSocketRequest<ExtendedWorkItem | null>("workItem", {
    workItemId,
  });

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
        <div>
          <h2 className="font-bold text-2xl">Description</h2>
          <div></div>
        </div>
        <div>
          <h2 className="font-bold text-2xl">Linked work items</h2>
          <div>
            {response.blockedBy.map((blocks) => (
              <Link
                key={"blockedBy" + blocks.id}
                to={{
                  pathname: generatePath(SpaceRoutes.WORK_ITEM, {
                    name,
                    workItemId: blocks.id,
                  }),
                }}
              >
                Blocked by #{blocks.shortId} - {blocks.title}
              </Link>
            ))}
          </div>
          <div>
            {response.blocks.map((blocks) => (
              <Link
                key={"blocks" + blocks.id}
                to={{
                  pathname: generatePath(SpaceRoutes.WORK_ITEM, {
                    name,
                    workItemId: blocks.id,
                  }),
                }}
              >
                Blocks #{blocks.shortId} - {blocks.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold text-2xl">Events</h2>
          <pre>{JSON.stringify([], null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
