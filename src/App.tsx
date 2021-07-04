import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Home from "./Home";
import TodoList from "./TodoList";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/todo-list">
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
