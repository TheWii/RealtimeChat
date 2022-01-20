
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

    connection.subscribe('room:received_message', messenger.receivedUserMessage);
    messenger.subscribe('room:appended_message', connection.room.broadcastMessage);
    
    return {
        messenger,
        connection
    }
}
