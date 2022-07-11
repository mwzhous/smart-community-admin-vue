<template>
  <el-card>
    <el-row :gutter="20" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-50 m-2" placeholder="停车场、小区名搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" size="small" @click="searchPosition">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button type="danger" size="small" v-if="isAuth(['ROOT', 'CARPORT:DELETE'])" @click="deleteCarportByIds()"
          >批量删除</el-button
        >
        <el-button type="warning" size="small" text @click="handleAdd">增加</el-button>
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in carport"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
        <template v-if="item.prop === 'action'" #default="{ row }">
          <span>{{ row.label }}</span>

          <el-button type="danger" size="mini" @click="deleteById(row)">删除</el-button>

          <el-button type="success" size="mini" @click="updateHandle(row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogFormVisible" title="增加信息" :append-to-body="false">
      <el-form :model="form" :rules="addRules" ref="addValidForm">
         <el-form-item label="停车场编号" :label-width="formLabelWidth" prop="parkingId">
          <el-select v-model="form.parkingId" class="m-2" placeholder="选择小区" size="large">
            <el-option
              v-for="item in parkingIdList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定小区" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="form.communityId" class="m-2" placeholder="选择小区" size="large">
            <el-option
              v-for="item in communityNameList.value"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号" :label-width="formLabelWidth" prop="carportNo">
          <!-- <el-input v-model="form.carportNo" autocomplete="off" placeholder="以英文逗号分割每个车位编号" /> -->
          <el-select v-model="form.carportNo" class="m-2" placeholder="Select" size="large" multiple>
            <el-option v-for="item in list" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="车位区号" :label-width="formLabelWidth" prop="sections">
          <!-- <el-input v-model="form.sections" autocomplete="off" placeholder="以英文逗号分割每个编号" /> -->
           <el-select v-model="form.sections" class="m-2" placeholder="Select" size="large" multiple>
            <el-option v-for="item in sectionList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogUpateFormVisible" title="修改信息">
      <el-form
        v-for="(item, index) in updateForm"
        :key="index"
        ref="updateValidForm"
        :rules="updateRules"
        :model="updateForm.value"
      >
        <el-form-item label="绑定小区" :label-width="formLabelWidth" prop="communityId">
          <el-select v-model="item.communityId" class="m-2" placeholder="Select" size="large" :disabled="!isRoot">
            <el-option
              v-for="item in communityNameList.value"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车位编号" :label-width="formLabelWidth" prop="carportNo">
          <!-- <el-input v-model="item.carportNo" autocomplete="off" validate-event /> -->
          <el-select v-model="item.carportNo" class="m-2" placeholder="Select" size="large" multiple>
            <el-option v-for="item in list" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="车位区号" :label-width="formLabelWidth" prop="sections">
          <!-- <el-input v-model="item.sections" autocomplete="off" /> -->
           <el-select v-model="item.sections" class="m-2" placeholder="Select" size="large" multiple>
            <el-option v-for="item in sectionList" :key="item" :label="item" :value="item" />
          </el-select>
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
import { addCarport, getAllCarPort, updateCarport, deleteCarportById, getAllParkingId } from '@/api/carport'
import { getCommunityNameList } from '@/api/community'
import carport from './carport'
import { ElMessage, ElMessageBox } from 'element-plus'
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const multipleSelection = ref([])
const communityNameList = reactive({})
// 删除的id
const selectIds = ref([])
const addValidForm = ref(null)
const updateValidForm = ref(null)
const parkingIdList = ref()
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
const list = ref([
  '001',
  '002',
  '003',
  '004',
  '005',
  '006',
  '007',
  '008',
  '009',
  '010',
  '011',
  '012',
  '013',
  '014',
  '015',
  '016',
  '017',
  '018',
  '019',
  '020',
  '021',
  '022',
  '023',
  '024',
  '025',
  '026',
  '027',
  '028',
  '029',
  '030',
  '031'
])
const sectionList = ref(['CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH'])
const handleAdd = () => {
  dialogFormVisible.value = !dialogFormVisible.value
  form.value = ''
}

getAllParkingId().then((res) => {
  parkingIdList.value = res.data
  console.log(parkingIdList.value)
})
// 处理单选框选中
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
getCommunityNameList().then((res) => {
  communityNameList.value = res.data
  console.log(res.data)
})
const formLabelWidth = '140px'
const updateForm = reactive({})
const addRules = reactive({
  name: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  parkingId: [{ required: true, message: '请输入停车场id', trigger: 'blur' }],
  carportNo: [{ required: true, message: '请输入车位编号', trigger: 'blur' }],
  sections: [{ required: true, message: '请输入车位区号', trigger: 'blur' }],
  communityId: [{ required: true, message: '请输入小区', trigger: 'change' }]
})
const updateRules = reactive({
  name: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  parkingId: [{ required: true, message: '请输入停车场id', trigger: 'blur' }],
  carportNo: [{ required: true, message: '请输入车位编号', trigger: 'blur' }],
  sections: [{ required: true, message: '请输入车位区号', trigger: 'blur' }],
  communityId: [{ required: true, message: '请输入小区', trigger: 'change' }]
})
const form = reactive({
  id: '',
  parkingId: '',
  communityId: '',
  name: '',
  carportNo: '',
  sections: ''
})
// 模糊搜索输入框内容
const searchInfo = ref('')
const searchPosition = () => {
  getListData()
}
// 请求首页广告列表
const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
  console.log(updateForm.value)
}
const getListData = async () => {
  const param = {
    info: searchInfo.value,
    pageIndex: page.value,
    pageSize: size.value,
    comId: userCommunityId.value
  }
  const result = await getAllCarPort(param)
  console.log(result.data)
  tableData.value = result.data
  total.value = result.total
}
getListData()

const handleAddShow = () => {
  dialogFormVisible.value = false
}

const handleAddConfirm = () => {
  const data = {
    parkingId: form.parkingId,
    carportNo: JSON.parse('"' + form.carportNo + '"'),
    sections: JSON.parse('"' + form.sections + '"'),
    communityId: form.communityId
  }
  addValidForm.value.validate(async (valid) => {
    if (valid) {
      const result = await addCarport(data)
      handleAddShow()
      form.value = ''
      console.log(result.data)
      ElMessage.success('新增成功')
      getListData()
    }
  })
}
const handleUpdateShow = () => {
  dialogUpateFormVisible.value = false
}
const handleUpdateConfirm = async () => {
  // console.log(updateForm)
  const data = {
    id: updateForm.value.id,
    parkingId: updateForm.value.parkingId,
    carportNo: JSON.parse('"' + updateForm.value.carportNo + '"'),
    sections: JSON.parse('"' + updateForm.value.sections + '"'),
    communityId: updateForm.value.communityId
  }
  console.log(data)
  const result = await updateCarport(data)

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
      await deleteCarportById(ids)
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

const deleteCarportByIds = (val) => {
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
      await deleteCarportById(ids)
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
// 分页请求
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
