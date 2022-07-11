import request from '@/utils/request'

/**
 * 分页查询所有跳蚤市场商品
 */
export const getFleaMarket = (params) => {
  return request({
    url: '/operation/fleamarket',
    method: 'get',
    params: params
  })
}

/**
 * 增加跳蚤市场商品
 */
export const addFleaMarket = (params) => {
  return request({
    url: '/operation/fleamarket',
    method: 'post',
    data: params
  })
}

/**
 * 修改跳蚤市场商品
 */
export const updateFleaMarket = (params) => {
  return request({
    url: '/operation/fleamarket',
    method: 'put',
    data: params
  })
}

/**
 * 删除跳蚤市场商品
 */
export const delFleaMarket = (params) => {
  return request({
    url: '/operation/fleamarket',
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

/**
 * 导出
 */
export const exportAdmin = (params) => {
  return request({
    url: '/operation/fleamarket/export',
    method: 'get',
    responseType: 'blob',
    params
  })
}
