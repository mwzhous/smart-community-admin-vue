<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-22 m-1" placeholder="小区、车牌号搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-select v-model="state" size="small" clearable placeholder="支付状态" @change="handleStateChange">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="type" size="small" clearable placeholder="收费类型" @change="handleTypeChange">
          <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="payType" size="small" clearable placeholder="支付方式" @change="handlePayTypeChange">
          <el-option v-for="item in payTypeList" :key="item.value" :label="item.label" :value="item.value" />
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
          v-if="isAuth(['ROOT', 'SITE_RENT:DELETE'])"
          @click="deleteInvitationRecordByIds()"
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
        v-for="(item, index) in record"
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
          <el-tag v-show="row.type == 1"> 月租 </el-tag>
          <el-tag v-show="row.type == 2" type="warning"> 临停 </el-tag>
          <el-tag v-show="row.type == 3" type="danger"> 邀请 </el-tag>
          <el-tag v-show="row.type == 4" type="success"> 长期车 </el-tag>
           <el-tag v-show="row.type == null" type="danger"> 暂无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'payType'">
          <el-tag v-show="row.payType == 1"> 微信 </el-tag>
          <el-tag v-show="row.payType == 2" type="warning"> 支付宝 </el-tag>
          <el-tag v-show="row.payType == 3" type="warning"> 现金 </el-tag>
            <el-tag v-show="row.payType == null" type="danger"> 暂无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'state'">
          <el-tag v-show="row.state == 0"> 未支付 </el-tag>
          <el-tag v-show="row.state == 1" type="warning"> 已支付 </el-tag>
          <el-tag v-show="row.state == 2" type="success"> 无需付款 </el-tag>
           <el-tag v-show="row.state == null" type="danger"> 暂无 </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" prop="action" width="200" fixed="right" #default="{ row }">
        <el-button type="danger" size="mini" @click="deleteById(row)">删除</el-button>
        <el-button type="success" size="mini" @click="updateHandle(row)">修改</el-button>
      </el-table-column>
    </el-table>
    <!-- Form -->

    <el-dialog v-model="dialogFormVisible" title="新增停车记录信息" :append-to-body="false">
      <el-form :model="form" ref="addValidForm">
        <el-form-item
          label="停车场id"
          :label-width="formLabelWidth"
          prop="parkingId"
          :rules="[{ required: true, message: '请输入停车场id', trigger: 'blur' }]"
        >
          <el-input v-model="form.parkingId" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="社区"
          prop="communityId"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入社区', trigger: 'blur' }]"
        >
          <el-input v-model="form.communityId" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="邀请时长"
          :label-width="formLabelWidth"
          prop="invitationTime"
          :rules="[{ required: true, message: '请输入邀请时长', trigger: 'blur' }]"
        >
          <el-input v-model="form.invitationTime" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="车牌号"
          :label-width="formLabelWidth"
          prop="carNumber"
          :rules="[{ required: true, message: '请输入车牌号', trigger: 'blur' }]"
        >
          <el-input v-model="form.carNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="收费类型" :label-width="formLabelWidth" prop="type">
          <el-input v-model="form.type" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="停车时长"
          prop="parkingTime"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <el-input v-model="form.parkingTime" autocomplete="off" placeholder="" />
        </el-form-item>
        <el-form-item
          label="应收金额"
          prop="amount"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <el-input v-model="form.amount" autocomplete="off" placeholder="" />
        </el-form-item>
        <el-form-item
          label="支付方式"
          prop="payType"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <el-input v-model="form.payType" autocomplete="off" placeholder="" />
        </el-form-item>
        <el-form-item
          label="支付状态"
          prop="state"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <el-input v-model="form.state" autocomplete="off" placeholder="" />
        </el-form-item>
        <el-form-item
          label="支付时间"
          prop="payTime"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <div class="block">
            <el-date-picker
              v-model="form.payTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
        <el-form-item
          label="入场时间"
          prop="startTime"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <div class="block">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
        <el-form-item
          label="出场时间"
          prop="endTime"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入', trigger: 'blur' }]"
        >
          <div class="block">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleAddConfirm">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpateFormVisible" title="修改停车记录">
      <el-form v-for="(item, index) in updateForm" :key="index">
        <!-- <el-form-item label="停车场id" :label-width="formLabelWidth" prop="parkingId">
          <el-input v-model="item.parkingId" autocomplete="off" />
        </el-form-item> -->
        <el-form-item label="社区" prop="communityId" :label-width="formLabelWidth">
          <el-select v-model="item.communityId" class="m-2" placeholder="选择小区" size="large" :disabled="!isRoot">
            <el-option
              v-for="item in communityNameList.value"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邀请时长" :label-width="formLabelWidth" prop="invitationTime">
          <el-input v-model="item.invitationTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="车牌号" :label-width="formLabelWidth" prop="carNumber">
          <el-input v-model="item.carNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="停车时长" prop="parkingTime" :label-width="formLabelWidth">
          <el-input v-model="item.parkingTime" autocomplete="off" placeholder="" />
        </el-form-item>
        <el-form-item label="应收金额" prop="amount" :label-width="formLabelWidth">
          <el-input v-model="item.amount" autocomplete="off" placeholder="" />
        </el-form-item>
        <!-- <el-form-item label="支付方式" prop="payType" :label-width="formLabelWidth">
          <el-input v-model="item.payType" autocomplete="off" placeholder="" />
        </el-form-item> -->
        <el-form-item label="支付方式" :label-width="formLabelWidth">
          <el-radio-group v-model.number="item.payType">
            <el-radio :label="0">未支付</el-radio>
            <el-radio :label="1">微信</el-radio>
            <el-radio :label="2">支付宝</el-radio>
            <el-radio :label="3">现金</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="收费类型" :label-width="formLabelWidth">
          <el-radio-group v-model.number="item.type">
            <el-radio :label="1">月租</el-radio>
            <el-radio :label="2">临停</el-radio>
            <el-radio :label="3">邀请</el-radio>
            <el-radio :label="4">长期车</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付状态" :label-width="formLabelWidth">
          <el-radio-group v-model.number="item.state">
            <el-radio :label="0">未支付</el-radio>
            <el-radio :label="1">已支付</el-radio>
            <el-radio :label="2">无需付款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付时间" prop="payTime" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="item.payTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
        <el-form-item label="入场时间" prop="startTime" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="item.startTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
        <el-form-item label="出场时间" prop="endTime" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="item.endTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
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
  addParkingRecord,
  updateParkingRecord,
  deleteParkingRecord,
  getAllParkingRecord,
  exportParkingRecord,
  importParkingRecord
} from '@/api/carport'
import { getCommunityNameList } from '@/api/community'
import record from './record'
import { ElMessage, ElMessageBox } from 'element-plus'
const multipleSelection = ref([])
const communityNameList = reactive({})
// 删除的id
const selectIds = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const updateForm = reactive({})
const addValidForm = ref(null)

