import request from '@/utils/request'

/**
 * 登录
 */
export const login = (data) => {
  return request({
    url: '/system/login',
    method: 'POST',
    data
  })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/system/profile'
  })
}

/**
 * 获取用户列表
 */
export const getUserList = (params) => {
  return request({
    url: '/system/user',
    method: 'get',
    params
  })
}

/**
 * 修改用户信息
 */
export const updateUser = (data) => {
  return request({
    url: '/system/user',
    method: 'put',
    data
  })
}

/**
 * 禁用用户
 */
export const banUser = (data) => {
  return request({
    url: '/system/banUser',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 启用用户
 */
export const enableUser = (data) => {
  return request({
    url: '/system/enableUser',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 导出
 */
export const exportUser = (params) => {
  return request({
    url: '/system/userExport',
    method: 'get',
    responseType: 'blob',
    params
  })
}

/**
 * 查询用户详细信息
 */
export const getUserDetailById = (params) => {
  return request({
    url: '/system/userDetail',
    method: 'get',
    params
  })
}
