<template>
  <el-card class="mt-2">
    <el-form inline>
      <el-form-item label="用户名：">
        <el-input v-model="username" class="w-50 m-2" placeholder="请输入用户名">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left:5px"/></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="info" v-if="isAuth(['ROOT', 'INTEGRATION_LIST:SEARCH'])" @click="getListData()">搜索</el-button>
        <!-- <el-button type="primary" v-if="isAuth(['ROOT', 'INTEGRAL:INSERT'])" @click="addIntegrationModal()">新增通知</el-button> -->
        <el-button type="danger" v-if="isAuth(['ROOT', 'INTEGRATION_LIST:INSERT'])" @click="batchDel()">批量删除</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in integrationList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="success"
          size="mini"
          @click="updateIntegrationModel(row)"
          v-if="isAuth(['ROOT', 'INTEGRATION_LIST:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="deleteIntegrat(row)" v-if="isAuth(['ROOT', 'INTEGRATION_LIST:DELETE'])"
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

  <el-dialog v-model="addModel" :title="integration.id == undifined ? '新增积分记录' : '修改积分记录'" width="40%">
    <el-form :model="integration" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
        <el-input
          placeholder="请输入用户id"
          :disabled="integration.id != undifined"
          clearable
          v-model="integration.username"
        />
      </el-form-item>
      <el-form-item label="积分变动" :label-width="formLabelWidth" prop="count">
        <el-input placeholder="请输入积分变动" clearable v-model="integration.count" />
      </el-form-item>
      <el-form-item label="积分用途" :label-width="formLabelWidth" prop="purpose">
        <el-input placeholder="请输入积分用途" clearable v-model="integration.purpose" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="insertIntegration()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { getIntegration, addIntegration, updateIntegration, deleteIntegration } from '@/api/integration'
import { ElMessage, ElMessageBox } from 'element-plus'
import integrationList from './integral'
// 积分对象
const integration = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const username = ref('')
// 多选项
const multipleSelection = ref([])
// 请求首页广告列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    username: username.value
  }
  const result = await getIntegration(param)
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
const addModel = ref(false)
// 新增弹框
const addIntegrationModal = () => {
  addModel.value = !addModel.value
}
// 修改 填充值
const updateIntegrationModel = (row) => {
  addModel.value = !addModel.value
  integration.value = Object.assign({}, row)
}
// 取消
const cancelModel = () => {
  addModel.value = false
  integration.value = {}
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  userId: [{ required: true, type: 'number', message: '请输入用户id', trigger: 'blur' }],
  count: [{ required: true, message: '请输入积分变动', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入积分用途', trigger: 'blur' }]
})
// 新增/修改通知提交请求
const insertIntegration = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      console.log(integration.value)
      if (integration.value.id === undefined) {
        addIntegration(integration.value)
        ElMessage.success('通知新增成功')
      } else {
        updateIntegration(integration.value)
        ElMessage.success('通知修改成功')
      }
      addModel.value = false
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
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
    await deleteIntegration(param)
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
    await deleteIntegration(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
