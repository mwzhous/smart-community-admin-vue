import request from '@/utils/request'

/**
 * 分页请求通知列表
 */
export const getIntegration = (params) => {
  return request({
    url: '/integration',
    method: 'get',
    params
  })
}

/**
 * 添加通知
 */
export const addIntegration = (data) => {
  return request({
    url: '/integration',
    method: 'put',
    data
  })
}

/**
 * 修改通知
 */
export const updateIntegration = (data) => {
  return request({
    url: '/integration',
    method: 'post',
    data
  })
}

/**
 * 删除通知
 */
export const deleteIntegration = (data) => {
  return request({
    url: '/integration',
    method: 'delete',
    data
  })
}
