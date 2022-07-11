const getters = {
  token: (state) => state.user.token,
  userInfo: (state) => state.user.userInfo,
  moduleId: (state) => state.user.moduleId,
  /**
   * @returns true 表示已存在用户信息
   */
  hasUserInfo: (state) => {
    return JSON.stringify(state.user.userInfo) !== '{}'
  },
  permissions: (state) => {
    return state.user.permissions
  }
}
export default getters
