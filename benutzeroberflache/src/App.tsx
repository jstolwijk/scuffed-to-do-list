import { useState, createContext } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import TodoList from "./TodoList";
import ToDoListItem from "./ToDoListItem";
import Confetti from "react-confetti";

export enum Routes {
  HOME = "/",
  TO_DO_LIST = "/todo-list/:toDoListId",
  TO_DO_LIST_ITEM = "/item/:itemId",
}

export const PartyContext = createContext(() => {});

function App() {
  const [party, setParty] = useState(false);
  return (
    <PartyContext.Provider value={() => setParty(true)}>
      <Router>
        <div>
          <Confetti
            style={{ pointerEvents: "none" }}
            numberOfPieces={party ? 500 : 0}
            recycle={false}
            onConfettiComplete={(confetti) => {
              setParty(false);
              confetti?.reset();
            }}
          />
          <Switch>
            <Route path={Routes.TO_DO_LIST + Routes.TO_DO_LIST_ITEM}>
              <ToDoListItem />
            </Route>
            <Route path={Routes.TO_DO_LIST}>
              <TodoList />
            </Route>
            <Route path={Routes.HOME}>
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </PartyContext.Provider>
  );
}

export default App;
