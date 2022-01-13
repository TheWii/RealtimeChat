
export function generateId(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function generateUserId(req, res, next) {
    if (!req.cookies['user']) {
        res.cookie('user', generateId());
    }
    next();
}