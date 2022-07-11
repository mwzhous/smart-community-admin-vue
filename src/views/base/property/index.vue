<template>
  <el-card>
    <el-row :gutter="6" class="searchInput">
      <el-col :span="4">
        <el-input v-model="searchInfo" :icon="Search" size="large" placeholder="搜索物业公司">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="16">
        <el-button
          type="success"
          size="large"
          :icon="Search"
          v-if="isAuth(['ROOT', 'PROPERTY:SELECT'])"
          @click="searchPosition"
        >
          <span><svg-icon icon="search" /></span> 搜索物业公司</el-button
        >
        <el-button type="primary" size="large" v-if="isAuth(['ROOT', 'PROPERTY:INSERT'])" @click="addAdvertiseStatus()"
          >新增物业</el-button
        >
        <el-button type="danger" size="large" v-if="isAuth(['ROOT', 'PROPERTY:DELETE'])" @click="delCompany()"
          >批量删除</el-button
        >
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        show-overflow-tooltip="true"
        v-for="(item, index) in property"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        align="center"
      >
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="100" #default="{ row }">
        <el-button
          type="primary"
          size="mini"
          v-if="isAuth(['ROOT', 'PROPERTY:UPDATE'])"
          @click="clickUpdateCompany(row)"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="delCompany(row)" v-if="isAuth(['ROOT', 'PROPERTY:DELETE'])"
          >删除</el-button
        >
        <!-- </el-popconfirm> -->
      </el-table-column>
    </el-table>
    <div class="bottom">
      <el-pagination
        class="pagination"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[5, 10, 50, 100, 200]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <!-- 新增物业弹框 -->
    <el-dialog v-model="showWindow" title="新增" width="45%">
      <el-form :model="companyting" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="小区名称" prop="contacts">
          <el-input placeholder="请输入小区名称" v-model="companyting.contacts" />
        </el-form-item>
        <el-form-item label="小区负责人" prop="name">
          <el-input placeholder="请输入负责人姓名" v-model="companyting.name" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input placeholder="请输入联系方式" v-model="companyting.phone" />
        </el-form-item>
        <el-form-item label="小区介绍" prop="location">
          <el-input placeholder="请输入小区介绍" v-model="companyting.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWindow = false">取消</el-button>
          <el-button type="primary" @click="insertAdvertise(companyting)">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 修改物业弹框 -->
    <el-dialog v-model="showUpdate" title="修改" width="45%">
      <el-form :model="onlyCompany" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="小区负责人" prop="name">
          <el-input placeholder="请输入负责人姓名" v-model="onlyCompany.name" />
        </el-form-item>
        <el-form-item label="小区名称" prop="contacts">
          <el-input placeholder="请输入小区名称" v-model="onlyCompany.contacts" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input placeholder="请输入联系方式" v-model="onlyCompany.phone" />
        </el-form-item>
        <el-form-item label="小区介绍" prop="location">
          <el-input placeholder="请输入小区介绍" v-model="onlyCompany.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdate = false">取消</el-button>
          <el-button type="primary" @click="btnUpdateCompany(onlyCompany)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { getCompanyList, deleteCompany, addCompany, updateCompany } from '@/api/company'
import property from './property'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 多选项
const multipleSelection = ref([])
// 新增对象
const companyting = ref({
  phone: null
})

// 请求物业列表
const getListData = async () => {
  const param = {
    info: '',
    pageIndex: page.value,
    pageSize: size.value
  }
  const result = await getCompanyList(param)
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
const showWindow = ref(false)

const addAdvertiseStatus = () => {
  showWindow.value = !showWindow.value
}

// 删除操作
const delCompany = (val) => {
  let ids = []
  if (val === undefined) {
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.id
    })
  } else {
    multipleSelection.value = []
    ids.push(val.id)
  }
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await deleteCompany(ids)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
    ids = []
  })
}
// 验证手机号正则
const regTelPhone = /^1[34578][0-9]{9}$/
// 校验规则
const ruleFormRef = ref(null)
const rules = ref({
  name: [
    {
      required: true,
      message: '输入错误',
      trigger: 'blur'
    }
  ],
  contacts: [
    {
      required: true,
      message: '输入错误',
      trigger: 'blur'
    }
  ],
  phone: [
    {
      len: 11,
      required: true,
      message: '输入错误',
      trigger: ['blur', 'change']
    },
    {
      pattern: regTelPhone,
      message: '手机号格式错误',
      trigger: ['blur', 'change']
    }
  ],
  location: [
    {
      required: true,
      message: '输入错误',
      trigger: 'blur'
    }
  ]
})
// 遮罩层表单控制
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 新增
const insertAdvertise = (companyting) => {
  // 新增数据
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addCompany(companyting)
      showWindow.value = false
      // 重新渲染数据
      getListData()
      ruleFormRef.value.resetFields()
    }
  })
}

const showUpdate = ref(false)
const onlyCompany = ref({})
// 点击修改
const clickUpdateCompany = (row) => {
  // onlyCompany.value = Object.assign({}, row)
  // 把需要用到的值拿到
  onlyCompany.value = {
    id: row.id,
    name: row.name,
    contacts: row.contacts,
    phone: row.phone,
    location: row.location
  }
  // onlyCompany.value = row
  showUpdate.value = !showUpdate.value
}
// 修改
const btnUpdateCompany = (onlyCompany) => {
  // 校验规则
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateCompany(onlyCompany)
      ElMessage.success('修改成功')
      // 重新渲染数据
      getListData()
      showUpdate.value = !showUpdate.value
      ruleFormRef.value.resetFields()
    }
  })
}
// 模糊搜索输入框内容
const searchInfo = ref('')
const searchPosition = async () => {
  console.log(searchInfo.value)
  const param = {
    info: searchInfo.value,
    pageIndex: page.value,
    pageSize: size.value
  }
  const result = await getCompanyList(param)
  console.log(result.data)
  console.log(result.total)
  tableData.value = result.data
  total.value = result.total
}
</script>

<style lang="scss" scoped>
.pagination {
  display: inline-block;
}
.bottom {
  display: flex;
  justify-content: center;
}
.searchInput {
  margin-bottom: 1rem;
}
</style>
