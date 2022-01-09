
export async function getAll() {
    const res = await fetch('/api/rooms');
    if (!res.ok) return null;
    return await res.json();
}

export async function get(id) {
    const res = await fetch(`/api/rooms/${id}`);
    if (!res.ok) return null;
    return await res.json();
}

export async function authorize(id, body={}) {
    const res = await fetch(`/api/rooms/${id}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const text = await res.text();
    return {
        ok: res.ok,
        status: res.status,
        content: res.ok ? JSON.parse(text) : text
    };
}