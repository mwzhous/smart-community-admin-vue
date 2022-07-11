import request from '@/utils/request'
/**
 * 请求人数信息
 * @param {*} param
 * @returns
 */
export const searchCountUser = (communityId) => {
  return request({
    url: '/dashboard/card?communityId=' + communityId
  })
}
/**
 * 图表信息
 * @param {*} param
 * @returns
 */
export const selectEcharts = (communityId) => {
  return request({
    url: '/dashboard/echarts?communityId=' + communityId
  })
}
