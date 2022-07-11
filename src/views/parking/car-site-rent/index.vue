<template>
  <el-card>
    <el-row :gutter="20" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-50 m-2" placeholder="账单号、小区、姓名、牌照搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-select v-model="searchState" size="small" clearable placeholder="申请状态" @change="handleStateChange">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" size="small" @click="searchPosition">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="danger" size="small" v-if="isAuth(['ROOT', 'SITE_RENT:DELETE'])" @click="deleteCardByIds()"
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
        v-for="(item, index) in carRent"
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
          <el-button type="primary" size="mini" @click="updateStateHandle(row)">审核</el-button>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'state'">
          <el-tag v-show="row.state == 0" type="primary"> 申请车位 </el-tag>
          <el-tag v-show="row.state == 1" type="success"> 申请通过</el-tag>
          <el-tag v-show="row.state == 2" type="warning"> 已支付 </el-tag>
          <el-tag v-show="row.state == 3" type="warning"> 超时关闭 </el-tag>
          <el-tag v-show="row.state == 4" type="danger"> 订单关闭 </el-tag>
          <el-tag v-show="row.state == 5" type="danger"> 申请失败</el-tag>
          <el-tag v-show="row.state == 6" type="danger"> 已到期 </el-tag>
          <el-tag v-show="row.state == 7" type="success"> 已购买 </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!-- Form -->

    <el-dialog v-model="dialogFormVisible" title="审核停车租赁信息">
      <el-form :model="updateStateForm">
        <el-form-item label="租赁状态" :label-width="100">
          <el-radio-group v-model.number="updateStateForm.value.state">
            <el-radio :label="0">申请车位</el-radio>
            <el-radio :label="1">申请通过</el-radio>
            <el-radio :label="2">已支付</el-radio>
            <el-radio :label="3">超时关闭</el-radio>
            <el-radio :label="4">订单关闭</el-radio>
            <el-radio :label="5">申请失败</el-radio>
            <el-radio :label="6">已到期</el-radio>
            <el-radio :label="7">已购买</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateState">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpateFormVisible" title="修改停车租赁信息">
      <el-form
        v-for="(item, index) in updateForm"
        :key="index"
        :rules="updateRules"
        ref="updateRuleFormRef"
        :model="updateForm.value"
      >
        <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
          <el-input v-model="item.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="小区" :label-width="formLabelWidth" prop="communityId">
          <el-select
            v-model="item.communityId"
            class="m-2"
            placeholder="选择小区"
            size="large"
            @change="handleSelectId(item.communityId)"
            :disabled="!isRoot"
          >
            <el-option
              v-for="item in communityNameList.value"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车场区号" :label-width="formLabelWidth" prop="section">
          <el-input v-model="item.section" autocomplete="off" />
        </el-form-item>
        <el-form-item label="车牌照" :label-width="formLabelWidth" prop="carNumber">
          <el-input v-model="item.carNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="卡种" :label-width="formLabelWidth" prop="carNumber">
          <el-select v-model.number="item.cardId" class="m-2" placeholder="选择卡种" size="large">
            <el-option
              v-for="item2 in cardList.value"
              :key="item2.cardId"
              :label="item2.cardName"
              :value="item2.cardId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车场" :label-width="formLabelWidth" prop="carNumber">
          <el-select v-model="item.parkingId" class="m-2" placeholder="选择卡种" size="large">
            <el-option
              v-for="item2 in cardList.value"
              :key="item2.parkingId"
              :label="item2.parkingId"
              :value="item2.parkingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位号" :label-width="formLabelWidth" prop="carportId">
          <el-input v-model="item.carportId" autocomplete="off" />
        </el-form-item>
        <el-form-item label="账单号" :label-width="formLabelWidth" prop="billId">
          <el-input v-model="item.billId" autocomplete="off" />
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
import {
  getAllCarRent,
  updateCarRent,
  deleteCarRentById,
  exportCarRent,
  getAllParkingCardById,
  updateStateById
} from '@/api/carport'
import carRent from './car_rent'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommunityNameList } from '@/api/community'
const multipleSelection = ref([])
// 删除的id
const selectIds = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const searchState = ref('')
const updateRuleFormRef = ref(null)
const cardId = ref()
const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const formLabelWidth = '140px'
const updateForm = reactive({})
const communityNameList = reactive({})
const cardList = reactive({})
const updateStateForm = reactive({})
const state = ref()
const id = ref()
// 当前登录用户是否为超级管理员
const isRoot = ref(true)
// 当前登录用户的社区id
const userCommunityId = ref(null)
// 获取当前登录用户社区id
const store = useStore()
const stateList = [
  {
    value: 0,
    label: '申请车位'
  },
  {
    value: 1,
    label: '申请通过'
  },
  {
    value: 2,
    label: '已支付'
  },
  {
    value: 3,
    label: '超时关闭'
  },
  {
    value: 4,
    label: '订单关闭'
  },
  {
    value: 5,
    label: '申请失败'
  },
  {
    value: 6,
    label: '已到期'
  },
  {
    value: 7,
    label: '已购买'
  }
]
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
getCommunityNameList().then((res) => {
  communityNameList.value = res.data
  console.log(res.data)
})
const handleSelectId = (val) => {
  cardId.value = val
  getCardListData()
}
// 模糊搜索输入框内容
const searchInfo = ref('')
const searchPosition = () => {
  getListData()
}
const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
  updateForm.value.parkingId = cardList.value.parkingId[0]
  cardId.value = val.communityId
  getCardListData()
  console.log(updateForm.value)
}
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
const updateStateHandle = (val) => {
  updateStateForm.value = {
    id: val.id,
    state: val.state
  }
  dialogFormVisible.value = !dialogFormVisible.value
}
const updateState = async () => {
  state.value = updateStateForm.value.state
  id.value = updateStateForm.value.id
  const param = {
    state: state.value,
    id: id.value
  }
  await updateStateById(param)
  ElMessage.success('修改成功')
  getListData()
  dialogFormVisible.value = !dialogFormVisible.value
}
const updateRules = reactive({
  price: [{ required: true, message: '请输入价格', trigger: 'change' }],
  parkingId: [{ required: true, message: '请输入停车场id', trigger: 'change' }],
  userId: [{ required: true, message: '请输入用户id', trigger: 'change' }],
  carNumber: [{ required: true, message: '请输入车牌号', trigger: 'change' }],
  carportId: [{ required: true, message: '请输入车位编号', trigger: 'change' }],
  communityId: [{ required: true, message: '请输入小区id', trigger: 'change' }],
  billId: [{ required: true, message: ' 请输入账单id', trigger: 'change' }]
})

