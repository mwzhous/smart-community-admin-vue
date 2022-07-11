<template>
  <el-card>
    <el-row :gutter="20" class="search-box">
      <el-col :span="4">
        <el-input v-model="searchInfo" size="small" class="w-50 m-2" placeholder="卡种名称、价格搜索">
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
        <el-button type="danger" size="small" v-if="isAuth(['ROOT', 'CARD:DELETE'])" @click="deleteCardByIds()"
          >批量删除</el-button
        >
        <el-button type="warning" size="small" text @click="dialogFormVisible = true">增加</el-button>
      </el-col>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column v-for="(item, index) in card" :key="index" :prop="item.prop" :label="item.label" align="center">
        <template v-if="item.prop === 'action'" #default="{ row }">
          <span>{{ row.label }}</span>

          <el-button type="danger" size="mini" @click="deleteById(row)">删除</el-button>

          <el-button type="success" size="mini" @click="updateHandle(row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Form -->
    <el-dialog v-model="dialogFormVisible" title="增加停车卡信息" :append-to-body="false">
      <el-form :model="form" :rules="addRules" ref="addValidForm">
        <el-form-item label="停车场编号" :label-width="formLabelWidth" prop="parkingId">
          <el-select v-model="form.parkingId" placeholder="请选择卡种">
            <el-option
              v-show="isRoot"
              v-for="(item, index) in parkingIdList.value"
              :key="index"
              :label="item"
              :value="item"
            />
            <el-option
              v-show="!isRoot"
              v-for="item in tableData"
              :key="item.parkingId"
              :label="item.parkingId"
              :value="item.parkingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
          <el-input v-model="form.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="卡种名称" :label-width="formLabelWidth" prop="cardType">
          <el-select v-model="form.cardType" placeholder="请选择卡种">
            <el-option label="月卡" value="月卡" />
            <el-option label="季卡" value="季卡" />
            <el-option label="年卡" value="年卡" />
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

    <el-dialog v-model="dialogUpateFormVisible" title="修改停车卡信息">
      <el-form v-for="(item, index) in updateForm" :key="index">
        <el-form-item label="停车场编号" :label-width="formLabelWidth" prop="parkingId">
          <el-select v-model="item.parkingId" placeholder="请选择卡种" :disabled="!isRoot">
            <el-option
              v-show="isRoot"
              v-for="(item, index) in parkingIdList.value"
              :key="index"
              :label="item"
              :value="item"
            />
            <el-option
              v-show="!isRoot"
              v-for="(item, index) in tableData"
              :key="index"
              :label="item.parkingId"
              :value="item.parkingId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" :label-width="formLabelWidth">
          <el-input v-model="item.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="卡种名称" :label-width="formLabelWidth">
          <el-select v-model="item.cardType" placeholder="请选择卡种">
            <el-option label="月卡" value="月卡" />
            <el-option label="季卡" value="季卡" />
            <el-option label="年卡" value="年卡" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogUpateFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleUpdateConfirm">Confirm</el-button>
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
import { getAllParkingCard, deleteCardById, addParkingCard, updateCard, getAllParkingId } from '@/api/carport'
import card from './card'
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
const parkingIdList = reactive({})
const addRules = reactive({
  parkingId: [{ required: true, message: '请输入停车场编号', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  cardType: [{ required: true, message: '请输入卡种', trigger: 'blur' }]
})

const dialogFormVisible = ref(false)
const dialogUpateFormVisible = ref(false)
const formLabelWidth = '140px'
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  console.log(multipleSelection.value)
}
const updateHandle = (val) => {
  dialogUpateFormVisible.value = !dialogUpateFormVisible.value
  updateForm.value = val
}
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
const searchPosition = () => {
  getListData()
}
const form = reactive({
  id: '',
  parkingId: '',
  price: '',
  cardType: ''
})

const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    info: searchInfo.value,
    comId: userCommunityId.value
  }
  const result = await getAllParkingCard(param)
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

getAllParkingId().then((res) => {
  parkingIdList.value = res.data
  console.log(parkingIdList.value)
})
const handleAddConfirm = () => {
  const data = {
    parkingId: form.parkingId,
    price: form.price,
    name: form.cardType
  }
  addValidForm.value.validate(async (valid) => {
    if (valid) {
      const result = await addParkingCard(data)
      handleAddShow()
      console.log(result.data)
      ElMessage.success('新增成功')
      getListData()
    } else {
      ElMessage.error('提交格式有误')
      addValidForm.value.resetFields()
    }
  })
}
const handleUpdateConfirm = async () => {
  const data = {
    id: updateForm.value.id,
    parkingId: updateForm.value.parkingId,
    price: updateForm.value.price,
    name: updateForm.value.cardType
  }
  const result = await updateCard(data)

  handleUpdateShow()
  console.log(result.data)
  ElMessage.success('更新成功')
  getListData()
}
const deleteById = (val) => {
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
  }
  console.log(ids)
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteCardById(ids)
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

const deleteCardByIds = (val) => {
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
      await deleteCardById(ids)
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
