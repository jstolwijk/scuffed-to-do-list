import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import TodoList from "./TodoList";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/todo-list/:id">
            <TodoList />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
