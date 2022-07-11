<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="primary" v-if="isAuth(['ROOT', 'PROPERTY_FEE:INSERT'])" @click="addBillModule()"
          >添加物业费</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'PROPERTY_FEE:DELETE'])" @click="batchDel()">批量删除</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'PROPERTY_FEE:EXPORT'])" @click="exportBil()"
          >批量导出</el-button
        >
        <el-form-item style="margin-left: 20px">
          <el-input v-model="fName" class="w-50 m-2" clearable placeholder="请输入家庭名称" style="width: 290px">
            <template #prefix>
              <span><svg-icon icon="search" class="icon" /></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="类型" :label-width="formLabelWidth" prop="title" style="margin-left: 20px">
          <el-select placeholder="请选择物业费类型" v-model="tTile" clearable style="width: 180px">
            <el-option
              v-for="(item, index) in typeInfo"
              :key="index"
              :label="item.title"
              :value="item.title"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="缴费状态" prop="status">
          <el-select placeholder="请选择缴费状态" v-model="sStatus" clearable style="width: 170px">
            <el-option label="未支付" value="0" />
            <el-option label="已支付" value="1" />
          </el-select>
        </el-form-item>
        <el-button
          type="primary"
          :icon="Search"
          @click="getListData()"
          v-if="isAuth(['ROOT', 'PROPERTY_FEE:SELECT'])"
          style="margin-left: 10px"
          >搜索</el-button
        >
      </el-form>
    </el-row>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in propertyFee"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :height="item.height"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'status'">
          <el-tag v-if="row.status == 0" type="warning"> 未支付 </el-tag>
          <el-tag v-else> 已支付 </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center">
        <template #default="{ row }">
          {{ $filters.dateTimeFilter(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="success"
          size="mini"
          @click="updatebillModel(row)"
          v-if="isAuth(['ROOT', 'PROPERTY_FEE:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="deleteIntegrat(row)" v-if="isAuth(['ROOT', 'PROPERTY_FEE:DELETE'])"
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
  <el-dialog v-model="addModel" :title="bill.id == undifined ? '生成物业费账单' : '修改物业费账单'" width="40%">
    <el-form :model="bill" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="家庭名称" :label-width="formLabelWidth" prop="familyId">
        <el-select v-model="bill.familyId" placeholder="请选择家庭">
          <el-option v-for="(item, index) in familyInfo" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="物业费类型" :label-width="formLabelWidth" prop="typeId">
        <el-select v-model="bill.typeId" placeholder="物业费类型">
          <el-option v-for="(item, index) in typeInfo" :key="index" :label="item.title" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="金额" :label-width="formLabelWidth" prop="billAccount">
        <el-input placeholder="请输入物业费金额" clearable v-model="bill.billAccount" />
      </el-form-item>
      <el-form-item label="支付状态" prop="status">
        <el-radio-group v-model="bill.status">
          <el-radio label="0">未支付</el-radio>
          <el-radio label="1">已支付</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="addPropertyBill()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { getBill, selectAllType, selectAllFamily, addBill, updateBill, delBill, exportBill } from '@/api/propertyFee'
import propertyFee from './propertyFee'
import { getCurrentTime } from '@/utils/time'

// 物业费对象
const bill = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const BillModule = ref(false)
// 家庭名字
const fName = ref('')
// 物业费类型
const tTile = ref('')
// 物业费状态
const sStatus = ref('')

const typeInfo = ref([])
const familyInfo = ref([])
// 多选项
const multipleSelection = ref([])

const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    name: fName.value,
    title: tTile.value,
    status: sStatus.value
  }
  const result = await getBill(param)
  tableData.value = result.data
  total.value = result.total

  const AllType = await selectAllType()
  typeInfo.value = AllType.data

  const AllFamily = await selectAllFamily()
  familyInfo.value = AllFamily.data
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
const addBillModule = async () => {
  addModel.value = !addModel.value

  const AllType = await selectAllType()
  typeInfo.value = AllType.data

  const AllFamily = await selectAllFamily()
  familyInfo.value = AllFamily.data
}
// 修改填充值
const updatebillModel = (row) => {
  addModel.value = true
  bill.value = {
    id: row.id,
    familyId: row.familyId,
    typeId: row.typeId,
    billAccount: row.billAccount,
    status: row.status.toString()
  }
}
// 取消
const cancelModel = () => {
  addModel.value = false
  bill.value = {}
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({})
// 新增/修改通知提交请求
const addPropertyBill = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (bill.value.id === undefined) {
        // bill.value.status = Number(bill.value.status)
        console.log(bill.value)
        addBill(bill.value)
        ElMessage.success('物业费新增成功')
      } else {
        updateBill(bill.value)
        ElMessage.success('物业费修改成功')
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
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await delBill(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
const deleteIntegrat = (row) => {
  const param = {
    ids: [row.id]
  }
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await delBill(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 导出
const exportBil = () => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.id)
  })
  const param = {
    name: fName.value,
    title: tTile.value,
    status: sStatus.value,
    ids: selectIds.toString()
  }
  exportBill(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '物业费列表.xlsx' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
  selectIds.value = []
}
</script>
