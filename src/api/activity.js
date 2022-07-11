import request from '@/utils/request'

/**
 * 获取活动列表
 */
export const getActivityList = (params) => {
  return request({
    url: '/app/active',
    method: 'GET',
    params: params
  })
}

/**
 *新增活动
 * @param {*} params
 * @returns
 */
export const addActivity = (data) => {
  return request({
    url: '/app/active',
    method: 'POST',
    data
  })
}

/**
 *修改活动信息
 * @param {*} params
 * @returns
 */
export const updateActivity = (data) => {
  return request({
    url: '/app/active',
    method: 'PUT',
    data
  })
}

/**
 *删除活动
 * @param {*} params
 * @returns
 */
export const deleteActivity = (data) => {
  return request({
    url: '/app/active',
    method: 'DELETE',
    data
  })
}
