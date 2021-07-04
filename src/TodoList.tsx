import { useLocalStorage } from "react-use";
import React from "react";
import { useState } from "react";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/solid";
import { v4 as uuidv4 } from "uuid";
import { useMemo } from "react";
import { useEffect } from "react";

interface Item {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

function TodoList() {
  const [items, setItems] = useLocalStorage<Item[]>("items", []);

  const [newItemTitle, setNewItemTitle] = useState<string>("");

  const [listName, setListName] = useLocalStorage<string>("title", "To do list");

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
    setItems(copy);
  };
  const removeItem = (item: Item) => {
    setItems(items!!.filter((i) => i.id !== item.id));
  };

  const itemsDone = items!!.filter((item) => item.completed);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mx-auto container py-4">
        <div className="flex justify-center">
          <input
            className="text-3xl font-semibold bg-gray-100 text-center focus:outline-none focus:ring"
            placeholder="Title"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          ></input>
        </div>

        <div>
          <h2 className="text-2xl mb-4">To do</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem();
            }}
            className="grid grid-flow-col grid-cols-2"
          >
            <div className="bg-white shadow-lg border rounded mb-4 p-4 col-start-1 col-end-11">
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
            <div>
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
  // Sort ASC
  const sortedItems = useMemo(() => [...items].sort((a, b) => (b.order > a.order ? 1 : -1)), [items]);

  return (
    <div>
      <div>{children}</div>
      <ul>
        {sortedItems.map((item) => (
          <li key={item.id} className="bg-white shadow-lg border rounded mb-4 p-4 flex">
            <div className="mr-2">
              {!item.completed && (
                <div className="border w-4 h-4 rounded-xl" onClick={() => toggleCompleted(item)}></div>
              )}
              {item.completed && (
                <CheckCircleIcon onClick={() => toggleCompleted(item)} className="h-5 w-5 text-green-500" />
              )}
            </div>
            <p className="flex-1">{item.title}</p>
            <button onClick={() => removeItem(item)}>
              <TrashIcon className="h-5 w-5 text-gray-600" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
