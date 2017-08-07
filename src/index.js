// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Game from './game'

Vue.use(VueRouter)
Vue.use(require('bootstrap-vue'))

const game = new Game()

const router = new VueRouter({
  mode: 'history',
  routes: require('./config/routes'),
})

const ui = new Vue({ // eslint-disable-line no-new
  el: '#app',
  router: router,
  render: (h) => h(App),
  provide: { game },
})

const app = { game, ui }

if (process.env.NODE_ENV !== 'production') {
  global.app = app
}

export default app
