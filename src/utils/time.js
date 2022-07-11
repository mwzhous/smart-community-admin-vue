/**
 * 获取当前时间格式化
 */
export function getCurrentTime() {
  let date = new Date()
  const Y = date.getFullYear()
  const M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  date = Y + '-' + M + '-' + D + ' ' + hours + ':' + minutes + ':' + seconds
  console.log(date)
  return date
}

/**
 * 根据天数获取几天后的某个时间格式化
 */
export function getAfterTime(days) {
  let date = new Date()
  const Y = date.getFullYear()
  const M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const D = date.getDate() + days < 10 ? '0' + date.getDate() + days : date.getDate() + days
  const hours = date.getHours()
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  date = Y + '-' + M + '-' + D + ' ' + hours + ':' + minutes + ':' + seconds
  console.log(date)
  return date
}
