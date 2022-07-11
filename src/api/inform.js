import request from '@/utils/request'

/**
 * 分页请求通知列表
 */
export const getNoticeList = (params) => {
  return request({
    url: '/inform',
    method: 'get',
    params
  })
}

/**
 * 添加通知
 */
export const addNotice = (data) => {
  return request({
    url: '/inform',
    method: 'put',
    data
  })
}

/**
 * 修改通知
 */
export const updateNotice = (data) => {
  return request({
    url: '/inform',
    method: 'post',
    data
  })
}

/**
 * 删除通知
 */
export const deleteNotice = (data) => {
  return request({
    url: '/inform',
    method: 'delete',
    data
  })
}

/**
 * 导出
 */
export const exportNotice = () => {
  return request({
    url: '/inform/export',
    method: 'get',
    responseType: 'blob'
  })
}
