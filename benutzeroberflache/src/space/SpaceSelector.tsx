import { eventNames } from "process";
import { useEffect, useState } from "react";
import { generatePath, Link } from "react-router-dom";
import socket from "../Socket";
import { Color, RowWithStatusColor } from "./components/RowWithStatusColor";
import { SpaceRoutes } from "./Router";

const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const useSocketRequest = (eventName: string) => {
  const [response, setResponse] = useState<any | null>(null);
  useEffect(() => {
    socket.emit("get" + capitalizeFirstLetter(eventName));
    socket.on(eventName, setResponse);
  }, []);

  return response;
};

const useSocketConsumer = (eventName: string, onDataReceived: (data: any) => void) => {
  useEffect(() => {
    socket.on(eventName, onDataReceived);
  }, []);
};

const SpaceSelector = () => {
  const response = useSocketRequest("spaces");

  return (
    <div className="container mx-auto bg-gray-100">
      <h2 className="font-bold text-4xl">Good morning, $name</h2>
      <div className="mt-8">
        <TimelineSelector />
        <RowWithStatusColor statusColor={Color.BLUE}>John has joined the team 🚀</RowWithStatusColor>
        <RowWithStatusColor statusColor={Color.GREEN}>Jan completed cool work item 🎉</RowWithStatusColor>
        <RowWithStatusColor statusColor={Color.RED}>
          "Design new website" has been blocked by a new dependency
        </RowWithStatusColor>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your spaces</h2>
        <div>
          {response?.spaces?.map((space: any) => (
            <Link
              to={{
                pathname: generatePath(SpaceRoutes.BOARD, {
                  name: space.name,
                }),
              }}
              className="block p-4 rounded shadow-lg bg-white mt-2 flex"
            >
              <p className="font-semibold">{space.title}</p>
              <span className="px-1"></span>
              <p>{space.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const TimelineSelector = () => {
  return (
    <select className="text-xl font-semibold bg-gray-100">
      <option>Revent events</option>
      <option>Summary of yesterday</option>
      <option>Summary of last week</option>
    </select>
  );
};

export default SpaceSelector;
