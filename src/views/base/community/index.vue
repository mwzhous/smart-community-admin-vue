<template>
  <el-card>
    <el-row :gutter="6" class="searchInput">
      <el-col :span="4">
        <el-input v-model="searchInfo" :icon="Search" size="large" placeholder="搜索社区">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="3">
        <el-select v-model.number="state.value" class="m-2" clearable placeholder="请选择状态" size="large">
          <el-option v-for="item in state" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model.number="enterType.value" class="m-2" clearable placeholder="临时车辆是否可进" size="large">
          <el-option v-for="item in enterType" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="10">
        <el-button
          type="success"
          size="large"
          :icon="Search"
          v-if="isAuth(['ROOT', 'COMMUNITY_CONFIG:SELECT'])"
          @click="searchPosition"
        >
          <span><svg-icon icon="search" /></span> 搜索社区</el-button
        >
        <el-button
          type="primary"
          size="large"
          v-if="isAuth(['ROOT', 'COMMUNITY_CONFIG:INSERT'])"
          @click="addPositionStatus()"
          >新增社区</el-button
        >
        <el-button type="danger" size="large" v-if="isAuth(['ROOT', 'COMMUNITY_CONFIG:DELETE'])" @click="delCommuity()"
          >批量删除</el-button
        >
      </el-col>
    </el-row>

    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        show-overflow-tooltip="true"
        v-for="(item, index) in community"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'state'">
          <el-tag v-if="row.state == 0"> 是 </el-tag>
          <el-tag v-else type="danger"> 否 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'enterType'">
          <el-tag v-if="row.enterType == 0"> 是 </el-tag>
          <el-tag v-else type="danger"> 否 </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="100" #default="{ row }">
        <el-button
          type="primary"
          size="mini"
          v-if="isAuth(['ROOT', 'COMMUNITY_CONFIG:UPDATE'])"
          @click="clickUpdatePosition(row)"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="mini"
          @click="delCommuity(row)"
          v-if="isAuth(['ROOT', 'COMMUNITY_CONFIG:DELETE'])"
          >删除</el-button
        >
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
    <!-- 新增社区弹框 -->
    <el-dialog v-model="showWindow" title="新增" width="50%">
      <el-form :model="addting" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="物业名称" prop="manageCompanyId">
          <el-select v-model.number="addting.manageCompanyId" placeholder="请选择物业">
            <el-option v-for="item in CompanyList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="社区名称" prop="name">
          <el-input placeholder="请输入社区名称" v-model="addting.name" />
        </el-form-item>
        <el-form-item label="社区地址" prop="address">
          <el-input placeholder="请输入社区地址" v-model="addting.address" />
        </el-form-item>
        <el-form-item label="负责人" prop="contacts">
          <el-input placeholder="请输入负责人姓名" v-model="addting.contacts" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input placeholder="请输入联系电话" v-model="addting.phone" />
        </el-form-item>
        <!-- <el-form-item label="经度">
          <el-input placeholder="请输入经度" v-model="addting.longitude" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input placeholder="请输入纬度" v-model="addting.latitude" />
        </el-form-item> -->
        <el-form-item label="是否启用" prop="state">
          <el-radio-group v-model="addting.state">
            <el-radio label="0">是</el-radio>
            <el-radio label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="临时车辆是否可进" label-width="50" prop="enterType">
          <el-radio-group v-model="addting.enterType">
            <el-radio label="0">是</el-radio>
            <el-radio label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWindow = false">取消</el-button>
          <el-button type="primary" @click="insertCommuity(addting)">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 修改社区弹框 -->
    <el-dialog v-model="showUpdate" title="修改" width="45%">
      <el-form :model="onlyComminity" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="物业公司" prop="manageCompanyId">
          <el-select v-model.number="onlyComminity.manageCompanyId" placeholder="请选择小区">
            <el-option v-for="item in CompanyList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="社区名称" prop="name">
          <el-input placeholder="请输入社区名称" v-model="onlyComminity.name" />
        </el-form-item>
        <el-form-item label="社区地址" prop="address">
          <el-input placeholder="请输入社区地址" v-model="onlyComminity.address" />
        </el-form-item>
        <el-form-item label="负责人" prop="contacts">
          <el-input placeholder="请输入负责人姓名" v-model="onlyComminity.contacts" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input placeholder="请输入联系电话" v-model="onlyComminity.phone" />
        </el-form-item>
        <!-- <el-form-item label="经度">
          <el-input placeholder="请输入经度" v-model="onlyComminity.longitude" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input placeholder="请输入纬度" v-model="onlyComminity.latitude" />
        </el-form-item> -->
        <el-form-item label="是否启用" prop="state">
          <el-radio-group v-model="onlyComminity.state">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="临时车辆是否可进" label-width="50" prop="enterType">
          <el-radio-group v-model="onlyComminity.enterType">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdate = false">取消</el-button>
          <el-button type="primary" @click="btnUpdatecommuity(onlyComminity)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
  <fulaimap></fulaimap>
