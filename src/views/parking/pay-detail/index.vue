<template>
  <el-card>
    <el-row :gutter="20" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-50 m-2" placeholder="小区、停车场搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" size="small" @click="searchPosition">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button
          type="danger"
          size="small"
          v-if="isAuth(['ROOT', 'DETAIL:DELETE'])"
          @click="deleteParkingOrderByIds()"
          >批量删除</el-button
        >
        <el-button
          type="warning"
          size="small"
          text
          v-if="isAuth(['ROOT', 'DETAIL:INSERT'])"
          @click="dialogFormVisible = true"
          >增加</el-button
        >
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in rule"
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
          <el-button type="primary" size="mini" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Form -->

    <el-dialog v-model="dialogFormVisible" title="新增停车规则">
      <el-form :model="form" :rules="addRules" ref="addRuleFormRef">
        <el-form-item label="小区" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="form.communityId" class="m-2" placeholder="选择小区" size="large">
            <el-option
              v-for="item in communityNameList.value"
              :key="item.id"
              :label="item.communityName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车场别名" :label-width="formLabelWidth" prop="otherName">
          <el-input v-model="form.otherName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="免费时长" :label-width="formLabelWidth" prop="freeTime">
          <el-input v-model="form.freeTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="首段时长" :label-width="formLabelWidth" prop="firstPeriod">
          <el-input v-model="form.firstPeriod" autocomplete="off" />
        </el-form-item>
        <el-form-item label="首段价格" :label-width="formLabelWidth" prop="firstAmount">
          <el-input v-model="form.firstAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="超出首段的时长" :label-width="formLabelWidth" prop="unitPeriod">
          <el-input v-model="form.unitPeriod" autocomplete="off" />
        </el-form-item>
        <el-form-item label="超出首段时长收费" :label-width="formLabelWidth" prop="unitAmount">
          <el-input v-model="form.unitAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="夜间价格" :label-width="formLabelWidth" prop="nightAmount">
          <el-input v-model="form.nightAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="白天开始时间" :label-width="formLabelWidth" prop="dayStartTime">
          <el-time-picker v-model="form.dayStartTime" placeholder="Arbitrary time" format="HH:mm:ss" />
        </el-form-item>
        <el-form-item label="夜晚开始时间" :label-width="formLabelWidth" prop="nightStartTime">
          <el-time-picker v-model="form.nightStartTime" placeholder="Arbitrary time" format="HH:mm:ss" />
        </el-form-item>
        <el-form-item label="封顶金额" :label-width="formLabelWidth" prop="cappingAmount">
          <el-input v-model="form.cappingAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="收费类型" :label-width="formLabelWidth" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="1">月租</el-radio>
            <el-radio label="2">临停</el-radio>
            <el-radio label="3">邀请</el-radio>
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

    <el-dialog v-model="dialogUpateFormVisible" title="修改停车规则">
      <el-form v-for="(item, index) in updateForm" :key="index" :rules="updateRules" ref="updateRuleFormRef">
        <el-form-item label="小区" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="item.communityId" class="m-2" placeholder="选择小区" size="large" :disabled="!isRoot">
            <el-option
              v-for="item in communityNameList.value"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="停车场别名" :label-width="formLabelWidth" prop="otherName">
          <el-input v-model="item.otherName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="免费时长" :label-width="formLabelWidth" prop="freeTime">
          <el-input v-model="item.freeTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="首段时长" :label-width="formLabelWidth" prop="firstPeriod">
          <el-input v-model="item.firstPeriod" autocomplete="off" />
        </el-form-item>
        <el-form-item label="首段价格" :label-width="formLabelWidth" prop="firstAmount">
          <el-input v-model="item.firstAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="超出首段的时长" :label-width="formLabelWidth" prop="unitPeriod">
          <el-input v-model="item.unitPeriod" autocomplete="off" />
        </el-form-item>
        <el-form-item label="超出首段时长收费" :label-width="formLabelWidth" prop="unitAmount">
          <el-input v-model="item.unitAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="夜间价格" :label-width="formLabelWidth" prop="nightAmount">
          <el-input v-model="item.nightAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="白天开始时间" :label-width="formLabelWidth" prop="dayStartTime">
          <el-input v-model="item.dayStartTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="夜晚开始时间" :label-width="formLabelWidth" prop="nightStartTime">
          <el-input v-model="item.nightStartTime" autocomplete="off" />
        </el-form-item>
        <el-form-item label="封顶金额" :label-width="formLabelWidth" prop="cappingAmount">
          <el-input v-model="item.cappingAmount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="收费类型" :label-width="formLabelWidth" prop="type">
          <el-radio-group v-model.number="item.type">
            <el-radio :label="1">月租</el-radio>
            <el-radio :label="2">临停</el-radio>
            <el-radio :label="3">邀请</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelHandle">取消</el-button>
          <el-button type="primary" @click="handleUpdateConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 查看停车规则详情对话框-->
    <el-dialog v-model="dialogRuleFormVisible" title="停车收费规则">
      <el-form v-for="(item, index) in detailList" :key="index" class="detail">
        <el-form-item label="免费时长:" :label-width="formLabelWidth">
          <el-tag type="success">{{ item.freeTime }}分钟</el-tag>
        </el-form-item>
        <el-form-item label="首段时长:" :label-width="formLabelWidth">
          <el-tag type="success">{{ item.firstPeriod }}分钟</el-tag>
        </el-form-item>
        <el-form-item label="首段价格:" :label-width="formLabelWidth">
          <el-tag type="danger">￥{{ item.firstAmount }}元</el-tag>
        </el-form-item>
        <el-form-item label="超出首段的时长:" :label-width="formLabelWidth">
          <el-tag type="success">{{ item.unitPeriod }}分钟</el-tag>
        </el-form-item>
        <el-form-item label="超出首段时长收费:" :label-width="formLabelWidth">
          <el-tag type="danger">￥{{ item.unitAmount }}元/分钟</el-tag>
        </el-form-item>
        <el-form-item label="夜间价格:" :label-width="formLabelWidth">
          <el-tag type="danger">￥{{ item.nightAmount }}元/次</el-tag>
        </el-form-item>
        <el-form-item label="白天开始时间:" :label-width="formLabelWidth">
          <el-tag type="warning">{{ item.dayStartTime }}</el-tag>
        </el-form-item>
        <el-form-item label="夜晚开始时间:" :label-width="formLabelWidth">
          <el-tag type="warning">{{ item.nightStartTime }}</el-tag>
        </el-form-item>
        <el-form-item label="封顶金额:" :label-width="formLabelWidth">
          <el-tag type="danger">￥{{ item.cappingAmount }}元</el-tag>
        </el-form-item>
        <el-form-item label="收费类型:" :label-width="formLabelWidth">
          <el-tag v-show="item.type == 1">按时收费</el-tag>
          <el-tag v-show="item.type == 2">日夜分时段收费</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogRuleFormVisible = false">关闭</el-button>
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
import { getAllParkingRule, addParkingRule, updateParkingRule, deleteParkingRule } from '@/api/carport'
import { getCommunityNameList } from '@/api/community'
import rule from './rule'
import { ElMessage, ElMessageBox } from 'element-plus'
const multipleSelection = ref([])
// 删除的id
const selectIds = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const addRuleFormRef = ref(null)
const updateRuleFormRef = ref(null)

