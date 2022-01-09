
import Messenger from './messenger.js';
import Connection from './connection.js';

export default Services;

export function Services(sockets) {
    const messenger = Messenger();
    const connection = Connection(sockets);
        
    messenger.addRoom('mainhall', {
        name: 'Main Hall',
        limit: 25
    });
    messenger.addRoom('viparea', {
        name: 'VIP Area',
        isPrivate: true,
        password: '12345678',
        limit: 10
    });

    connection.subscribe('room:join', messenger.joinRoom);
    messenger.subscribe('room:joined', connection.room.joined);
    connection.subscribe('room:leave', messenger.leaveRoom);
    connection.subscribe('user:disconnected', messenger.leaveRoom);
    messenger.subscribe('room:left', connection.room.left);
    

    //
    //connection.subscribe('received-message', (data) =>
    //    messenger.appendMessage(data.roomId, data.message)
    //);
    //connection.subscribe('user-connection', (data) => {
    //    messenger.renameUser(data.user, data.user.cookies.name);
    //    messenger.joinRoom(data.user.roomId, data.user);
    //});
    //connection.subscribe('user-disconnection', (data) =>
    //    messenger.leaveRoom(data.user.roomId, data.user)
    //);
    //connection.subscribe('user-name-request', (data) =>
    //    messenger.renameUser(data.user, data.name)
    //);
    //
    //messenger.subscribe('user-joined', connection.userJoinedRoom);
    //messenger.subscribe('user-left', connection.userLeftRoom);
    //messenger.subscribe('appended-message', connection.broadcastMessage);
    //messenger.subscribe('renamed-user', connection.sendUserName);

    return {
        messenger,
        connection
    }
}
