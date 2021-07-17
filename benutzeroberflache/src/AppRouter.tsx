import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { useMount } from "react-use";
import SignUp from "./auth/SignUp";
import { SpaceRouter } from "./space/Router";
import Home from "./Home";
import ToDoPage from "./to-do/Home";
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

export const AppRouter = () => {
  const history = useHistory();

  useMount(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    };
  });
  return (
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
        <Route path={Routes.TO_DO_LIST}>
          <TodoList />
        </Route>
        <Route path={Routes.TO_DOS}>
          <ToDoPage />
        </Route>
        <Route path={Routes.EDIT_IDEA} exact>
          <DocumentEditor />
        </Route>
        <Route path={Routes.HOME} exact>
          <Home />
        </Route>
      </div>
    </Switch>
  );
};
