import request from '@/utils/request'
/**
 *
 */
export const permissionTree = () => {
  return request({
    url: '/common/permission',
    method: 'get'
  })
}
