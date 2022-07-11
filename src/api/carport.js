import request from '@/utils/request'

export const getAllCarPort = (params) => {
  return request({
    url: '/carport/all',
    method: 'get',
    params: params
  })
}

export const getAllParkingId = () => {
  return request({
    url: '/carport/all/parkingId',
    method: 'get'
  })
}

export const getAllParkingCard = (params) => {
  return request({
    url: '/parking/card',
    method: 'get',
    params: params
  })
}
export const getAllParkingCardById = (params) => {
  return request({
    url: '/parking/cardById',
    method: 'get',
    params: params
  })
}
export const getCommuntyName = () => {
  return request({
    url: '/parking/card',
    method: 'get'
  })
}
export const deleteCardById = (data) => {
  return request({
    url: '/parking/delete',
    method: 'delete',
    data
  })
}
export const updateCard = (data) => {
  return request({
    url: '/parking/update',
    method: 'put',
    data
  })
}
export const addParkingCard = (data) => {
  return request({
    url: '/parking/add',
    method: 'post',
    data
  })
}

export const addCarport = (data) => {
  return request({
    url: '/carport/add',
    method: 'post',
    data
  })
}

export const updateCarport = (data) => {
  return request({
    url: '/carport/update',
    method: 'put',
    data
  })
}
export const deleteCarportById = (data) => {
  return request({
    url: '/carport/delete',
    method: 'delete',
    data
  })
}

export const getAllCarRent = (params) => {
  return request({
    url: '/carRental/all',
    method: 'get',
    params: params
  })
}
export const addCarRent = (data) => {
  return request({
    url: '/carRental/add',
    method: 'post',
    data
  })
}

export const updateCarRent = (data) => {
  return request({
    url: '/carRental/update',
    method: 'put',
    data
  })
}
export const deleteCarRentById = (data) => {
  return request({
    url: '/carRental/delete',
    method: 'delete',
    data
  })
}

export const getAllInvitationRecord = (params) => {
  return request({
    url: '/invitationRecord/all',
    method: 'get',
    params: params
  })
}
export const addInvitationRecord = (data) => {
  return request({
    url: '/invitationRecord/add',
    method: 'post',
    data
  })
}

export const updateInvitationRecord = (data) => {
  return request({
    url: '/invitationRecord/update',
    method: 'put',
    data
  })
}
export const deleteInvitationRecord = (data) => {
  return request({
    url: '/invitationRecord/delete',
    method: 'delete',
    data
  })
}

export const getAllParkingOrder = (params) => {
  return request({
    url: '/parking/order',
    method: 'get',
    params: params
  })
}
export const addParkingOrder = (data) => {
  return request({
    url: '/parking/order/add',
    method: 'post',
    data
  })
}

export const updateParkingOrder = (data) => {
  return request({
    url: '/parking/order/update',
    method: 'put',
    data
  })
}
export const deleteParkingOrder = (data) => {
  return request({
    url: '/parking/order/delete',
    method: 'delete',
    data
  })
}

export const getAllParkingRule = (params) => {
  return request({
    url: '/parking/rule',
    method: 'get',
    params: params
  })
}
export const addParkingRule = (data) => {
  return request({
    url: '/parking/rule/add',
    method: 'post',
    data
  })
}

export const updateParkingRule = (data) => {
  return request({
    url: '/parking/rule/update',
    method: 'put',
    data
  })
}
export const deleteParkingRule = (data) => {
  return request({
    url: '/parking/rule/delete',
    method: 'delete',
    data
  })
}

export const getAllParkingRecord = (params) => {
  return request({
    url: '/parking/record/all',
    method: 'get',
    params: params
  })
}
export const addParkingRecord = (data) => {
  return request({
    url: '/parking/record/add',
    method: 'post',
    data
  })
}

export const updateParkingRecord = (data) => {
  return request({
    url: '/parking/record/update',
    method: 'put',
    data
  })
}
export const deleteParkingRecord = (data) => {
  return request({
    url: '/parking/record/delete',
    method: 'delete',
    data
  })
}

/**
 * 导出
 */
export const exportParkingRecord = (data) => {
  return request({
    url: '/parking/record/export',
    method: 'get',
    params: data,
    responseType: 'blob'
  })
}

/**
 * 导入停车记录
 */
export const importParkingRecord = (data) => {
  return request({
    url: '/parking/record/import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data;charset=UTF-8'
    },
    data
  })
}

/**
 * 导出停车邀请记录
 */
export const exportInvitationRecord = (data) => {
  return request({
    url: '/invitationRecord/export',
    method: 'get',
    params: data,
    responseType: 'blob'
  })
}

/**
 * 导出停车租赁记录
 */
export const exportCarRent = (data) => {
  return request({
    url: '/carRental/export',
    method: 'get',
    params: data,
    responseType: 'blob'
  })
}

/**
 * 导出停车订单
 */
export const exportParkingOrder = (data) => {
  return request({
    url: '/parking/order/export',
    method: 'get',
    params: data,
    responseType: 'blob'
  })
}

export const updateStateById = (state, id) => {
  return request({
    url: '/carRental/state/update',
    method: 'put',
    params: state,
    id
  })
}
