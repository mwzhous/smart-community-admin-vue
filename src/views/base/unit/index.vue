<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="6">
        <el-input v-model="searchInfo" placeholder="模糊查询单元名称、楼栋名称" v-if="isAuth(['ROOT', 'UNIT:SELECT'])">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="3">
        <el-select
          v-model="searchCommunityId"
          placeholder="请选择社区"
          @change="onClearCommunity()"
          :change="onSearchCommunityChange()"
          clearable
          :disabled="!isRoot"
        >
          <el-option v-for="item in comunityName" :key="item" :label="item.communityName" :value="item.communityId" />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="searchBuildingId" placeholder="请选择楼栋" :disabled="searchBuildingDisable" clearable>
          <el-option
            v-for="(item, index) in buildingNameList"
            :key="index"
            :label="item.buildingName"
            :value="item.buildingId"
          />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="getListData" v-if="isAuth(['ROOT', 'UNIT:SELECT'])">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="primary" v-if="isAuth(['ROOT', 'UNIT:INSERT'])" @click="addUnitStatus()">新增单元</el-button>
        <el-button type="danger" v-if="isAuth(['ROOT', 'UNIT:DELETE'])" @click="deleteUnits()">批量删除</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'UNIT:EXPORT'])" @click="exportUnits()">批量导出</el-button>
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column v-for="(item, index) in unit" :key="index" :prop="item.prop" :label="item.label" align="center">
      </el-table-column>
      <el-table-column label="操作" align="center" #default="{ row }">
        <el-button type="warning" size="mini" v-if="isAuth(['ROOT', 'UNIT:UPDATE'])" @click="onUpdateClick(row)"
          >修改</el-button
        >
        <el-button type="danger" size="mini" v-if="isAuth(['ROOT', 'UNIT:DELETE'])" @click="deleteUnit(row.unitId)"
          >删除</el-button
        >
      </el-table-column>
    </el-table>

    <!-- 新增单元弹出层 -->
    <el-dialog v-model="addFormVisible" title="新增单元" width="50%">
      <el-form :model="addForm" :label-width="formLabelWidth" :rules="addRules" ref="addRuleFormRef">
        <el-form-item label="社区名称" :label-width="formLabelWidth" prop="communityId">
          <el-select
            v-model="addForm.communityId"
            placeholder="请选择社区"
            @change="addForm.buildingId = undefined"
            :change="onCommunityChange()"
            :disabled="!isRoot"
          >
            <el-option v-for="item in comunityName" :key="item" :label="item.communityName" :value="item.communityId" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋名称" :label-width="formLabelWidth" prop="buildingId">
          <el-select v-model="addForm.buildingId" placeholder="请选择楼栋" :disabled="addFormDisable">
            <el-option
              v-for="(item, index) in buildingNameList"
              :key="index"
              :label="item.buildingName"
              :value="item.buildingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单元名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="addForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancleAddUnit">取消</el-button>
          <el-button type="primary" @click="addUnitInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改楼栋弹出层 -->
    <el-dialog v-model="updateFormVisible" title="修改楼栋" width="50%">
      <el-form :model="updateForm" :label-width="formLabelWidth" :rules="updateRules" ref="updateRuleFormRef">
        <el-form-item label="楼栋名称" :label-width="formLabelWidth" prop="buildingName">
          <el-select v-model="updateForm.buildingName" placeholder="请选择社区" disabled>
            <el-option :label="updateForm.buildingName" :value="updateForm.buildingId" />
          </el-select>
        </el-form-item>
        <el-form-item label="单元名称" :label-width="formLabelWidth" prop="unitName">
          <el-input v-model="updateForm.unitName" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateUnitInfo">确定</el-button>
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
import { getUnitList, deleteUnitById, addUnit, updateUnit, unitExport } from '@/api/unit'
import { getCommunityNameList } from '@/api/community'
import { getBuildingNameList } from '@/api/building'
import unit from './unit.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getCurrentTime } from '@/utils/time'

