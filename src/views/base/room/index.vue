<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="6">
        <el-input
          v-model="searchInfo"
          placeholder="查询小区、楼栋、单元、房间编号、业主信息"
          v-if="isAuth(['ROOT', 'ROOM:SELECT'])"
          clearable
        >
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
        <el-select
          v-model="searchBuildingId"
          placeholder="请选择楼栋"
          @change="onClearBuilding()"
          :change="onSearchBuildingChange()"
          :disabled="searchBuildingDisable"
          clearable
        >
          <el-option
            v-for="(item, index) in buildingNameList"
            :key="index"
            :label="item.buildingName"
            :value="item.buildingId"
          />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="searchUnitId" placeholder="请选择单元" :disabled="searchUnitDisable" clearable>
          <el-option v-for="(item, index) in unitNameList" :key="index" :label="item.unitName" :value="item.unitId" />
        </el-select>
      </el-col>
      <el-col :span="9">
        <el-button type="primary" @click="getListData" v-if="isAuth(['ROOT', 'UNIT:SELECT'])">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="primary" v-if="isAuth(['ROOT', 'ROOM:INSERT'])" @click="addRoomStatus()">新增房间</el-button>
        <el-button type="danger" v-if="isAuth(['ROOT', 'ROOM:DELETE'])" @click="deleteRooms()">批量删除</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'UNIT:EXPORT'])" @click="exportRooms()">批量导出</el-button>
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column v-for="(item, index) in room" :key="index" :prop="item.prop" :label="item.label" align="center">
        <template #default="{ row }" v-if="item.value == 'ownerId'">
          <el-tag v-if="row.ownerId === 0 || row.ownerId == null" type="info"> 待售 </el-tag>
          <el-tag v-else type="primary"> {{ row.ownerName }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" #default="{ row }">
        <el-button type="warning" size="mini" v-if="isAuth(['ROOT', 'ROOM:UPDATE'])" @click="onUpdateClick(row)"
          >修改</el-button
        >
        <el-button type="danger" size="mini" v-if="isAuth(['ROOT', 'ROOM:DELETE'])" @click="deleteRoom(row.roomId)"
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
          <el-select
            v-model="addForm.buildingId"
            placeholder="请选择楼栋"
            :disabled="addFormDisableBuilding"
            @change="addForm.unitId = undifined"
            :change="onBuildingChange()"
          >
            <el-option
              v-for="(item, index) in buildingNameList"
              :key="index"
              :label="item.buildingName"
              :value="item.buildingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单元名称" :label-width="formLabelWidth" prop="unitId">
          <el-select v-model="addForm.unitId" placeholder="请选择单元" :disabled="addFormDisableUnit">
            <el-option v-for="(item, index) in unitNameList" :key="index" :label="item.unitName" :value="item.unitId" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="addForm.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancleAddRoom">取消</el-button>
          <el-button type="primary" @click="addRoomInfo">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改楼栋弹出层 -->
    <el-dialog v-model="updateFormVisible" title="修改楼栋" width="50%">
      <el-form :model="updateForm" :label-width="formLabelWidth" :rules="updateRules" ref="updateRuleFormRef">
        <el-form-item label="社区名称" :label-width="formLabelWidth">
          <el-select v-model="updateForm.communityName" placeholder="请选择社区" disabled>
            <el-option :label="updateForm.communityName" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋名称" :label-width="formLabelWidth">
          <el-select v-model="updateForm.buildingName" placeholder="请选择楼栋" disabled>
            <el-option :label="updateForm.buildingName" />
          </el-select>
        </el-form-item>
        <el-form-item label="单元名称" :label-width="formLabelWidth">
          <el-select v-model="updateForm.unitName" placeholder="请选择单元" disabled>
            <el-option :label="updateForm.unitName" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间名称" :label-width="formLabelWidth" prop="roomNumber">
          <el-input v-model="updateForm.roomNumber"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateRoomInfo">确定</el-button>
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
import { getRoomList, addRoom, updateRoom, deleteRoomById, roomExport } from '@/api/room'
import { getUnitNameList } from '@/api/unit'
import { getCommunityNameList } from '@/api/community'
import { getBuildingNameList } from '@/api/building'
import room from './room.js'
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
// 单元名称列表
const unitNameList = ref([])
// 控制弹出
const updateFormVisible = ref(false)
const addFormVisible = ref(false)
// 新增表单未选择社区时楼栋禁用状态
const addFormDisableBuilding = ref(true)
// 新增表单未选择楼栋时单元禁用状态
const addFormDisableUnit = ref(true)
// 表单label宽度
const formLabelWidth = '140px'
// 多选
const multipleSelection = ref([])
// 搜索框
const searchInfo = ref(null)
const searchCommunityId = ref(null)
const searchBuildingId = ref(null)
const searchUnitId = ref(null)
const searchBuildingDisable = ref(true)
const searchUnitDisable = ref(true)
// 当前登录用户的社区id
const userCommunityId = ref(null)
// 当前登录用户是否为超级管理员
const isRoot = ref(true)
// 删除的id
const selectIds = ref([])
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
  unitId: [{ required: true, type: 'number', message: '请选择所属单元', trigger: 'blur' }],
  name: [{ required: true, message: '请输入房间名称', trigger: 'blur' }]
})
const updateRules = ref({
  roomNumber: [{ required: true, message: '请输入房间名称', trigger: 'change' }]
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
// 请求房间列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    communityId: searchCommunityId.value,
    buildingId: searchBuildingId.value,
    unitId: searchUnitId.value
  }
  const result = await getRoomList(param)

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
// 删除单行数据
const deleteRoom = async (id) => {
  const param = [id]
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  }).then(async () => {
    await deleteRoomById(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 删除多行数据
const deleteRooms = (val) => {
  let ids = []
  if (val === undefined) {
    ids = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    ids = multipleSelection.value.map((item) => {
      return item.roomId
    })
    console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.roomId)
    console.log(ids)
  }
  selectIds.value = ids
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteRoomById(ids)
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

// 新增房间弹窗
const addRoomStatus = () => {
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
    addFormDisableBuilding.value = false
  }
}

// 选择楼栋id后的触发事件
const onBuildingChange = async () => {
  if (addForm.buildingId !== undefined) {
    const param = {
      id: addForm.buildingId
    }
    // console.log(addForm.buildingId)
    const result = await getUnitNameList(param)
    unitNameList.value = result.data
    addFormDisableUnit.value = false
  }
}

// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  comunityName.value = result.data
}
// 获取社区列表
getCommunityList()

// 新增房间表单确定事件
const addRoomInfo = () => {
  const roomForm = {
    unitId: addForm.unitId,
    roomNumber: addForm.name,
    ownerId: null
  }
  addRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addRoom(roomForm)
      addFormVisible.value = false
      ElMessage.success('新增成功')
      getListData()
      addRuleFormRef.value.resetFields()
    }
  })
}
// 新建房间表单取消事件
const cancleAddRoom = () => {
  addFormVisible.value = false
  addRuleFormRef.value.resetFields()
  addFormDisableBuilding.value = true
  addFormDisableUnit.value = true
}

