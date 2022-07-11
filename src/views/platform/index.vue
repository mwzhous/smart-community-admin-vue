<template>
  <div class="common-layout">
    <el-container>
      <el-container>
        <el-header> <navbar /></el-header>
        <el-main>
          <el-row>
            <el-col span="4" offset="2" v-for="(item, index) in list" :key="index">
              <el-card v-if="isAuth(['ROOT', item.moduleCode])">
                <img :src="item.cover" class="image" />
                <h3>{{ item.moduleName }}</h3>
                <div class="bottom">
                  <el-button type="primary" @click="gotoIndex(item.id)">进入</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
        <el-footer>
          <p>南京工业职业技术大学 | 计算机与软件学院</p>
          <p>2021级校企合作班 2022.5</p>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Navbar from '@/layout/components/Navbar'
import { useRouter } from 'vue-router'
import { getModuleList } from '@/api/system.js'
import { ref } from 'vue'
import store from '@/store'
const router = useRouter()
const list = ref([])
// 模块列表
const init = async () => {
  const result = await getModuleList({ id: 0 })
  list.value = result.data
}

const gotoIndex = (id) => {
  router.push({ name: 'dashboard' })
  localStorage.setItem('moduleId', id)
}
init()
</script>

<style lang="scss" scoped>
.image {
  width: 185px;
  height: 135px;
}
.el-header {
  background-color: #202c3d;
  .navbar {
    background-color: #202c3d;
  }
}
.el-main {
  width: 90%;
  margin: 0 auto;
}
.el-card {
  margin: 10px;
  background-color: #9bb4d6;
  cursor: pointer;
}
.el-card:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

.el-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  background-color: #202c3d;
  color: #f6f6f6;
  box-sizing: content-box;
  padding-top: 10px;
  padding-bottom: 10px;
  p {
    line-height: 30px;
  }
}
</style>
