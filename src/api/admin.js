import request from '@/utils/request'

/**
 * 获取管理员列表
 */
export const getAdminList = (params) => {
  return request({
    url: '/system/admin',
    method: 'get',
    params
  })
}

/**
 * 禁用用户
 */
export const banAdmin = (data) => {
  return request({
    url: '/system/banAdmin',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 启用管理员
 */
export const enableAdmin = (data) => {
  return request({
    url: '/system/enableAdmin',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 新增管理员信息
 */
export const addAdmin = (data) => {
  return request({
    url: '/system/admin',
    method: 'post',
    data
  })
}

/**
 *上传文件
 * @param {*} params
 * @returns
 */
export const uploadAdminAvatar = (params) => {
  return request({
    url: '/system/upload/admin',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}

/**
 * 修改管理员信息
 */
export const updateAdmin = (data) => {
  return request({
    url: '/system/admin',
    method: 'put',
    data
  })
}

/**
 * 导出
 */
export const exportAdmin = (params) => {
  return request({
    url: '/system/adminExport',
    method: 'get',
    responseType: 'blob',
    params
  })
}
