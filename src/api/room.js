import request from '@/utils/request'

/**
 * 获取房间列表（可模糊查询）
 */
export const getRoomList = (params) => {
  return request({
    url: '/base/room',
    method: 'get',
    params
  })
}

/**
 * 根据id删除房间信息
 */
export const deleteRoomById = (data) => {
  return request({
    url: '/base/room',
    method: 'DELETE',
    data
  })
}

/**
 * 新增房间信息
 */
export const addRoom = (data) => {
  return request({
    url: '/base/room',
    method: 'post',
    data
  })
}

/**
 * 修改房间信息
 */
export const updateRoom = (data) => {
  return request({
    url: '/base/room',
    method: 'put',
    data
  })
}

/**
 * 导出
 */
export const roomExport = (params) => {
  return request({
    url: '/base/roomExport',
    method: 'get',
    responseType: 'blob',
    params
  })
}
