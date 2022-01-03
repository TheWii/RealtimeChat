
export async function getAll() {
    const res = await fetch('/api/rooms');
    if (!res.ok) return null;
    return await res.json();
}