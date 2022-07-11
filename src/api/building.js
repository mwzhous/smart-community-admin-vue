import request from '@/utils/request'

/**
 * 获取楼栋列表
 */
export const getBuildingList = (params) => {
  return request({
    url: '/base/building',
    method: 'get',
    params
  })
}

/**
 * 根据id删除楼栋信息
 */
export const deleteBuildingById = (data) => {
  return request({
    url: '/base/building',
    method: 'DELETE',
    data
  })
}

/**
 * 新增楼栋信息
 */
export const addBuilding = (data) => {
  return request({
    url: '/base/building',
    method: 'post',
    data
  })
}

/**
 * 修改楼栋信息
 */
export const updateBuilding = (data) => {
  return request({
    url: '/base/building',
    method: 'put',
    data
  })
}

/**
 * 根据社区id获取楼栋id&name列表
 */
export const getBuildingNameList = (params) => {
  return request({
    url: '/base/buildingName',
    method: 'get',
    params
  })
}

/**
 * 导出
 */
export const buildingExport = (params) => {
  return request({
    url: '/base/buildingsExport',
    method: 'get',
    responseType: 'blob',
    params
  })
}
