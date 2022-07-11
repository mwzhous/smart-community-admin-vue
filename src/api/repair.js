import request from '@/utils/request'

/**
 * 分页获取维修信息
 * @param {*} data
 * @returns
 */
export const getRepairList = (data) => {
  return request({
    url: '/operation/repair',
    params: data
  })
}

/**
 * 获取维修记录信息
 * @param {*} data
 * @returns
 */
export const getRepairRecord = (data) => {
  return request({
    url: '/operation/repair/record',
    params: data
  })
}

/**
 * 获取正在维修中的工作人员的id
 * @param {*} data
 * @returns
 */
export const getInRepairStatusWorkerId = () => {
  return request({
    url: '/operation/repair/record/workerIds'
  })
}

/**
 *新增维修记录
 *同时修改 对应申报记录的状态为2：处理中
 * @param {*} data
 * @returns
 */
export const addRepairRecord = (data) => {
  return request({
    url: '/operation/repair/record',
    method: 'POST',
    data
  })
}

/**
 * 批量删除维修申报和维修记录信息
 * @param {*} data
 * @returns
 */
export const deleteRepair = (data) => {
  return request({
    url: '/operation/repair',
    method: 'DELETE',
    data
  })
}

/**
 * 更新维修状态为1
 * @param {*} data
 * @returns
 */
export const updateRepairRecord = (data) => {
  return request({
    url: '/operation/repair/record',
    method: 'PUT',
    data
  })
}

/**
 * 导出
 */
export const exportRepair = (params) => {
  return request({
    url: '/operation/repair/record/export',
    method: 'GET',
    params: params,
    responseType: 'blob'
  })
}