</template>

<script setup>
// import fulaimap from './map.vue'
import { ref } from 'vue'
import { getCommunityList, insertCommunity, updateComunity, deleteCommunity } from '@/api/community'
import { getCompanyIdAndNameList } from '@/api/company'
import community from './community'
import { ElMessage, ElMessageBox } from 'element-plus'
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 多选项
const multipleSelection = ref([])
// 新增社区
const addting = ref({})
// 小区名称数组
const CompanyList = ref([])
// 临时车量进出数组
const enterType = ref([
  {
    value: 0,
    label: '临时车可进'
  },
  {
    value: 1,
    label: '临时车不可进'
  }
])
// 状态数组
const state = ref([
  {
    value: 0,
    label: '启用'
  },
  {
    value: 1,
    label: '禁用'
  }
])
// 请求社区列表
const getListData = async () => {
  const param = {
    info: '',
    pageIndex: page.value,
    pageSize: size.value,
    state: null,
    enterType: null
  }
  const result = await getCommunityList(param)
  console.log(tableData.value)
  console.log(result.data)
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

const addPositionStatus = () => {
  showWindow.value = !showWindow.value
}
// 请求小区列表
getCompanyIdAndNameList().then((res) => {
  CompanyList.value = res.data
  console.log(res.data)
})

// 删除操作
const delCommuity = (val) => {
  let ids = []
  if (val === undefined) {
    console.log(multipleSelection.value)
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.communityId
    })
  } else {
    multipleSelection.value = []
    ids.push(val.communityId)
  }
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    console.log(ids)
    await deleteCommunity(ids)
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
  manageCompanyId: [
    {
      required: true,
      type: 'number',
      message: '输入错误',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: '输入错误',
      trigger: 'blur'
    }
  ],
  address: [
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
  state: [
    {
      required: true,
      message: '输入错误',
      trigger: 'blur'
    }
  ],
  enterType: [
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
      trigger: ['blur']
    },
    {
      pattern: regTelPhone,
      message: '手机号格式错误',
      trigger: ['blur']
    }
  ]
})
// 遮罩层表单控制
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 新增
const insertCommuity = (addting) => {
  // 新增数据
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await insertCommunity(addting)
      showWindow.value = false
      // 重新渲染数据
      getListData()
      ruleFormRef.value.resetFields()
    }
  })
}

const showUpdate = ref(false)
const onlyComminity = ref({})
// 点击修改
const clickUpdatePosition = (row) => {
  // 把需要用到的值拿到
  console.log(row)
  onlyComminity.value = {
    id: row.communityId,
    name: row.communityName,
    address: row.communityAddress,
    phone: row.phone,
    contacts: row.contacts,
    state: row.state,
    enterType: row.enterType,
    manageCompanyId: row.manageCompanyId
  }
  showUpdate.value = !showUpdate.value
}
// 修改
const btnUpdatecommuity = (onlyComminity) => {
  // 校验规则
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log(onlyComminity)
      await updateComunity(onlyComminity)
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
    pageSize: size.value,
    state: state.value.value,
    enterType: enterType.value.value
  }
  const result = await getCommunityList(param)
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
