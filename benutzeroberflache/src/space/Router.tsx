import { NavLink, Route, Switch } from "react-router-dom";
import BoardPage from "./board/Page";
import SpaceSelector from "./SpaceSelector";

export enum SpaceRoutes {
  BOARD = "/space/:name/board",
  PROFILE = "/space/profile",
  SPACE = "/space",
}

export const SpaceRouter = () => {
  return (
    <div className="h-screen">
      <div className="w-full bg-black text-white mb-4">
        <nav className="mx-auto container py-2">
          <NavLink to={SpaceRoutes.SPACE} className="pr-4">
            Spaces
          </NavLink>
          <NavLink to={SpaceRoutes.PROFILE}>Profile</NavLink>
        </nav>
      </div>
      <Switch>
        <Route path={SpaceRoutes.BOARD}>
          <BoardPage />
        </Route>
        <Route path={SpaceRoutes.SPACE} exact>
          <SpaceSelector />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
};

const NotFound = () => {
  return (
    <div className="flex pt-16">
      <h1 className="m-auto text-2xl font-extralight">Page not found</h1>
    </div>
  );
};
