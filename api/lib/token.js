
import jwt from 'jsonwebtoken';

export function decode(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
        return null;
    }
}
