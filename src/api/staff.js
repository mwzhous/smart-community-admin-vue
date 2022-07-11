import request from '@/utils/request'

/**
 * 请求员工信息 分页 模糊查询
 * @param {*} param 条件
 * @returns 返回结果
 */
export const selectAllWorker = (param) => {
  return request({
    url: '/base/worker',
    params: param
  })
}
/**
 * 新增员工
 *
 */

export const addStaff = (staff) => {
  return request({
    url: '/base/worker',
    method: 'post',
    data: staff
  })
}
/**
 * 修改员工
 *
 */

export const updateStaff = (staff) => {
  return request({
    url: '/base/worker',
    method: 'put',
    data: staff
  })
}
/**
 * 删除员工
 *
 */

export const deleteStaff = (ids) => {
  return request({
    url: '/base/worker',
    method: 'delete',
    data: ids
  })
}

/**
 * 文件上传
 */
export const uploadStaff = (params) => {
  return request({
    url: '/base/upload/worker',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: params
  })
}

/**
 * 导出
 */
export const exportStaff = (ids, communityId) => {
  return request({
    url: '/base/export?ids=' + ids + '&communityId=' + communityId,
    method: 'get',
    responseType: 'blob'
  })
}
