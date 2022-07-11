import request from '@/utils/request'

/**
 * 分页查询所有商品类型
 */
export const getGoodsType = (params) => {
  return request({
    url: '/operation/goodstype',
    method: 'get',
    params: params
  })
}

/**
 * 增加商品类型
 */
export const addGoodsType = (params) => {
  return request({
    url: '/operation/goodstype',
    method: 'post',
    data: params
  })
}

/**
 * 修改跳蚤市场商品类型
 */
export const updateGoodsType = (params) => {
  return request({
    url: '/operation/goodstype',
    method: 'put',
    data: params
  })
}

/**
 * 删除跳蚤市场商品类型
 */
export const delGoodsType = (params) => {
  return request({
    url: '/operation/goodstype',
    method: 'delete',
    data: params
  })
}
