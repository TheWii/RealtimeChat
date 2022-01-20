
import { decode } from '../../lib/token.js';

export default function RoomHandler(io, bus) {

    function join(user, data) {
        const token = decode(data.token);
        if (!token) return user.emit('room:unauthorized');
        console.log(`RoomConnection -> User(${user.id}) requested to join room #${token.id}.`);
        bus.publish('room:join', {
            user,
            roomId: token.id,
            password: data.password
        });
    }
    
    function leave(user) {
        console.log(`RoomConnection -> User(${user.id}) requested to leave room #${user.roomId}.`);
        if (!user.roomId) return;
        bus.publish('room:leave', {
            user,
            roomId: user.roomId
        });
    }

    /**
     * Emits to all users in room `room` a `room:joined` event
     * containing the user `user` that joined the room.
     * @param {{
     *  room: Room,
     *  user: Socket
     * }} data
     */
    function joined(data) {
        const { room, user } = data;
        console.log(`RoomConnection -> Emitting user joined on room #${room.id}.`);
        user.join(`room:${room.id}`);
        // send initial data to user
        user.emit('room:joined', {
            id: room.id,
            name: room.name,
            userAmount: room.userAmount,
            messages: room.messages,
            typing: room.typing.map( user => ({
                id: user.userId,
                name: user.name
            }))
        });
        // notify all users in room
        io.to(`room:${room.id}`).emit('room:user_joined', {
            userId: user.userId,
            userName: user.name,
            roomId: room.id,
            userAmount: room.userAmount
        });
    }

    /**
     * Emits to all users in room `room` a `room:left` event
     * containing the user `user` that left the room.
     * @param {{
     *  room: Room,
     *  user: Socket
     * }} data
     */
    function left(data) {
        const { room, user } = data;
        console.log(`RoomConnection -> Emitting user left of room #${room.id}.`);
        user.leave(`room:${room.id}`);
        io.to(`room:${room.id}`).emit('room:user_left', {
            userId: user.userId,
            userName: user.name,
            roomId: room.id,
            userAmount: room.userAmount
        })
    } 

    function receivedMessage(user, data, callback) {
        const { text } = data;
        const roomId = user.roomId;
        console.log(`RoomConnection -> Received message by ${user.userId} in #${roomId}.`);
        bus.publish('room:received_message', {
            roomId,
            user,
            text,
            createdMessage(message) {
                callback({
                    messageId: message.id,
                    time: message.time
                });
            }
        });
    }
    
    function broadcastMessage(data) {
        console.log(`RoomConnection -> Broadcasting message to room #${data.roomId}.`);
        sendToRoom(data.roomId, 'room:broadcast_message', data.message);
    }

    //function userStartedTyping(user) {
    //    console.log(`Connection -> An user started typing...`);
    //    const roomId = user.roomId;
    //    sendToRoom(roomId, 'user-started-typing', {
    //        id: user.id,
    //        name: user.name
    //    });
    //}
    //function userStoppedTyping(user) {
    //    console.log(`Connection -> An user stopped typing...`);
    //    const roomId = user.roomId;
    //    sendToRoom(roomId, 'user-stopped-typing', {
    //        id: user.id,
    //        name: user.name
    //    });
    //}
    
    function sendToRoom(roomId, event, ...args) {
        io.in(`room:${roomId}`).emit(event, ...args);
    }

    return {
        bind(user) { return {
            join: join.bind(null, user),
            leave: leave.bind(null, user),
            send_message: receivedMessage.bind(null, user)
        }},
        joined,
        left,
        broadcastMessage
    }
}