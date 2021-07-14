import { useState, createContext } from "react";
import { BrowserRouter as Router, Switch, Route, NavLink, Redirect, useLocation } from "react-router-dom";
import Home from "./to-do/Home";
import TodoList from "./to-do/TodoList";
import ToDoListItem from "./to-do/ToDoListItem";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ZettelkastenHome from "./zettelkasten/Home";
import DocumentEditor from "./zettelkasten/DocumentEditor";
import SignUp from "./auth/SignUp";
import EnterPasscode from "./auth/EnterPasscode";
import Board from "./task-tracker/Board";

export enum Routes {
  HOME = "/",
  TO_DOS = "/to-dos",
  TO_DO_LIST = "/todo-list/:toDoListId",
  TO_DO_LIST_ITEM = "/item/:itemId",
  IDEAS = "/ideas",
  EDIT_IDEA = "/edit-idea/:ideaId",
  SIGN_UP = "/sign-up",
  ENTER_PASSCODE = "/enter-passcode",
  BOARD = "/board",
}

export const PartyContext = createContext(() => {});

function App() {
  const [party, setParty] = useState(false);
  const { width, height } = useWindowSize();

  return (
    <PartyContext.Provider value={() => setParty(true)}>
      <Router>
        <div className="bg-gray-100">
          {/* <NavBar /> */}
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
            <Route path={Routes.BOARD}>
              <Board />
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
              <Route path={Routes.HOME}>
                <Redirect to={Routes.TO_DOS} />
              </Route>
              <Route path="/">
                <Redirect to={Routes.TO_DOS} />
              </Route>
            </div>
          </Switch>
        </div>
      </Router>
    </PartyContext.Provider>
  );
}

const NavBar = () => {
  const location = useLocation();
  return location.pathname !== Routes.SIGN_UP &&
    location.pathname !== Routes.ENTER_PASSCODE &&
    location.pathname !== Routes.BOARD ? (
    <nav>
      <div className="flex flex-row space-x-10 items-center justify-center text-2xl font-semibold">
        <NavLink to={Routes.HOME}>To dos</NavLink>
        <NavLink to={Routes.IDEAS}>Ideas</NavLink>
        <NavLink to={Routes.TO_DOS}>Login</NavLink>
      </div>
    </nav>
  ) : (
    <></>
  );
};

export default App;
