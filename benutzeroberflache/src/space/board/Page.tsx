import React, { useEffect, useReducer } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import socket from "../../Socket";
import { CreateWorkItemInput } from "./components/CreateWorkItemInput";
import { WorkItemTile } from "./components/WorkItemTile";
import { State, WorkItem } from "./workItem";

const reorder = (
  list: WorkItem[],
  startIndex: number,
  endIndex: number
): WorkItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (
  source: WorkItem[],
  destination: WorkItem[],
  sourceIndex: number,
  destinationIndex: number
): { source: WorkItem[]; dest: WorkItem[] } => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(sourceIndex, 1);

  destClone.splice(destinationIndex, 0, removed);

  return { source: sourceClone, dest: destClone };
};

const groups = ["To do", "In progress", "Done"];

const appendWorkItem = (
  workItem: WorkItem,
  state: WorkItem[][]
): WorkItem[][] => {
  const newState = [...state];
  newState[0] = [workItem, ...state[0]];
  return newState;
};

const droppableIdToState = (n: number): State => {
  if (n > 2) {
    throw new Error("Droppable id bigger than 2: " + n);
  }
  return [State.TO_DO, State.IN_PROGRESS, State.DONE][n]!;
};

type ReducerState = WorkItem[][];

const initialState: ReducerState = [[], [], []];

type Action =
  | { type: "deprecated"; newState: ReducerState }
  | { type: "workItemCreated"; workItem: WorkItem }
  | { type: "workItems"; workItems: WorkItem[] }
  | {
      type: "workItemStateChanged";
      workItemId: string;
      oldWorkItemState: State;
      newWorkItemState: State;
    };

const handleWorkItemStateChange = (
  old: ReducerState,
  workItemId: string,
  oldWorkItemState: State,
  newWorkItemState: State
) => {
  const oldColIdx = Object.values(State).findIndex(
    (s) => s === oldWorkItemState
  );
  const newColIdx = Object.values(State).findIndex(
    (s) => s === newWorkItemState
  );

  const workItemCurrentId = old[oldColIdx].findIndex(
    (wi) => wi.id === workItemId
  );

  if (workItemCurrentId < 0) {
    return old;
  }

  const result = move(
    old[oldColIdx],
    old[newColIdx],
    workItemCurrentId,
    old[newColIdx].length
  );

  const newColState = [...old];
  newColState[oldColIdx] = result.source;
  newColState[newColIdx] = result.dest;

  return newColState;
};

function reducer(state: ReducerState, action: Action) {
  switch (action.type) {
    case "workItemCreated":
      return appendWorkItem(action.workItem, state);
    case "workItemStateChanged":
      return handleWorkItemStateChange(
        state,
        action.workItemId,
        action.oldWorkItemState,
        action.newWorkItemState
      );
    case "workItems":
      return [
        action.workItems.filter(
          (workItem: WorkItem) => workItem.state === State.TO_DO
        ),
        action.workItems.filter(
          (workItem: WorkItem) => workItem.state === State.IN_PROGRESS
        ),
        action.workItems.filter(
          (workItem: WorkItem) => workItem.state === State.DONE
        ),
      ];
    case "deprecated":
      return action.newState;
    default:
      throw new Error();
  }
}

function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    socket.on("workItemCreated", (workItem: WorkItem) => {
      dispatch({ type: "workItemCreated", workItem });
    });
    socket.on("workItemStateChanged", ({ workItemId, oldState, newState }) => {
      dispatch({
        type: "workItemStateChanged",
        workItemId,
        oldWorkItemState: oldState,
        newWorkItemState: newState,
      });
    });
    socket.on("workItems", (fetchedItems: any) => {
      dispatch({ type: "workItems", workItems: fetchedItems.workItems });
    });
    socket.emit("getWorkItems", "");
  }, []);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    console.log("Source: ", source);
    console.log("Destination: ", destination);

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
      dispatch({ type: "deprecated", newState });
    } else {
      const result = move(
        state[sInd],
        state[dInd],
        source.index,
        destination.index
      );
      const newState = [...state];
      newState[sInd] = result.source;
      newState[dInd] = result.dest;
      dispatch({ type: "deprecated", newState });

      socket.emit("changeWorkItemState", {
        workItemId: state[sInd][source.index].id,
        oldState: droppableIdToState(sInd) as State,
        newState: droppableIdToState(dInd) as State,
      });

      setTimeout(function () {
        socket.emit("getWorkItems", ""); // TODO: HACK TO SEE ITEMS GETTING BLOCKED AFTER STATE CHANGE
      }, 500);
    }
  }

  const handleCreateWorkItem = (workItem: WorkItem) => {
    dispatch({ type: "deprecated", newState: appendWorkItem(workItem, state) });

    socket.emit("createWorkItem", workItem);
  };
  const getListStyle = (isDraggingOver: boolean): string =>
    isDraggingOver
      ? "min-h-full transition duration-200 ease-in-out p-2 bg-gray-200"
      : "min-h-full transition duration-500 ease-in-out p-2";

  return (
    <div className="mx-auto container">
      <h1 className="text-center text-4xl font-bold mb-8">Jesse's board</h1>

      <div className="text-center p-8">
        <h2>View (TODO)</h2>
        <select className="bg-red-600">
          <option>Development</option>
          <option>Requirements</option>
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 select-none">
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <div className={`xl:col-start-${2 + ind} xl:col-end-${3 + ind}`}>
              <div className="flex px-2 pb-1">
                <p className="rounded px-3 py-1 bg-gray-200 mr-1 font-semibold">
                  {state[ind].length}
                </p>
                <h2>{groups[ind]}</h2>
              </div>
              {ind === 0 && (
                <CreateWorkItemInput onCreate={handleCreateWorkItem} />
              )}
              <Droppable key={ind} droppableId={`${ind}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    {el.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <WorkItemTile
                            provided={provided}
                            snapshot={snapshot}
                            item={item}
                          />
                        )}
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
