<template>
  <div class="sidebar-container">
    <div class="top">
      <img src="@/assets/login/logo.png" width="200" />
    </div>

    <el-scrollbar>
      <sidebar-menu></sidebar-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { } from 'vue'
import SidebarMenu from './SidebarMenu'
</script>

<style lang="scss" scoped>
@import '@/styles/sidebar.scss';
.top {
  display: flex;
  align-items: center;
  color: #f6f6f6;
}
</style>
