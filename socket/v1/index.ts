import {  Socket } from "socket.io";

export default class SocketHandlerV1 {
    socket: Socket;
    constructor(socket: Socket) {
        this.socket = socket;

        this.socket.on("status", () => {
            this.socket.emit("status", "ok");
        })
    }
}