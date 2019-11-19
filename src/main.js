import '@babel/polyfill';
import Vue from 'vue';
import App from './App.vue';
import router from './setup/router-setup';
import store from './store';
import i18n from './setup/i18n-setup';
import vueConfig from './plugins/vueConfig';
import mixins from './plugins/mixins';
import eject from './plugins/eject';
import filters from './plugins/filters';
// eslint-disable-next-line import/no-named-as-default
import components from './plugins/components';
// import jockey from './utils/jockey';
import './assets/styleSheet/global.css';

Vue.use(vueConfig);
Vue.mixin(mixins);
Vue.use(filters);
Vue.use(eject);
Vue.use(components);

/* eslint-disable no-new */

new Vue({
  el: '#root',
  router,
  store,
  i18n,
  // components: { App },
  // template: '<App/>', // https://cli.vuejs.org/config/#runtimecompiler
  render: h => h(App)
});
