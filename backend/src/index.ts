import express from "express";
import PouchDB from "pouchdb";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());

const db = new PouchDB("noicee");

app.post("/to-do-list", (req, res) => {
  const { _id, title } = req.body;

  db.put({ _id, title });

  res.send("Good job");
});

app.get("/to-do-list/:id", (req, res) => {
  db.get(req.params.id)
    .then((toDoList) => res.send(toDoList))
    .catch(() => res.send("You suck"));
});

app.get("/health", (req, res) => {
  res.send("UP AND RUNNING!!!!!!");
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
