import { login, getUserInfo } from '@/api/user'
import { setItem, getItem, removeAllItem } from '@/utils/storage'
import { TOKEN, PERMISSIONS } from '@/constant'
import router from '@/router'
import { setTimeStamp } from '@/utils/auth'

export default {
  namespaced: true,
  state: () => ({
    token: getItem(TOKEN) || '',
    permissions: getItem(PERMISSIONS) || [],
    userInfo: {},
    moduleId: 0
  }),
  mutations: {
    setToken (state, token) {
      state.token = token
      setItem(TOKEN, token)
    },
    setPermissions (state, permissions) {
      state.permissions = permissions
      setItem(PERMISSIONS, permissions)
    },
    setUserInfo (state, userInfo) {
      state.userInfo = userInfo
    },
    setModuleId (state, moduleId) {
      state.moduleId = moduleId
    }
  },
  actions: {
    login (context, userInfo) {
      const { username, password } = userInfo
      return new Promise((resolve, reject) => {
        login({
          username,
          password
        })
          .then((data) => {
            setTimeStamp()
            resolve(data.data)
            this.commit('user/setToken', data.data.token)
            this.commit('user/setPermissions', data.data.permissions)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    async getUserInfo (context) {
      const res = await getUserInfo()
      this.commit('user/setUserInfo', res.data)
      return res
    },
    logout () {
      this.commit('user/setToken', '')
      this.commit('user/setUserInfo', {})
      removeAllItem()
      router.push('/login')
    }
  }
}
