import { useLocalStorage } from "react-use";
import React from "react";
import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { v4 as uuidv4 } from "uuid";
import { useMemo } from "react";

interface Item {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

function App() {
  const [items, setItems] = useLocalStorage<Item[]>("items", []);

  const [newItemTitle, setNewItemTitle] = useState<string>("");

  const [listName, setListName] = useLocalStorage<string>("title", "To do list");

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
          <ItemList title="To do" items={items!!.filter((item) => !item.completed)} toggleCompleted={toggleCompleted}>
            <div className="grid grid-flow-col grid-cols-2">
              <div className="bg-white shadow-lg border rounded mb-4 p-4 col-start-1 col-end-11">
                <input
                  className="w-full"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="New item"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addItem();
                    }
                  }}
                ></input>
              </div>
              <div className="col-start-12">
                <button className="ml-2 border rounded bg-green-300 p-4 shadow" onClick={addItem}>
                  Add item
                </button>
              </div>
            </div>
          </ItemList>
          <ItemList
            title="Done 🎉"
            items={items!!.filter((item) => item.completed)}
            toggleCompleted={toggleCompleted}
          />
        </div>
      </div>
    </div>
  );
}

const ItemList: React.FC<{ title: string; items: Item[]; toggleCompleted: (item: Item) => void }> = ({
  title,
  items,
  toggleCompleted,
  children,
}) => {
  // Sort ASC
  const sortedItems = useMemo(() => [...items].sort((a, b) => (b.order > a.order ? 1 : -1)), [items]);

  return (
    <div>
      {items.length > 0 && <h2 className="text-2xl mb-4">{title}</h2>}
      <div>{children}</div>
      <ul>
        {sortedItems.map((item) => (
          <li key={item.id} className="bg-white shadow-lg border rounded mb-4 p-4 flex">
            {!item.completed && <div className="border w-4 h-4 rounded-xl" onClick={() => toggleCompleted(item)}></div>}
            {item.completed && (
              <CheckCircleIcon onClick={() => toggleCompleted(item)} className="h-5 w-5 text-green-500" />
            )}
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
