<template>
  <el-card>
    <el-row :gutter="6" class="searchInput">
      <el-col :span="3">
        <el-input v-model="searchInfo" :icon="Search" size="large" placeholder="搜索员工" @keyup.enter="searchPosition">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="3" v-if="isAuth(['ROOT'])">
        <el-select
          v-model="community.communityId"
          class="m-2"
          clearable
          placeholder="请选择小区"
          size="large"
          @clear=";(community.communityId = null), (dept = null)"
        >
          <el-option
            v-for="item in community"
            :key="item.communityId"
            :label="item.communityName"
            :value="item.communityId"
            @click="isRoot(community.communityId)"
          />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="dept.id" class="m-2" clearable placeholder="请选择部门" size="large">
          <el-option v-for="item in dept" :key="item.id" :label="item.deptName" :value="item.id" />
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select v-model.number="sexual.value" class="m-2" clearable placeholder="性别" size="large">
          <el-option v-for="item in sexual" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select v-model.number="isEnabled.value" class="m-2" clearable placeholder="状态" size="large">
          <el-option v-for="item in isEnabled" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="10">
        <el-button
          type="success"
          size="large"
          :icon="Search"
          v-if="isAuth(['ROOT', 'STAFF:SELECT'])"
          @click="searchPosition"
        >
          <span><svg-icon icon="search" /></span> 搜索员工</el-button
        >
        <el-button type="primary" size="large" v-if="isAuth(['ROOT', 'STAFF:INSERT'])" @click="addPositionStatus()"
          >新增员工</el-button
        >
        <el-button type="danger" size="large" v-if="isAuth(['ROOT', 'STAFF:DELETE'])" @click="delStaff()"
          >批量删除</el-button
        >
        <el-button type="success" v-if="isAuth(['ROOT', 'STAFF:EXPORT'])" @click="exportStaffList()"
          >导出员工数据</el-button
        >
      </el-col>
    </el-row>

    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        show-overflow-tooltip="true"
        v-for="(item, index) in staff"
        :key="index"
        :label="item.label"
        :width="item.width"
        :prop="item.prop"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'avatar'">
          <el-avatar v-if="row.avatar != null" :src="row.avatar" size="default" :fit="cover" />
          <el-tag v-if="row.avatar == null" type="info" size="small"> 无头像</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'phone'">
          <el-tag v-if="row.phone !== null" size="small" disable-transitions="true" v-html="row.phone"></el-tag>
          <el-tag v-if="row.phone == null" type="info" size="small">空</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'sexual'">
          <el-tag v-if="row.sexual === 0" size="small" disable-transitions="true">保密</el-tag>
          <el-tag v-if="row.sexual === 1" size="small" disable-transitions="true" color="#a7ffeb">男</el-tag>
          <el-tag v-if="row.sexual === 2" size="small" disable-transitions="true" color="#fce4ec">女</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'state'">
          <el-tag v-if="row.state === 0" size="small" disable-transitions="true">待审核</el-tag>
          <el-tag v-if="row.state === 1" size="small" disable-transitions="true">通过</el-tag>
          <el-tag v-if="row.state === 2" type="info" size="small">未通过</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'isEnabled'">
          <el-tag v-if="row.isEnabled === 0" size="small" disable-transitions="true">启用</el-tag>
          <el-tag v-if="row.isEnabled === 1" type="info" size="small">禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="140" #default="{ row }">
        <el-button type="primary" size="mini" v-if="isAuth(['ROOT', 'STAFF:UPDATE'])" @click="clickUpdatePosition(row)"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="delStaff(row)" v-if="isAuth(['ROOT', 'STAFF:DELETE'])"
          >删除</el-button
        >
      </el-table-column>
    </el-table>
    <div class="bottom">
      <el-pagination
        class="pagination"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[5, 10, 50, 100, 200]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <!-- 新增员工弹框 -->
    <el-dialog v-model="showWindow" title="新增" width="45%">
      <el-form :model="addting" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="小区名称" prop="communityId">
          <el-select v-model.number="addting.communityId" placeholder="请选择小区">
            <el-option
              v-for="item in communityList"
              :key="item.id"
              :label="item.communityName"
              :value="item.communityId"
              @change="deptList = undefined"
              @click="selWorkerBydeptId()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="员工部门" prop="departmentId">
          <el-select v-model.number="addting.departmentId" placeholder="请选择部门" :disabled="tabelDis">
            <el-option
              v-for="item in deptList"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
              @change="posList = undefined"
              @click="selPosBydeptId()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="员工职位" prop="positionId">
          <el-select v-model.number="addting.positionId" placeholder="请选择职位" :disabled="tabelDis">
            <el-option v-for="item in posList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工姓名" prop="name">
          <el-input placeholder="请输入员工姓名" v-model="addting.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input placeholder="请输入联系方式" v-model="addting.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="sexual">
          <el-radio-group v-model="addting.sexual">
            <el-radio label="0">保密</el-radio>
            <el-radio label="1">男</el-radio>
            <el-radio label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="员工描述">
          <el-input placeholder="请输入员工描述" v-model="addting.des" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            :class="{ 'avatar-uploader': !addting.avatar }"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadFile"
          >
            <img v-if="addting.avatar" :src="addting.avatar" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWindow = false">取消</el-button>
          <el-button type="primary" @click="insertStaff(addting)">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 修改员工遮罩层 -->
    <el-dialog v-model="showUpdate" title="修改" width="45%">
      <el-form :model="onlyStaff" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="小区名称" prop="communityId">
          <el-select v-model.number="onlyStaff.communityId" placeholder="请选择小区">
            <el-option
              v-for="item in communityList"
              :key="item.id"
              :label="item.communityName"
              :value="item.communityId"
              @click="selWorkerBydeptId()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="员工部门" prop="departmentId">
          <el-select
            v-model.number="onlyStaff.departmentId"
            :placeholder="onlyStaff.departmentName"
            :disabled="tabelDis"
          >
            <el-option
              v-for="item in deptList"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
              @click="selPosBydeptId()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="员工职位" prop="positionId">
          <el-select v-model.number="onlyStaff.positionId" placeholder="请选择职位" :disabled="tabelDis">
            <el-option v-for="item in posList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工姓名" prop="name">
          <el-input placeholder="请输入员工姓名" v-model="onlyStaff.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input placeholder="请输入联系方式" v-model="onlyStaff.phone" />
        </el-form-item>
        <el-form-item label="性别" prop="sexual">
          <el-radio-group v-model="onlyStaff.sexual">
            <el-radio :label="0">保密</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="isEnabled">
          <el-radio-group v-model="onlyStaff.isEnabled">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核状态" prop="state">
          <el-radio-group v-model="onlyStaff.state">
            <el-radio :label="0">待审核</el-radio>
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">驳回审核</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="员工描述">
          <el-input placeholder="请输入员工描述" v-model="onlyStaff.des" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            :class="{ 'avatar-uploader': !onlyStaff.avatar }"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadFile"
          >
            <img v-if="onlyStaff.avatar" :src="onlyStaff.avatar" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdate = false">取消</el-button>
          <el-button type="primary" @click="btnUpdatePosition(onlyStaff)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { getPositionsBydeptId } from '@/api/position'
