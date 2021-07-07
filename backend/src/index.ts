import express from "express";
import PouchDB from "pouchdb";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());

const db = new PouchDB("noicee");

enum EventType {
  TO_DO_LIST_CREATED = "TO_DO_LIST_CREATED",
  TO_DO_LIST_ITEM_CREATED = "TO_DO_LIST_ITEM_CREATED",
  TO_DO_LIST_ITEM_DONE = "TO_DO_LIST_ITEM_DONE",
  TO_DO_LIST_ITEM_UNDO = "TO_DO_LIST_ITEM_UNDO",
  TO_DO_LIST_ITEM_DELETED = "TO_DO_LIST_ITEM_DELETED",
}

interface ToDoList {
  _id: string;
  _rev: string;
  title: string;
  events: any[];
}

app.post("/to-do-list", (req, res) => {
  const { _id, title } = req.body;

  db.put({ _id, title, events: [] })
    .then(() => res.sendStatus(201))
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

app.post("/to-do-list/:id/events", (req, res) => {
  const { eventType } = req.body;

  db.get(req.params.id)
    .then((toDoList: ToDoList) => {
      db.put({ ...toDoList, events: [...toDoList.events, getEventFields(eventType, req.body)] })
        .then(() => res.sendStatus(201))
        .catch((e) => {
          console.error(e);
          res.sendStatus(500);
        });
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

// TODO: generate id on server side
const getEventFields = (eventType: EventType, event: any): any => {
  switch (eventType) {
    case EventType.TO_DO_LIST_CREATED:
      return { eventType, toDoListId: event.toDoListId, title: event.title };
    case EventType.TO_DO_LIST_ITEM_CREATED:
      return { eventType, toDoListItemId: event.toDoListItemId, title: event.title };
    case EventType.TO_DO_LIST_ITEM_DONE:
      return { eventType, toDoListItemId: event.toDoListItemId };
    case EventType.TO_DO_LIST_ITEM_UNDO:
      return { eventType, toDoListItemId: event.toDoListItemId };
    case EventType.TO_DO_LIST_ITEM_DELETED:
      return { eventType, toDoListItemId: event.toDoListItemId };
    default:
      throw new Error("Can't process event");
  }
};

app.get("/dump-db", async (req, res) => {
  const secret = process.env.SUPER_SECRET_PASSWORD;
  if (secret && secret === req.query.s) {
    res.send(await db.allDocs({ include_docs: true }));
  } else {
    res.sendStatus(403);
  }
});
app.get("/to-do-list/:id", (req, res) => {
  db.get(req.params.id)
    .then((toDoList) => res.send(toDoList))
    .catch(() => res.send("Failed to store item"));
});

app.get("/health", (req, res) => {
  res.send("UP AND RUNNING!!!!!!");
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
