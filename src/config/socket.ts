import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { auth } from "./firebase";

export let socketIO: Server;

export const initializeSocket = (server: HttpServer) => {
  socketIO = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

  socketIO.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decodedToken = await auth.verifyIdToken(token);
      socket.data.user = decodedToken;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  socketIO.on("connection", (socket) => {
    console.log("User connected:", socket.data.user.uid);

    socket.on("joinMatch", (matchId: string) => {
      socket.join(matchId);
    });

    socket.on("leaveMatch", (matchId: string) => {
      socket.leave(matchId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.data.user.uid);
    });
  });
};
