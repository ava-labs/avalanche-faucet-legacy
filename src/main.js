import Vue from 'vue'
import App from './App.vue'

import vuetify from './plugins/vuetify' // path to vuetify export

import store from './store/index';
import router from './router';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'
import VueAnalytics from 'vue-analytics'


Vue.config.productionTip = false;

Vue.use(VueAnalytics, {
  id: 'UA-126268251-6',
  router
})

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')
