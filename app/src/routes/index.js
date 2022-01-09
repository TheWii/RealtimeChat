import { createRouter, createWebHistory } from 'vue-router';

import Welcome from '../views/Welcome.vue';
import Rooms from '../views/Rooms.vue';
import Room from '../views/Room.vue';
import JoinRoom from '../views/JoinRoom.vue';

function requireName(to, from, next) {
    // if user does not have name, redirect to welcome page
    if (!window.$cookies.isKey('name')) return next({name:'welcome'});
    next();
}

const routes = [
    {
        path: '/', name: 'welcome', component: Welcome,
        beforeEnter(to, from, next) {
            // if user already has name, redirect to room home page
            if (window.$cookies.isKey('name')) return next({name:'rooms'});
            next();
        }
    },
    {
        path: '/rooms', name: 'rooms', component: Rooms,
        beforeEnter: requireName
    },
    {
        path: '/rooms/:id', name: 'room', component: Room,
        props: true,
        beforeEnter: requireName
    },
    {
        path: '/rooms/:id/join', name: 'join-room', component: JoinRoom,
        props: true,
        beforeEnter: requireName
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;