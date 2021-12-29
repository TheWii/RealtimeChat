import { io } from 'socket.io-client';

export default Connection;

export function Connection() {
    const socket = io();

    socket.setProp = function(prop, val) {
        this[prop] = val;
    }

    return socket;
}