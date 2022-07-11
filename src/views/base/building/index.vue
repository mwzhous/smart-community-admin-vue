<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="6">
        <el-input
          v-model="searchInfo"
          placeholder="模糊查询社区名称、楼栋名称"
          v-if="isAuth(['ROOT', 'BUILDING:SELECT'])"
          clearable
        >
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="3"
        ><el-select v-model="searchCommunityId" placeholder="请选择社区" clearable :disabled="!isRoot">
          <el-option
            v-for="item in comunityName"
            :key="item"
            :label="item.communityName"
            :value="item.communityId"
          /> </el-select
      ></el-col>
      <el-col :span="15">
        <el-button type="primary" @click="getListData" v-if="isAuth(['ROOT', 'BUILDING:SELECT'])">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="primary" v-if="isAuth(['ROOT', 'BUILDING:INSERT'])" @click="addBuildingStatus()"
          >新增楼栋</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'BUILDING:DELETE'])" @click="deleteBuildings()"
          >批量删除</el-button
        >
        <el-button type="success" v-if="isAuth(['ROOT', 'BUILDING:EXPORT'])" @click="exportBuildings()"
          >批量导出</el-button
        >
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in building"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
      </el-table-column>
      <el-table-column label="操作" align="center" #default="{ row }">
        <el-button type="warning" size="mini" v-if="isAuth(['ROOT', 'BUILDING:UPDATE'])" @click="onUpdateClick(row)"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="mini"
          v-if="isAuth(['ROOT', 'BUILDING:DELETE'])"
          @click="deleteBuilding(row.buildingId)"
          >删除</el-button
        >
      </el-table-column>
    </el-table>

    <!-- 新增楼栋弹出层 -->
    <el-dialog v-model="addFormVisible" title="新增楼栋" width="50%">
      <el-form :model="addForm" :label-width="formLabelWidth" :rules="addRules" ref="addRuleFormRef">
        <el-form-item label="社区名称" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="addForm.communityId" placeholder="请选择社区" :disabled="!isRoot">
            <el-option v-for="item in comunityName" :key="item" :label="item.communityName" :value="item.communityId" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="addForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addFormVisible = false">取消</el-button>
          <el-button type="primary" @click="addBuildingInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改楼栋弹出层 -->
    <el-dialog v-model="updateFormVisible" title="修改楼栋" width="50%">
      <el-form :model="updateForm" :label-width="formLabelWidth" :rules="updateRules" ref="updateRuleFormRef">
        <el-form-item label="社区名称" :label-width="formLabelWidth" prop="communityName">
          <el-select v-model="updateForm.value.communityName" placeholder="请选择社区" disabled>
            <el-option :label="updateForm.communityName" :value="updateForm.communityId" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋名称" :label-width="formLabelWidth" prop="buildingName">
          <el-input v-model="updateForm.buildingName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateBuildingInfo">确定</el-button>
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
import { useStore } from 'vuex'
import { getBuildingList, deleteBuildingById, addBuilding, updateBuilding, buildingExport } from '@/api/building'
import { getCommunityNameList } from '@/api/community'
import building from './building.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getCurrentTime } from '@/utils/time'

// 数据相关
const tableData = reactive([])
const comunityName = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 控制弹出
const updateFormVisible = ref(false)
const addFormVisible = ref(false)
// 表单label宽度
const formLabelWidth = '140px'
// 多选
const multipleSelection = ref([])
// 多选框选中的的id
const selectIds = ref([])
// 搜索框
const searchInfo = ref(null)
const searchCommunityId = ref(null)
// 当前登录用户是否为超级管理员
const isRoot = ref(true)
// 当前登录用户的社区id
const userCommunityId = ref(null)
// 新增表单
const addForm = reactive({})
// 更新表单
const updateForm = reactive({})
// 文本框校验规则
const addRuleFormRef = ref(null)
const updateRuleFormRef = ref(null)
const addRules = ref({
  communityId: [{ required: true, type: 'number', message: '请选择所属小区', trigger: 'blur' }],
  name: [{ required: true, message: '请输入楼栋名称', trigger: 'blur' }]
})
const updateRules = ref({
  buildingName: [{ required: true, message: '请输入楼栋名称', trigger: 'change' }]
})
// 获取当前登录用户社区id
const store = useStore()
const getAdminCommunityId = () => {
  const info = store.state.user.userInfo
  if (info.communityId === 0) {
    isRoot.value = true
    userCommunityId.value = 0
  } else {
    isRoot.value = false
    searchCommunityId.value = info.communityId
    userCommunityId.value = info.communityId
  }
}
getAdminCommunityId()
// 请求楼栋列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    communityId: searchCommunityId.value
  }
  const result = await getBuildingList(param)

  tableData.value = result.data
  total.value = result.total
}
// 获取列表数据
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
// console.log(tableData)
// 删除单行数据
const deleteBuilding = async (id) => {
  const param = [id]
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  }).then(async () => {
    await deleteBuildingById(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 删除多行数据
const deleteBuildings = (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.buildingId
    })
    // console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.buildingId)
    // console.log(ids)
  }
  selectIds.value = ids
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteBuildingById(ids)
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
// 处理单选框选中
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 新增楼栋弹窗
const addBuildingStatus = () => {
  addFormVisible.value = !addFormVisible.value
  getCommunityList()
  if (!isRoot.value) {
    addForm.communityId = userCommunityId.value
  }
}

// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  comunityName.value = result.data
  // console.log(comunityName)
}
// 获取社区列表
getCommunityList()

// 新增楼栋
const addBuildingInfo = () => {
  const buildingForm = {
    communityId: addForm.communityId,
    name: addForm.name
  }
  // console.log(buildingForm)
  // console.log(addForm)
  addRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addBuilding(buildingForm)
      addFormVisible.value = false
      ElMessage.success('新增成功')
      getListData()
      addRuleFormRef.value.resetFields()
    }
  })
  // console.log(buildingForm)
}

// 点击修改事件
const onUpdateClick = (val) => {
  updateFormVisible.value = !updateFormVisible.value
  getCommunityList()
  updateForm.value = val
  updateForm.buildingName = val.buildingName
  // console.log(updateForm.value)
}
// 修改楼栋
const updateBuildingInfo = () => {
  const buildingInfo = {
    id: updateForm.value.buildingId,
    name: updateForm.buildingName
  }
  updateRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateBuilding(buildingInfo)
      updateFormVisible.value = false
      ElMessage.success('修改成功')
      getListData()
      updateRuleFormRef.value.resetFields()
    }
  })
}

// 导出
const exportBuildings = async (val) => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.buildingId)
  })
  const param = {
    info: searchInfo.value,
    communityId: searchCommunityId.value,
    ids: selectIds.toString()
  }
  await buildingExport(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '楼栋列表' + getCurrentTime() + '.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
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
