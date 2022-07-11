import request from '@/utils/request'

/**
 * 分页获取互助信息
 * @param {*} data
 * @returns
 */
export const getInteractList = (data) => {
  return request({
    url: '/communication/interact',
    params: data
  })
}

/**
 * 删除互助列表信息
 * @param {*} data
 * @returns
 */
export const deleteInteracts = (data) => {
  return request({
    url: '/communication/interact',
    method: 'DELETE',
    data
  })
}

/**
 *上传文件
 * @param {*} params
 * @returns
 */
export const uploadInteract = (params) => {
  return request({
    url: '/communication/interact/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}

/**
 *新增互助
 * @param {*} data
 * @returns
 */
export const addInteract = (data) => {
  return request({
    url: '/communication/interact',
    method: 'POST',
    data
  })
}

/**
 *修改互助
 * @param {*} data
 * @returns
 */
export const updateInteract = (data) => {
  return request({
    url: '/communication/interact',
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
    url: '/communication/interact/status',
    method: 'PUT',
    data
  })
}
