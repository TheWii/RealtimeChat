
export default {
    username
};

export function username(name) {
    if (typeof name !== 'string') return false;
    return (name.length >= 3);
}