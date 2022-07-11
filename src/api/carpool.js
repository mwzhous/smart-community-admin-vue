import request from '@/utils/request'

/**
 * 分页获取拼车信息
 * @param {*} data
 * @returns
 */
export const getCarPoolList = (data) => {
  return request({
    url: '/communication/carpool',
    params: data
  })
}

/**
 * 删除拼车列表信息
 * @param {*} data
 * @returns
 */
export const deleteCarPools = (data) => {
  return request({
    url: '/communication/carpool',
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
    url: '/communication/carpool/status',
    method: 'PUT',
    data
  })
}
