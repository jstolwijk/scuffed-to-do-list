import { io } from "socket.io-client";

const URL = "http://188.166.27.58";
const socket = io(URL, { autoConnect: true });

// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });

export default socket;
