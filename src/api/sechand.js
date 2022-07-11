import request from '@/utils/request'

/**
 * 分页获取二手信息
 * @param {*} data
 * @returns
 */
export const getSechandList = (data) => {
  return request({
    url: '/communication/sechand',
    params: data
  })
}

/**
 * 删除二手列表信息
 * @param {*} data
 * @returns
 */
export const deleteSechands = (data) => {
  return request({
    url: '/communication/sechand',
    method: 'DELETE',
    data
  })
}

/**
 * 更新上架下架状态
 * @param {*} data
 * @returns
 */
export const updateStatus = (data) => {
  return request({
    url: '/communication/sechand/status',
    method: 'PUT',
    data
  })
}
