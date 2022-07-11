import request from '@/utils/request'
/**
 * 获取模块列表
 */
export const getModuleList = (params) => {
  return request({
    url: '/common/list',
    method: 'GET',
    params: params
  })
}

/**
 * 获取菜单列表
 */
export const getMenuList = () => {
  return request({
    url: '/common/moduleList',
    method: 'GET'
  })
}
