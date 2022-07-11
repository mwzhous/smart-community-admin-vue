import request from '@/utils/request'

/**
 * 分页查询职位配置
 */
export const getPositionList = (params) => {
  return request({
    url: '/base/position',
    method: 'get',
    params: params
  })
}
/**
 * 根据小区id查职位
 * @returns 结果
 */
export const getPositionsBydeptId = (communityId) => {
  return request({
    url: '/base/positions?communityId=' + communityId,
    method: 'get'
  })
}

/**
 * 删除职位配置
 */
export const deletePosition = (ids) => {
  return request({
    url: '/base/position',
    method: 'delete',
    data: ids
  })
}

/**
 * 新增职位配置
 */
export const addPosition = (position) => {
  return request({
    url: '/base/position',
    method: 'post',
    data: position
  })
}

/**
 * 修改职位配置
 */
export const updatePosition = (position) => {
  return request({
    url: '/base/position',
    method: 'put',
    data: position
  })
}
