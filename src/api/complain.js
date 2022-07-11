import request from '@/utils/request'

/**
 * 查询投诉建议
 */
export const getComplain = (params) => {
  return request({
    url: '/operation/complain',
    method: 'get',
    params: params
  })
}

/**
 * 回复投诉建议
 */
export const updateOrder = (params) => {
  return request({
    url: '/operation/complain',
    method: 'post',
    data: params
  })
}

/**
 * 删除投诉建议
 */
export const delBill = (params) => {
  return request({
    url: '/operation/complain',
    method: 'delete',
    data: params
  })
}

/**
 * 获取回复记录
 * @param {*} data
 * @returns
 */
export const getResult = (data) => {
  return request({
    url: '/operation/complain/result',
    params: data
  })
}

/**
 * 导出
 */
export const exportComplain = (params) => {
  return request({
    url: '/operation/complain/export',
    method: 'get',
    responseType: 'blob',
    params
  })
}
