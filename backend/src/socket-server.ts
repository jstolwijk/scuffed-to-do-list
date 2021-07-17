import bodyParser from "body-parser";
import crypto from "crypto";
import express from "express";
import http from "http";
import PouchDB from "pouchdb";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());

const authenticationDb = new PouchDB("authentication");

const THIRTY_MINUTES = 30 * 60000;

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://shittytestdomain.xyz", "https://www.shittytestdomain.xyz"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/health", (req, res) => {
  res.status(200);
  res.send("UP AND RUNNING!!!");
});

interface PasscodeDto {
  _id: string;
  _rev?: string;
  passcode: string;
  alreadyUsed: boolean; // can be removed, just delete entry form db when passcode is used
  expiresAt: number;
}

app.post("/sign-up", async (req, res) => {
  // validate input
  const { email, name } = req.body;

  if (await documentExists("auth:" + email)) {
    res.sendStatus(500);
  } else {
    await authenticationDb.put({ _id: "auth:" + email, createdAt: Date.now(), name });

    console.log("Created user: " + email);

    const passcode = generatePasscode();

    // key: passcode:email:passcode value: expiry date
    const passcodeDto: PasscodeDto = {
      _id: `passcode|${email}|${passcode}`,
      expiresAt: Date.now() + THIRTY_MINUTES,
      passcode,
      alreadyUsed: false,
    };

    await authenticationDb.put(passcodeDto);

    sendMail(passcode);

    res.status(201);
    res.send({ expiresAt: passcodeDto.expiresAt });
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, passcode } = req.body;

  let passcodeDto: PasscodeDto | null = null;
  try {
    passcodeDto = await authenticationDb.get(`passcode|${email}|${passcode}`);
  } catch (e) {
    console.error("Sign in failed ", e);
    res.sendStatus(400);
    return;
  }

  if (passcodeDto.alreadyUsed) {
    console.log("Passcode already used for user " + email);
    res.sendStatus(400);
  } else if (passcodeDto.expiresAt < Date.now()) {
    console.log("Passcode expired for user " + email + " expired at " + passcodeDto.expiresAt);
    res.sendStatus(400);
  } else {
    await authenticationDb.put({ ...passcodeDto, alreadyUsed: true });
    res.sendStatus(202);
  }
});

const generatePasscode = (): string => {
  const randomNumber = crypto.randomInt(0, 1000000);
  return randomNumber.toString().padStart(6, "0");
};

const sendMail = (code: string) => {
  console.log("Code " + code);
};

const documentExists = async (docId: string): Promise<boolean> => {
  let doc;
  try {
    doc = await authenticationDb.get(docId);
  } catch (e) {
    if (e.error && e.status === 404) {
      console.log("Not found: " + docId);
      return false;
    }
    throw new Error("Failed to connect to DB: " + JSON.stringify(e));
  }

  console.log("Found document: " + doc);

  return true;
};

const clients = [];

enum State {
  TO_DO = "TO_DO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

let workItems = [
  {
    id: uuidv4(),
    title: "Et aperiam eveniet.",
    riskLevel: 0,
    state: State.TO_DO,
  },
  {
    id: uuidv4(),
    title: "Qui quia aliquid ea facere non occaecati sequi.",
    riskLevel: 4,
    state: State.TO_DO,
  },
  {
    id: uuidv4(),
    title: "Unde maxime praesentium.",
    riskLevel: 2,
    state: State.TO_DO,
  },
  {
    id: uuidv4(),
    title: "Refactor all the things",
    riskLevel: 2,
    state: State.TO_DO,
  },
  {
    id: uuidv4(),
    title: "Follow cursor",
    riskLevel: 2,
    state: State.TO_DO,
  },
  {
    id: uuidv4(),
    title: "Drink coffee",
    riskLevel: 0,
    state: State.DONE,
  },
  {
    id: uuidv4(),
    title: "Design website",
    riskLevel: 2,
    state: State.TO_DO,
  },
];

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("createDocument", (data) => {
    console.log(data);
  });

  socket.on("getSpaces", () => {
    socket.emit("spaces", {
      spaces: [
        { name: "jesse", title: "Jesse", description: "Tracking personal progress" },
        { name: "test-space", title: "Test space", description: "Testing" },
      ],
    });
  });

  socket.on("editDocument", (data) => {
    console.log("editDocument");
    socket.broadcast.emit("documentChanged", data);
  });

  socket.on("createWorkItem", (workItem) => {
    workItems = [workItem, ...workItems];

    socket.broadcast.emit("workItemCreated", workItem);
  });

  socket.on("changeWorkItemState", ({ workItemId, newState }) => {
    console.log("changeWorkItemState", workItemId, newState);
    const wiId = workItems.findIndex((wi) => wi.id === workItemId);
    workItems[wiId] = { ...workItems[wiId], state: newState };

    socket.emit("workItemStateChanged", { workItemId, newState });
    socket.broadcast.emit("workItemStateChanged", { workItemId, newState });
  });

  socket.on("getWorkItems", (data) => {
    socket.emit("workItems", {
      todo: workItems,
    });
  });
  socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(8080, () => {
  console.log("listening on *:8080");
});
