import request from '@/utils/request'
/**
 * 分页查询所有账单
 */
export const getOrder = (params) => {
  return request({
    url: '/operation/order',
    method: 'GET',
    params: params
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

/**
 * 修改账单
 */
export const updateOrder = (params) => {
  return request({
    url: '/operation/order',
    method: 'put',
    data: params
  })
}

/**
 * 导出
 */
export const exportCoupon = () => {
  return request({
    url: '/operation/order/export',
    method: 'get',
    responseType: 'blob'
  })
}
