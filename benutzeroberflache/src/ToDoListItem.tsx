import { useMemo, useState } from "react";
import { generatePath, Link, useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { Routes } from "./App";
import { Item } from "./TodoList";
import MDEditor from "@uiw/react-md-editor";

const ToDoListItem = () => {
  let { itemId, toDoListId } = useParams<{ itemId: string; toDoListId: string }>();

  const [items] = useLocalStorage<Item[]>(toDoListId + "-items", []);
  const item = useMemo(() => items?.find((item) => item.id === itemId), [itemId]);
  const [value, setValue] = useLocalStorage<string | undefined>(toDoListId + "-notes", "");
  const [editorVisible, setEditorVisible] = useState(false);

  return (
    <div className="pt-8 mx-auto container">
      <Link
        className="text-2xl font-semibold"
        to={{
          pathname: generatePath(Routes.TO_DO_LIST, {
            toDoListId,
          }),
        }}
      >
        Back
      </Link>
      <div className="mt-8 p-4 rounded shadow-2xl">
        <div className="flex">
          <h1 className={`text-4xl font-bold ${item?.completed && "line-through"}`}>{item?.title}</h1>
        </div>
        <div className="pt-4">
          <h2 className="mb-4 text-xl">Notes</h2>
          {editorVisible && (
            <div>
              <MDEditor value={value} onChange={setValue} />{" "}
              <button className="p-2 rounded bg-blue-300" onClick={() => setEditorVisible(false)}>
                Done
              </button>
            </div>
          )}
          {!editorVisible && (
            <div>
              <MDEditor.Markdown source={value} />
              <button className="p-2 rounded bg-blue-300" onClick={() => setEditorVisible(true)}>
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToDoListItem;
