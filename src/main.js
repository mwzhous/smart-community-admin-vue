import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import installElementPlus from './plugins/element'
import * as ElementPlusIconsVue from '@element-plus/icons'
import { ElMessage } from 'element-plus'
// 导入全局样式
import './styles/index.scss'
// 导入 SvgIcon
import installIcons from '@/icons'
// 导入权限控制模块
import './permission'
// filter
import installFilter from '@/filter'

const app = createApp(App)
installElementPlus(app)
installIcons(app)
installFilter(app)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.provide('$message', ElMessage)
// 封装用于判断用户是否具有某些权限的公共函数
app.config.globalProperties.isAuth = (permission) => {
  const permissions = localStorage.getItem('permissions')
  let flag = false
  for (const one of permission) {
    if (permissions.includes(one)) {
      flag = true
      break
    }
  }
  return flag
}
app.use(store).use(router).mount('#app')