const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const formLabelWidth = '140px'
// 条件筛选
const state = ref('')
const type = ref('')
const payType = ref('')
const searchInfo = ref('')
// 当前登录用户是否为超级管理员
const isRoot = ref(null)
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
getCommunityNameList().then((res) => {
  communityNameList.value = res.data
  console.log(res.data)
})
const searchPosition = () => {
  getListData()
}
const stateList = [
  {
    value: 0,
    label: '未支付'
  },
  {
    value: 1,
    label: '已支付'
  },
  {
    value: 2,
    label: '无需付款'
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
  },
  {
    value: 4,
    label: '长期'
  }
]
const payTypeList = [
  // {
  //   value: 0,
  //   label: '未支付'
  // },
  {
    value: 1,
    label: '微信'
  },
  {
    value: 2,
    label: '支付宝'
  },
  {
    value: 3,
    label: '现金'
  }
]

// 监听状态改变
const handleStateChange = (val) => {
  state.value = val
}
const handleTypeChange = (val) => {
  type.value = val
}
const handlePayTypeChange = (val) => {
  payType.value = val
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}

const form = reactive({
  id: '',
  parkingId: '',
  carNumber: '',
  communityId: '',
  amount: '',
  invitationTime: '',
  parkingTime: '',
  payTime: '',
  payType: '',
  startTime: '',
  endTime: '',
  state: '',
  type: ''
})
// 批量导出
const exportRecord = async () => {
  let ids = []
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  console.log(ids)
  const data = {
    state: state.value,
    type: type.value,
    payType: payType.value,
    info: searchInfo.value,
    ids: ids.toString()
  }
  console.log(data)
  await exportParkingRecord(data).then((res) => {
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

const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
  console.log(updateForm.value)
}
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    state: state.value,
    type: type.value,
    payType: payType.value,
    keywords: searchInfo.value,
    comId: userCommunityId.value
  }
  const result = await getAllParkingRecord(param)
  console.log(result.data)
  tableData.value = result.data
  total.value = result.total
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
    carNumber: form.carNumber,
    communityId: form.communityId,
    amount: form.amount,
    invitationTime: form.invitationTime,
    parkingTime: form.parkingTime,
    payTime: form.payTime,
    payType: form.payType,
    startTime: form.startTime,
    endTime: form.endTime,
    state: form.state,
    type: form.type
  }
  addValidForm.value.validate(async (valid) => {
    if (valid) {
      const result = await addParkingRecord(data)
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
    parkingId: updateForm.value.parkingId,
    carNumber: updateForm.value.carNumber,
    communityId: updateForm.value.communityId,
    amount: updateForm.value.amount,
    invitationTime: updateForm.value.invitationTime,
    parkingTime: updateForm.value.parkingTime,
    payTime: updateForm.value.payTime,
    payType: updateForm.value.payType,
    startTime: updateForm.value.startTime,
    endTime: updateForm.value.endTime,
    state: updateForm.value.state,
    type: updateForm.value.type
  }
  const result = await updateParkingRecord(data)

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
    // console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.id)
    console.log(ids)
  }
  console.log(ids)
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteParkingRecord(ids)
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

const deleteInvitationRecordByIds = (val) => {
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
      await deleteParkingRecord(ids)
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
