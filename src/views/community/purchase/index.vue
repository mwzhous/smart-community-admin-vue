<template>
  <el-card class="mt-2">
    <el-form inline>
      <el-form-item label="物品名称：">
        <el-input v-model="search" class="w-50 m-2" placeholder="请输入标题">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="物业人员名称：">
        <el-input v-model="account" class="w-50 m-2" placeholder="请输入物业人员">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="审核状态：">
        <el-select v-model="state" clearable placeholder="请选择">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属小区" clearable>
        <el-select placeholder="选择小区" v-model="communityId">
          <el-option
            v-for="(item, index) in communityList"
            :key="index"
            :label="item.communityName"
            :value="item.communityId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="getListData()">搜索</el-button>
        <el-button type="primary" v-if="isAuth(['ROOT', 'PURCHASE:INSERT'])" @click="addInformModal()"
          >新增采购记录</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'PURCHASE:INSERT'])" @click="batchDel()">批量删除</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'PURCHASE:EXPORT'])" @click="exportNoti()">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in purchaseList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'state'">
          <el-tag type="warning" v-if="row.state == 0">申请中</el-tag>
          <el-tag type="info" v-else-if="row.state == 1">已同意</el-tag>
          <el-tag type="success" v-else-if="row.state == 2">已完成</el-tag>
          <el-tag type="error" v-else>已拒绝</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 0"> 文本类型 </el-tag>
          <el-tag v-else type="warning"> 链接类型 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'pushType'">
          <el-tag v-if="row.pushType == 0"> 发送全部 </el-tag>
          <el-tag v-else type="warning"> 不发送全部 </el-tag>
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" min-width="360" label="操作" align="center">
        <el-button
          type="primary"
          size="mini"
          @click="changeReason(row, 1)"
          v-if="isAuth(['ROOT', 'PURCHASE:APPROVAL']) && row.state == 0"
          >同意</el-button
        >
        <el-button
          type="danger"
          size="mini"
          @click="changeReason(row, 3)"
          v-if="isAuth(['ROOT', 'PURCHASE:APPROVAL']) && row.state == 0"
          >拒绝</el-button
        >
        <el-button type="info" size="mini" v-else-if="row.state == 3">已拒绝</el-button>
        <el-button type="info" size="mini" v-else>已同意</el-button>
        <el-button type="success" size="mini" @click="updateInformModel(row)" v-if="isAuth(['ROOT', 'PURCHASE:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="deleteInform(row)" v-if="isAuth(['ROOT', 'PURCHASE:DELETE'])"
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

  <el-dialog v-model="addModel" :title="purchase.id == undifined ? '新增采购记录' : '修改采购记录'" width="40%">
    <el-form :model="purchase" label-width="120px" style="width: 90%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="物品名称" :label-width="formLabelWidth" prop="name">
        <el-input placeholder="请输入物品名称" clearable v-model="purchase.name" />
      </el-form-item>
      <el-form-item label="物品单价" :label-width="formLabelWidth" prop="price">
        <el-input placeholder="请输入物品单价" clearable v-model="purchase.price" />
      </el-form-item>
      <el-form-item label="物品数量" :label-width="formLabelWidth" prop="number">
        <el-input placeholder="请输入物品数量" clearable v-model="purchase.number" />
      </el-form-item>
      <el-form-item label="其他价格" :label-width="formLabelWidth" prop="elsePrice">
        <el-input placeholder="请输入其他价格" clearable v-model="purchase.elsePrice" />
      </el-form-item>
      <el-form-item label="备注" :label-width="formLabelWidth" prop="remark">
        <el-input placeholder="请输入备注" type="textarea" rows="4" clearable v-model="purchase.remark" />
      </el-form-item>
      <el-form-item label="所属小区" :label-width="formLabelWidth" prop="communityId">
        <el-select placeholder="选择小区" v-model="purchase.communityId" style="width: 100%">
          <el-option
            v-for="(item, index) in communityList"
            :key="index"
            :label="item.communityName"
            :value="item.communityId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="insertInform()">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="reasonModel" title="同意审核">
    <el-form :model="reasonValue" label-width="120px" style="width: 90%" ref="ruleFormRef">
      <el-form-item label="审核原因" :label-width="formLabelWidth" prop="reasonValue">
        <el-input placeholder="请输入审核原因" clearable v-model="reasonValue" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelReasonModel">取消</el-button>
        <el-button type="primary" @click="changeSatus()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  getPurchaseList,
  addPurchase,
  updatePurchase,
  deletePurchase,
  exportPurchase,
  changePurchase
} from '@/api/purchase'
import { getCommunityNameList } from '@/api/community'
import { ElMessage, ElMessageBox } from 'element-plus'
import purchaseList from './purchase'
// 采购记录对象
const purchase = ref({})

const account = ref('')
const communityId = ref('')
const stateList = ref([
  {
    value: '0',
    label: '申请中'
  },
  {
    value: '1',
    label: '已同意'
  },
  {
    value: '2',
    label: '已完成'
  },
  {
    value: '3',
    label: '已拒绝'
  }
])
// 数据相关
const tableData = ref([])
const search = ref('')
const state = ref('')
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 多选项
const multipleSelection = ref([])
// 请求首页广告列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    name: search.value,
    communityId: communityId.value,
    state: state.value,
    account: account.value
  }
  console.log(param)
  const result = await getPurchaseList(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)
  getCommunity()
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
// 导出
const exportNoti = () => {
  exportPurchase().then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '采购记录列表.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
// 请求社区列表
const communityList = ref({})
const getCommunity = async () => {
  const result = await getCommunityNameList()
  console.log(result.data)
  communityList.value = result.data
}

const addModel = ref(false)
// 新增弹框
const addInformModal = () => {
  addModel.value = !addModel.value
}
// 修改 填充值
const updateInformModel = (row) => {
  addModel.value = !addModel.value
  purchase.value = Object.assign({}, row)
}
// 取消
const cancelModel = () => {
  addModel.value = false
  inform.value = {}
  ruleFormRef.value.resetFields()
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入物品单价', trigger: 'blur' }],
  number: [{ required: true, message: '请输入物品数量', trigger: 'blur' }],
  communityId: [
    {
      required: true,
      message: '请选择所属小区',
      trigger: 'change'
    }
  ]
})

// 新增/修改采购记录提交请求
const insertInform = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log(purchase.value)
      if (purchase.value.id === undefined) {
        await addPurchase(purchase.value)
        ElMessage.success('采购记录新增成功')
      } else {
        console.log(purchase.value)
        await updatePurchase(purchase.value)
        ElMessage.success('采购记录修改成功')
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
    await deletePurchase(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
const deleteInform = (row) => {
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
    await deletePurchase(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

const reasonModel = ref(false)
const reasonValue = ref('')
const reasonObj = ref({})
const changeReason = (row, state) => {
  reasonModel.value = true
  reasonObj.value = {
    id: row.id,
    state: state
  }
}
const cancelReasonModel = () => {
  reasonModel.value = false
  reasonValue.value = ''
}
const changeSatus = async () => {
  const param = {
    reason: reasonValue.value,
    id: reasonObj.value.id,
    state: reasonObj.value.state
  }
  if (reasonValue.value === '') {
    ElMessage.warning('请输入审核原因')
    return
  }
  await changePurchase(param)
  ElMessage.success('审核成功')
  cancelReasonModel()
  getListData()
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
