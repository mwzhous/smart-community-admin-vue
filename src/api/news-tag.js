import request from '@/utils/request'

/**
 * 获取标签列表
 */
export const getNewsTagList = (params) => {
  return request({
    url: '/app/tag',
    method: 'GET',
    params: params
  })
}

/**
 *根据社区id获取标签
 * @param {*} params
 * @returns
 */
export const getNewsTagByCommunityId = (params) => {
  return request({
    url: '/app/community/tag',
    method: 'GET',
    params: params
  })
}

/**
 *新增资讯标签
 * @param {*} params
 * @returns
 */
export const addNewsTag = (data) => {
  return request({
    url: '/app/tag',
    method: 'POST',
    data
  })
}

/**
 *修改广告信息
 * @param {*} params
 * @returns
 */
export const updateNewsTag = (data) => {
  return request({
    url: '/app/tag',
    method: 'PUT',
    data
  })
}

/**
 *删除广告
 * @param {*} params
 * @returns
 */
export const deleteNewsTag = (data) => {
  return request({
    url: '/app/tag',
    method: 'DELETE',
    data
  })
}
