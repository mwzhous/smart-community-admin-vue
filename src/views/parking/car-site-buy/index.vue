<template>
  <el-card>
    <el-row :gutter="15" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-50 m-2" placeholder="订单号、账单标题、车牌号搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
       <el-col :span="4">
        <el-select v-model="state" size="small" clearable placeholder="订单状态" @change="handleStateChange">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="type" size="small" clearable placeholder="收费类型" @change="handleTypeChange">
          <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="channel" size="small" clearable placeholder="支付通道" @change="handlePayTypeChange">
          <el-option v-for="item in channelList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="8">
        <el-button type="primary" size="small" @click="searchPosition">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button
          type="danger"
          size="small"
          v-if="isAuth(['ROOT', 'SITE_BUY:DELETE'])"
          @click="deleteParkingOrderByIds()"
          >批量删除</el-button
        >
        <el-button type="success" size="small" v-if="isAuth(['ROOT', 'SITE_RENT:EXPORT'])" @click="exportRecord()"
          >批量导出</el-button
        >
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in order"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
        :width="item.width"
      >
        <template v-if="item.prop === 'action'" #default="{ row }">
          <span>{{ row.label }}</span>

          <el-button type="danger" size="mini" @click="deleteById(row)">删除</el-button>

          <el-button type="success" size="mini" @click="updateHandle(row)">修改</el-button>
        </template>

        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 1"> 月租 </el-tag>
          <el-tag v-else-if="row.type == 2" type="warning"> 临停 </el-tag>
          <el-tag v-else-if="row.type == 3" type="success"> 邀请 </el-tag>
          <el-tag v-else type="danger"> 暂无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'channel'">
          <el-tag v-show="row.channel == 0"> 支付宝 </el-tag>
          <el-tag v-show="row.channel == 1" type="warning"> 微信 </el-tag>
          <el-tag v-show="row.channel == null" type="danger"> 暂无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'state'">
          <el-tag v-show="row.state == 1"> 待付款 </el-tag>
          <el-tag v-show="row.state == 2" type="warning"> 交易成功 </el-tag>
          <el-tag v-show="row.state == 3" type="success"> 超时关闭 </el-tag>
          <el-tag v-show="row.state == 4" type="danger"> 取消订单 </el-tag>
            <el-tag v-show="row.state == null" type="danger"> 暂无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'parkingTime'">
          <span>{{ row.parkingTime }}分钟</span>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'total'">
          <span>￥{{ row.total }}元</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- Form -->

    <el-dialog v-model="dialogFormVisible" title="新增订单">
      <el-form :model="form" :rules="addRules" ref="addRuleFormRef">
        <el-form-item label="订单号" :label-width="formLabelWidth" prop="orderNum">
          <el-input v-model="form.orderNum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="账单标题" :label-width="formLabelWidth" prop="title">
          <el-input v-model="form.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="总价" :label-width="formLabelWidth" prop="total">
          <el-input v-model="form.total" autocomplete="off" />
        </el-form-item>
        <el-form-item label="车牌号" :label-width="formLabelWidth" prop="carNumber">
          <el-input v-model="form.carNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="停车场" :label-width="formLabelWidth" prop="parkingId">
          <el-select v-model="form.parkingId" class="m-2" placeholder="Select" size="large">
            <el-option
              v-for="item in parkingIdList"
              :key="item.parkingId"
              :label="item.parkingId"
              :value="item.parkingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车时长" :label-width="formLabelWidth" prop="parkingTime">
          <el-input v-model="form.parkingTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="支付方式" :label-width="formLabelWidth" prop="channel">
          <el-radio-group v-model="form.channel">
            <el-radio label="0">支付宝</el-radio>
            <el-radio label="1">微信</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="收费类型" :label-width="formLabelWidth" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="1">月租</el-radio>
            <el-radio label="2">临停</el-radio>
            <el-radio label="3">邀请</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="支付状态" :label-width="formLabelWidth" prop="state">
          <el-radio-group v-model="form.state">
            <el-radio label="1">待付款</el-radio>
            <el-radio label="2">交易成功</el-radio>
            <el-radio label="3">超时关闭</el-radio>
            <el-radio label="4">取消订单</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpateFormVisible" title="修改停车订单信息">
      <el-form
        v-for="(item, index) in updateForm"
        :key="index"
        :rules="updateRules"
        ref="updateRuleFormRef"
        :model="updateForm.value"
      >
        <el-form-item label="订单号" :label-width="formLabelWidth" prop="orderNum">
          <el-input v-model="item.orderNum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="账单标题" :label-width="formLabelWidth" prop="title">
          <el-input v-model="item.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="总价" :label-width="formLabelWidth" prop="total">
          <el-input v-model="item.total" autocomplete="off" />
        </el-form-item>
        <el-form-item label="车牌号" :label-width="formLabelWidth" prop="carNumber">
          <el-input v-model="item.carNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="停车时长" :label-width="formLabelWidth" prop="parkingTime">
          <el-input v-model="item.parkingTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="支付方式" :label-width="formLabelWidth" prop="channel">
          <el-radio-group v-model.number="item.channel">
            <el-radio :label="0">支付宝</el-radio>
            <el-radio :label="1">微信</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="收费类型" :label-width="formLabelWidth" prop="type">
          <el-radio-group v-model.number="item.type">
            <el-radio :label="1">月租</el-radio>
            <el-radio :label="2">临停</el-radio>
            <el-radio :label="3">邀请</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付状态" :label-width="formLabelWidth" prop="state">
          <el-radio-group v-model.number="item.state">
            <el-radio :label="1">待付款</el-radio>
            <el-radio :label="2">交易成功</el-radio>
            <el-radio :label="3">超时关闭</el-radio>
            <el-radio :label="4">取消订单</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-pagination
      class="pagination"
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
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import {
  getAllParkingOrder,
  addParkingOrder,
  updateParkingOrder,
  deleteParkingOrder,
  getAllCarPort,
  exportParkingOrder
} from '@/api/carport'
import order from './order'
import { ElMessage, ElMessageBox } from 'element-plus'
const multipleSelection = ref([])
// 删除的id
const selectIds = ref([])
const tableData = ref([])
const parkingIdList = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const addRuleFormRef = ref(null)
const updateRuleFormRef = ref(null)
const state = ref('')
const channel = ref('')
const type = ref('')
const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const formLabelWidth = '140px'
const updateForm = reactive({})
// 模糊搜索输入框内容
const searchInfo = ref('')
// 当前登录用户是否为超级管理员
const isRoot = ref(true)
// 当前登录用户的社区id
const userCommunityId = ref(null)
// 获取当前登录用户社区id
const store = useStore()
const getAdminCommunityId = () => {
  const info = store.state.user.userInfo
  if (info.communityId === 0) {
    isRoot.value = true
    userCommunityId.value = 0
  } else {
    isRoot.value = false
    userCommunityId.value = info.communityId
    console.log(userCommunityId.value)
  }
}
getAdminCommunityId()
const searchPosition = () => {
  getListData()
}
const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
  updateForm.value.id = val.id
  console.log(updateForm.value)
}
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
// 批量导出
const exportRecord = async () => {
  let ids = []
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  console.log(ids)
  const data = {
    info: searchInfo.value,
    ids: ids.toString()
  }
  // console.log(data)
  await exportParkingOrder(data).then((res) => {
    console.log(res)
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '停车记录.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
const addRules = reactive({
  total: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  parkingId: [{ required: true, message: '请输入停车场id', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  carNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  openId: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  orderNum: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  parkingTime: [{ required: true, message: ' 请输入停车时长', trigger: 'blur' }]
})
const updateRules = reactive({
  total: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  parkingId: [{ required: true, message: '请输入停车场id', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  carNumber: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  openId: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  orderNum: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  parkingTime: [{ required: true, message: ' 请输入停车时长', trigger: 'blur' }]
})
const form = reactive({
  id: '',
  parkingId: '',
  carNumber: '',
  channel: '',
  openId: '',
  orderNum: '',
  parkingTime: '',
  recordId: '',
  state: '',
  title: '',
  total: '',
  type: ''
})
const stateList = [
  {
    value: 1,
    label: '待付款'
  },
  {
    value: 2,
    label: '交易成功'
  },
  {
    value: 3,
    label: '超时关闭'
  },
  {
    value: 4,
    label: '取消订单'
  }
]
const typeList = [
  {
    value: 1,
    label: '月租'
  },
  {
    value: 2,
    label: '临停'
  },
  {
    value: 3,
    label: '邀请'
  }
]
const channelList = [
  {
    value: 0,
    label: '支付宝'
  },
  {
    value: 1,
    label: '微信'
  }
]
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    comId: userCommunityId.value,
    type: type.value,
    channel: channel.value,
    state: state.value
  }
  const result = await getAllParkingOrder(param)
  console.log(result)
  tableData.value = result.data
  total.value = result.total
  console.log(total.value)
}
getListData()

const handleAddShow = () => {
  dialogFormVisible.value = false
}
const handleUpdateShow = () => {
  dialogUpateFormVisible.value = false
}

const handleAddConfirm = () => {
  const data = {
    parkingId: form.parkingId,
    channel: form.channel,
    openId: form.openId,
    orderNum: form.orderNum,
    carNumber: form.carNumber,
    parkingTime: form.parkingTime,
    state: form.state,
    title: form.title,
    total: form.total,
    type: form.type
  }
  addRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await addParkingOrder(data)
      console.log(form.value)
      handleAddShow()
      console.log(result.data)
      ElMessage.success('新增成功')
      getListData()
    }
  })
}
const handleUpdateConfirm = async () => {
  const data = {
    id: updateForm.value.id,
    channel: updateForm.value.channel,
    // openId: updateForm.value.openId,
    orderNum: updateForm.value.orderNum,
    carNumber: updateForm.value.carNumber,
    parkingTime: updateForm.value.parkingTime,
    state: updateForm.value.state,
    title: updateForm.value.title,
    total: updateForm.value.total,
    type: updateForm.value.type
  }
  const result = await updateParkingOrder(data)
  handleUpdateShow()
  console.log(result.data)
  ElMessage.success('更新成功')
  getListData()
}
const deleteById = (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.id
    })
    console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.id)
    // console.log(ids)
  }
  console.log(ids)
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteParkingOrder(ids)
      ElMessage.success('删除成功')
      selectIds.value = []
      ids = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      ids = []
      selectIds.value = []
    })
}

const deleteParkingOrderByIds = (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.id
    })
    console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.id)
    console.log(ids)
  }
  selectIds.value = ids
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteParkingOrder(ids)
      ElMessage.success('删除成功')
      selectIds.value = []
      ids = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      ids = []
      selectIds.value = []
    })
}

const handleSizeChange = (currentSize) => {
  size.value = currentSize
  getListData()
}

const handleCurrentChange = (currentSize) => {
  page.value = currentSize
  getListData()
}
</script>
<style lang="scss" scoped>
.el-row {
  margin-bottom: 10px;
}
.bottom {
  display: flex;
  justify-content: center;
}
</style>
