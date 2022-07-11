import request from '@/utils/request'

/**
 * 分页查询商品
 */
export const getGoods = (params) => {
  return request({
    url: '/operation/communityshop',
    method: 'get',
    params: params
  })
}

/**
 * 增加商品
 */
export const addGoods = (params) => {
  return request({
    url: '/operation/communityshop',
    method: 'post',
    data: params
  })
}

/**
 * 修改商品
 */
export const updateGoods = (params) => {
  return request({
    url: '/operation/communityshop',
    method: 'put',
    data: params
  })
}

/**
 * 删除商品
 */
export const delGoods = (params) => {
  return request({
    url: '/operation/communityshop',
    method: 'delete',
    data: params
  })
}

/**
 * 查询所有类别
 */
export const selectAllTab = () => {
  return request({
    url: '/operation/communityshop/tab',
    method: 'get'
  })
}

/**
 * 查询所有店铺
 */
export const selectAllShop = () => {
  return request({
    url: '/operation/communityshop/shop',
    method: 'get'
  })
}
