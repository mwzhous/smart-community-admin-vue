<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button
          type="info"
          :icon="Search"
          @click="getListData()"
          v-if="isAuth(['ROOT', 'ORDER:SELECT'])"
          style="margin-left: 10px"
          >搜索</el-button
        >
        <el-button type="success" v-if="isAuth(['ROOT', 'ORDER:EXPORT'])" @click="exportCou()">批量导出</el-button>
        <el-form-item label="所属商店" style="margin-left: 20px">
          <el-select placeholder="请选择商店" v-model="sName" clearable style="width: 180px">
            <el-option v-for="(item, index) in AllComm" :key="index" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账单状态" prop="status">
          <el-select placeholder="请选择缴费状态" v-model="sStatus" clearable style="width: 170px">
            <el-option label="未处理" value="1" />
            <el-option label="处理中" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已取消" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-row>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in order"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :height="item.height"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'status'">
          <el-tag v-if="row.status == 1" type="info"> 未处理 </el-tag>
          <el-tag v-if="row.status == 2" type="primary"> 处理中 </el-tag>
          <el-tag v-if="row.status == 3" type="success"> 已完成 </el-tag>
          <el-tag v-if="row.status == 4" type="warning"> 已取消 </el-tag>
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button type="warning" size="mini" @click="updatebillModel(row)" v-if="isAuth(['ROOT', 'ORDER:UPDATE'])"
          >修改</el-button
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
  <el-dialog v-model="addModel" :title="bill.id == undifined ? '修改账单' : '修改账单'" width="50%">
    <el-form :model="bill" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="订单号" :label-width="formLabelWidth" prop="orderId">
        <el-input :disabled="bill.orderId != undifined" v-model="bill.orderId" />
      </el-form-item>
      <el-form-item label="商店名称" :label-width="formLabelWidth" prop="shopName">
        <el-input :disabled="bill.shopName != undifined" v-model="bill.shopName" />
      </el-form-item>
      <el-form-item label="品名" :label-width="formLabelWidth" prop="name">
        <el-input :disabled="bill.name != undifined" v-model="bill.name" />
      </el-form-item>
      <el-form-item label="金额" :label-width="formLabelWidth" prop="price">
        <el-input :disabled="bill.price != undifined" v-model="bill.price" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="bill.status">
          <el-radio label="1">未处理</el-radio>
          <el-radio label="2">处理中</el-radio>
          <el-radio label="3">已完成</el-radio>
          <el-radio label="4">已取消</el-radio>
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrder, selectAllShop, updateOrder, exportCoupon } from '@/api/order'
import order from './order'

// 账单对象
const bill = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 商店名称
const sName = ref('')
const AllComm = ref([])
const sStatus = ref('')

const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    shopName: sName.value,
    status: sStatus.value
  }
  const result = await getOrder(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)

  const commInfo = await selectAllShop()
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

// 修改填充值
const updatebillModel = (row) => {
  addModel.value = true
  bill.value = {
    id: row.id,
    orderId: row.orderId,
    shopName: row.shopName,
    name: row.name,
    price: row.price,
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
      console.log(bill.value)
      bill.value.status = Number(bill.value.status)
      updateOrder(bill.value)
      ElMessage.success('修改成功')
      addModel.value = false
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}

// 批量导出
const exportCou = () => {
  exportCoupon().then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '账单列表.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
</script>

<style lang="scss" scoped></style>
