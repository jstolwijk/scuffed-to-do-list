import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, DraggableLocation, Droppable, DropResult } from "react-beautiful-dnd";
import socket from "../../Socket";
import { CreateWorkItemInput } from "./components/CreateWorkItemInput";
import { WorkItemTile } from "./components/WorkItemTile";
import { State, WorkItem } from "./workItem";

const reorder = (list: WorkItem[], startIndex: number, endIndex: number): WorkItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (
  source: WorkItem[],
  destination: WorkItem[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
): { source: WorkItem[]; dest: WorkItem[] } => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  return { source: sourceClone, dest: destClone };
};

const groups = ["To do", "In progress", "Done"];

const appendWorkItem = (workItem: WorkItem, state: WorkItem[][]): WorkItem[][] => {
  const newState = [...state];
  newState[0] = [workItem, ...state[0]];
  return newState;
};

function Page() {
  const [state, setState] = useState<WorkItem[][]>([[], [], []]);

  useEffect(() => {
    (async () => {
      if (!socket.connected) {
        await socket.connect();
        console.log("Connected");
      }
      socket.on("workItemCreated", (workItem: WorkItem) => {
        console.log("New work item created. ", workItem);

        setState((old) => appendWorkItem(workItem, old));
      });
      socket.on("workItems", (fetchedItems: any) => {
        setState([
          fetchedItems.todo.filter((workItem: WorkItem) => workItem.state === State.TO_DO),
          fetchedItems.todo.filter((workItem: WorkItem) => workItem.state === State.IN_PROGRESS),
          fetchedItems.todo.filter((workItem: WorkItem) => workItem.state === State.DONE),
        ]);
      });
      await socket.emit("getWorkItems", "");
      console.log("done");
    })();
  }, []);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result.source;
      newState[dInd] = result.dest;
      setState(newState);
    }
  }

  const handleCreateWorkItem = (workItem: WorkItem) => {
    setState(appendWorkItem(workItem, state));
    socket.emit("createWorkItem", workItem);
  };
  const getListStyle = (isDraggingOver: boolean): string =>
    isDraggingOver
      ? "min-h-full transition duration-200 ease-in-out p-2 bg-gray-200"
      : "min-h-full transition duration-500 ease-in-out p-2";

  return (
    <div className="">
      <h1>Jesse's board</h1>
      <div className="my-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 select-none">
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <div className={`xl:col-start-${2 + ind} xl:col-end-${3 + ind}`}>
              <div className="flex px-2 pb-1">
                <p className="rounded px-3 py-1 bg-gray-200 mr-1 font-semibold">{state[ind].length}</p>
                <h2>{groups[ind]}</h2>
              </div>
              {ind === 0 && <CreateWorkItemInput onCreate={handleCreateWorkItem} />}
              <Droppable key={ind} droppableId={`${ind}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    {el.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => <WorkItemTile provided={provided} snapshot={snapshot} item={item} />}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}

export default Page;
