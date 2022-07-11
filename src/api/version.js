import request from '@/utils/request'

/**
 * 获取版本列表
 */
export const getVersionList = (params) => {
  return request({
    url: 'app/version',
    method: 'GET',
    params: params
  })
}

/**
 *修改版本信息
 * @param {*} params
 * @returns
 */
export const updateVersion = (data) => {
  return request({
    url: '/app/version',
    method: 'PUT',
    data
  })
}
