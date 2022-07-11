import request from '@/utils/request'

/**
 * 获取社区名称列表
 */
export const getCommunityNameList = (params) => {
  return request({
    url: '/base/communityName',
    method: 'get',
    params: params
  })
}

/**
 * 获取社区列表
 */
export const getCommunityList = (params) => {
  return request({
    url: '/base/community',
    method: 'get',
    params: params
  })
}
/**
 * 新增社区
 */
export const insertCommunity = (community) => {
  return request({
    url: '/base/community',
    method: 'post',
    data: community
  })
}

/**
 * 修改社区
 */
export const updateComunity = (community) => {
  return request({
    url: '/base/community',
    method: 'put',
    data: community
  })
}

/**
 * 删除社区
 */
export const deleteCommunity = (ids) => {
  return request({
    url: '/base/community',
    method: 'delete',
    data: ids
  })
}
