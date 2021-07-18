import { FC, useState } from "react";
import socket from "../../../Socket";
import { RelationType } from "../WorkItemPage";
import { WorkItemSearchInput } from "./WorkItemSearchInput";

export const CreateRelationInput: FC<{ workItemId: string }> = ({ workItemId }) => {
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

const RelationTypeSelector: React.FC<{
  value: RelationType;
  handleChange: (value: RelationType) => void;
}> = ({ value, handleChange }) => {
  return (
    <select value={value} onChange={(e) => handleChange(e.target.value as RelationType)}>
      <option value={RelationType.BLOCKED_BY}>Blocked by</option>
      <option value={RelationType.BLOCKS}>Blocks</option>
    </select>
  );
};