import { selectAllWorker, addStaff, uploadStaff, updateStaff, deleteStaff, exportStaff } from '@/api/staff'
import { getCommunityNameList } from '@/api/community'
import { selDeptBycId } from '@/api/department'
import staff from './staff'
import { ElMessage, ElMessageBox } from 'element-plus'
import { IMG_URL } from '@/constant'
import { useStore } from 'vuex'

// 拿到小区id
const store = useStore()

// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 多选项
const multipleSelection = ref([])
// 新增员工
const addting = ref({})
// 性别数组
const sexual = ref([
  {
    value: 0,
    label: '保密'
  },
  {
    value: 1,
    label: '男'
  },
  {
    value: 2,
    label: '女'
  }
])
// 状态数组
const isEnabled = ref([
  {
    value: 0,
    label: '启用'
  },
  {
    value: 1,
    label: '禁用'
  }
])
// 小区名称数组
const communityList = ref([])
// 部门数组
const deptList = ref([])
// 职位数组
const posList = ref([])
// 上传文件
const fileName = ref()
// 批量导出
const exportStaffList = () => {
  let ids = []
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  // console.log(ids)
  // if(tableData.value.id){}
  exportStaff(ids, store.getters.userInfo.communityId).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '员工列表.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
// 根据小区id来查询员工
const selWorkerBydeptId = () => {
  // console.log(addting.value.communityId)
  // console.log(onlyStaff.value.communityId)
  // 新增
  if (addting.value.communityId !== undefined) {
    selDeptBycId(addting.value.communityId).then((res) => {
      deptList.value = res.data
    })
    // 根据社区id来查询职位
    getPositionsBydeptId(addting.value.communityId).then((res) => {
      posList.value = res.data
    })
  } else {
    // 修改
    selDeptBycId(onlyStaff.value.communityId).then((res) => {
      deptList.value = res.data
    })
    // 根据社区id来查询职位
    getPositionsBydeptId(onlyStaff.value.communityId).then((res) => {
      posList.value = res.data
    })
  }
}
// 查询小区
const community = ref([])

getCommunityNameList().then((res) => {
  community.value = res.data
  // console.log(community.value)
})
// 根据登陆者的小区id来查部门
const dept = ref([])
selDeptBycId(store.getters.userInfo.communityId).then((res) => {
  dept.value = res.data
  // console.log(res.data)
})
// console.log(dept)

// 管理员登陆，依据选择的小区id来查询部门
const isRoot = (id) => {
  // console.log(id)
  selDeptBycId(id).then((res) => {
    dept.value = res.data
    // console.log(res.data)
  })
}
// 请求员工列表
const getListData = async () => {
  const param = {
    info: '',
    pageIndex: page.value,
    pageSize: size.value,
    isEnabled: null,
    sexual: null,
    communityId: store.getters.userInfo.communityId,
    departmentId: dept.value.id
  }
  // console.log(param)
  const result = await selectAllWorker(param)
  tableData.value = result.data
  // console.log(tableData.value)
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
const showWindow = ref(false)

const addPositionStatus = () => {
  showWindow.value = !showWindow.value
}
// 请求小区列表
getCommunityNameList().then((res) => {
  communityList.value = res.data
})

// 删除操作
const delStaff = (val) => {
  let ids = []
  if (val === undefined) {
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.id
    })
  } else {
    multipleSelection.value = []
    ids.push(val.id)
  }
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await deleteStaff(ids)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
    ids = []
  })
}
// 验证手机号正则
const regTelPhone = /^1[34578][0-9]{9}$/
// 校验规则
const ruleFormRef = ref(null)
const rules = ref({
  name: [
    {
      required: true,
      message: '请选择',
      trigger: 'blur'
    }
  ],
  state: [
    {
      required: true,
      type: 'number',
      message: '请选择',
      trigger: 'blur'
    }
  ],
  isEnabled: [
    {
      required: true,
      type: 'number',
      message: '请选择',
      trigger: 'blur'
    }
  ],
  communityId: [
    {
      required: true,
      type: 'number',
      message: '请选择',
      trigger: 'blur'
    }
  ],
  sexual: [
    {
      required: true,
      // type: 'number',
      message: '请选择',
      trigger: 'blur'
    }
  ],
  departmentId: [
    {
      required: true,
      type: 'number',
      message: '请选择',
      trigger: 'blur'
    }
  ],
  positionId: [
    {
      required: true,
      type: 'number',
      message: '请选择',
      trigger: 'blur'
    }
  ],
  phone: [
    {
      len: 11,
      required: true,
      message: '输入错误',
      trigger: ['blur', 'change']
    },
    {
      pattern: regTelPhone,
      message: '手机号格式错误',
      trigger: ['blur', 'change']
    }
  ]
})
// 遮罩层表单控制
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadStaff({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    addting.value.avatar = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
    // console.log(addting.value.avatar)
    onlyStaff.value.avatar = IMG_URL + 'admin-api/' + fileInfo.data
  }
}
// 新增
const insertStaff = (addting) => {
  // 新增数据
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      // console.log(fileName.value)
      if (fileName.value === undefined) {
        addting.avatar = 'http://106.14.169.149:9000/admin-api/moren.jpg'
      } else {
        addting.avatar = IMG_URL + 'admin-api/' + fileName.value
      }
      await addStaff(addting)
      showWindow.value = false
      // 重新渲染数据
      getListData()
      ruleFormRef.value.resetFields()
      addting.avatar = ''
      fileName.value = undefined
    }
  })
}

