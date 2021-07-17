import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import socket from "../Socket";

const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

let lastRequestId: string | null = null;
export const useSocketRequest = <T>(eventName: string, data?: any): T => {
  const [response, setResponse] = useState<any | null>(null);

  const handleResponse = (response: any) => {
    const { requestId, ...rest } = response;
    if (requestId === lastRequestId) {
      setResponse(rest);
    }
  };

  useEffect(() => {
    socket.on(eventName, handleResponse);
  }, [eventName]);

  useEffect(() => {
    const requestId = uuidv4();
    lastRequestId = requestId;
    socket.emit("get" + capitalizeFirstLetter(eventName), {
      requestId,
      ...data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, JSON.stringify(data)]);

  return response;
};
