import bodyParser from "body-parser";
import crypto from "crypto";
import express from "express";
import http from "http";
import PouchDB from "pouchdb";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import mail, { MailDataRequired } from "@sendgrid/mail";
import { config } from "./config";

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());

const authenticationDb = new PouchDB("authentication");

const THIRTY_MINUTES = 30 * 60000;

const allowedOrigins = ["http://localhost:3000", "https://shittytestdomain.xyz", "https://www.shittytestdomain.xyz"];

app.use(
  cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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

const sendSignUpMail = async (passcode: string, email: string): Promise<void> => {
  mail.setApiKey(config.SENDGRID_API_KEY);
  const msg: MailDataRequired = {
    to: email,
    from: "hello@shittytestdomain.xyz",
    templateId: "d-c47dd35dded24357b3c30d39dd4d5ba3",
    dynamicTemplateData: {
      firstName: email,
      passcode,
    },
  };
  await mail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

const sendSignInMail = async (passcode: string, email: string): Promise<void> => {
  mail.setApiKey(config.SENDGRID_API_KEY);
  const msg: MailDataRequired = {
    to: email,
    from: "hello@shittytestdomain.xyz",
    templateId: "d-c12a972068bb4672a0bfb3d0a5710998",
    dynamicTemplateData: {
      firstName: email,
      passcode,
    },
  };
  await mail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

const generateAndStorePasscode = async (email: string): Promise<PasscodeDto> => {
  const passcode = generatePasscode();

  // key: passcode:email:passcode value: expiry date
  const passcodeDto: PasscodeDto = {
    _id: `passcode|${email}|${passcode}`,
    expiresAt: Date.now() + THIRTY_MINUTES,
    passcode,
    alreadyUsed: false,
  };

  await authenticationDb.put(passcodeDto);

  return passcodeDto;
};

app.post("/sign-up", async (req, res) => {
  // validate input
  const { email, name } = req.body;
  console.log("sign-up request " + email);

  if (await documentExists("auth:" + email)) {
    res.sendStatus(500);
  } else {
    await authenticationDb.put({ _id: "auth:" + email, createdAt: Date.now(), name });

    console.log("Created user: " + email);

    const passcodeDto = await generateAndStorePasscode(email);

    sendSignUpMail(passcodeDto.passcode, email);

    res.status(201);
    res.send({ expiresAt: passcodeDto.expiresAt });
    console.log("sign-up mail sent " + email);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email } = req.body;
  console.log("sign-in request " + email);

  if (await documentExists("auth:" + email)) {
    const passcodeDto = await generateAndStorePasscode(email);

    sendSignInMail(passcodeDto.passcode, email);

    res.status(201);
    res.send({ expiresAt: passcodeDto.expiresAt });
    console.log("sign-in mail sent " + email);
  } else {
    res.sendStatus(404);
    console.log("sign-in failed " + email);
  }
});

app.post("/validate-passcode", async (req, res) => {
  const { email, passcode } = req.body;
  console.log("validate-passcode request " + email);

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
    console.log("validate-passcode succeeded " + email);
  }
});

const generatePasscode = (): string => {
  const randomNumber = crypto.randomInt(0, 1000000);
  return randomNumber.toString().padStart(6, "0");
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

enum State {
  TO_DO = "TO_DO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

interface WorkItem {
  id: string;
  title: string;
  riskLevel: number;
  state: State;
  shortId: number;
  blockedBy: string[];
  blocks: string[];
}

const firstId = uuidv4();
const secondId = uuidv4();
let workItems: WorkItem[] = [
  {
    id: firstId,
    title: "Et aperiam eveniet.",
    riskLevel: 0,
    state: State.TO_DO,
    shortId: 1,
    blockedBy: [],
    blocks: [],
  },
  {
    id: secondId,
    title: "Qui quia aliquid ea facere non occaecati sequi.",
    riskLevel: 0,
    state: State.TO_DO,
    shortId: 2,
    blockedBy: [],
    blocks: [],
  },
  {
    id: uuidv4(),
    title: "Unde maxime praesentium.",
    riskLevel: 0,
    state: State.TO_DO,
    shortId: 3,
    blockedBy: [],
    blocks: [],
  },
  {
    id: uuidv4(),
    title: "Refactor all the things",
    riskLevel: 0,
    state: State.TO_DO,
    shortId: 4,
    blockedBy: [],
    blocks: [],
  },
  {
    id: uuidv4(),
    title: "Follow cursor",
    riskLevel: 0,
    state: State.TO_DO,
    shortId: 5,
    blockedBy: [],
    blocks: [],
  },
  {
    id: uuidv4(),
    title: "Drink coffee",
    riskLevel: 0,
    state: State.DONE,
    shortId: 6,
    blockedBy: [],
    blocks: [],
  },
  {
    id: uuidv4(),
    title: "Design website",
    riskLevel: 0,
    state: State.TO_DO,
    shortId: 7,
    blockedBy: [],
    blocks: [],
  },
];

app.post("/work-items/search", (req, res) => {
  const { query } = req.body;

  const first = workItems.filter(
    (workItem) =>
      workItem.shortId.toString().startsWith(query) || workItem.title.toLowerCase().startsWith(query.toLowerCase())
  );

  if (first.length > 0) {
    res.send({ workItems: first });
    return;
  }
  const responseBody = {
    workItems: workItems.filter((workItem) => workItem.title.toLowerCase().includes(query.toLowerCase())),
  };

  res.send(responseBody);
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("createDocument", (data) => {
    console.log(data);
  });

  socket.on("getSpaces", ({ requestId }) => {
    socket.emit("spaces", {
      requestId,
      spaces: [
        { name: "jesse", title: "Jesse", description: "Tracking personal progress" },
        { name: "test-space", title: "Test space", description: "Testing" },
      ],
    });
  });

  socket.on("createWorkItem", (workItem) => {
    workItems = [{ ...workItem, shortId: workItems.length, blocks: [], blockedBy: [] }, ...workItems];

    socket.broadcast.emit("workItemCreated", workItem);
  });

  socket.on("changeWorkItemState", ({ workItemId, oldState, newState }) => {
    console.log("changeWorkItemState", workItemId, newState);
    const wiId = workItems.findIndex((wi) => wi.id === workItemId);
    workItems[wiId] = { ...workItems[wiId], state: newState };

    if (newState === "DONE") {
      const blockedWorkItems = workItems[wiId].blocks.map((id: string) => workItems.find((wi) => wi.id === id));

      const yes = blockedWorkItems.filter((wi) => wi.blockedBy.length === 1);

      yes.forEach((wi) => {
        const idx = workItems.findIndex((w) => w.id === wi.id);
        workItems[idx] = { ...wi, riskLevel: workItems[idx].riskLevel - 3 };
      });
    } else {
      const blockedWorkItems = workItems[wiId].blocks.map((id: string) => workItems.find((wi) => wi.id === id));

      const yes = blockedWorkItems.filter((wi) => wi.blockedBy);

      yes.forEach((wi) => {
        const idx = workItems.findIndex((w) => w.id === wi.id);
        workItems[idx] = { ...wi, riskLevel: Math.min(workItems[idx].riskLevel + 3) };
      });
    }

    socket.broadcast.emit("workItemStateChanged", { workItemId, oldState, newState });
  });

  socket.on("blockWorkItem", ({ workItemId, blockedByWorkItemId }) => {
    console.log("blockWorkItem", workItemId);
    const idx = workItems.findIndex((workItem) => workItem.id === workItemId)!;
    const blockedByIdx = workItems.findIndex((workItem) => workItem.id === blockedByWorkItemId)!;

    workItems[idx] = {
      ...workItems[idx],
      riskLevel: Math.min(workItems[idx].riskLevel + 3, 4),
      blockedBy: [...workItems[idx].blockedBy, workItems[blockedByIdx].id],
    };

    workItems[blockedByIdx] = {
      ...workItems[blockedByIdx],
      blocks: [...workItems[blockedByIdx].blocks, workItems[idx].id],
    };

    console.log(JSON.stringify(workItems, null, 2));

    socket.broadcast.emit("workItemBlocked", { workItemId, blockedByWorkItemId });
  });

  socket.on("getWorkItem", ({ requestId, ...rest }) => {
    const workItem = workItems.find((wi) => wi.id === rest.workItemId)!;

    socket.emit("workItem", {
      requestId,
      ...workItem,
      blockedBy: workItem.blockedBy.map(toWorkItemSummary),
      blocks: workItem.blocks.map(toWorkItemSummary),
    });
  });

  socket.on("getWorkItems", ({ requestId }) => {
    socket.emit("workItems", {
      requestId,
      workItems,
    });
  });
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const toWorkItemSummary = (workItemId: string) => {
  const workItem = workItems.find((wi) => wi.id === workItemId);
  return {
    id: workItemId,
    title: workItem.title,
    shortId: workItem.shortId,
    state: workItem.state,
  };
};

server.listen(8080, () => {
  console.log("listening on *:8080");
});
