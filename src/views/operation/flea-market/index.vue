<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="success" v-if="isAuth(['ROOT', 'ADMIN:EXPORT'])" @click="exportAdminList">批量导出</el-button>
        <el-button type="danger" v-if="isAuth(['ROOT', 'FLEA_MARKET:DELETE'])" @click="batchDel()">批量删除</el-button>
        <el-form-item style="margin-left: 20px">
          <el-input v-model="flName" class="w-50 m-2" clearable placeholder="请输入商品名" style="width: 290px">
            <template #prefix>
              <span><svg-icon icon="search" class="icon" /></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="发布人" :label-width="formLabelWidth" prop="username" style="margin-left: 20px">
          <el-select placeholder="请选择发布人" v-model="issUser" clearable style="width: 180px">
            <el-option
              v-for="(item, index) in userInfo"
              :key="index"
              :label="item.username"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属小区" :label-width="formLabelWidth" prop="cname">
          <el-select v-model="fromComm" placeholder="请选择所属小区" clearable style="width: 180px">
            <el-option v-for="(item, index) in commInfo" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="类型" prop="type" style="margin-left: 20px">
          <el-select placeholder="请选择类型" v-model="flType" clearable style="width: 150px">
            <el-option v-for="(item, index) in typeInfo" :key="index" :label="item.title" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否售出" prop="isSelled">
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

    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="name" label="品名" align="center" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="content" label="内容" align="center" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column
        v-for="(item, index) in fleamarket"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :height="item.height"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'state'">
          <el-tag v-if="row.state == 0" type="info"> 待审核 </el-tag>
          <el-tag v-if="row.state == 1" type="success"> 审核通过 </el-tag>
          <el-tag v-if="row.state == 2" type="warning"> 已下架 </el-tag>
          <el-tag v-if="row.state == 3" type="danger"> 审核拒绝 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'thumbnail'">
          <el-image :preview-src-list="[row.thumbnail]" :src="row.thumbnail" width="80" height="30" />
        </template>

        <template #default="{ row }" v-else-if="item.prop == 'isSelled'">
          <el-tag v-if="row.isSelled == 0" type="info"> 未售出 </el-tag>
          <el-tag v-if="row.isSelled == 1" type="success"> 已售出 </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" align="center" width="80">
        <template #default="{ row }"> ￥ {{ row.price }} </template>
      </el-table-column>

      <el-table-column prop="address" label="地址" align="center" width="100" show-overflow-tooltip></el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center">
        <template #default="{ row }">
          {{ $filters.dateTimeFilter(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="warning"
          size="mini"
          @click="updateIntegrationModel(row)"
          v-if="isAuth(['ROOT', 'INTEGRAL:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="deleteIntegrat(row)" v-if="isAuth(['ROOT', 'FLEA_MARKET:DELETE'])"
          >删除</el-button
        >
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
  </el-card>

  <!--  发布/修改跳蚤市场商品 -->
  <el-dialog
    v-model="addModel"
    :title="integration.id == undifined ? '发布跳蚤市场商品' : '修改跳蚤市场商品'"
    width="40%"
  >
    <el-form :model="integration" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="发布人姓名" :label-width="formLabelWidth" prop="username">
        <el-select v-model="integration.userId" placeholder="请选择发布人">
          <el-option v-for="(item, index) in userInfo" :key="index" :label="item.username" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属小区" :label-width="formLabelWidth" prop="cname">
        <el-select v-model="integration.communityId" placeholder="请选择所属小区">
          <el-option v-for="(item, index) in commInfo" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品类别" :label-width="formLabelWidth" prop="title">
        <el-select v-model="integration.typeId" placeholder="请选择商品类别">
          <el-option v-for="(item, index) in typeInfo" :key="index" :label="item.title" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="品名" :label-width="formLabelWidth" prop="name">
        <el-input placeholder="请输入品名" clearable v-model="integration.name" />
      </el-form-item>
      <el-form-item label="内容" :label-width="formLabelWidth" prop="content">
        <el-input placeholder="请输入内容" clearable v-model="integration.content" />
      </el-form-item>
      <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
        <el-input placeholder="请输入价格" clearable v-model="integration.price" />
      </el-form-item>
      <el-form-item label="地址" :label-width="formLabelWidth" prop="address">
        <el-input placeholder="请输入地址" clearable v-model="integration.address" />
      </el-form-item>
      <el-form-item label="联系电话" :label-width="formLabelWidth" prop="phone">
        <el-input placeholder="请输入联系电话" clearable v-model="integration.phone" />
      </el-form-item>
      <el-form-item label="预览图" prop="thumbnail">
        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
          <img v-if="integration.thumbnail" :src="integration.thumbnail" class="avatar" name="file" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-radio-group v-model="integration.state">
          <el-radio label="0">待审核</el-radio>
          <el-radio label="1">审核通过</el-radio>
          <el-radio label="2">下架</el-radio>
          <el-radio label="3">拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否售出" prop="isSelled">
        <el-radio-group v-model="integration.isSelled">
          <el-radio label="0">未售出</el-radio>
          <el-radio label="1">已售出</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="addfleamarket()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  getFleaMarket,
  delFleaMarket,
  addFleaMarket,
  updateFleaMarket,
  selectAllUser,
  selectAllComm,
  selectAllType,
  exportAdmin
} from '@/api/fleamarket'
import { uploadEstate } from '@/api/estateTransaction'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { IMG_URL } from '@/constant'
import fleamarket from './fleamarket'
import { getCurrentTime } from '@/utils/time'
// 跳蚤市场商品对象
const integration = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()
const userInfo = ref([])
const commInfo = ref([])
const typeInfo = ref([])
const AllUser = ref([])
const AllType = ref([])

// 商品名称
const flName = ref('')
// 发布人
const issUser = ref('')
// 商品类型
const flType = ref('')
// 所属小区
const fromComm = ref('')
// 是否售出
const isSelled = ref('')
// 多选项
const multipleSelection = ref([])
// 请求跳蚤市场商品
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    username: issUser.value,
    communityId: fromComm.value.toString(),
    name: flName.value,
    typeId: flType.value,
    isSelled: isSelled.value
  }

  const result = await getFleaMarket(param)

  tableData.value = result.data
  total.value = result.total

  const Alluser = await selectAllUser()
  userInfo.value = Alluser.data
  const AllComm = await selectAllComm()
  commInfo.value = AllComm.data
  const AllType = await selectAllType()
  typeInfo.value = AllType.data
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
const addfleamarketModal = async () => {
  addModel.value = !addModel.value
  const Alluser = await selectAllUser()
  userInfo.value = Alluser.data
  const AllComm = await selectAllComm()
  commInfo.value = AllComm.data
  const AllType = await selectAllType()
  typeInfo.value = AllType.data

  // console.log(typeInfo.value)
}
// 修改 填充值
const updateIntegrationModel = (row) => {
  addModel.value = true
  integration.value = {
    id: row.id,
    userId: row.userId,
    communityId: row.communityId,
    typeId: row.typeId,
    name: row.name,
    content: row.content,
    price: row.price,
    address: row.address,
    phone: row.phone,
    thumbnail: row.thumbnail,
    state: row.state.toString(),
    isSelled: row.isSelled.toString()
  }
}
// 取消
const cancelModel = () => {
  addModel.value = false
  integration.value = {}
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({})
// 新增/修改通知提交请求
const addfleamarket = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      console.log(integration.value)
      if (integration.value.id === undefined) {
        addFleaMarket(integration.value)
        ElMessage.success('新增成功')
      } else {
        updateFleaMarket(integration.value)
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
    await delFleaMarket(param)
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
    await delFleaMarket(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadEstate({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    integration.value.thumbnail = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}

// 导出
const exportAdminList = () => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.id)
  })
  const param = {
    name: flName.value,
    username: issUser.value,
    communityId: fromComm.value,
    typeId: flType.value,
    isSelled: isSelled.value,
    ids: selectIds.toString()
  }
  exportAdmin(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '跳蚤市场商品列表' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
  ElNotification({
    title: '导出成功',
    message: '导出成功,请查看下载列表!',
    type: 'success'
  })
  selectIds.value = []
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>

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
