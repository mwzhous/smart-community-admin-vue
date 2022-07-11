<template>
  <el-menu background-color="#304155" text-color="#fff">
    <el-submenu v-for="(item, index) in list" :key="index" :index="item.id" v-show="isAuth(['ROOT', item.moduleCode])">
      <template #title>
        <i :class="item.cover"></i>
        <span>{{ item.moduleName }}</span>
      </template>
      <el-menu-item-group
        v-for="(child, index1) in item.modules"
        :key="index1"
        v-show="isAuth(['ROOT', child.moduleCode + ':SELECT'])"
      >
        <el-menu-item
          @click="router.push({ name: child.moduleCode.toLowerCase() })"
          active-text-color="#409eff"
          :index="child.id"
        >
          <i :class="child.cover"></i>
          <span> {{ child.moduleName }}</span>
        </el-menu-item>
      </el-menu-item-group>
    </el-submenu>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getMenuList } from '@/api/system.js'
const router = useRouter()
// 计算高亮 menu 的方法
const route = useRoute()
const list = ref([])
// 菜单栏
const init = async () => {
  const result = await getMenuList()
  list.value = result.data
}
init()
const activeMenu = computed(() => {
  const { path } = route
  return path
})
</script>
<style scoped>
</style>
