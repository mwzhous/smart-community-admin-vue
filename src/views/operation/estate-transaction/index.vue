<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="primary" v-if="isAuth(['ROOT', 'ESTATE_TRANSACTION:INSERT'])" @click="addEstateStatus()"
          >发布房产信息</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'ESTATE_TRANSACTION:DELETE'])" @click="onRemoveClick()"
          >批量删除</el-button
        >
        <el-button type="success" v-if="isAuth(['ROOT', 'ADMIN:EXPORT'])" @click="exportAdminList">批量导出</el-button>

        <el-form-item label="搜索" style="margin-left: 20px">
          <el-input v-model="isTitle" class="w-50 m-2" placeholder="输入标题进行搜索">
            <template #prefix>
              <span><svg-icon icon="search" class="icon" /></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="所属小区" prop="name">
          <el-select placeholder="请选择所属小区" v-model="fromComm" clearable style="width: 170px">
            <el-option v-for="(item, index) in AllComm" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否售出" prop="state">
          <el-select placeholder="请选择是否售出" v-model="isSelled" clearable style="width: 170px">
            <el-option label="未售出" value="0" />
            <el-option label="已售出" value="1" />
          </el-select>
        </el-form-item>
        <el-button
          type="primary"
          :icon="Search"
          @click="getListData()"
          v-if="isAuth(['ROOT', 'ESTATE_TRANSACTION:SELECT'])"
          style="margin-left: 10px"
          >搜索</el-button
        >
      </el-form>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="title" label="标题" align="center" width="130" show-overflow-tooltip></el-table-column>
      <el-table-column prop="content" label="内容" align="center" width="160" show-overflow-tooltip></el-table-column>
      <el-table-column
        v-for="(item, index) in estateTransaction"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'imageUrl'">
          <el-image :preview-src-list="[row.imageUrl]" :src="row.imageUrl" width="160" height="45" />
        </template>

        <template #default="{ row }" v-else-if="item.prop == 'state'">
          <el-tag v-if="row.state == 1" type="warning"> 是 </el-tag>
          <el-tag v-else type="primary"> 否 </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" align="center" width="130">
        <template #default="{ row }"> ￥ {{ row.price }} </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center" width="160">
        <template #default="{ row }">
          {{ $filters.dateTimeFilter(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" #default="{ row }">
        <el-button
          type="warning"
          size="mini"
          v-if="isAuth(['ROOT', 'ESTATE_TRANSACTION:UPDATE'])"
          @click="clickupdateEstate(row)"
          >编辑</el-button
        >
        <el-button type="danger" size="mini" @click="deleteOne(row)">删除</el-button>
      </el-table-column>
    </el-table>

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

    <!--   新增房产信息 -->
    <el-dialog v-model="addEstateModule" title="发布房产信息" width="35%">
      <el-form :model="estate" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
          <el-input placeholder="请输入标题" clearable v-model="estate.title" />
        </el-form-item>

        <el-form-item label="内容" :label-width="formLabelWidth" prop="content">
          <el-input placeholder="请输入简介内容" clearable v-model="estate.content" />
        </el-form-item>

        <el-form-item label="联系人" :label-width="formLabelWidth" prop="contact">
          <el-input placeholder="请输入联系人姓名" clearable v-model="estate.contact" />
        </el-form-item>

        <el-form-item label="联系电话" :label-width="formLabelWidth" prop="phone">
          <el-input placeholder="请输入联系人电话" clearable v-model="estate.phone" />
        </el-form-item>

        <el-form-item label="地址" :label-width="formLabelWidth" prop="address">
          <el-input placeholder="请输入房产地址" clearable v-model="estate.address" />
        </el-form-item>

        <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
          <el-input placeholder="请输入房产价格" clearable v-model="estate.price" />
        </el-form-item>
        <el-form-item label="所属小区" prop="name">
          <el-select v-model="estate.communityId" placeholder="请选择所属小区" clearable style="width: 170px">
            <el-option v-for="(item, index) in AllComm" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="是否售出" prop="state">
          <el-radio-group v-model="estate.state">
            <el-radio label="0">否</el-radio>
            <el-radio label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="预览图" prop="imageUrl">
          <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
            <img v-if="estate.imageUrl" :src="estate.imageUrl" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addEstateModule = false">取消</el-button>
          <el-button type="primary" @click="insertEstate()">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改房产信息 -->
    <el-dialog v-model="showUpdate" title="房产信息编辑" width="50%">
      <el-form :model="onlyEstate" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
          <el-input placeholder="请输入标题" clearable v-model="onlyEstate.title" />
        </el-form-item>

        <el-form-item label="内容" :label-width="formLabelWidth" prop="content">
          <el-input type="textarea" :rows="4" clearable v-model="onlyEstate.content" />
        </el-form-item>

        <el-form-item label="联系人" :label-width="formLabelWidth" prop="contact">
          <el-input placeholder="请输入联系人姓名" clearable v-model="onlyEstate.contact" />
        </el-form-item>

        <el-form-item label="联系电话" :label-width="formLabelWidth" prop="phone">
          <el-input placeholder="请输入联系人电话" clearable v-model="onlyEstate.phone" />
        </el-form-item>

        <el-form-item label="地址" :label-width="formLabelWidth" prop="address">
          <el-input placeholder="请输入房产地址" clearable v-model="onlyEstate.address" />
        </el-form-item>

        <el-form-item label="价格" :label-width="formLabelWidth" prop="price" align="center">
          <el-input placeholder="请输入房产价格" clearable v-model="onlyEstate.price" />
        </el-form-item>

        <el-form-item label="是否售出" prop="state">
          <el-radio-group v-model="onlyEstate.state">
            <el-radio label="0">否</el-radio>
            <el-radio label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="预览图" prop="imageUrl">
          <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
            <img v-if="onlyEstate.imageUrl" :src="onlyEstate.imageUrl" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdate = false">取消</el-button>
          <el-button type="primary" @click="btnupdateEstate(onlyEstate)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import {
  getEstateTransaction,
  getEstateTransactionDetail,
  addEstate,
  uploadEstate,
  deleteEstate,
  updateEstate,
  selectAllComm,
  exportEstate
} from '@/api/estateTransaction'
import estateTransaction from './estateTransaction'
import { IMG_URL } from '@/constant'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCurrentTime } from '@/utils/time'
// 房产对象
const estate = ref({})
const onlyEstate = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()
const showDetail = ref(false)
const detailData = ref([])
const AllComm = ref([])

// 发布人
const issUser = ref('')
// 所属小区
const fromComm = ref('')
// 是否售出
const isSelled = ref('')
// 标题
const isTitle = ref('')
// 多选项
const multipleSelection = ref([])
// 请求首页房产信息列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    username: issUser.value,
    communityId: fromComm.value,
    state: isSelled.value,
    title: isTitle.value
  }

  const result = await getEstateTransaction(param)
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

