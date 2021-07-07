import { CheckCircleIcon } from "@heroicons/react/solid";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { generatePath, Link, useParams } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { v4 as uuidv4 } from "uuid";
import { PartyContext, Routes } from "./App";
import { ToDoList } from "./Home";

export interface Item {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

function TodoList() {
  let { toDoListId } = useParams<{ toDoListId: string }>();

  const [items, setItems] = useLocalStorage<Item[]>(toDoListId + "-items", []);
  const [newItemTitle, setNewItemTitle] = useState<string>("");

  const [toDoLists, setTodoLists] = useLocalStorage<ToDoList[]>("to-do-lists", []);
  const listName = useMemo<string>(
    () => toDoLists?.find((item) => item.id === toDoListId)?.title ?? "",
    [toDoLists, toDoListId]
  );

  const startTheParty = useContext(PartyContext);

  const setListName = (newName: string) => {
    const copy = [...toDoLists!!];
    const idx = copy.findIndex((item) => item.id === toDoListId);

    copy[idx] = { ...copy[idx], title: newName };

    setTodoLists(copy);
  };

  useEffect(() => {
    document.title = "Idea box - " + listName;
  }, [listName]);

  const addItem = () => {
    console.log(newItemTitle);
    const newItems = [...items!!, { id: uuidv4(), title: newItemTitle, completed: false, order: Date.now() }];
    setItems(newItems);
    setNewItemTitle("");
  };

  const toggleCompleted = (item: Item) => {
    const copy = [...items!!];
    const idx = copy.findIndex((i) => i.id === item.id);

    copy[idx] = { ...item, completed: !item.completed, order: Date.now() };

    if (!item.completed) {
      startTheParty();
    }
    setItems(copy);
  };
  const removeItem = (item: Item) => {
    if (window.confirm(`Are you sure you want to delete ${item.title}?`)) {
      setItems(items!!.filter((i) => i.id !== item.id));
    }
  };

  const itemsDone = items!!.filter((item) => item.completed);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mx-auto container px-4">
        <nav className="flex">
          <Link
            className="text-2xl font-semibold flex mb-4"
            to={{
              pathname: "/",
            }}
          >
            Ugly button to navigate to home page
          </Link>
        </nav>
        <input
          className="text-4xl font-bold bg-gray-100 focus:outline-none focus:ring"
          placeholder="Title"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        ></input>
        <div className="py-4">
          <h2 className="text-2xl mb-4">To do</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem();
            }}
            className="grid grid-flow-col grid-cols-2"
          >
            <div className="bg-white shadow-lg border rounded mb-2 p-4 col-start-1 col-end-11">
              <input
                required={true}
                className="w-full"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="New item"
              ></input>
            </div>
            <div className="col-start-12">
              <button className="ml-2 border rounded bg-green-300 p-4 shadow" type="submit">
                Add item
              </button>
            </div>
          </form>
          <ItemList
            items={items!!.filter((item) => !item.completed)}
            toggleCompleted={toggleCompleted}
            removeItem={removeItem}
          ></ItemList>
          {itemsDone.length > 0 && (
            <div className="mt-4">
              <h2 className="text-2xl mb-4">Done 🎉</h2>
              <ItemList items={itemsDone} toggleCompleted={toggleCompleted} removeItem={removeItem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ItemList: React.FC<{
  items: Item[];
  toggleCompleted: (item: Item) => void;
  removeItem: (item: Item) => void;
}> = ({ items, toggleCompleted, removeItem, children }) => {
  let { toDoListId } = useParams<{ toDoListId: string }>();

  // Sort ASC
  const sortedItems = useMemo(() => [...items].sort((a, b) => (b.order > a.order ? 1 : -1)), [items]);

  return (
    <div>
      <div>{children}</div>
      <ul>
        {sortedItems.map((item) => (
          <li key={item.id} className="bg-white shadow-lg border rounded mb-2 p-4 flex">
            <div className="mr-2">
              {!item.completed && (
                <div className="border w-4 h-4 rounded-xl" onClick={() => toggleCompleted(item)}></div>
              )}
              {item.completed && (
                <CheckCircleIcon onClick={() => toggleCompleted(item)} className="h-5 w-5 text-green-500" />
              )}
            </div>
            <Link
              className="flex-1"
              to={{
                pathname: generatePath(Routes.TO_DO_LIST + Routes.TO_DO_LIST_ITEM, {
                  toDoListId,
                  itemId: item.id,
                }),
              }}
            >
              <p>{item.title}</p>
            </Link>
            <button onClick={() => removeItem(item)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
