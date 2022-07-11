<template>
  <el-card>
    <el-row :gutter="6" class="searchInput">
      <el-col :span="3">
        <el-input v-model="searchInfo" :icon="Search" size="large" placeholder="搜索职位">
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
          @clear="community.communityId = null"
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
      <el-col :span="16">
        <el-button
          type="success"
          size="large"
          :icon="Search"
          v-if="isAuth(['ROOT', 'POSITION_CONFIG:SELECT'])"
          @click="searchPosition"
        >
          <span><svg-icon icon="search" /></span> 搜索职位</el-button
        >
        <el-button
          type="primary"
          size="large"
          v-if="isAuth(['ROOT', 'POSITION_CONFIG:INSERT'])"
          @click="addPositionStatus()"
          >新增部门</el-button
        >
        <el-button type="danger" size="large" v-if="isAuth(['ROOT', 'POSITION_CONFIG:DELETE'])" @click="delPosition()"
          >批量删除</el-button
        >
      </el-col>
    </el-row>

    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        show-overflow-tooltip="true"
        v-for="(item, index) in position"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        align="center"
      >
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="100" #default="{ row }">
        <el-button
          type="primary"
          size="mini"
          v-if="isAuth(['ROOT', 'POSITION_CONFIG:UPDATE'])"
          @click="clickUpdatePosition(row)"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="delPosition(row)" v-if="isAuth(['ROOT', 'POSITION_CONFIG:DELETE'])"
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
    <!-- 新增职位弹框 -->
    <el-dialog v-model="showWindow" title="新增" width="45%">
      <el-form :model="addting" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="小区名称" prop="communityId">
          <el-select v-model.number="addting.communityId" placeholder="请选择小区">
            <el-option
              v-for="item in communityList"
              :key="item.id"
              :label="item.communityName"
              :value="item.communityId"
              @click="selWorkerBycommunityId(item.communityId)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="职位名称" prop="name">
          <el-input placeholder="请输入职位名称" v-model="addting.name" />
        </el-form-item>
        <el-form-item label="职位描述">
          <el-input placeholder="请输入职位描述" v-model="addting.des" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWindow = false">取消</el-button>
          <el-button type="primary" @click="insertPosition(addting)">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 修改职位弹框 -->
    <el-dialog v-model="showUpdate" title="修改" width="45%">
      <el-form :model="onlyPosition" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="小区名称" prop="communityId">
          <el-select v-model.number="onlyPosition.communityId" :placeholder="onlyPosition.communityName">
            <el-option
              v-for="item in communityList"
              :key="item.id"
              :label="item.communityName"
              :value="item.communityId"
              @click="selWorkerBycommunityId(item.communityId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位名称" prop="name">
          <el-input placeholder="请输入小区名称" v-model="onlyPosition.name" />
        </el-form-item>
        <el-form-item label="职位描述">
          <el-input placeholder="请输入小区介绍" v-model="onlyPosition.des" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdate = false">取消</el-button>
          <el-button type="primary" @click="btnUpdatePosition(onlyPosition)">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { getPositionList, deletePosition, addPosition, updatePosition } from '@/api/position'
import { getCommunityNameList } from '@/api/community'
import { selWorkerBycId } from '@/api/worker'
import position from './position'
import { ElMessage, ElMessageBox } from 'element-plus'
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
// 新增职位
const addting = ref({})
// 职位数组
// const departmentList = ref([])
// 小区名称数组
const communityList = ref([])
// 员工数组
const workerList = ref([])

// 根据小区id来查询员工
const selWorkerBycommunityId = (communityId) => {
  selWorkerBycId(communityId).then((res) => {
    workerList.value = res.data
  })
}
// 查询小区
const community = ref([])

getCommunityNameList().then((res) => {
  community.value = res.data
  // console.log(community.value)
})
// 请求职位列表
const getListData = async () => {
  const param = {
    info: '',
    pageIndex: page.value,
    pageSize: size.value,
    communityId: store.getters.userInfo.communityId
  }
  const result = await getPositionList(param)
  tableData.value = result.data
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
const delPosition = (val) => {
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
    await deletePosition(ids)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
    ids = []
  })
}

// 校验规则
const ruleFormRef = ref(null)
const rules = ref({
  name: [
    {
      required: true,
      message: '输入错误',
      trigger: 'blur'
    }
  ]
})
// 遮罩层表单控制
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 新增
const insertPosition = (addting) => {
  // 新增数据
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addPosition(addting)
      showWindow.value = false
      // 重新渲染数据
      getListData()
      ruleFormRef.value.resetFields()
    }
  })
}

const showUpdate = ref(false)
const onlyPosition = ref({})
// 点击修改
const clickUpdatePosition = (row) => {
  // selWorkerBycommunityId(row.communityId)
  // 把需要用到的值拿到
  console.log(row)
  onlyPosition.value = {
    id: row.id,
    communityId: row.communityId,
    name: row.name,
    des: row.des
  }
  showUpdate.value = !showUpdate.value
}
// 修改
const btnUpdatePosition = (onlyPosition) => {
  // 校验规则
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log(onlyPosition)
      await updatePosition(onlyPosition)
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
  console.log(searchInfo.value)
  const param = {
    info: searchInfo.value,
    pageIndex: page.value,
    pageSize: size.value,
    communityId: store.getters.userInfo.communityId
  }
  if (community.value.communityId !== undefined) {
    param.communityId = community.value.communityId
    if (community.value.communityId === null) {
      param.communityId = 0
    }
  }
  const result = await getPositionList(param)
  console.log(result.data)
  console.log(result.total)
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
</style>
