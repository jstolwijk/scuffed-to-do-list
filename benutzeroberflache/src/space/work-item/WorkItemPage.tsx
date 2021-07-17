import { XIcon } from "@heroicons/react/solid";
import { useHistory, useParams } from "react-router-dom";
import { useSocketRequest } from "../useSocketRequest";

export const WorkItemPage = () => {
  const { workItemId } = useParams<{ workItemId: string }>();
  const history = useHistory();
  const response = useSocketRequest("workItem", { workItemId });

  if (!response) {
    return null;
  }

  return (
    <div className="mx-auto container">
      <button onClick={history.goBack} className="flex mb-4">
        <XIcon className="w-5" />
        <p className="font-medium">Close</p>
      </button>
      <div className="rounded bg-white px-4 py-2">
        <h1 className="font-bold text-4xl">{response.title}</h1>
        <div>
          <h2 className="font-bold text-2xl">Description</h2>
          <div></div>
        </div>
        <div>
          <h2 className="font-bold text-2xl">Linked work items</h2>
        </div>
        <div>
          <h2 className="font-bold text-2xl">Events</h2>
          <pre>{JSON.stringify(response.events, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
