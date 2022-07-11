import dayjs from 'dayjs'
import rt from 'dayjs/plugin/relativeTime'
// 语言包
import 'dayjs/locale/zh-cn'
import store from '@/store'

const dateFilter = (val, format = 'YYYY-MM-DD') => {
  if (!isNaN(val)) {
    val = parseInt(val)
  }

  return dayjs(val).format(format)
}

const dateTimeFilter = (val, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!isNaN(val)) {
    val = parseInt(val)
  }

  return dayjs(val).format(format)
}

// 加载相对时间插件
dayjs.extend(rt)
function relativeTime(val) {
  if (!isNaN(val)) {
    val = parseInt(val)
  }
  return dayjs().to(dayjs(val))
}

export default (app) => {
  app.config.globalProperties.$filters = {
    dateFilter,
    dateTimeFilter,
    relativeTime
  }
}
