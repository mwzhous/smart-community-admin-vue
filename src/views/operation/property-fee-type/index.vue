<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="primary" v-if="isAuth(['ROOT', 'PROPERTY_FEE_TYPE:INSERT'])" @click="addBillModule()"
          >新增物业费类型</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'PROPERTY_FEE_TYPE:DELETE'])" @click="batchDel()"
          >批量删除</el-button
        >
        <el-form-item style="margin-left: 20px">
          <el-input v-model="tTile" class="w-50 m-2" clearable placeholder="类型搜索" style="width: 290px">
            <template #prefix>
              <span><svg-icon icon="search" class="icon" /></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="所属小区" style="margin-left: 20px">
          <el-select placeholder="请选择所属小区" v-model="cName" clearable style="width: 180px">
            <el-option v-for="(item, index) in AllComm" :key="index" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>

        <el-button
          type="primary"
          :icon="Search"
          @click="getListData()"
          v-if="isAuth(['ROOT', 'PROPERTY_FEE_TYPE:SELECT'])"
          style="margin-left: 10px"
          >搜索</el-button
        >
      </el-form>
    </el-row>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in propertyFeeType"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :height="item.height"
        align="center"
      >
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="success"
          size="mini"
          @click="updatebillModel(row)"
          v-if="isAuth(['ROOT', 'PROPERTY_FEE_TYPE:UPDATE'])"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="mini"
          @click="deleteIntegrat(row)"
          v-if="isAuth(['ROOT', 'PROPERTY_FEE_TYPE:DELETE'])"
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

  <el-dialog v-model="addModel" :title="bill.id == undifined ? '添加物业费类型' : '修改物业费类型'" width="40%">
    <el-form :model="bill" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="小区名称" :label-width="formLabelWidth" prop="familyId">
        <el-select v-model="bill.communityId" placeholder="请选择小区名称">
          <el-option v-for="(item, index) in typeInfo" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="物业费类型" :label-width="formLabelWidth" prop="title">
        <el-input placeholder="请输入物业费类型" clearable v-model="bill.title" />
      </el-form-item>
      <el-form-item label="金额" :label-width="formLabelWidth" prop="des">
        <el-input placeholder="请输入物业费类型描述" clearable v-model="bill.des" />
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
import { getBillType, selectAllComm, addBill, updateBill, delBill } from '@/api/propertyfeetype'
import propertyFeeType from './propertyFeeType'

// 物业费类型对象
const bill = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 小区名称
const cName = ref('')
// 物业费类型
const tTile = ref('')

const AllComm = ref([])
const typeInfo = ref([])
// 多选项
const multipleSelection = ref([])
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    name: cName.value,
    title: tTile.value
  }
  const result = await getBillType(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)

  const commInfo = await selectAllComm()
  AllComm.value = commInfo.data
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

  const AllComm = await selectAllComm()
  typeInfo.value = AllComm.data
}
// 修改填充值
const updatebillModel = (row) => {
  addModel.value = !addModel.value
  bill.value = row
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
        addBill(bill.value)
        ElMessage.success('新增成功')
      } else {
        updateBill(bill.value)
        ElMessage.success('修改成功')
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
</script>
