
import Messenger from './messenger.js';
import Connection from './connection.js';

export default Services;

export function Services(sockets) {
    const messenger = Messenger();
    const connection = Connection(sockets);

    //messenger.addRoom('public', { name: 'Community Center' });
    //messenger.addRoom('private', {
    //    name: 'Secret Club',
    //    private: true,
    //    password: 'chocolate123'
    //});
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
