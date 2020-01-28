import Vue from 'vue'
import App from './App.vue'

import vuetify from './plugins/vuetify' // path to vuetify export

import store from './store/index';
import router from './router';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.config.productionTip = false

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app')
