import request from '@/utils/request'

/**
 * 查询优惠券
 */
export const getDiscount = (params) => {
  return request({
    url: '/coupon',
    method: 'get',
    params: params
  })
}

/**
 * 删除优惠券
 */
export const deleteDiscount = (ids) => {
  return request({
    url: '/coupon',
    method: 'delete',
    data: ids
  })
}

/**
 * 新增优惠券
 */
export const addDiscount = (department) => {
  return request({
    url: '/coupon',
    method: 'put',
    data: department
  })
}

/**
 * 修改
 */
export const updateDiscount = (department) => {
  return request({
    url: '/coupon',
    method: 'post',
    data: department
  })
}

/**
 * 查询优惠券用户
 */
export const getUserDiscount = (params) => {
  return request({
    url: '/coupon/user',
    method: 'get',
    params: params
  })
}

/**
 * 查询未被分配优惠券的用户
 */
export const getUserNoDiscount = (params) => {
  return request({
    url: '/coupon/user/no',
    method: 'get',
    params: params
  })
}

/**
 * 删除用户优惠券
 */
export const deleteUserDiscount = (ids) => {
  return request({
    url: '/coupon/user',
    method: 'delete',
    data: ids
  })
}

/**
 * 新增用户优惠券
 */
export const addUserDiscount = (department) => {
  return request({
    url: '/coupon/user',
    method: 'put',
    data: department
  })
}

/**
 * 导出
 */
export const exportCoupon = () => {
  return request({
    url: '/coupon/export',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导出
 */
export const importCoupon = (data) => {
  return request({
    url: '/coupon/import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data;charset=UTF-8'
    },
    data
  })
}
