import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import Planck from '../pages/Planck.vue'
import Physics from '../pages/Physics.vue'

module.exports = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/planck', component: Planck },
  { path: '/physics', component: Physics },
  // todo: figure how to catch all
  // { path: '*', name: '404', component: NotFound },
]
