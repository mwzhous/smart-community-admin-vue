import request from '@/utils/request'

/**
 * 查询物业公司
 */
export const getDepartmentList = (params) => {
  return request({
    url: '/common/dept',
    method: 'get',
    params: params
  })
}

/**
 * 删除物业公司
 */
export const deleteDepartment = (ids) => {
  return request({
    url: '/common/dept',
    method: 'delete',
    data: ids
  })
}

/**
 * 新增物业公司
 */
export const addDepartment = (department) => {
  return request({
    url: '/common/dept',
    method: 'post',
    data: department
  })
}

/**
 * 新增物业公司
 */
export const updateDepartment = (department) => {
  return request({
    url: '/common/dept',
    method: 'put',
    data: department
  })
}

/**
 * 根据小区id查询部门
 */
export const selDeptBycId = (id) => {
  return request({
    url: '/common/deptID?id=' + id,
    method: 'get'
  })
}

/**
 * 不分页查询部门
 */
export const selDepts = () => {
  return request({
    url: '/common/depts',
    method: 'get'
  })
}
/**
 * 导出
 */
export const exportDepartment = (ids, communityId) => {
  return request({
    url: '/common/export?ids=' + ids + '&communityId=' + communityId,
    method: 'get',
    responseType: 'blob'
  })
}
