<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="6" class="my-2">
        <el-input
          v-model="searchInfo"
          placeholder="管理员姓名、昵称、用户名、手机号"
          v-if="isAuth(['ROOT', 'ADMIN:SELECT'])"
          clearable
        >
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <!-- 条件筛选 -->
      <el-col :span="3"
        ><el-select v-model="gender" placeholder="性别" clearable>
          <el-option label="男" value="男" />
          <el-option label="女" value="女" /> </el-select
      ></el-col>
      <el-col :span="3"
        ><el-select v-model="role" placeholder="角色" clearable>
          <el-option
            v-for="(item, index) in roleNameList"
            :key="index"
            :label="item.roleName"
            :value="item.roleId"
          /> </el-select
      ></el-col>
      <el-col :span="3"
        ><el-select v-model="status" placeholder="状态" clearable>
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" /> </el-select
      ></el-col>
      <el-col :span="9"
        ><el-button type="primary" @click="getListData" v-if="isAuth(['ROOT', 'ADMIN:SELECT'])">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="primary" v-if="isAuth(['ROOT', 'ADMIN:INSERT'])" @click="addAdminStatus">新增管理员</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'ADMIN:EXPORT'])" @click="exportAdminList">批量导出</el-button>
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in admin"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'status'">
          <el-tag v-if="row.status == 1" type="success"> 启用 </el-tag>
          <el-tag v-else-if="row.status == 0" type="danger"> 禁用 </el-tag>
          <el-tag v-else type="info"> 无 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'avatar'">
          <el-avatar v-if="row.avatar != null" :src="row.avatar" :size="60" :fit="cover" />
          <el-tag v-if="row.avatar == null" type="info" size="mini"> 暂无头像 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'gender'">
          <el-tag v-if="row.gender == '男'" type="primary"> 男 </el-tag>
          <el-tag v-else-if="row.gender == '女'" type="danger"> 女 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'communityId'">
          <el-tag v-if="row.communityId === 0" type="success"> 超级管理员 </el-tag>
          <el-tag v-else type="primary"> {{ row.communityName }} </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'role'">
          <el-tag v-for="(item, index) in row.roleNameVOList" :key="index" type="info" size="mini">
            {{ item.roleName }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" #default="{ row }" width="160">
        <el-button type="warning" size="mini" v-if="isAuth(['ROOT', 'ADMIN:UPDATE'])" @click="onUpdateClick(row)"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="mini"
          v-if="isAuth(['ROOT', 'ADMIN:UPDATE'])"
          @click="banAdminById(row.id)"
          v-show="row.status == 1"
          :disabled="row.root == 1"
          >禁用</el-button
        >
        <el-button
          type="success"
          size="mini"
          v-if="isAuth(['ROOT', 'ADMIN:UPDATE'])"
          @click="enableAdminById(row.id)"
          v-show="row.status == 0"
          >启用</el-button
        >
      </el-table-column>
    </el-table>

    <!-- 新增管理员弹出层 -->
    <el-dialog v-model="addFormVisible" title="新增管理员" width="50%">
      <el-form :model="addForm" :label-width="formLabelWidth" :rules="addRules" ref="addRuleFormRef">
        <el-form-item label="管理员姓名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="addForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="addForm.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="addForm.password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="昵称" :label-width="formLabelWidth" prop="nickname">
          <el-input v-model="addForm.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth" prop="gender">
          <el-radio-group v-model="addForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="phone">
          <el-input v-model="addForm.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="addForm.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色" :label-width="formLabelWidth" prop="role">
          <el-select v-model="addForm.role" placeholder="角色" multiple>
            <el-option
              v-for="(item, index) in roleNameList"
              :key="index"
              :label="item.roleName"
              :value="item.roleId"
              :disabled="item.roleId === 1"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属社区" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="addForm.communityId" placeholder="请选择所属社区">
            <el-option
              v-for="(item, index) in communityName"
              :key="index"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
            <el-icon v-if="avatarUrl == null" class="avatar-uploader-icon"><Plus /></el-icon>
            <img v-else :src="avatarUrl" class="avatar" name="file" />
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="部门" :label-width="formLabelWidth" prop="deptId">
          <el-input v-model="addForm.deptId" autocomplete="off" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancleAddAdmin">取消</el-button>
          <el-button type="primary" @click="addAdminInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改管理员弹出层 -->
    <el-dialog v-model="updateFormVisible" title="修改管理员" width="50%">
      <el-form :model="updateForm" :label-width="formLabelWidth" :rules="updateRules" ref="updateRuleFormRef">
        <el-form-item label="管理员姓名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="updateForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="updateForm.username" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="updateForm.password" placeholder="请输入新密码，若无需修改则无需输入" autocomplete="off" />
        </el-form-item>
        <el-form-item label="昵称" :label-width="formLabelWidth" prop="nickname">
          <el-input v-model="updateForm.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth" prop="gender">
          <el-radio-group v-model="updateForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="phone">
          <el-input v-model="updateForm.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="updateForm.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色" :label-width="formLabelWidth" prop="role">
          <el-select v-model="updateForm.role" placeholder="角色" multiple>
            <el-option
              v-for="(item, index) in roleNameList"
              :key="index"
              :label="item.roleName"
              :value="item.roleId"
              :disabled="item.roleId === 1"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属社区" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="updateForm.communityId">
            <el-option
              v-for="(item, index) in communityName"
              :key="index"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
            <el-icon v-if="avatarUrl == null" class="avatar-uploader-icon"><Plus /></el-icon>
            <img v-else :src="avatarUrl" class="avatar" name="file" />
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="部门" :label-width="formLabelWidth" prop="deptId">
          <el-input v-model="addForm.deptId" autocomplete="off" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancleUpdateAdmin">取消</el-button>
          <el-button type="primary" @click="updateAdminInfo">确定</el-button>
        </span>
      </template>
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
import admin from './admin.js'
import { IMG_URL } from '@/constant'
import { ElMessage } from 'element-plus'
import { getAdminList, banAdmin, enableAdmin, addAdmin, uploadAdminAvatar, updateAdmin, exportAdmin } from '@/api/admin'
import { getAllRoleName } from '@/api/role'
import { getCommunityNameList } from '@/api/community'
import { getCurrentTime } from '@/utils/time'

// 数据相关
const tableData = reactive([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 表单label宽度
const formLabelWidth = '140px'
// 多选
const multipleSelection = ref([])
// 搜索区
const searchInfo = ref('')
const gender = ref(null)
const status = ref(null)
const role = ref(null)
// 新增表单显示
const addFormVisible = ref(false)
// 修改表单显示
const updateFormVisible = ref(false)
// 新增表单
const addForm = reactive({})
// 更新表单
const updateForm = reactive({})
// 文本框校验规则
const addRuleFormRef = ref(null)
const updateRuleFormRef = ref(null)
// 头像上传回调链接
const avatarUrl = ref()
const fileName = ref()
// 角色列表
const roleNameList = ref([])
// 社区列表
const communityName = ref([])
// 请求管理员列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    gender: gender.value,
    status: status.value,
    role: role.value
  }
  // console.log(param)
  const result = await getAdminList(param)

  tableData.value = result.data
  total.value = result.total
}
// 获取管理员列表数据
getListData()
// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityName.value = result.data
}
// 获取社区列表
getCommunityList()
// 分页请求
const handleSizeChange = (currentSize) => {
  size.value = currentSize
  getListData()
}

