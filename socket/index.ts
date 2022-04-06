import { Server, Socket } from "socket.io";
import SocketHandlerV1 from "./v1";

export default class SocketHandler {
    io: Server;
    constructor(server: Server) {
        this.io = server;

        this.io.on("connection", (socket: Socket) => {
            const version = `${socket.handshake.headers.version}`;
            switch (version) {
                case "1": {
                    new SocketHandlerV1(socket);
                } break
                default: {

                }
            }
            console.log("a user connected");
            socket.on("disconnect", () => {
                console.log("user disconnected");
            });
        })
    }
}