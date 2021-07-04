import { useState } from "react";
import { useHistory } from "react-router-dom";

const Home = () => {
  const [newListName, setNewListName] = useState("");
  const history = useHistory();

  const onFormSubmit = (e: any) => {
    e.preventDefault();
    localStorage.setItem("title", JSON.stringify(newListName));
    history.push("/todo-list");
  };

  return (
    <div className="mx-auto container ">
      <div className="text-center pt-16">
        <h1 className="text-4xl">Create a new to do list</h1>
        <form className="py-8" onSubmit={onFormSubmit}>
          <input
            placeholder="e.g. Groceries 🛍️"
            required
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          ></input>
          <button className="bg-green-300 p-2 rounded" type="submit">
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
