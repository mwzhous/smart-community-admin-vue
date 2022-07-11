<template>
  <el-card class="mt-2">
    <el-form inline>
      <el-form-item label="优惠券名字：">
        <el-input v-model="search" class="w-50 m-2" placeholder="请输入名字">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="getListData()">搜索</el-button>
        <el-button type="primary" v-if="isAuth(['ROOT', 'DISCOUNT:INSERT'])" @click="addDiscountModal()"
          >新增优惠券</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'DISCOUNT:INSERT'])" @click="batchDel()">批量删除</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'DISCOUNT:EXPORT'])" @click="exportCou()">批量导出</el-button>
        <el-button type="warning" v-if="isAuth(['ROOT', 'DISCOUNT:IMPORT'])" @click="importModel()">批量导入</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in discountList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button type="warning" size="mini" @click="showUserModel(row)" v-if="isAuth(['ROOT', 'DISCOUNT:SENDUSER'])"
          >发放用户</el-button
        >
        <el-button
          type="success"
          size="mini"
          @click="updateDiscountModel(row)"
          v-if="isAuth(['ROOT', 'DISCOUNT:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="delDiscount(row)" v-if="isAuth(['ROOT', 'DISCOUNT:DELETE'])"
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

  <el-dialog v-model="addModel" :title="discount.id == undifined ? '新增优惠券' : '修改优惠券'" width="40%">
    <el-form :model="discount" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="满减金额" :label-width="formLabelWidth" prop="money">
        <el-input placeholder="请输入满减金额" clearable v-model="discount.money" />
      </el-form-item>
      <el-form-item label="用途" :label-width="formLabelWidth" prop="money">
        <el-input placeholder="请输入用途" clearable v-model="discount.purpose" />
      </el-form-item>
      <el-form-item label="名称" :label-width="formLabelWidth" prop="name">
        <el-input placeholder="请输入名称" clearable v-model="discount.name" />
      </el-form-item>
      <el-form-item label="可用天数" :label-width="formLabelWidth" prop="money">
        <el-input placeholder="请输入可用天数" clearable v-model="discount.days" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="insertDiscount()">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="userModel" title="发放优惠券" width="60%">
    <el-form inline>
      <el-form-item label="用户名：">
        <el-input v-model="username" class="w-50 m-2" placeholder="请输入用户名">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="getUserList()">搜索</el-button>
        <el-button type="danger" @click="batchUserDel()">批量删除</el-button>
        <el-button type="primary" @click="addUserModel()">新增用户</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableUserRef"
      :data="tableUserData"
      class="mt-1"
      border
      @selection-change="handleUserSelectionChange"
    >
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in userList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button type="danger" size="mini" @click="delUserDiscount(row)" v-if="isAuth(['ROOT', 'DISCOUNT:SENDUSERF'])"
          >删除</el-button
        >
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination mt-2 f-right mb-2"
      @size-change="handleUserSizeChange"
      @current-change="handleUserCurrentChange"
      :current-page="pageUser"
      :page-sizes="[5, 10, 50, 100, 200]"
      :page-size="sizeUser"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalUser"
    >
    </el-pagination>
    <template #footer>
      <div class="footer-confim"></div>
    </template>
  </el-dialog>

  <el-dialog v-model="addUserM" title="发放优惠券" width="60%">
    <el-form inline>
      <el-form-item label="用户名：">
        <el-input v-model="usernameNo" class="w-50 m-2" placeholder="请输入用户名">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="getNoUserList()">搜索</el-button>
        <el-button type="primary" @click="addNoUser()">新增用户</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableNoUserRef"
      :data="tableNoUserData"
      class="mt-1"
      border
      @selection-change="handleNoUserSelectionChange"
    >
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in userNoList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'gender'">
          <div v-if="row.gender == 0">保密</div>
          <div v-else-if="row.gender == 1">男</div>
          <div v-else>女</div>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'avatar'">
          <el-image style="width: 50px; height: 50px; border-radius: 50%" :src="row.avatar"></el-image>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'pushType'">
          <el-tag v-if="row.pushType == 0"> 发送全部 </el-tag>
          <el-tag v-else type="warning"> 不发送全部 </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination mt-2 f-right mb-2"
      @size-change="handleNoUserSizeChange"
      @current-change="handleNoUserCurrentChange"
      :current-page="pageNoUser"
      :page-sizes="[5, 10, 50, 100, 200]"
      :page-size="sizeNoUser"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalNoUser"
    >
    </el-pagination>
    <template #footer>
      <div class="footer-confim"></div>
    </template>
  </el-dialog>

  <el-dialog v-model="isImportModel" title="批量导入">
    <div class="import-container">
      <div class="left container">
        <div>1.下载模板，填写信息</div>
        <div>
          <el-button type="primary" size="small" style="margin-top: 10px"
            ><a :href="downUrl" target="_blank" :download="downNm">下载模板</a></el-button
          >
        </div>
      </div>
      <el-divider direction="vertical" style="height: 250px"></el-divider>
      <div class="right container">
        <div>2.上传文件</div>
        <el-upload
          drag
          style="margin-top: 10px"
          :limit="limitNum"
          :auto-upload="false"
          accept=".xlsx"
          :action="UploadUrl()"
          :before-upload="beforeUploadFile"
          :on-change="fileChange"
          :on-exceed="exceedFile"
          :on-success="handleSuccess"
          :on-error="handleError"
          :file-list="fileList1.value"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <br />
        <el-button size="small" type="primary" @click="uploadFile">立即上传</el-button>
        <el-button size="small" @click="cancelFile">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  getDiscount,
  deleteDiscount,
  addDiscount,
  updateDiscount,
  getUserDiscount,
  deleteUserDiscount,
  getUserNoDiscount,
  addUserDiscount,
  exportCoupon,
  importCoupon
} from '@/api/discount'
import { ElMessage, ElMessageBox } from 'element-plus'
import discountList from './discount'
import { userList, userNoList } from './user'
import { getCurrentTime, getAfterTime } from '@/utils/time'
// 通知对象
const discount = ref({})

