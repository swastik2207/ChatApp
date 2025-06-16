import { io, Socket } from "socket.io-client";
import Env from "./env";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options"
let socket: Socket;
export const getSocket = () => {
  if (!socket) {
    socket = io(Env.BACKEND_URL, { autoConnect: false });
  }
  return socket;
};
