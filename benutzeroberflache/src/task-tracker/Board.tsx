import { useEffect, useRef, useState } from "react";
import { useMouse } from "react-use";
import socket from "../Socket";
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
}

interface Cursor {
  x: number;
  y: number;
}

const Board = () => {
  const [newWorkItemName, setNewWorkItemName] = useState("");
  const [otherCursor, setOtherCursor] = useState<Cursor | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const ref = useRef(null);
  const { docX, docY } = useMouse(ref);

  useEffect(() => {
    socket.emit("mouseLocationUpdated", { docX, docY });
  }, [docX, docY]);

  useEffect(() => {
    (async () => {
      if (!socket.connected) {
        await socket.connect();
        console.log("Connected");
      }
      socket.on("workItems", (fetchedItems: any) => {
        setWorkItems(fetchedItems.todo);
      });
      socket.on("workItemCreated", (workItem: WorkItem) => {
        console.log("New work item created. ", workItem);
        setWorkItems((old) => [workItem, ...old]);
      });
      socket.on("mouseLocationUpdated", ({ docX, docY }) => {
        setOtherCursor({ x: docX, y: docY });
      });
      socket.on("workItemStateChanged", ({ workItemId, newState }) => {
        console.log("workItemStateChanged");
        setWorkItems((old) => {
          let copy = [...old];
          const wiId = copy.findIndex((wi) => wi.id === workItemId);
          console.log(wiId);

          copy[wiId] = { ...copy[wiId], state: newState };
          console.log(copy);
          console.log(copy[wiId]);

          return copy;
        });
      });
      await socket.emit("getWorkItems", "");
      console.log("done");
    })();
  }, []);

  return (
    <div className="border-2 border-black bg-black" ref={ref}>
      {otherCursor && (
        <div
          className="flex"
          style={{
            position: "absolute",
            left: Math.min(otherCursor.x, window.innerWidth - 20),
            top: Math.min(otherCursor.y, window.innerHeight - 40),
          }}
        >
          <div className="rounded-full p-2 bg-blue-500 text-xs">J</div>
        </div>
      )}
      <div className="bg-white border-2 border-black flex">
        <h1 className="p-2 border-2 border-black font-bold text-lg">Jesse's board</h1>
        <div className="flex-1 flex">
          <div className="border-2 border-black flex-grow p-2">Fancy search bar</div>
          <input
            className="border-2 border-black p-2"
            placeholder="e.g. Design new website"
            value={newWorkItemName}
            onChange={(e) => setNewWorkItemName(e.target.value)}
          ></input>
          <button
            className="border-2 border-black p-2 bg-blue-500"
            onClick={() => {
              socket.emit("createWorkItem", { title: newWorkItemName });
            }}
          >
            Create item
          </button>
        </div>
      </div>
      <div className="border-t-2 border-b-2 border-black p-4 mx-1 bg-white">Filters</div>
      <div className="bg-white grid grid-flow-col border-black grid-cols-3">
        <Column title="To do" workItems={workItems.filter((workItem) => workItem.state === State.TO_DO)} />
        <Column title="In progress" workItems={workItems.filter((workItem) => workItem.state === State.IN_PROGRESS)} />
        <Column title="Done" workItems={workItems.filter((workItem) => workItem.state === State.DONE)} />
      </div>
    </div>
  );
};

const Column: React.FC<{ title: string; workItems: WorkItem[] }> = ({ title, workItems }) => {
  return (
    <div className="bg-black flex flex-col border-black border-2 flex-wrap overflow-y-auto">
      <div className="bg-white grid grid-cols-2 text-center">
        <h2 className="border-2 border-black p-4 font-semibold text-xl">{title}</h2>
        <button className="border-2 border-black p-4 font-semibold text-xl bg-white" onClick={() => {}}>
          {workItems.length} items
        </button>
      </div>
      {workItems.map((workItem: WorkItem) => (
        <WorkItemTile
          key={workItem.id}
          id={String(workItem.id)}
          title={workItem.title}
          riskLevel={workItem.riskLevel}
          state={workItem.state}
        />
      ))}
    </div>
  );
};

const riskColors = ["bg-green-600", "bg-green-300", "bg-yellow-100", "bg-red-300", "bg-red-600"];

const WorkItemTile: React.FC<WorkItem> = ({ id, title, riskLevel, state }) => {
  return (
    <div className={`${riskColors[riskLevel]} h-32 p-4 cursor-pointer border-2 border-black`}>
      <h3 className="font-semibold text-xl">{title}</h3>
      <select
        name="cars"
        id="cars"
        value={state}
        onChange={(e) => socket.emit("changeWorkItemState", { workItemId: id, newState: e.target.value })}
      >
        <option value={State.TO_DO}>To do</option>
        <option value={State.IN_PROGRESS}>In progress</option>
        <option value={State.DONE}>Done</option>
      </select>
    </div>
  );
};

export default Board;
