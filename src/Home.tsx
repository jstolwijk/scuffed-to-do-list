import { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useLocalStorage } from "react-use";
import { v4 as uuidv4 } from "uuid";

export interface ToDoList {
  id: string;
  title: string;
}

const Home = () => {
  const [newListName, setNewListName] = useState<string>("");
  const history = useHistory();

  const [toDoLists, setTodoLists] = useLocalStorage<ToDoList[]>("to-do-lists", []);

  const onFormSubmit = (e: any) => {
    e.preventDefault();

    const toDoList: ToDoList = {
      id: uuidv4(),
      title: newListName,
    };

    setTodoLists([toDoList, ...toDoLists!!]);

    history.push("/todo-list/" + toDoList.id);
  };

  const onTrashCanClicked = (toDoList: ToDoList) => {
    if (window.confirm(`Are you sure you want to delete: ${toDoList.title}?`)) {
      setTodoLists(toDoLists?.filter((item) => item.id !== toDoList.id) || []);
      localStorage.removeItem(toDoList.id + "-items");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mx-auto container ">
        <div className="text-center pt-16">
          <h1 className="text-4xl font-bold">Create a new to do list</h1>
          <form className="py-8" onSubmit={onFormSubmit}>
            <input
              placeholder="e.g. Groceries 🛍️"
              required
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="bg-white rounded p-2 shadow"
            ></input>
            <button className="ml-2 bg-green-300 p-2 rounded shadow" type="submit">
              Create
            </button>
          </form>

          {toDoLists!!.length > 0 && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold">Your to do lists 📋</h2>
              <ul className="py-4">
                {toDoLists?.map((item) => (
                  <li className="text-2xl p-1 font-medium" key={item.id}>
                    <Link
                      to={{
                        pathname: "/todo-list/" + item.id,
                      }}
                    >
                      {item.title}
                    </Link>
                    <button className="ml-2" onClick={() => onTrashCanClicked(item)}>
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
