<template>
  <el-card>
    <el-row :gutter="10" class="search-box">
      <el-col :span="6">
        <el-input v-model="searchInfo" placeholder="模糊查询业主信息" v-if="isAuth(['ROOT', 'OWNER:SELECT'])">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="15">
        <el-button type="primary" @click="searchUnitListBySearch" v-if="isAuth(['ROOT', 'OWNER:SELECT'])">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <!-- <el-button type="primary" v-if="isAuth(['ROOT', 'OWNER:INSERT'])" @click="addUnitStatus()">新增业主</el-button> -->
        <!-- <el-button type="danger" v-if="isAuth(['ROOT', 'OWNER:DELETE'])" @click="deleteUnits()">批量删除</el-button> -->
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column v-for="(item, index) in owner" :key="index" :prop="item.prop" :label="item.label" align="center">
        <template #default="{ row }" v-if="item.prop == 'gender'">
          <el-tag v-if="row.gender == 0" type="primary"> 男 </el-tag>
          <el-tag v-else-if="row.gender == 1" type="danger"> 女 </el-tag>
          <el-tag v-else type="info"> 无 </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" align="center" #default="{ row }" width="150">
        <el-button type="warning" size="mini" v-if="isAuth(['ROOT', 'OWNER:UPDATE'])" @click="onUpdateClick(row)"
          >修改</el-button
        > -->
      <!-- <el-button type="danger" size="mini" v-if="isAuth(['ROOT', 'OWNER:DELETE'])" @click="deleteUnit(row.unitId)"
          >删除</el-button
        > -->
      <!-- </el-table-column> -->
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
import { getOwnerList } from '@/api/owner'
import { getCommunityNameList } from '@/api/community'
import { getBuildingNameList } from '@/api/building'
import owner from './owner.js'
import { ElMessage } from 'element-plus'

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
const searchInfo = ref('')
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
// 请求楼栋列表
const getListData = async () => {
  const param = {
    info: searchInfo.value,
    pageIndex: page.value,
    pageSize: size.value
  }
  const result = await getOwnerList(param)

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
// 处理单选框选中
const handleSelectionChange = (val) => {
  multipleSelection.value = val
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

// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  comunityName.value = result.data
}

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
// 修改楼栋
const updateBuildingInfo = () => {
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

// 模糊查询
const searchUnitListBySearch = async () => {
  const info = {
    info: searchInfo.value,
    pageIndex: page.value,
    pageSize: size.value
  }
  const result = await getUnitListBySearch(info)
  tableData.value = result.data
  total.value = result.total
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
