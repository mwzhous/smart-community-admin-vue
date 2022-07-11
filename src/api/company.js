import request from '@/utils/request'

/**
 * 查询物业公司
 */
export const getCompanyList = (params) => {
  return request({
    url: '/base/company',
    method: 'get',
    params: params
  })
}

/**
 * 查询物业公司的id和名称
 */
export const getCompanyIdAndNameList = () => {
  return request({
    url: '/base/companyIdAndName',
    method: 'get'
  })
}
/**
 * 删除物业公司
 */
export const deleteCompany = (ids) => {
  return request({
    url: '/base/company',
    method: 'delete',
    data: ids
  })
}

/**
 * 新增物业公司
 */
export const addCompany = (company) => {
  return request({
    url: '/base/company',
    method: 'post',
    data: company
  })
}

/**
 * 新增物业公司
 */
export const updateCompany = (company) => {
  return request({
    url: '/base/company',
    method: 'put',
    data: company
  })
}
