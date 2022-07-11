import request from '@/utils/request'
/**
 * 分页查询所有物业费
 */
export const getBillType = (params) => {
  return request({
    url: '/operation/property/type',
    method: 'GET',
    params: params
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
 *添加物业费类型
 * @param {*} params
 * @returns
 */

export const addBill = (params) => {
  return request({
    url: '/operation/property/type',
    method: 'POST',
    data: params
  })
}

/**
 * 修改物业费类型
 */
export const updateBill = (params) => {
  return request({
    url: '/operation/property/type',
    method: 'put',
    data: params
  })
}
/**
 * 删除物业费
 */
export const delBill = (params) => {
  return request({
    url: '/operation/property/type',
    method: 'delete',
    data: params
  })
}
