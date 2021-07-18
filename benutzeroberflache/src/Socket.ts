import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_BASE_URL as string, {
  autoConnect: true,
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
