import { XIcon } from "@heroicons/react/solid";
import React, { FC, useEffect, useState } from "react";
import Autosuggest, { ChangeEvent } from "react-autosuggest";
import { generatePath, Link, useHistory, useParams } from "react-router-dom";
import socket from "../../Socket";
import { State, WorkItem } from "../board/workItem";
import { SpaceRoutes } from "../Router";
import { useSocketRequest } from "../useSocketRequest";

interface WorkItemSummary {
  id: string;
  title: string;
  shortId: number;
  state: State;
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

const RelationItem: FC<{ workItem: WorkItemSummary; relationType: RelationType; spaceName: string }> = ({
  workItem,
  relationType,
  spaceName,
}) => {
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

enum RelationType {
  BLOCKED_BY = "BLOCKED_BY",
  BLOCKS = "BLOCKS",
}

const CreateRelationInput: FC<{ workItemId: string }> = ({ workItemId }) => {
  const [relationType, setRelationType] = useState(RelationType.BLOCKED_BY);
  const [searchWorkItemId, setWorkItemId] = useState<string>("");

  return (
    <form
      className="flex"
      onSubmit={(e) => {
        e.preventDefault();
        socket.emit("blockWorkItem", {
          workItemId: relationType === RelationType.BLOCKED_BY ? workItemId : searchWorkItemId,
          blockedByWorkItemId: relationType === RelationType.BLOCKED_BY ? searchWorkItemId : workItemId,
        });
      }}
    >
      <RelationTypeSelector value={relationType} handleChange={setRelationType} />
      <WorkItemSearchInput handleWorkItemIdChange={setWorkItemId} />
      <button className="p-2 bg-blue-500 rounded" type="submit">
        Create relation
      </button>
    </form>
  );
};

const RelationTypeSelector: React.FC<{ value: RelationType; handleChange: (value: RelationType) => void }> = ({
  value,
  handleChange,
}) => {
  return (
    <select value={value} onChange={(e) => handleChange(e.target.value as RelationType)}>
      <option value={RelationType.BLOCKED_BY}>Blocked by</option>
      <option value={RelationType.BLOCKS}>Blocks</option>
    </select>
  );
};

const RenderSuggestion = (suggestion: WorkItemSummary) => (
  <div className="cursor-pointer bg-white rounded border">
    #{suggestion.shortId} - {suggestion.title} - {suggestion.state}
  </div>
);

const WorkItemSearchInput: FC<{ handleWorkItemIdChange: (value: string) => void }> = ({ handleWorkItemIdChange }) => {
  const [suggestions, setSuggestions] = useState<WorkItemSummary[]>([]);
  const [value, setValue] = useState<string>("");

  const onSuggestionsFetchRequested = async (prop: any) => {
    const response = await fetch("https://backend.shittytestdomain.xyz/work-items/search", {
      method: "POST",
      body: JSON.stringify({ query: prop.value }),
      headers: { "Content-Type": "application/json" },
    });

    const body: any = await response.json();

    console.log(body);

    if (response.ok) {
      setSuggestions(body.workItems);
    }
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const regex = /#([0-9]+) - .*/;
  const onChange = (_: React.FormEvent<HTMLElement>, params: ChangeEvent) => {
    const matches = params.newValue.match(regex);
    if (matches) {
      const match = suggestions.find((suggestion) => suggestion.shortId.toString() === matches[1]);
      if (match) {
        handleWorkItemIdChange(match.id);
      } else {
        console.error(
          "Unable to match input with suggestion matches: ",
          JSON.stringify(matches) + " suggestions " + JSON.stringify(suggestions)
        );
      }
    }
    setValue(params.newValue);
  };
  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={(suggestion) => "#" + suggestion.shortId + " - " + suggestion.title}
      renderSuggestion={RenderSuggestion}
      inputProps={{
        placeholder: "Search for a work item",
        value,
        onChange,
      }}
    />
  );
};
