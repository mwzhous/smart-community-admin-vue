<template>
  <el-card class="mt-2">
    <el-form inline>
      <el-form-item label="用户名：">
        <el-input v-model="username" class="w-50 m-2" placeholder="请输入用户名">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-select v-model="status" clearable placeholder="请选择">
          <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="info" v-if="isAuth(['ROOT', 'USER_FEED:SEARCH'])" @click="getListData()">搜索</el-button>
        <!-- <el-button type="primary" v-if="isAuth(['ROOT', 'INTEGRAL:INSERT'])" @click="addIntegrationModal()">新增通知</el-button> -->
        <el-button type="danger" v-if="isAuth(['ROOT', 'USER_FEED:INSERT'])" @click="batchDel()">批量删除</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in feedList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'status'">
          <div v-if="row.status == 0">待处理</div>
          <div v-else-if="row.status == 1">处理中</div>
          <div v-else>处理完成</div>
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="success"
          size="mini"
          @click="updateStatus(row, 1)"
          v-if="isAuth(['ROOT', 'USER_FEED:UPDATE']) && row.status == 0"
          >处理</el-button
        >
        <el-button
          type="success"
          size="mini"
          @click="updateStatus(row, 2)"
          v-if="isAuth(['ROOT', 'USER_FEED:UPDATE']) && row.status == 1"
          >处理完成</el-button
        >
        <el-button type="danger" size="mini" @click="deleteIntegrat(row)" v-if="isAuth(['ROOT', 'USER_FEED:DELETE'])"
          >删除</el-button
        >
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination mt-2 f-right mb-2"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-sizes="[5, 10, 50, 100, 200]"
      :page-size="size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { getFeedback, updateFeedback, delFeedback } from '@/api/feedback'
import { ElMessage, ElMessageBox } from 'element-plus'
import feedList from './feed'
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const username = ref('')
const status = ref('')
const statusList = ref([
  {
    value: '0',
    label: '待处理'
  },
  {
    value: '1',
    label: '处理中'
  },
  {
    value: '2',
    label: '处理完成'
  }
])
// 多选项
const multipleSelection = ref([])
// 请求首页广告列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    status: status.value,
    username: username.value
  }
  const result = await getFeedback(param)
  tableData.value = result.data
  total.value = result.total
}
getListData()
// 分页请求
const handleSizeChange = (currentSize) => {
  size.value = currentSize
  getListData()
}

const handleCurrentChange = (currentSize) => {
  page.value = currentSize
  getListData()
}

// 修改状态
const updateStatus = async (row, status) => {
  const data = {
    id: row.id,
    status: status
  }
  console.log(data)
  await updateFeedback(data)
  getListData()
}

// 多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const batchDel = () => {
  console.log(multipleSelection.value)
  if (multipleSelection.value.length === 0) {
    ElMessage.error('请至少选择一条数据')
    return
  }
  const ids = []
  multipleSelection.value.forEach((item) => {
    ids.push(item.id)
  })
  const param = {
    ids
  }
  console.log(param)
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await delFeedback(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
const deleteIntegrat = (row) => {
  const param = {
    ids: [row.id]
  }
  console.log(param)
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await delFeedback(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
