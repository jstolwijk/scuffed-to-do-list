import { io } from "socket.io-client";

// const URL = "https://backend.shittytestdomain.xyz";
const URL = "http://localhost:8080";
const socket = io(URL, { autoConnect: true });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
