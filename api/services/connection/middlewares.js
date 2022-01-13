
import cookie from 'cookie';

export function parseCookies(socket, next) {
    socket.cookies = {};
    const headers = socket.handshake.headers;
    if ('cookie' in headers) {
        socket.cookies = cookie.parse(headers.cookie);
    }
    next();
}

export function setPropertyFromCookie(cookie, prop=undefined) {
    if (!prop) prop = cookie;
    return function(socket, next) {
        socket[prop] = socket.cookies[cookie];
        next();
    }
}