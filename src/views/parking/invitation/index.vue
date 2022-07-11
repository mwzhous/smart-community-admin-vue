<template>
  <el-card>
    <el-row :gutter="20" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-22 m-1" placeholder="用户名、小区、手机号、车牌号搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-select v-model="state" size="small" clearable placeholder="状态" @change="handleStateChange">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" size="small" @click="searchPosition">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button
          type="danger"
          size="small"
          v-if="isAuth(['ROOT', 'SITE_RENT:DELETE'])"
          @click="deleteInvitationRecordByIds()"
          >批量删除</el-button
        >
        <el-button type="success" size="small" v-if="isAuth(['ROOT', 'SITE_RENT:EXPORT'])" @click="exportRecord()"
          >批量导出</el-button
        >
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in invitation"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
        :width="item.width"
      >
        <template v-if="item.prop === 'action'" #default="{ row }">
          <span>{{ row.label }}</span>
          <el-button type="danger" size="mini" @click="deleteById(row)">删除</el-button>
          <el-button type="success" size="mini" @click="updateHandle(row)">修改</el-button>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'state'">
          <el-tag v-show="row.state == 0"> 默认 </el-tag>
          <el-tag v-show="row.state == 1" type="warning"> 已过期 </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <!-- Form -->

    <el-dialog v-model="dialogFormVisible" title="新增停车邀请信息" :append-to-body="false">
      <el-form :model="form" ref="addValidForm">
        <el-form-item
          label="停车场id"
          :label-width="formLabelWidth"
          prop="parkingId"
          :rules="[{ required: true, message: '请输入停车场id', trigger: 'blur' }]"
        >
          <el-input v-model="form.parkingId" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="联系人"
          prop="contact"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入联系人', trigger: 'blur' }]"
        >
          <el-input v-model="form.contact" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="手机号"
          :label-width="formLabelWidth"
          prop="phone"
          :rules="[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]"
        >
          <el-input v-model="form.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="小区id"
          :label-width="formLabelWidth"
          prop="communityId"
          :rules="[{ required: true, message: '请输入小区id', trigger: 'blur' }]"
        >
          <el-input v-model="form.communityId" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="用户id"
          :label-width="formLabelWidth"
          prop="userId"
          :rules="[{ required: true, message: '请输入用户id', trigger: 'blur' }]"
        >
          <el-input v-model="form.userId" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="车牌照"
          prop="carNumber"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请输入车牌照', trigger: 'blur' }]"
        >
          <el-input v-model="form.carNumber" autocomplete="off" placeholder="" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleAddConfirm">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpateFormVisible" title="修改停车邀请信息">
      <el-form v-for="(item, index) in updateForm" :key="index">
        <el-form-item label="联系人" :label-width="formLabelWidth">
          <el-input v-model="item.contact" autocomplete="off" />
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth">
          <el-input v-model="item.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="小区" :label-width="formLabelWidth">
          <el-select v-model="item.communityId" class="m-2" placeholder="选择小区" size="large" :disabled="!isRoot">
            <el-option
              v-for="item in communityNameList.value"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车牌照" :label-width="formLabelWidth">
          <el-input v-model="item.carNumber" autocomplete="off" />
        </el-form-item>
        <el-form-item label="状态" :label-width="formLabelWidth">
          <el-radio-group v-model.number="item.state">
            <el-radio :label="0">默认</el-radio>
            <el-radio :label="1">已过期</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入场时间" prop="startTime" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="item.startTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
        <el-form-item label="出场时间" prop="endTime" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
              v-model="item.endTime"
              type="datetime"
              placeholder="Select date and time"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import {
  getAllInvitationRecord,
  addInvitationRecord,
  updateInvitationRecord,
  deleteInvitationRecord,
  exportInvitationRecord
} from '@/api/carport'
import { getCommunityNameList } from '@/api/community'
import invitation from './invitation'
import { ElMessage, ElMessageBox } from 'element-plus'
const multipleSelection = ref([])
// 删除的id
const selectIds = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const updateForm = reactive({})
const addValidForm = ref(null)

