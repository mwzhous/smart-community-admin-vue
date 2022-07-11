import request from '@/utils/request'

/**
 * 分页请求采购列表
 */
export const getPurchaseList = (params) => {
  return request({
    url: '/purchase',
    method: 'get',
    params
  })
}

/**
 * 添加采购
 */
export const addPurchase = (data) => {
  return request({
    url: '/purchase',
    method: 'put',
    data
  })
}

/**
 * 修改采购
 */
export const updatePurchase = (data) => {
  return request({
    url: '/purchase',
    method: 'post',
    data
  })
}

/**
 * 删除采购
 */
export const deletePurchase = (data) => {
  return request({
    url: '/purchase',
    method: 'delete',
    data
  })
}

/**
 * 导出
 */
export const exportPurchase = () => {
  return request({
    url: '/purchase/export',
    method: 'get',
    responseType: 'blob'
  })
}
/**
 * 修改采购状态
 */
export const changePurchase = (data) => {
  return request({
    url: '/purchase/change',
    method: 'post',
    data
  })
}
