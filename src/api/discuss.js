import request from '@/utils/request'

/**
 * 分页获取评论信息
 * @param {*} data
 * @returns
 */
export const getDiscussList = (data) => {
  return request({
    url: '/communication/discuss',
    params: data
  })
}

/**
 * 删除评论列表信息
 * @param {*} data
 * @returns
 */
export const deleteDiscuss = (data) => {
  return request({
    url: '/communication/discuss',
    method: 'DELETE',
    data
  })
}
