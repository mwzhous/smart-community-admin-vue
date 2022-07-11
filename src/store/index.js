import { createStore } from 'vuex'
import user from './modules/user'
import getters from './getters'
import carport from './modules/carport'

export default createStore({
  getters,
  modules: {
    user,
    carport
  }
})
