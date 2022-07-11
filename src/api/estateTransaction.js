import request from '@/utils/request'

/**
 * 分页查询所有房产交易信息
 */
export const getEstateTransaction = (params) => {
  return request({
    url: '/operation/estatetransaction',
    method: 'GET',
    params: params
  })
}

/**
 * 根据id查询
 * @param {} id
 * @returns
 */
export const getEstateTransactionDetail = (id) => {
  return request({
    url: '/operation/estatetransaction/' + id,
    method: 'get'
  })
}

/**
 *上传文件
 * @param {*} params
 * @returns
 */
export const uploadEstate = (params) => {
  return request({
    url: '/operation/upload/estatetransaction',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}

/**
 *上传文件
 * @param {*} params
 * @returns
 */
export const addEstate = (data) => {
  return request({
    url: '/operation/estatetransaction',
    method: 'POST',
    data
  })
}

/**
 * 删除房产交易信息
 */
export const deleteEstate = (params) => {
  return request({
    url: '/operation/estatetransaction',
    method: 'delete',
    data: params
  })
}

/**
 * 修改房产信息
 */
export const updateEstate = (data) => {
  return request({
    url: '/operation/estatetransaction',
    method: 'put',
    data
  })
}

/**
 * 查询所有管理员
 */
export const selectAllAdmin = () => {
  return request({
    url: '/operation/estatetransaction/admin',
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
 * 导出
 */
export const exportEstate = (params) => {
  return request({
    url: '/operation/estatetransaction/export',
    method: 'get',
    responseType: 'blob',
    params
  })
}
