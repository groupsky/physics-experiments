import Home from '../pages/Home.vue'
import About from '../pages/About.vue'

module.exports = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  // todo: figure how to catch all
  // { path: '*', name: '404', component: NotFound },
]
