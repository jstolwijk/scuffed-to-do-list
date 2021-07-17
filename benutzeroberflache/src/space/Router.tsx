import { Route, Switch } from "react-router-dom";
import BoardPage from "./board/Page";
import SpaceSelector from "./SpaceSelector";
import { WorkItemPage } from "./work-item/WorkItemPage";

export enum SpaceRoutes {
  BOARD = "/space/:name/board",
  PROFILE = "/space/profile",
  SPACE = "/space",
  WORK_ITEM = "/space/:name/work-item/:workItemId",
}

export const SpaceRouter = () => {
  return (
    <div className="h-screen">
      <Switch>
        <Route path={SpaceRoutes.BOARD}>
          <BoardPage />
        </Route>
        <Route path={SpaceRoutes.SPACE} exact>
          <SpaceSelector />
        </Route>
        <Route path={SpaceRoutes.WORK_ITEM}>
          <WorkItemPage />
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
