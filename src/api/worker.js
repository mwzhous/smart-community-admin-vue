import request from '@/utils/request'
/**
 * 根据小区id查询员工
 */
export const selWorkerBycId = (id) => {
  return request({
    url: '/base/workerName?id=' + id,
    method: 'get'
  })
}
