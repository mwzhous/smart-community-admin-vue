import request from '@/utils/request'
/**
 *获取角色列表
 */
export const getRoleList = (param) => {
  return request({
    url: '/system/role',
    method: 'get',
    params: param
  })
}

/**
 *根据id获取角色权限列表
 */
export const getPermissionListById = (id) => {
  return request({
    url: '/system/roleId?id=' + id,
    method: 'get'
  })
}
/**
 *根据id获取角色权限列表
 */
export const selectRolePermissionsById = (id) => {
  return request({
    url: '/system/rolePermissions?id=' + id,
    method: 'get'
  })
}

/**
 *删除角色
 */
export const deleteRole = (ids) => {
  return request({
    url: '/system/role',
    method: 'delete',
    data: ids
  })
}

/**
 *新增角色
 */
export const insertRole = (role) => {
  return request({
    url: '/system/role',
    method: 'post',
    data: role
  })
}

/**
 *修改角色
 */
export const updateRole = (role) => {
  return request({
    url: '/system/role',
    method: 'put',
    data: role
  })
}

/**
 * 查询权限
 *
 */
export const selPer = () => {
  return request({
    url: '/common/module',
    method: 'get'
  })
}

/**
 * 查所有角色id&name
 */
export const getAllRoleName = () => {
  return request({
    url: '/system/roleName',
    method: 'get'
  })
}
