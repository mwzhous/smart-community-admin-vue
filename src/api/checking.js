import request from '@/utils/request'

/**
 * 分页请求通知列表
 */
export const getCheckingList = (params) => {
  return request({
    url: '/attendance',
    method: 'get',
    params
  })
}

/**
 * 添加通知
 */
export const addChecking = (data) => {
  return request({
    url: '/attendance',
    method: 'put',
    data
  })
}

/**
 * 修改通知
 */
export const updateChecking = (data) => {
  return request({
    url: '/attendance',
    method: 'post',
    data
  })
}

/**
 * 删除通知
 */
export const deleteChecking = (data) => {
  return request({
    url: '/attendance',
    method: 'delete',
    data
  })
}

/**
 * 导出
 */
export const exportChecking = () => {
  return request({
    url: '/attendance/export',
    method: 'get',
    responseType: 'blob'
  })
}
