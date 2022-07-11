import request from '@/utils/request'

/**
 * 分页获取广场信息
 * @param {*} data
 * @returns
 */
export const getSquareList = (data) => {
  return request({
    url: '/communication/square',
    params: data
  })
}

/**
 * 删除广场列表信息
 * @param {*} data
 * @returns
 */
export const deleteSquares = (data) => {
  return request({
    url: '/communication/square',
    method: 'DELETE',
    data
  })
}

/**
 *上传文件
 * @param {*} params
 * @returns
 */
export const uploadSquare = (params) => {
  return request({
    url: '/communication/square/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}

/**
 *新增广场
 * @param {*} data
 * @returns
 */
export const addSquare = (data) => {
  return request({
    url: '/communication/square',
    method: 'POST',
    data
  })
}

/**
 *修改广场
 * @param {*} data
 * @returns
 */
export const updateSquare = (data) => {
  return request({
    url: '/communication/square',
    method: 'PUT',
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
    url: '/communication/square/status',
    method: 'PUT',
    data
  })
}
