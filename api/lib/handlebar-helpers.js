
export default {
    len
}

export function len(param) {
    if (Array.isArray(param)) return param.length;
    return Object.entries(param).length;
}
