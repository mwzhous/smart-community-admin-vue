import request from '@/utils/request'

/**
 * 获取广告列表
 */
export const getAdvertiseList = (params) => {
  return request({
    url: '/app/advertising',
    method: 'GET',
    params: params
  })
}

/**
 *上传文件
 * @param {*} params
 * @returns
 */
export const uploadAdvertise = (params) => {
  return request({
    url: '/app/upload/advertising',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}

/**
 *新增广告
 * @param {*} params
 * @returns
 */
export const addAdvertise = (data) => {
  return request({
    url: '/app/advertising',
    method: 'POST',
    data
  })
}

/**
 *删除广告
 * @param {*} params
 * @returns
 */
export const deleteAdvertise = (data) => {
  return request({
    url: '/app/advertising',
    method: 'DELETE',
    data
  })
}
/**
 *修改广告信息
 * @param {*} params
 * @returns
 */
export const updateAdvertise = (data) => {
  return request({
    url: '/app/advertising',
    method: 'PUT',
    data
  })
}
