import { io } from 'socket.io-client';

export default Connection;

export function Connection() {
    const socket = io();

    socket.setProp = function(prop, val) {
        this[prop] = val;
    }

    socket.$listeners = [];

    /**
     * Adds the `listener` function as an event listener for `ev`.
     * Listeners added using `$on` are route-exclusive and are
     * removed everytime the route changes.
     * @param {*} ev Name of the event
     * @param {*} listener Callback function
     */
    socket.$on = function(ev, listener) {
        this.on(ev, listener);
        this.$listeners.push([ ev, listener ]);
    }

    /**
     * Removes all listeners added with `$on` method.
     */
    socket.$resetListeners = function() {
        for (let [ev, listener] of this.$listeners) {
            this.off(ev, listener);
        }
        this.$listeners.splice(0, this.$listeners.length);
    }

    return socket;
}