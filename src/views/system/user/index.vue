<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="6">
        <el-input v-model="searchInfo" class="w-50 m-2" placeholder="模糊搜索用户名、地区" clearable>
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <!-- 条件筛选 -->
      <el-col :span="3"
        ><el-select v-model="gender" placeholder="性别" clearable>
          <el-option label="保密" value="2" />
          <el-option label="男" value="0" />
          <el-option label="女" value="1" /> </el-select
      ></el-col>
      <el-col :span="3">
        <el-select v-model="type" placeholder="用户类型" clearable>
          <el-option label="业主" value="0" />
          <el-option label="物业" value="1" />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="status" placeholder="状态" clearable>
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-col>
      <el-col :span="9"
        ><el-button type="primary" @click="getListData">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="success" v-if="isAuth(['ROOT', 'USER:EXPORT'])" @click="exportUserList"
          >导出用户数据</el-button
        ></el-col
      >
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in user"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'type'">
          <el-tag v-if="row.type == 1" type="warning"> 物业 </el-tag>
          <el-tag v-else-if="row.type == 0" type="primary"> 业主 </el-tag>
          <el-tag v-else type="info"> 无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'status'">
          <el-tag v-if="row.status == 1" type="success"> 启用 </el-tag>
          <el-tag v-else-if="row.status == 0" type="danger"> 禁用 </el-tag>
          <el-tag v-else type="info"> 无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'githubAccount'">
          <el-tag v-if="row.githubAccount == null" type="info"> 暂无 </el-tag>
          <el-tag v-if="row.githubAccount != null" effect="plain">{{ row.githubAccount }}</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'ddAccount'">
          <el-tag v-if="row.ddAccount == null" type="info"> 暂无 </el-tag>
          <el-tag v-if="row.ddAccount != null" effect="plain">{{ row.ddAccount }}</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'avatar'">
          <el-avatar v-if="row.avatar != null" :src="row.avatar" :size="60" :fit="cover" />
          <el-tag v-if="row.avatar == null" type="info"> 暂无头像 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'gender'">
          <el-tag v-if="row.gender == 0" type="primary"> 男 </el-tag>
          <el-tag v-else-if="row.gender == 1" type="danger"> 女 </el-tag>
          <el-tag v-else-if="row.gender == 2" type="success"> 保密 </el-tag>
          <el-tag v-else type="info"> 无 </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" #default="{ row }" width="220">
        <el-button type="success" size="mini" v-if="isAuth(['ROOT', 'USER:SELECT'])" @click="onDetailClick(row)"
          >详情</el-button
        >
        <el-button type="warning" size="mini" v-if="isAuth(['ROOT', 'USER:UPDATE'])" @click="onUpdateClick(row)"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="mini"
          v-if="isAuth(['ROOT', 'USER:UPDATE'])"
          @click="banUserById(row.id)"
          v-show="row.status == 1"
          >禁用</el-button
        >
        <el-button
          type="success"
          size="mini"
          v-if="isAuth(['ROOT', 'USER:UPDATE'])"
          @click="enableUserById(row.id)"
          v-show="row.status == 0"
          >启用</el-button
        >
      </el-table-column>
    </el-table>

    <!-- 修改楼栋弹出层 -->
    <el-dialog v-model="updateFormVisible" title="修改用户" width="50%">
      <el-form :model="updateForm" label-width="120px" :rules="updateRules" ref="updateRuleFormRef">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="updateForm.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="账号" :label-width="formLabelWidth" prop="account">
          <el-input v-model="updateForm.account" autocomplete="off" />
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="phone">
          <el-input v-model="updateForm.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth" prop="type">
          <el-radio-group v-model.number="updateForm.gender">
            <el-radio :label="0">男</el-radio>
            <el-radio :label="1">女</el-radio>
            <el-radio :label="2">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地区" :label-width="formLabelWidth" prop="area">
          <el-input v-model="updateForm.area" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="账号类型" :label-width="formLabelWidth" prop="type">
          <el-radio-group v-model.number="updateForm.type">
            <el-radio :label="0">业主</el-radio>
            <el-radio :label="1">物业</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账号状态" :label-width="formLabelWidth" prop="status">
          <el-radio-group v-model.number="updateForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateUserInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户详情弹窗弹窗 -->
    <el-dialog v-model="showDetailDialog" width="45%">
      <el-col><h2>用户基础信息</h2></el-col><br />
      <el-descriptions class="margin-top" :column="3" :size="large" border>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <User />
              </el-icon>
              用户名
            </div>
          </template>
          {{ userDetailRow.username }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <iphone />
              </el-icon>
              手机号
            </div>
          </template>
          {{ userDetailRow.phone }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <location />
              </el-icon>
              地区
            </div>
          </template>
          {{ userDetailRow.area }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <ForkSpoon />
              </el-icon>
              性别
            </div>
          </template>
          <el-tag v-if="userDetailRow.gender == 0" type="primary">男</el-tag>
          <el-tag v-else-if="userDetailRow.gender == 1" type="danger">女</el-tag>
          <el-tag v-else-if="userDetailRow.gender == 2" type="success">保密</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <office-building />
              </el-icon>
              住址
            </div>
          </template>
          {{ userDetailRoom.roomLocation }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Grid />
              </el-icon>
              民族
            </div>
          </template>
          {{ userDetailRoom.national }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Burger />
              </el-icon>
              籍贯
            </div>
          </template>
          {{ userDetailRoom.nativePlace }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Guide />
              </el-icon>
              身份证号
            </div>
          </template>
          {{ userDetailRoom.idNumber }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Management />
              </el-icon>
              家庭名称
            </div>
          </template>
          {{ userDetailFamily.familyName }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Avatar />
              </el-icon>
              昵称
            </div>
          </template>
          {{ userDetailFamily.familyNickName }}
        </el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-col><h2>社区交流信息</h2></el-col><br />
      <el-descriptions class="margin-top" :column="3" :size="large" border>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Connection />
              </el-icon>
              github账号
            </div>
          </template>
          <el-tag v-if="userDetailRow.githubAccount == null" type="info">暂无</el-tag>
          <el-tag v-else type="primary">{{ userDetailRow.githubAccount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Link />
              </el-icon>
              钉钉账号
            </div>
          </template>
          <el-tag v-if="userDetailRow.ddAccount == null" type="info">暂无</el-tag>
          <el-tag v-else type="primary">{{ userDetailRow.ddAccount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <ChatDotRound />
              </el-icon>
              广场发帖
            </div>
          </template>
          {{ userDetailCommunication.squareCount }} 条
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <Coin />
              </el-icon>
              拥有优惠券
            </div>
          </template>
          {{ userDetailCommunication.squareCount }} 条
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon :style="iconStyle">
                <ChatDotSquare />
              </el-icon>
              互动交流
            </div>
          </template>
          {{ userDetailCommunication.squareCount }} 条
        </el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-col><h2>用户车位信息</h2></el-col><br />
      <el-table :data="userDetailCar" border style="width: 100%" class="margin-top">
        <el-table-column prop="section" label="区号" width="180" />
        <el-table-column prop="carportId" label="车位编号" width="180" />
      </el-table>
    </el-dialog>

    <div class="bottom">
      <el-row align="middle" justify="space-between">
        <el-col :span="1"> </el-col>
        <el-col :span="8.9">
          <el-pagination
            class="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page"
            :page-sizes="[2, 5, 10, 20]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import user from './user.js'
import { ElMessage } from 'element-plus'
import { getUserList, updateUser, banUser, enableUser, exportUser, getUserDetailById } from '@/api/user'
import { getCurrentTime } from '@/utils/time'
// 数据相关
const tableData = reactive([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const updateFormVisible = ref(false)
const formLabelWidth = '140px'
// 多选
const multipleSelection = ref([])
// 用户详情弹出控制
const showDetailDialog = ref(false)
// 用户行数据
const userDetailRow = ref()
// 用户详细数据-房间
const userDetailRoom = ref()
// 用户详细数据-车辆
const userDetailCar = ref()
// 用户详细数据-家庭
const userDetailFamily = ref()
// 用户详细数据-社区交流
const userDetailCommunication = ref()
// 搜索框
const searchInfo = ref(null)
const gender = ref(null)
const status = ref(null)
const type = ref(null)
// 更新用户信息表单
const updateForm = ref({})
// 文本框校验规则
const updateRuleFormRef = ref(null)
const updateRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  phone: [
    {
      required: true,
      message: '请输入手机号'
    },
    {
      pattern: /^[1][3-9][0-9]{9}$/,
      trigger: ['blur'],
      message: '请输入正确的手机号'
    }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
  area: [{ required: false }],
  type: [{ required: true, message: '请选择账号类型', trigger: 'blur' }],
  status: [{ required: true, message: '请选择账号状态', trigger: 'blur' }]
})
// 请求用户列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    gender: gender.value,
    type: type.value,
    status: status.value
  }
  const result = await getUserList(param)

  tableData.value = result.data
  total.value = result.total
}
// 获取用户列表数据
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

// 点击修改事件
const onUpdateClick = (val) => {
  updateFormVisible.value = !updateFormVisible.value
  // console.log(val)
  updateForm.value = {
    id: val.id,
    username: val.username,
    account: val.account,
    phone: val.phone,
    gender: val.gender,
    area: val.area,
    type: val.type,
    status: val.status
  }
  // console.log(updateForm)
}
// 修改用户信息
const updateUserInfo = () => {
  updateRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      const userInfo = updateForm.value
      await updateUser(userInfo)
      updateFormVisible.value = false
      ElMessage.success('修改成功')
      getListData()
      updateRuleFormRef.value.resetFields()
    }
  })
}

// 禁用用户
const banUserById = async (id) => {
  const banUserId = id
  await banUser(banUserId)
  ElMessage.success('禁用成功')
  getListData()
}

// 启用用户
const enableUserById = async (id) => {
  const enabelUserId = id
  await enableUser(enabelUserId)
  ElMessage.success('启用成功')
  getListData()
}

// 多选框选中事件
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 批量导出
const exportUserList = () => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.id)
  })
  const param = {
    info: searchInfo.value,
    gender: gender.value,
    type: type.value,
    status: status.value,
    ids: selectIds.toString()
  }
  console.log(param)
  exportUser(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    console.log(res)
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '用户列表' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
  selectIds.value = []
}
const clear = () => {
  userDetailRow.value = null
  userDetailRoom.value = null
  userDetailCar.value = null
  userDetailFamily.value = null
  userDetailCommunication.value = null
}
// 显示用户详情
const onDetailClick = async (val) => {
  clear()
  // console.log(val)
  const info = {
    id: val.id
  }
  const result = await getUserDetailById(info)
  console.log(result.data)
  userDetailRow.value = val
  userDetailRoom.value = result.data.rooms[0]
  userDetailCar.value = result.data.cars
  userDetailFamily.value = result.data.family[0]
  userDetailCommunication.value = {
    squareCount: result.data.squareCount,
    couponCount: result.data.couponCount,
    interactCount: result.data.interactCount
  }
  showDetailDialog.value = true
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
  font-size: 20px;
}
.el-descriptions {
  margin-top: 20px;
}
.cell-item {
  display: flex;
  align-items: center;
}
.margin-top {
  margin-top: 30px;
}
</style>
