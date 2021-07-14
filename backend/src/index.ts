import express from "express";
import PouchDB from "pouchdb";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());
const server = http.createServer(app);
const io = new Server(server);

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
  // if (secret && secret === req.query.s) {
  res.send(await db.allDocs({ include_docs: true }));
  // } else {
  // res.sendStatus(403);
  // }
});
app.get("/to-do-list/:id", (req, res) => {
  db.get(req.params.id)
    .then((toDoList) => res.send(toDoList))
    .catch(() => res.send("Failed to store item"));
});

interface UserDocuments {
  _id: string;
  _rev: string;
  documentMetaData: DocumentMetaData[];
}

interface DocumentMetaData {
  title: string;
  documentId: string;
}

interface DocumentContent {
  _id: string;
  _rev: string;
  title: string;
  content: string;
}

const userId = "4ff6a9a1-efdc-400d-8fa5-d5b5a0c2bf41";

app.post("/documents", async (req, res) => {
  const { title, content } = req.body;
  const documentId = uuidv4();

  const documents: UserDocuments = await db.get(`u:${userId}@documents`);
  const metaData: DocumentMetaData = { title, documentId };

  await db.put<UserDocuments>({ ...documents, documentMetaData: [...documents.documentMetaData, metaData] });

  const documentContent: DocumentContent = { _id: `doc:${documentId}`, title, content, _rev: "new" };
  await db.put(documentContent);

  res.status(201);
  res.send({ documentId });
});

app.put("/documents/:id", async (req, res) => {
  const { title, content, _rev } = req.body;

  const document: DocumentContent = { _id: `doc:${req.params.id}`, _rev, title, content };
  db.put(document);

  console.log(`Updated document (id = ${req.params.id}, rev: ${_rev})`);

  res.sendStatus(202);
});

app.post("/set-up", async (req, res) => {
  try {
    await db.put({ _id: `u:${userId}@documents`, documentMetaData: [] });
  } catch (e) {
    console.error(e);
    res.status(500);
    return;
  }
  res.sendStatus(201);
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

app.get("/documents", async (req, res) => {
  const userDocuments = await db.get<UserDocuments>(`u:${userId}@documents`);
  console.log(`Found ${userDocuments.documentMetaData.length} number of user documents`);

  const documents = await Promise.all(
    userDocuments.documentMetaData.map((metaData) => db.get(`doc:${metaData.documentId}`))
  );

  res.send({ documents: documents.map((document) => ({ ...document, _id: document._id.replace("doc:", "") })) });
});

app.get("/documents/:id", async (req, res) => {
  res.send(await db.get<UserDocuments>(`doc:${req.params.id}`));
});

app.get("/health", (req, res) => {
  res.send("UP AND RUNNING!!!!!!");
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