const handleCurrentChange = (currentSize) => {
  page.value = currentSize
  getListData()
}

// 禁用管理员
const banAdminById = async (id) => {
  const banAdminId = id
  await banAdmin(banAdminId)
  ElMessage.success('禁用成功')
  getListData()
}

// 启用管理员
const enableAdminById = async (id) => {
  const enabelAdminId = id
  await enableAdmin(enabelAdminId)
  ElMessage.success('启用成功')
  getListData()
}

// 查询所有角色id&name
const getRoleName = async () => {
  const result = await getAllRoleName()
  roleNameList.value = result.data
  // console.log(roleNameList)
}
getRoleName()
// 新建管理员弹窗
const addAdminStatus = () => {
  avatarUrl.value = null
  addFormVisible.value = !addFormVisible.value
  getRoleName()
}

// 新增管理员表单确认事件
const addAdminInfo = () => {
  const adminForm = {
    username: addForm.username,
    password: addForm.password,
    nickname: addForm.nickname,
    name: addForm.name,
    gender: addForm.gender,
    phone: addForm.phone,
    email: addForm.email,
    avatar: avatarUrl.value,
    role: addForm.role,
    communityId: addForm.communityId
  }
  // console.log(addForm)
  addRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addAdmin(adminForm)
      addFormVisible.value = false
      ElMessage.success('新增成功')
      getListData()
      addRuleFormRef.value.resetFields()
    }
  })
  avatarUrl.value = null
  // console.log(buildingForm)
}
// 新建管理员表单取消事件
const cancleAddAdmin = () => {
  addFormVisible.value = false
  avatarUrl.value = null
  addRuleFormRef.value.resetFields()
}

// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadAdminAvatar({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    avatarUrl.value = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
    // console.log(avatarUrl.value)
  }
}

// 管理员修改点击事件
const onUpdateClick = (val) => {
  updateFormVisible.value = !updateFormVisible.value
  updateForm.username = val.username
  updateForm.nickname = val.nickname
  updateForm.name = val.name
  updateForm.gender = val.gender
  updateForm.phone = val.phone
  updateForm.email = val.email
  avatarUrl.value = val.avatar
  updateForm.role = val.role
  updateForm.id = val.id
  updateForm.communityId = val.communityId
}
// 修改管理员
const updateAdminInfo = async () => {
  const updateInfo = {
    id: updateForm.id,
    name: updateForm.name,
    nickname: updateForm.nickname,
    gender: updateForm.gender,
    phone: updateForm.phone,
    email: updateForm.email,
    role: updateForm.role,
    avatar: avatarUrl.value,
    password: updateForm.password,
    communityId: updateForm.communityId
  }
  // console.log(updateInfo)
  updateRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateAdmin(updateInfo)
      getListData()
      updateFormVisible.value = !updateFormVisible.value
      updateRuleFormRef.value.resetFields()
      ElMessage.success('修改成功')
    }
  })
}
// 修改管理员表单取消事件
const cancleUpdateAdmin = () => {
  updateFormVisible.value = false
  avatarUrl.value = null
  updateRuleFormRef.value.resetFields()
}

// 多选框触发事件
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 导出
const exportAdminList = () => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.id)
  })
  const param = {
    info: searchInfo.value,
    gender: gender.value,
    status: status.value,
    role: role.value,
    ids: selectIds.toString()
  }
  exportAdmin(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '管理员列表' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
  selectIds.value = []
}

// 新增管理员表单校验规则
const addRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    {
      required: true,
      message: '请输入密码'
    },
    {
      pattern: /^[A-Za-z0-9]+$/,
      trigger: ['blur'],
      message: '密码只可以使用数字和字母'
    }
  ],
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
  nickname: [{ required: false }],
  name: [{ required: true, message: '请输入管理员姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'blur' }],
  communityId: [{ required: true, message: '请选择所属社区', trigger: 'blur' }],
  email: [
    {
      required: true,
      message: '请输入邮箱'
    },
    {
      pattern: /^([-_A-Za-z0-9.]+)@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/,
      trigger: ['blur', 'change'],
      message: '请输入正确的邮箱'
    }
  ],
  avatar: [{ required: false }]
})

// 修改管理员表单校验规则
const updateRules = ref({
  password: [
    {
      required: false
    },
    {
      pattern: /^[A-Za-z0-9]+$/,
      trigger: ['blur'],
      message: '密码只可以使用数字和字母'
    }
  ],
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
  nickname: [{ required: false }],
  name: [{ required: true, message: '请输入管理员姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'blur' }],
  communityId: [{ required: true, message: '请选择所属社区', trigger: 'blur' }],
  email: [
    {
      required: true,
      message: '请输入邮箱'
    },
    {
      pattern: /^([-_A-Za-z0-9.]+)@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/,
      trigger: ['blur', 'change'],
      message: '请输入正确的邮箱'
    }
  ],
  avatar: [{ required: false }]
})
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 10px;
}
.bottom {
  display: flex;
  justify-content: center;
}
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
  height: 128px;
  border-radius: 6px;
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