// 表格数据相关
const tableData = reactive([])
// 分页数据
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 社区名称列表
const comunityName = ref([])
// 楼栋名称列表
const buildingNameList = ref([])
// 控制弹出
const updateFormVisible = ref(false)
const addFormVisible = ref(false)
// 新增表单未选择社区时禁用状态
const addFormDisable = ref(true)
// 表单label宽度
const formLabelWidth = '140px'
// 多选
const multipleSelection = ref([])
// 搜索框
const searchInfo = ref(null)
const searchCommunityId = ref(null)
const searchBuildingId = ref(null)
const searchBuildingDisable = ref(true)
// 删除的id
const selectIds = ref([])
// 当前登录用户的社区id
const userCommunityId = ref(null)
// 当前登录用户是否为超级管理员
const isRoot = ref(true)
// 新增表单
const addForm = reactive({})
// 更新表单
const updateForm = reactive({})
// 文本框校验规则
const addRuleFormRef = ref(null)
const updateRuleFormRef = ref(null)
const addRules = ref({
  communityId: [{ required: true, type: 'number', message: '请选择所属小区', trigger: 'blur' }],
  buildingId: [{ required: true, type: 'number', message: '请选择所属楼栋', trigger: 'blur' }],
  name: [{ required: true, message: '请输入单元名称', trigger: 'blur' }]
})
const updateRules = ref({
  unitName: [{ required: true, message: '请输入单元名称', trigger: 'change' }]
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
    addForm.communityId = info.communityId
  }
}
getAdminCommunityId()
// 请求楼栋列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    communityId: searchCommunityId.value,
    buildingId: searchBuildingId.value
  }
  const result = await getUnitList(param)

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
const deleteUnit = async (id) => {
  const param = [id]
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  }).then(async () => {
    await deleteUnitById(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 删除多行数据
const deleteUnits = (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.unitId
    })
    console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.unitId)
    console.log(ids)
  }
  selectIds.value = ids
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteUnitById(ids)
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
const addUnitStatus = () => {
  addFormVisible.value = !addFormVisible.value
  // 请求社区列表
  getCommunityList()
}

// 选择社区id后的触发事件
const onCommunityChange = async () => {
  if (addForm.communityId !== undefined) {
    const param = {
      id: addForm.communityId
    }
    const result = await getBuildingNameList(param)
    buildingNameList.value = result.data
    addFormDisable.value = false
  }
}

// 选择筛选条件中的社区id后触发
const onSearchCommunityChange = async () => {
  if (searchCommunityId.value !== undefined && searchCommunityId.value !== null && searchCommunityId.value !== '') {
    const param = {
      id: searchCommunityId.value
    }
    const result = await getBuildingNameList(param)
    buildingNameList.value = result.data
    searchBuildingDisable.value = false
  }
}
// 清空搜索社区id后触发
const onClearCommunity = async () => {
  searchBuildingId.value = undefined
  searchBuildingDisable.value = true
}

// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  comunityName.value = result.data
}
// 获取社区列表
getCommunityList()

// 新增单元表单确定事件
const addUnitInfo = () => {
  const unitForm = {
    buildingId: addForm.buildingId,
    name: addForm.name
  }
  addRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addUnit(unitForm)
      addFormVisible.value = false
      ElMessage.success('新增成功')
      getListData()
      addRuleFormRef.value.resetFields()
    }
  })
  // console.log(buildingForm)
}
// 新建单元表单取消事件
const cancleAddUnit = () => {
  addFormVisible.value = false
  addRuleFormRef.value.resetFields()
}

// 点击修改事件
const onUpdateClick = (val) => {
  updateFormVisible.value = !updateFormVisible.value
  getCommunityList()
  updateForm.buildingName = val.buildingName
  updateForm.unitName = val.unitName
  updateForm.unitId = val.unitId
  // console.log(updateForm.value)
}
// 修改单元
const updateUnitInfo = () => {
  const unitInfo = {
    id: updateForm.unitId,
    name: updateForm.unitName
  }
  updateRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateUnit(unitInfo)
      updateFormVisible.value = false
      ElMessage.success('修改成功')
      getListData()
      updateRuleFormRef.value.resetFields()
    }
  })
}

// 导出
const exportUnits = async (val) => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.unitId)
  })
  const param = {
    info: searchInfo.value,
    communityId: searchCommunityId.value,
    buildingId: searchBuildingId.value,
    ids: selectIds.toString()
  }
  await unitExport(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '单元列表' + getCurrentTime() + '.xlsx'
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
