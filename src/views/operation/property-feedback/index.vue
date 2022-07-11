<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="danger" v-if="isAuth(['ROOT', 'PROPERTY_FEEDBACK:DELETE'])" @click="batchDel()"
          >批量删除</el-button
        >
        <el-button type="success" v-if="isAuth(['ROOT', 'ADMIN:EXPORT'])" @click="exportAdminList">批量导出</el-button>

        <el-form-item label="回复状态" style="margin-left: 20px">
          <el-select placeholder="请选择回复状态" v-model="sStatus" clearable style="width: 170px">
            <el-option label="未回复" value="0" />
            <el-option label="已回复" value="1" />
          </el-select>
        </el-form-item>
        <el-button
          type="primary"
          :icon="Search"
          @click="getListData()"
          v-if="isAuth(['ROOT', 'PROPERTY_FEEDBACK:SELECT'])"
          style="margin-left: 10px"
          >搜索</el-button
        >
      </el-form>
    </el-row>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in complain"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :height="item.height"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'status'">
          <el-tag v-if="row.status == 0" type="warning"> 未回复 </el-tag>
          <el-tag v-else type="success"> 已回复 </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="投诉图片(点击预览全部)" align="center" width="180">
        <template v-slot="{ row }">
          <el-image
            :key="index"
            :src="row.complainImg[0]"
            :preview-src-list="row.complainImg"
            fit="cover"
            style="width: 55px; height: 55px; margin: 10px"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" width="200">
        <template #default="{ row }">
          {{ $filters.dateTimeFilter(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showEditAdvertise(row)"> 回复详情 </el-button>
          <el-button
            type="success"
            size="small"
            :disabled="row.status == 0 ? false : true"
            @click="updatebillModel(row)"
            v-if="isAuth(['ROOT', 'PROPERTY_FEEDBACK:UPDATE']) && multipleSelection.length == 0 && row.status == 0"
            >回复</el-button
          >
          <el-button
            type="success"
            size="small"
            :disabled="row.status == 0 ? false : true"
            @click="updatebillModel(row)"
            v-if="isAuth(['ROOT', 'PROPERTY_FEEDBACK:UPDATE']) && multipleSelection.length == 0 && row.status == 1"
            >已回复</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="deleteIntegrat(row)"
            v-if="isAuth(['ROOT', 'PROPERTY_FEEDBACK:DELETE'])"
            >删除</el-button
          >
        </template>
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
  <el-dialog v-model="addModel" :title="bill.id == undifined ? '回复' : '投诉建议回复'" width="40%">
    <el-form :model="bill" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item id="username" label="用户名" :label-width="formLabelWidth">
        <el-input :disabled="bill.username != undifined" v-model="bill.username" />
      </el-form-item>
      <el-form-item label="投诉内容" :label-width="formLabelWidth" prop="complainContent">
        <el-input :disabled="bill.complainContent != undifined" v-model="bill.complainContent" />
      </el-form-item>
      <el-form-item label="回复内容" :label-width="formLabelWidth" prop="complainResult">
        <el-input type="textarea" v-model="bill.complainResult" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="addPropertyBill()">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 投诉建议回复详情 -->
  <el-dialog v-model="repairModule" title="投诉建议回复详情" width="35%">
    <template v-if="complainResult == null">
      <el-empty description="暂无回复···请回复后查看" />
    </template>
    <template v-else>
      <el-form :model="bill" disabled label-width="120px">
        <el-form-item label="用户名">
          <el-input :disabled="bill.username" v-model="bill.username" />
        </el-form-item>
        <el-form-item label="投诉内容" :label-width="formLabelWidth">
          <el-input type="textarea" disabled v-model="bill.complainContent" />
        </el-form-item>
      </el-form>

      <el-form :model="complainResult" disabled label-width="120px">
        <el-form-item label="回复内容" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="complainResult.complainResult" />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeRepairModule()">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { getComplain, updateOrder, delBill, getResult, exportComplain } from '@/api/complain'
import complain from './complain'
import { getCurrentTime } from '@/utils/time'

// 投诉建议对象
const bill = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 回复状态
const sStatus = ref('')

// 多选项
const multipleSelection = ref([])

// 投诉建议回复对象
const complainResult = ref({})

// 回复投诉建议弹窗是否显示
const repairModule = ref(false)
// 关闭回复投诉建议弹窗
const closeRepairModule = (row) => {
  repairModule.value = false
}

const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    status: sStatus.value
  }
  const result = await getComplain(param)
  result.data = result.data.map((item) => {
    // 对banner图片数组处理
    // "[xxx.jpg, xxx.png,...]"
    item.complainImg = item.complainImg

      .substr(1)
      .substring(0, item.complainImg.length - 2)
      .split(',')
    return item
  })
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

const addModel = ref(false)

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

// 回复投诉建议
const addPropertyBill = () => {
  ruleFormRef.value.validate(async (valid) => {
    const data = {
      complainId: bill.value.id,
      complainResult: bill.value.complainResult,
      resultTime: bill.value.resultTime
    }
    if (valid) {
      updateOrder(data)
      ElMessage.success('回复成功')
      addModel.value = false
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
    getListData()
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

// 显示回复投诉建议弹窗并填充记录数据
const showEditAdvertise = async (row) => {
  // 根据repairId来获取记录数据
  const param = {
    complainId: row.id
  }
  // 获取投诉建议回复信息
  bill.value = row
  const result = await getResult(param)
  complainResult.value = result.data
  console.log(complainResult.value)
  // 显示回复投诉建议详情弹窗
  repairModule.value = true
  console.log(bill.value)
}

// 导出
const exportAdminList = () => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.id)
  })
  const param = {
    status: sStatus.value,
    ids: selectIds.toString()
  }
  exportComplain(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '物业投诉建议' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
  selectIds.value = []
}
</script>

<style lang="scss" scoped></style>