// 点击修改事件
const onUpdateClick = (val) => {
  updateFormVisible.value = !updateFormVisible.value
  updateForm.communityName = val.communityName
  updateForm.buildingName = val.buildingName
  updateForm.unitName = val.unitName
  updateForm.roomId = val.roomId
  updateForm.roomNumber = val.roomNumber
  // console.log(updateForm.value)
}
// 修改房间
const updateRoomInfo = () => {
  const roomInfo = {
    id: updateForm.roomId,
    roomNumber: updateForm.roomNumber
  }
  updateRuleFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateRoom(roomInfo)
      updateFormVisible.value = false
      ElMessage.success('修改成功')
      getListData()
      updateRuleFormRef.value.resetFields()
    }
  })
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
// 清空筛选社区id后触发
const onClearCommunity = async () => {
  searchBuildingId.value = undefined
  searchBuildingDisable.value = true
}

// 选择筛选条件中的楼栋id后触发
const onSearchBuildingChange = async () => {
  if (searchBuildingId.value !== undefined && searchBuildingId.value !== null && searchBuildingId.value !== '') {
    const param = {
      id: searchBuildingId.value
    }
    const result = await getUnitNameList(param)
    unitNameList.value = result.data
    searchUnitDisable.value = false
  }
}
// 清空筛选楼栋id后触发
const onClearBuilding = async () => {
  searchUnitId.value = undefined
  searchUnitDisable.value = true
}

// 导出
const exportRooms = async (val) => {
  const selectIds = []
  multipleSelection.value.forEach((element) => {
    selectIds.push(element.roomId)
  })
  const param = {
    info: searchInfo.value,
    communityId: searchCommunityId.value,
    buildingId: searchBuildingId.value,
    unitId: searchUnitId.value,
    ids: selectIds.toString()
  }
  await roomExport(param).then((res) => {
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
