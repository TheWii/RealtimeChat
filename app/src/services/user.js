
export async function setName(name) {
    const res = await fetch('/api/user/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    const text = await res.text();
    return {
        ok: res.ok,
        content: res.ok ? JSON.parse(text) : text
    };
}