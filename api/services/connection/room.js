
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
        console.log(`RoomConnection -> Emitting user joined on room #${data.room.id}.`);
        io.to(`room:${data.room.id}`).emit('room:joined', {
            userId: data.user.id,
            roomId: data.room.id,
            userAmount: data.room.userAmount
        })
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
        console.log(`RoomConnection -> Emitting user left of room #${data.room.id}.`);
        io.to(`room:${data.room.id}`).emit('room:left', {
            userId: data.user.id,
            roomId: data.room.id,
            userAmount: data.room.userAmount
        })
    }

    return {
        bind(user) { return {
            join: join.bind(null, user),
            leave: leave.bind(null, user)
        }},
        joined,
        left
    }
}