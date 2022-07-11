import request from '@/utils/request'

/**
 * 获取业主列表（可模糊查询）
 */
export const getOwnerList = (params) => {
  return request({
    url: '/base/owner',
    method: 'get',
    params
  })
}

/**
 * 根据id删除业主信息
 */
export const deleteRoomById = (data) => {
  return request({
    url: '/base/room',
    method: 'DELETE',
    data
  })
}

/**
 * 新增业主信息
 */
export const addRoom = (data) => {
  return request({
    url: '/base/room',
    method: 'post',
    data
  })
}

/**
 * 修改业主信息
 */
export const updateRoom = (data) => {
  return request({
    url: '/base/room',
    method: 'put',
    data
  })
}
