import { createApp } from 'vue';
import VueCookies from 'vue-cookies';
import App from './App.vue';
import router from './routes/index.js';

// Fix for vue-cookies not working with Vue 3 due to $cookie property.
// https://github.com/cmp-cc/vue-cookies/issues/59#issuecomment-823796719
VueCookies.install = function(Vue) {
    Vue.prototype ? Vue.prototype.$cookies = this : Vue.config.globalProperties.$cookies = this;
    Vue.cookie = this;
}

createApp(App)
    .use(VueCookies)
    .use(router)
    .mount('#app');