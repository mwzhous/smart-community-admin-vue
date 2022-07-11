import request from '@/utils/request'

/**
 * 获取公告列表
 */
export const getAnnouncement = (params) => {
  return request({
    url: '/app/announcement',
    method: 'GET',
    params: params
  })
}

/**
 *新增公告
 * @param {*} params
 * @returns
 */
export const addAnnouncement = (data) => {
  return request({
    url: '/app/announcement',
    method: 'POST',
    data
  })
}

/**
 *删除公告
 * @param {*} params
 * @returns
 */
export const deleteAnnouncement = (data) => {
  return request({
    url: '/app/announcement',
    method: 'DELETE',
    data
  })
}
/**
 *修改公告信息
 * @param {*} params
 * @returns
 */
export const updateAnnouncement = (data) => {
  return request({
    url: '/app/announcement',
    method: 'PUT',
    data
  })
}
