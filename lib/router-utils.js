
export default {
    requireCookie
};

export function requireCookie(field, condition=null, callback=null) {
    if (!condition) condition = (value) => value !== undefined;
    if (!callback) callback = (req, res) => {};
    function middleware(req, res, next) {
        const value = req.cookies[field];
        if (condition(value)) next();
        else callback(req, res);
    }
    return middleware;
}