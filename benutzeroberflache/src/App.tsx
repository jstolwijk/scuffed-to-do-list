import { createContext, useState } from "react";
import Confetti from "react-confetti";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { useWindowSize } from "react-use";
import SignUp from "./auth/SignUp";
import { SpaceRouter } from "./space/Router";
import Home from "./to-do/Home";
import TodoList from "./to-do/TodoList";
import ToDoListItem from "./to-do/ToDoListItem";
import DocumentEditor from "./zettelkasten/DocumentEditor";
import ZettelkastenHome from "./zettelkasten/Home";

export enum Routes {
  HOME = "/",
  TO_DOS = "/to-dos",
  TO_DO_LIST = "/todo-list/:toDoListId",
  TO_DO_LIST_ITEM = "/item/:itemId",
  IDEAS = "/ideas",
  EDIT_IDEA = "/edit-idea/:ideaId",
  SIGN_UP = "/sign-up",
  ENTER_PASSCODE = "/enter-passcode",
  SPACE = "/space",
}

export const PartyContext = createContext(() => {});

function App() {
  const [party, setParty] = useState(false);
  const { width, height } = useWindowSize();

  return (
    <PartyContext.Provider value={() => setParty(true)}>
      <Router>
        <div className="bg-gray-100">
          {party && (
            <Confetti
              style={{ pointerEvents: "none" }}
              numberOfPieces={party ? 500 : 0}
              recycle={false}
              onConfettiComplete={(confetti) => {
                setParty(false);
                confetti?.reset();
              }}
              width={width}
              height={height}
            />
          )}

          <Switch>
            <Route path={Routes.SPACE}>
              <SpaceRouter />
            </Route>
            <div className="mx-auto container">
              <Route path={Routes.SIGN_UP}>
                <SignUp />
              </Route>
              <Route path={Routes.IDEAS}>
                <ZettelkastenHome />
              </Route>
              <Route path={Routes.TO_DO_LIST + Routes.TO_DO_LIST_ITEM}>
                <ToDoListItem />
              </Route>
              <Route path={Routes.TO_DO_LIST} exact>
                <TodoList />
              </Route>
              <Route path={Routes.TO_DOS}>
                <Home />
              </Route>
              <Route path={Routes.EDIT_IDEA}>
                <DocumentEditor />
              </Route>
              <Route path={Routes.HOME} exact>
                <Redirect to={Routes.TO_DOS} />
              </Route>
              <Route path="/" exact>
                <Redirect to={Routes.TO_DOS} />
              </Route>
            </div>
          </Switch>
        </div>
      </Router>
    </PartyContext.Provider>
  );
}

export default App;
