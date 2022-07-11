import request from '@/utils/request'

/**
 * 分页查询意见反馈列表
 */
export const getFeedback = (params) => {
  return request({
    url: '/feedback',
    method: 'get',
    params: params
  })
}

/**
 * 修改反馈状态
 */
export const updateFeedback = (params) => {
  return request({
    url: '/feedback',
    method: 'post',
    data: params
  })
}

/**
 * 删除跳蚤市场商品
 */
export const delFeedback = (params) => {
  return request({
    url: '/feedback',
    method: 'delete',
    data: params
  })
}

/**
 * 查询所有用户
 */
export const selectAllUser = () => {
  return request({
    url: '/operation/fleamarket/user',
    method: 'get'
  })
}

/**
 * 查询所有小区
 */
export const selectAllComm = () => {
  return request({
    url: '/operation/fleamarket/community',
    method: 'get'
  })
}

/**
 * 查询所有类别
 */
export const selectAllType = () => {
  return request({
    url: '/operation/fleamarket/goodstype',
    method: 'get'
  })
}
