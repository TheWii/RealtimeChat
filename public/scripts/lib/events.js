
export default EventBus;

export function EventBus() {
    const topics = {};

    function subscribe(topic, callback) {
        const subscribers = topics[topic] || [];
        if (!subscribers.includes(callback))
            subscribers.push(callback);
        topics[topic] = subscribers;
    }

    function unsubscribe(topic, callback) {
        const subscribers = topics[topic] || [];
        if (subscribers.includes(callback)) {
            const i = subscribers.indexOf(callback);
            subscribers.splice(i, 1);
        }
        topics[topic] = subscribers;
    }

    function publish(topic, ...data) {
        console.log(`EventBus -> Notifying topic "${topic}"`);
        const subscribers = topics[topic];
        if (!subscribers) return;
        for (const callback of subscribers) {
            callback(...data);
        }
    }

    return {
        topics,
        subscribe,
        unsubscribe,
        publish
    }
}