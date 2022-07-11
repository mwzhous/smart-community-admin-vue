<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="primary" v-if="isAuth(['ROOT', 'COMMUNITY_SHOP:INSERT'])" @click="addGoodsModal()"
          >发布社区商城商品</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'COMMUNITY_SHOP:DELETE'])" @click="batchDel()"
          >批量删除</el-button
        >
        <el-form-item style="margin-left: 20px">
          <el-input v-model="names" class="w-50 m-2" clearable placeholder="请输入商品名" style="width: 290px">
            <template #prefix>
              <span><svg-icon icon="search" class="icon" /></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="类别" prop="tabName" style="margin-left: 20px">
          <el-select placeholder="请选择类别" v-model="tabs" clearable style="width: 190px">
            <el-option
              v-for="(item, index) in tabInfo"
              :key="index"
              :label="item.tabName"
              :value="item.tabId"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="所属店铺" :label-width="formLabelWidth" prop="shopName">
          <el-select v-model="shops" clearable placeholder="请选择所属店铺">
            <el-option v-for="(item, index) in shopInfo" :key="index" :label="item.name" :value="item.id"></el-option>
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
      <el-table-column
        v-for="(item, index) in communityshop"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'imgurl'">
          <el-image :preview-src-list="[row.imgurl]" :src="row.imgurl" width="60" />
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="success"
          size="small"
          @click="updateIntegrationModel(row)"
          v-if="isAuth(['ROOT', 'INTEGRAL:UPDATE'])"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="small"
          @click="deleteIntegrat(row)"
          v-if="isAuth(['ROOT', 'COMMUNITY_SHOP:DELETE'])"
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

  <el-dialog v-model="addModel" :title="integration.id == undifined ? '发布商城商品' : '修改商城商品'" width="40%">
    <el-form :model="integration" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="品名" :label-width="formLabelWidth" prop="name">
        <el-input placeholder="请输入品名" clearable v-model="integration.name" />
      </el-form-item>

      <el-form-item label="售量" :label-width="formLabelWidth" prop="sales">
        <el-input placeholder="请输入售量" clearable v-model="integration.sales" />
      </el-form-item>

      <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
        <el-input placeholder="请输入价格" clearable v-model="integration.price" />
      </el-form-item>

      <el-form-item label="所属类别" clearable :label-width="formLabelWidth" prop="tabId">
        <el-select v-model="integration.tabId" clearable placeholder="请选择所属类别">
          <el-option
            v-for="(item, index) in tabInfo"
            :key="index"
            :label="item.tabName"
            :value="item.tabId"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属店铺" clearable :label-width="formLabelWidth" prop="shopId">
        <el-select v-model="integration.shopId" clearable placeholder="请选择所属店铺">
          <el-option v-for="(item, index) in shopInfo" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="预览图" prop="imgurl">
        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
          <img v-if="integration.imgurl" :src="integration.imgurl" class="avatar" name="file" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="addgoods()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

import { getGoods, delGoods, addGoods, updateGoods, selectAllTab, selectAllShop } from '@/api/communityshop'
import { uploadEstate } from '@/api/estateTransaction'
import { ElMessage, ElMessageBox } from 'element-plus'
import { IMG_URL } from '@/constant'
import communityshop from './communityshop'
// 积分对象
const integration = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()

const shops = ref('')
const tabs = ref('')
const units = ref('')
const names = ref('')
const tabInfo = ref([])
const shopInfo = ref([])

// 多选项
const multipleSelection = ref([])
// 请求社区商城商品列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    name: names.value,
    shopId: shops.value,
    tabId: tabs.value
  }
  const result = await getGoods(param)
  tableData.value = result.data
  total.value = result.total

  console.log(tableData.value)

  const AllTab = await selectAllTab()
  tabInfo.value = AllTab.data

  const AllShop = await selectAllShop()
  shopInfo.value = AllShop.data
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
const addGoodsModal = async () => {
  addModel.value = !addModel.value

  const AllTab = await selectAllTab()
  tabInfo.value = AllTab.data
  console.log(tabInfo.value)

  const AllShop = await selectAllShop()
  shopInfo.value = AllShop.data

  console.log(shopInfo.value)
}
// 修改 填充值
const updateIntegrationModel = (row) => {
  addModel.value = !addModel.value
  integration.value = row
}
// 取消
const cancelModel = () => {
  addModel.value = false
  integration.value = {}
}

// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadEstate({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    integration.value.imgurl = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  name: [{ required: true, message: '请输入品名', trigger: 'blur' }],
  sales: [{ required: true, message: '请输入售量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  tabId: [{ required: true, message: '请选择所属类别', trigger: 'blur' }],
  shopId: [{ required: true, message: '请选择所属商店', trigger: 'blur' }],
  imgurl: [{ required: true, message: '请上传预览图', trigger: 'blur' }]
})

// 新增/修改通知提交请求
const addgoods = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      console.log(integration.value)
      if (integration.value.id === undefined) {
        console.log(integration.value)
        addGoods(integration.value)
        ElMessage.success('商品新增成功')
      } else {
        updateGoods(integration.value)
        ElMessage.success('商品修改成功')
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
    await delGoods(param)
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
    await delGoods(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
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
</style>