const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    comId: userCommunityId.value,
    state: searchState.value
  }
  const result = await getAllCarRent(param)
  console.log(result.data)
  tableData.value = result.data
  total.value = result.total
}
getListData()

const getCardListData = async () => {
  const param = {
    id: cardId.value
  }
  const result = await getAllParkingCardById(param)
  console.log(result.data)
  cardList.value = result.data
  // total.value = result.total
}
const handleUpdateShow = () => {
  dialogUpateFormVisible.value = false
}
const handleUpdateConfirm = async () => {
  const data = {
    id: updateForm.value.id,
    parkingId: updateForm.value.parkingId,
    cardId: updateForm.value.cardId,
    price: updateForm.value.price,
    communityId: updateForm.value.communityId,
    userId: updateForm.value.userId,
    carNumber: updateForm.value.carNumber,
    carportId: updateForm.value.carportId,
    billId: updateForm.value.billId,
    section: updateForm.value.section
  }
  console.log(data.cardId)
  const result = await updateCarRent(data)
  handleUpdateShow()
  console.log(result.data)
  ElMessage.success('更新成功')
  getListData()
}
// 批量导出
const exportRecord = async () => {
  let ids = []
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  const data = {
    info: searchInfo.value,
    ids: ids.toString()
  }
  console.log(data)
  await exportCarRent(data).then((res) => {
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

const deleteById = async (val) => {
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
  }
  console.log(ids)
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteCarRentById(ids)
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

const deleteCardByIds = (val) => {
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
      await deleteCarRentById(ids)
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
