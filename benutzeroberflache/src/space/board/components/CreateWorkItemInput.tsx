import { useRef, useState } from "react";
import { useClickAway } from "react-use";
import { v4 as uuidv4 } from "uuid";
import { State, WorkItem } from "../workItem";

interface CreateWorkItemInputProps {
  onCreate: (workItem: WorkItem) => void;
}
export const CreateWorkItemInput: React.FC<CreateWorkItemInputProps> = ({
  onCreate,
}) => {
  const [newWorkItemTitle, setNewWorkItemTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const ref = useRef(null);

  const closeEditor = () => {
    setNewWorkItemTitle("");
    setEditMode(false);
  };

  useClickAway(ref, closeEditor);

  const handleAddNewItemButtonClick = () => {
    setEditMode(true);
  };

  return editMode ? (
    <form
      className="mt-2 ml-2"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate({
          id: uuidv4(),
          title: newWorkItemTitle,
          riskLevel: 0,
          state: State.TO_DO,
        });
        closeEditor();
      }}
      ref={ref}
    >
      <input
        autoFocus
        className="p-2 rounded border"
        value={newWorkItemTitle}
        onChange={(e) => setNewWorkItemTitle(e.target.value)}
        placeholder="E.g. design new website"
      ></input>
      <button type="submit" className="ml-2 p-2 rounded bg-blue-400">
        Create
      </button>
    </form>
  ) : (
    <div
      className="mt-2 py-2 px-2 mx-2 cursor-pointer"
      onClick={handleAddNewItemButtonClick}
    >
      ➕ Add new work item
    </div>
  );
};