const showUpdate = ref(false)
const onlyStaff = ref({})
// 点击修改
const clickUpdatePosition = (row) => {
  // getPositionsBydeptId(row.communityId)

  // 把需要用到的值拿到
  // console.log(row)
  onlyStaff.value = {
    id: row.id,
    communityId: row.communityId,
    departmentId: row.departmentId,
    positionId: row.positionId,
    account: row.account,
    state: row.state,
    isEnabled: row.isEnabled,
    phone: row.phone,
    sexual: row.sexual,
    avatar: row.avatar,
    name: row.name,
    des: row.des
  }
  selWorkerBydeptId()

  showUpdate.value = !showUpdate.value
}
// 修改
const btnUpdatePosition = (onlyStaff) => {
  // 校验规则
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      // console.log(onlyStaff)
      await updateStaff(onlyStaff)
      ElMessage.success('修改成功')
      // 重新渲染数据
      getListData()
      showUpdate.value = !showUpdate.value
      ruleFormRef.value.resetFields()
    }
  })
}
// 模糊搜索输入框内容
const searchInfo = ref('')
const searchPosition = async () => {
  // console.log(searchInfo.value)
  // console.log(isEnabled.value.value)
  // console.log(sexual.value.value)
  const param = {
    info: searchInfo.value,
    pageIndex: page.value,
    isEnabled: isEnabled.value.value,
    sexual: sexual.value.value,
    pageSize: size.value,
    communityId: store.getters.userInfo.communityId,
    departmentId: dept.value.id
  }
  // console.log(community.value.communityId)
  if (community.value.communityId !== undefined) {
    param.communityId = community.value.communityId
    if (community.value.communityId === null) {
      param.communityId = 0
    }
  }
  // console.log(param.communityId)
  const result = await selectAllWorker(param)
  // console.log(result.data)
  // console.log(result.total)
  tableData.value = result.data
  total.value = result.total
}
</script>

<style lang="scss" scoped>
.pagination {
  display: inline-block;
}
.bottom {
  display: flex;
  justify-content: center;
}
.searchInput {
  margin-bottom: 1rem;
}
.avatar-uploader {
  width: 75px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #8c939d;
  border-radius: 6px;
  cursor: pointer;
}
.avatar {
  width: 75;
  height: 75px;
  border-radius: 6px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 75;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
