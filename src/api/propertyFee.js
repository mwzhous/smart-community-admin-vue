import request from '@/utils/request'

/**
 * 分页查询所有物业费
 */
export const getBill = (params) => {
  return request({
    url: '/operation/property/fee',
    method: 'GET',
    params: params
  })
}

/**
 * 查询所有物业费类型
 */
export const selectAllType = () => {
  return request({
    url: '/operation/property/fee/type',
    method: 'get'
  })
}

/**
 * 查询所有家庭
 */
export const selectAllFamily = () => {
  return request({
    url: '/operation/property/fee/family',
    method: 'get'
  })
}

/**
 *生成账单
 * @param {*} params
 * @returns
 */

export const addBill = (params) => {
  return request({
    url: '/operation/property/fee',
    method: 'POST',
    data: params
  })
}

/**
 * 修改物业费
 */
export const updateBill = (params) => {
  return request({
    url: '/operation/property/fee',
    method: 'put',
    data: params
  })
}
/**
 * 删除物业费
 */
export const delBill = (params) => {
  return request({
    url: '/operation/property/fee',
    method: 'delete',
    data: params
  })
}

/**
 * 导出
 */
export const exportBill = (params) => {
  return request({
    url: '/operation/property/fee/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}
