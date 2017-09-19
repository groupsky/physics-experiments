import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import Planck from '../pages/Planck.vue'
import HPlanck from '../pages/HPlanck.vue'
import HPPlanck from '../pages/HPPlanck.vue'
import Physics from '../pages/Physics.vue'
import Breakable2 from '../pages/Breakable2.vue'
import Car from '../pages/Car.vue'
import Carry from '../pages/Carry.vue'

module.exports = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/planck', component: Planck },
  { path: '/hplanck', component: HPlanck },
  { path: '/hpplanck', component: HPPlanck },
  { path: '/physics', component: Physics },
  { path: '/breakable2', component: Breakable2 },
  { path: '/car', component: Car },
  { path: '/carry', component: Carry },
  // todo: figure how to catch all
  // { path: '*', name: '404', component: NotFound },
]