const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const dialogRuleFormVisible = ref(false)
const formLabelWidth = '140px'
const updateForm = reactive({})
const detailList = reactive({})
const communityNameList = reactive({})
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
// 模糊搜索输入框内容
const searchInfo = ref('')
const searchPosition = () => {
  getListData()
}
const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
}
const cancelHandle = () => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = ''
}
//  处理收费细节获取每行数据
const handleDetail = (val) => {
  dialogRuleFormVisible.value = !dialogRuleFormVisible.value
  detailList.value = val
  console.log(detailList.value)
}
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
getCommunityNameList().then((res) => {
  communityNameList.value = res.data
  console.log(res.data)
})
const addRules = reactive({
  communityId: [{ required: false, message: '请输入小区名', trigger: 'change' }],
  parkingId: [{ required: true, message: '请输入停车场', trigger: 'blur' }],
  otherName: [{ required: false, message: '请输入停车场别名', trigger: 'blur' }],
  freeTime: [{ required: true, message: '请输入免费时长', trigger: 'blur' }],
  parkingTime: [{ required: true, message: '请输入停车时长', trigger: 'blur' }],
  firstPeriod: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  firstAmount: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  unitPeriod: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  unitAmount: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  nightAmount: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  dayStartTime: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  nightStartTime: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  cappingAmount: [{ required: true, message: '请输入类容', trigger: 'blur' }],
  type: [{ required: false, message: '请输入类容', trigger: 'blur' }]
})
const form = reactive({
  id: '',
  communityId: '',
  parkingId: '',
  otherName: '',
  detail: '',
  freeTime: '',
  parkingTime: '',
  firstPeriod: '',
  firstAmount: '',
  unitPeriod: '',
  unitAmount: '',
  nightAmount: '',
  dayStartTime: '',
  nightStartTime: '',
  cappingAmount: '',
  type: ''
})

const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    comId: userCommunityId.value
  }
  const result = await getAllParkingRule(param)
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
  const time = form.dayStartTime.toString().split(' ')[4]
  const time2 = form.nightStartTime.toString().split(' ')[4]
  const data = {
    parkingId: form.parkingId,
    communityId: form.communityId,
    otherName: form.otherName,
    detail: form.detail,
    freeTime: form.freeTime,
    parkingTime: form.parkingTime,
    firstPeriod: form.firstPeriod,
    firstAmount: form.firstAmount,
    unitPeriod: form.unitPeriod,
    unitAmount: form.unitAmount,
    nightAmount: form.nightAmount,
    dayStartTime: time,
    nightStartTime: time2,
    cappingAmount: form.cappingAmount
  }
  console.log(time)
  addRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await addParkingRule(data)
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
    parkingId: updateForm.value.parkingId,
    communityId: updateForm.value.communityId,
    otherName: updateForm.value.otherName,
    detail: updateForm.value.detail,
    freeTime: updateForm.value.freeTime,
    parkingTime: updateForm.value.parkingTime,
    firstPeriod: updateForm.value.firstPeriod,
    firstAmount: updateForm.value.firstAmount,
    unitPeriod: updateForm.value.unitPeriod,
    unitAmount: updateForm.value.unitAmount,
    nightAmount: updateForm.value.nightAmount,
    dayStartTime: updateForm.value.dayStartTime,
    nightStartTime: updateForm.value.nightStartTime,
    cappingAmount: updateForm.value.cappingAmount
  }
  const result = await updateParkingRule(data)
  handleUpdateShow()
  console.log(result.data)
  ElMessage.success('更新成功')
  getListData()
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
      await deleteParkingRule(ids)
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
      await deleteParkingRule(ids)
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
.detail {
  text-align: center;
}
.example-basic .el-date-editor {
  margin: 8px;
}
</style>