// 查看房产详情
const openDetail = async (id) => {
  showDetail.value = true
  detailData.value = await getEstateTransactionDetail(id)
  console.log(detailData.value.data.content)
}

const addEstateModule = ref(false)
// 新增房产信息弹框
const addEstateStatus = () => {
  addEstateModule.value = !addEstateModule.value
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadEstate({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    estate.value.imageUrl = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}
// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入简介内容', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人信息', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系人电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入房产地址', trigger: 'blur' }],
  price: [{ required: true, message: '请输入房产价格', trigger: 'blur' }],
  name: [{ required: true, message: '请选择所属小区', trigger: 'blur' }],
  state: [
    {
      required: true,
      message: '请选择售卖状态',
      trigger: 'change'
    }
  ],
  imageUrl: [
    {
      required: true,
      message: '请上传房产预览图',
      trigger: 'change'
    }
  ]
})
const insertEstate = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      estate.value.imageUrl = IMG_URL + 'admin-api/' + fileName.value
      console.log(estate.value.imageUrl)
      addEstate(estate.value)
      addEstateModule.value = false
      ElMessage.success('房产信息新增成功')
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}
const deleteOne = (row) => {
  const param = {
    ids: [row.id]
  }
  console.log(row.id)
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await deleteEstate(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 批量删除数据
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const onRemoveClick = () => {
  let ids = []
  if (multipleSelection.value.length === 0) {
    ElMessage.error('还未选中要删除的项目')
    return
  }
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  console.log(ids)
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      const deleteResult = await deleteEstate(ids)
      console.log(deleteResult)
      ElMessage.success('删除成功')
      multipleSelection.value = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      multipleSelection.value = []
    })
}

const showUpdate = ref(false)
// 点击修改
const clickupdateEstate = (row) => {
  onlyEstate.value = {
    id: row.id,
    title: row.title,
    content: row.content,
    contact: row.contact,
    phone: row.phone,
    address: row.address,
    price: row.price,
    state: row.state.toString(),
    imageUrl: row.imageUrl.toString(),
    name: row.name.toString()
  }
  console.log(onlyEstate.value)
  showUpdate.value = !showUpdate.value
}
// 修改
const btnupdateEstate = () => {
  updateEstate(onlyEstate.value)
  ElMessage.success('修改成功')
  // 重新渲染数据
  showUpdate.value = !showUpdate.value
  getListData()
}

// 导出
const exportAdminList = () => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.id)
  })
  const param = {
    communityId: fromComm.value,
    state: isSelled.value,
    title: isTitle.value,
    ids: selectIds.toString()
  }
  exportEstate(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '房产交易信息列表' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
  selectIds.value = []
}
</script>

<style lang="scss" scoped>
.avatar-uploader {
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #8c939d;
  border-radius: 6px;
  cursor: pointer;
}
.avatar {
  width: 128px;
  height: 135px;
  border-radius: 6px;
  margin-top: 20px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-row {
  margin-bottom: 10px;
}
</style>
