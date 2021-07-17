import { lazy, Suspense, useMemo } from "react";
import { generatePath, Link, useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { Routes } from "../AppRouter";
import { Item } from "./TodoList";
const Notes = lazy(() => import("./Notes"));

const ToDoListItem = () => {
  let { itemId, toDoListId } = useParams<{ itemId: string; toDoListId: string }>();

  const [items] = useLocalStorage<Item[]>(toDoListId + "-items", []);
  const item = useMemo(() => items?.find((item) => item.id === itemId), [itemId, items]);

  return (
    <div className="mx-auto container">
      <Link
        to={{
          pathname: generatePath(Routes.TO_DO_LIST, {
            toDoListId,
          }),
        }}
        className="block font-semibold text-xl pb-8"
      >
        🔙 Back
      </Link>

      <div className="mt-8 p-4 rounded shadow-2xl bg-white">
        <div className="flex">
          <h1 className={`text-4xl font-bold ${item?.completed && "line-through"}`}>{item?.title}</h1>
        </div>
        <div className="pt-4">
          <h2 className="mb-4 text-xl">Notes</h2>
          <Suspense fallback={<div></div>}>
            <Notes />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ToDoListItem;