const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const state = ref('')
const formLabelWidth = '140px'
// 模糊搜索输入框内容
const searchInfo = ref('')
// 当前登录用户是否为超级管理员
const isRoot = ref(true)
// 当前登录用户的社区id
const userCommunityId = ref(null)
// 获取当前登录用户社区id
const store = useStore()
const getAdminCommunityId = () => {
  const info = store.state.user.userInfo
  if (info.communityId === 0) {
    isRoot.value = true
    userCommunityId.value = 0
  } else {
    isRoot.value = false
    userCommunityId.value = info.communityId
    console.log(userCommunityId.value)
  }
}
getAdminCommunityId()
const communityNameList = reactive({})
getCommunityNameList().then((res) => {
  communityNameList.value = res.data
  console.log(res.data)
})
const searchPosition = () => {
  getListData()
}
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
const stateList = [
  {
    value: 0,
    label: '默认'
  },
  {
    value: 1,
    label: '已到期'
  }
]

const form = reactive({
  id: '',
  parkingId: '',
  contact: '',
  userId: '',
  carNumber: '',
  phone: '',
  communityId: ''
})
const checkMobile = (rule, value, callback) => {
  // 手机号正则表达式
  const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
  if (regMobile.test(value)) {
    // 合法的手机号
    return callback()
  }
  callback(new Error('请输入合法的手机号'))
}

const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
  console.log(updateForm.value)
}
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    comId: userCommunityId.value,
    state: state.value
  }
  const result = await getAllInvitationRecord(param)
  console.log(result.data)
  tableData.value = result.data
  total.value = result.total
}
getListData()
const handleAddShow = () => {
  dialogFormVisible.value = false
}
const handleUpdateShow = () => {
  dialogUpateFormVisible.value = false
}
// 批量导出
const exportRecord = async () => {
  let ids = []
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  const data = {
    info: searchInfo.value,
    ids: ids.toString()
  }
  console.log(data)
  await exportInvitationRecord(data).then((res) => {
    console.log(res)
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '停车记录.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
const handleAddConfirm = () => {
  const data = {
    parkingId: form.parkingId,
    contact: form.contact,
    phone: form.phone,
    communityId: form.communityId,
    userId: form.userId,
    carNumber: form.carNumber
  }
  addValidForm.value.validate(async (valid) => {
    if (valid) {
      const result = await addInvitationRecord(data)
      handleAddShow()
      console.log(result.data)

      ElMessage.success('新增成功')
      getListData()
    }
  })
}
const handleUpdateConfirm = async () => {
  const data = {
    id: updateForm.value.id,
    parkingId: updateForm.value.parkingId,
    state: updateForm.value.state,
    contact: updateForm.value.contact,
    phone: updateForm.value.phone,
    communityId: updateForm.value.communityId,
    userId: updateForm.value.userId,
    carNumber: updateForm.value.carNumber
  }
  const result = await updateInvitationRecord(data)

  handleUpdateShow()
  console.log(result.data)
  ElMessage.success('更新成功')
  getListData()
}
const deleteById = async (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.id
    })
    console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.id)
    // console.log(ids)
  }
  console.log(ids)
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteInvitationRecord(ids)
      ElMessage.success('删除成功')
      selectIds.value = []
      ids = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      ids = []
      selectIds.value = []
    })
}

const deleteInvitationRecordByIds = (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.id
    })
    console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.id)
    console.log(ids)
  }
  selectIds.value = ids
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteInvitationRecord(ids)
      ElMessage.success('删除成功')
      selectIds.value = []
      ids = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      ids = []
      selectIds.value = []
    })
}

const handleSizeChange = (currentSize) => {
  size.value = currentSize
  getListData()
}

const handleCurrentChange = (currentSize) => {
  page.value = currentSize
  getListData()
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
</style>
