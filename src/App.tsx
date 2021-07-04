import { useLocalStorage } from "react-use";
import React from "react";
import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/solid";

interface Item {
  title: string;
  completed: boolean;
}

function App() {
  const [items, setItems] = useLocalStorage<Item[]>("items", []);
  const [newItemTitle, setNewItemTitle] = useState<string>("");

  const [listName, setListName] = useLocalStorage<string>("title", "To do list");

  const addItem = () => {
    console.log(newItemTitle);
    setItems([...items!!, { title: newItemTitle, completed: false }]);
    setNewItemTitle("");
  };

  const toggleCompleted = (item: Item, index: number) => {
    const copy = [...items!!];
    copy[index] = { ...item, completed: !item.completed };
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
        <input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addItem();
            }
          }}
        ></input>
        <button className="border rounded bg-green-300 p-3" onClick={addItem}>
          Add item
        </button>
        <div>
          <ul>
            {items!!.map((item, index) => (
              <li key={index} className="bg-white shadow-lg border rounded mb-4 p-4 flex">
                {!item.completed && (
                  <div className="border w-4 h-4 rounded-xl" onClick={() => toggleCompleted(item, index)}></div>
                )}
                {item.completed && (
                  <CheckCircleIcon onClick={() => toggleCompleted(item, index)} className="h-5 w-5 text-green-500" />
                )}
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