// 数据相关
const tableData = ref([])
const search = ref('')
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
    name: search.value
  }
  const result = await getDiscount(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)
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
// 批量导出
const exportCou = () => {
  exportCoupon().then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '优惠券列表.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
// 批量导入
const isImportModel = ref(false)
const downUrl = 'http://106.14.169.149:9000/admin-api/%E4%BC%98%E6%83%A0%E5%88%B8%E6%A8%A1%E6%9D%BF.xlsx'
const downNm = '优惠券导入模板'
const limitNum = ref(1) // 允许上传的excel数量
const fileList1 = ref([]) // excel文件列表
const cancelFile = () => {
  isImportModel.value = true
}
// 文件超出个数限制时的钩子
const exceedFile = (files, fileList) => {
  ElMessage.warning(`只能选择 ${limitNum.value} 个文件，当前共选择了 ${files.length + fileList.length} 个`)
}
// 文件状态改变时的钩子
const fileChange = (file, fileList) => {
  console.log(fileList)
  fileList1.value = file.raw
  console.log(fileList1.value)
}
// 上传文件之前的钩子, 参数为上传的文件,若返回 false 或者返回 Promise 且被 reject，则停止上传
const beforeUploadFile = (file) => {
  console.log('before upload')
  console.log(file)
  const extension = file.name.substring(file.name.lastIndexOf('.') + 1)
  const size = file.size / 1024 / 1024
  if (extension !== 'xlsx') {
    ElMessage.warning('只能上传后缀是.xlsx的文件')
  }
  if (size > 10) {
    ElMessage.warning('文件大小不得超过10M')
  }
}
// 文件上传成功时的钩子
const handleSuccess = (res, file, fileList) => {
  ElMessage.success('文件上传成功')
}
// 文件上传失败时的钩子
const handleError = () => {
  ElMessage.error('文件上传失败')
}
const UploadUrl = () => {
  // 因为action参数是必填项，我们使用二次确认进行文件上传时，直接填上传文件的url会因为没有参数导致api报404，所以这里将action设置为一个返回为空的方法就行，避免抛错
  return ''
}
const uploadFile = () => {
  console.log(fileList1.value)
  if (fileList1.value.length === 0) {
    ElMessage.warning('请上传文件')
  } else {
    const form = new FormData()
    form.append('file', fileList1.value)
    importCoupon(form).then((res) => {
      ElMessage.success('导入成功')
      isImportModel.value = false
      getListData()
    })
  }
}

const importModel = () => {
  isImportModel.value = true
}

const addModel = ref(false)
// 新增弹框
const addDiscountModal = () => {
  addModel.value = !addModel.value
}

// 修改 填充值
const updateDiscountModel = (row) => {
  addModel.value = !addModel.value
  discount.value = Object.assign({}, row)
}
// 取消
const cancelModel = () => {
  addModel.value = false
  discount.value = {}
  ruleFormRef.value.resetFields()
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  money: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入用途', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  days: [{ required: true, message: '请输入可用天数', trigger: 'blur' }]
})
// 新增/修改优惠券提交请求
const insertDiscount = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (discount.value.id === undefined) {
        await addDiscount(discount.value)
        ElMessage.success('优惠券新增成功')
      } else {
        await updateDiscount(discount.value)
        ElMessage.success('优惠券修改成功')
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
    await deleteDiscount(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
const delDiscount = (row) => {
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
    await deleteDiscount(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 相关对象
const user = ref({})

// 数据相关
const tableUserData = ref([])
const username = ref('')
const totalUser = ref(0)
const pageUser = ref(1)
const sizeUser = ref(10)
// 多选项
const multipleUserSelection = ref([])
// 多选
const handleUserSelectionChange = (val) => {
  multipleUserSelection.value = val
}
const couponId = ref()
// 发放用户弹框
const userModel = ref(false)
const showUserModel = (row) => {
  userModel.value = true
  user.value = row
  couponId.value = row.id
  getUserList()
}

const getUserList = async () => {
  const param = {
    page: pageUser.value,
    size: sizeUser.value,
    couponId: couponId.value,
    username: username.value
  }
  console.log(param)
  const result = await getUserDiscount(param)
  tableUserData.value = result.data
  totalUser.value = result.total
}
// 分页请求
const handleUserSizeChange = (currentSize) => {
  sizeUser.value = currentSize
  getUserList()
}

const handleUserCurrentChange = (currentSize) => {
  pageUser.value = currentSize
  getUserList()
}

// 新增用户弹框
const addUserM = ref(false)
const addUserModel = () => {
  addUserM.value = true
  getNoUserList()
}
const batchUserDel = () => {
  if (multipleUserSelection.value.length === 0) {
    ElMessage.error('请至少选择一条数据')
    return
  }
  const ids = []
  multipleUserSelection.value.forEach((item) => {
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
    await deleteUserDiscount(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getUserList()
  })
}
const delUserDiscount = (row) => {
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
    await deleteUserDiscount(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getUserList()
  })
}

// 数据相关
const tableNoUserData = ref([])
const usernameNo = ref('')
const totalNoUser = ref(0)
const pageNoUser = ref(1)
const sizeNoUser = ref(10)
// 多选项
const multipleNoUserSelection = ref([])
// 多选
const handleNoUserSelectionChange = (val) => {
  multipleNoUserSelection.value = val
}

const getNoUserList = async () => {
  const param = {
    page: pageNoUser.value,
    size: sizeNoUser.value,
    couponId: couponId.value,
    username: usernameNo.value
  }
  const result = await getUserNoDiscount(param)
  tableNoUserData.value = result.data
  totalNoUser.value = result.total
}
// 分页请求
const handleNoUserSizeChange = (currentSize) => {
  sizeNoUser.value = currentSize
  getNoUserList()
}

const handleNoUserCurrentChange = (currentSize) => {
  pageNoUser.value = currentSize
  getNoUserList()
}

const addNoUser = async () => {
  if (multipleNoUserSelection.value.length === 0) {
    ElMessage.error('请至少选择一条数据')
    return
  }
  const param = []
  multipleNoUserSelection.value.forEach((item) => {
    param.push({ userId: item.id })
  })
  param.forEach((item) => {
    item.money = user.value.money
    item.purpose = user.value.purpose
    item.name = user.value.name
    item.startTime = getCurrentTime()
    item.endTime = getAfterTime(user.value.days)
    item.couponId = user.value.id
  })
  console.log(param)
  await addUserDiscount({
    couponList: param
  })
  ElMessage.success('添加成功')
  addUserM.value = false
  // 重新渲染数据
  getUserList()
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
.footer-confim {
  float: right;
  margin-top: 40px;
}
.import-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 300px;

  .right {
    height: 300px;
  }

  .container {
    width: 45%;
    text-align: center;
    a {
      color: #fff;
      text-decoration: none;
    }
  }
}
</style>
