import { io } from "socket.io-client";

const URL = "https://backend.shittytestdomain.xyz";
const socket = io(URL, { autoConnect: true });

// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });

export default socket;
