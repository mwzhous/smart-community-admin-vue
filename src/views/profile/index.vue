<template>
  <h2>个人中心</h2>
  <el-avatar shape="circle" :size="80" :src="$store.getters.userInfo.avatar"></el-avatar>
  <el-empty description="description" />
</template>
<script setup></script>
