import request from '@/utils/request'

/**
 * 获取单元列表
 */
export const getUnitList = (params) => {
  return request({
    url: '/base/unit',
    method: 'get',
    params
  })
}

/**
 * 根据id删除单元信息
 */
export const deleteUnitById = (data) => {
  return request({
    url: '/base/unit',
    method: 'DELETE',
    data
  })
}

/**
 * 新增单元信息
 */
export const addUnit = (data) => {
  return request({
    url: '/base/unit',
    method: 'post',
    data
  })
}

/**
 * 修改单元信息
 */
export const updateUnit = (data) => {
  return request({
    url: '/base/unit',
    method: 'put',
    data
  })
}

/**
 * 模糊查询单元列表
 */
export const getUnitListBySearch = (params) => {
  return request({
    url: '/base/unitSearch',
    method: 'get',
    params
  })
}

/**
 * 根据楼栋id获取单元id&name列表
 */
export const getUnitNameList = (params) => {
  return request({
    url: '/base/unitName',
    method: 'get',
    params
  })
}

/**
 * 导出
 */
export const unitExport = (params) => {
  return request({
    url: '/base/unitExport',
    method: 'get',
    responseType: 'blob',
    params
  })
}
