import request from '@/utils/request'

/**
 * 获取资讯列表
 */
export const getNewsList = (params) => {
  return request({
    url: '/app/news',
    method: 'GET',
    params: params
  })
}

/**
 *新增资讯
 * @param {*} params
 * @returns
 */
export const addNews = (data) => {
  return request({
    url: '/app/news',
    method: 'POST',
    data
  })
}

/**
 *删除资讯
 * @param {*} params
 * @returns
 */
export const deleteNews = (data) => {
  return request({
    url: '/app/news',
    method: 'DELETE',
    data
  })
}
/**
 *修改资讯信息
 * @param {*} params
 * @returns
 */
export const updateNews = (data) => {
  return request({
    url: '/app/news',
    method: 'PUT',
    data
  })
}
