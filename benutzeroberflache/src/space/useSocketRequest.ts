import { useEffect, useState } from "react";
import socket from "../Socket";

const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const useSocketRequest = (eventName: string, data?: any) => {
  const [response, setResponse] = useState<any | null>(null);
  useEffect(() => {
    socket.emit("get" + capitalizeFirstLetter(eventName), data);
    socket.on(eventName, setResponse);
  }, [eventName]);

  return response;
};
