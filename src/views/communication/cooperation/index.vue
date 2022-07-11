<template>
  <el-card class="square-container">
    <el-form inline>
      <el-form-item>
        <el-input v-model="search" style="width: 200px" clearable placeholder="昵称、内容搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="社区列表">
        <el-select
          v-model="searchCommunityId"
          style="width: 150px"
          clearable
          :disabled="!isRoot"
          placeholder="请选择社区"
          @change="handleCommunityChange"
        >
          <el-option
            v-for="item in communityList"
            :key="item.communityId"
            :label="item.communityName"
            :value="item.communityId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="status" style="width: 150px" clearable placeholder="是否下架" @change="handleStatusChange">
          <el-option v-for="item in statusFilter" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-button type="info" @click="searchList">
        <span><svg-icon icon="search" /></span>
        搜索</el-button
      >
      <el-button type="danger" v-if="isAuth(['ROOT', 'COOPERATION:DELETE'])" @click="onRemoveClick()"
        >批量删除</el-button
      >
      <el-button type="success" v-if="isAuth(['ROOT', 'COOPERATION:UPDATE'])" @click="changeStatus(1)"
        >批量上架</el-button
      >
      <el-button type="warning" v-if="isAuth(['ROOT', 'COOPERATION:UPDATE'])" @click="changeStatus(0)"
        >批量下架</el-button
      >
    </el-form>
    <el-table
      :data="tableData"
      border
      max-height="650"
      style="width: 100%"
      class="container"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column
        v-for="(item, index) in interact"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
        width="120"
      ></el-table-column>
      <el-table-column label="头像" align="center" width="120">
        <template v-slot="{ row }">
          <el-image class="avatar" :src="row.avatar" :preview-src-list="[row.avatar]"></el-image>
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容"
        align="center"
        min-width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="图片" align="center" width="250">
        <template v-slot="{ row }">
          <el-image
            :src="row.banner[0]"
            :preview-src-list="row.banner"
            fit="cover"
            style="width: 50px; height: 50px"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发帖时间" align="center" width="300">
        <template #default="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="300">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showDetail(row)"> 详情 </el-button>
          <el-button type="warning" size="small" @click="showComment(row)"> 评论 </el-button>
          <el-button
            :type="row.status ? 'success' : 'warning'"
            size="small"
            v-if="isAuth(['ROOT', 'SECONDHAND:DELETE']) && multipleSelection.length == 0"
            @click="changeStatus(row)"
          >
            <template v-if="row.status == 1"> 下架 </template>
            <template v-else> 上架 </template>
          </el-button>
          <el-button
            type="danger"
            size="small"
            v-if="isAuth(['ROOT', 'COOPERATION:DELETE']) && multipleSelection.length == 0"
            @click="onRemoveClick(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-row align="middle" justify="end">
      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="size"
        :pager-count="4"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-row>

    <Comment :post-id="postId" :type-id="typeId" v-model="commentIsShow" />

    <Detail :post-id="postId" :type-id="typeId" :item="info" v-model="detailIsShow" />
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import { getInteractList, deleteInteracts, updateStatus } from '@/api/interact'
import { getCommunityNameList } from '@/api/community'
import interact from './interact'
import { ElMessageBox, ElMessage } from 'element-plus'
import Comment from '@/components/Comment'
import Detail from '@/views/communication/components/Detail'

// 评论
// 帖子id
const postId = ref()
// 帖子类型
const typeId = ref()
const info = ref({})
// 是否显示评论弹框
const commentIsShow = ref(false)
const showComment = (row) => {
  commentIsShow.value = !commentIsShow.value
  postId.value = row.id
  typeId.value = row.typeId
}

// 保证每次打开重新获取帖子评论数据
watch(commentIsShow, (val) => {
  if (!val) {
    postId.value = null
    typeId.value = null
  }
})

// 是否显示详情弹框
const detailIsShow = ref(false)
const showDetail = (row) => {
  detailIsShow.value = !detailIsShow.value
  postId.value = row.id
  typeId.value = row.typeId
  info.value = row
}

// 数据相关
// 表格数据
const tableData = ref([])
// 总条数
const total = ref(0)
// 页数
const page = ref(1)
// 每页条数
const size = ref(10)
// 搜索关键字
const search = ref('')
// 多选项
const multipleSelection = ref([])
// 删除的id
const selectIds = ref([])

// 条件筛选
const status = ref('')

const statusFilter = [
  {
    value: 0,
    label: '下架'
  },
  {
    value: 1,
    label: '上架'
  }
]
// 监听状态改变
const handleStatusChange = (val) => {
  status.value = val
}

// 是否是超管
const isRoot = ref(false)
// 社区管理员id
const userCommunityId = ref(0)
// 搜索社区
const searchCommunityId = ref(null)
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
    searchCommunityId.value = info.communityId
  }
}
getAdminCommunityId()
// 监听社区选择
const handleCommunityChange = (val) => {
  searchCommunityId.value = val
}

// 社区列表
const communityList = ref([])
// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityList.value = result.data
}
// 获取社区列表
getCommunityList()

// 请求首页互助列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    communityId: searchCommunityId.value,
    status: status.value,
    keywords: search.value
  }
  const result = await getInteractList(param)
  result.data = result.data.map((item) => {
    item.banner = item.banner
      .substr(1)
      .substring(0, item.banner.length - 2)
      .split(',')
    return item
  })
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

// 搜索列表
const searchList = () => {
  getListData()
}

// 删除数据
const onRemoveClick = (val) => {
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
    // console.log(ids)
  } else {
    multipleSelection.value = []
    ids.push(val.id)
    // console.log(ids)
  }
  selectIds.value = ids
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    // 选择确认
    .then(async () => {
      const param = {
        ids
      }
      await deleteInteracts(param)
      ElMessage.success('删除成功')
      selectIds.value = []
      ids = []
      // console.log(selectIds.value)
      // 重新渲染数据
      getListData()
    })
    // 选择取消
    .catch(() => {
      ids = []
      selectIds.value = []
      // console.log(selectIds.value)
      // console.log(ids)
    })
}

// 监听复选框
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 上架下架
const changeStatus = async (row) => {
  let items = []
  if ((row === 1 || row === 0) && multipleSelection.value.length === 0) {
    ElMessage.error('还未选中要删除的项目')
    return
  }
  if (row === 1) {
    // 批量上架
    // console.log('批量上架')
    items = []
    items = multipleSelection.value.map((item) => {
      item.status = 1
      item.banner = item.banner.toString
      return item
    })
  } else if (row === 0) {
    // 批量下架
    // console.log('批量下架')
    items = []
    items = multipleSelection.value.map((item) => {
      item.status = 0
      item.banner = item.banner.toString
      return item
    })
  } else {
    // console.log(row.status)
    row.status = Number(!row.status)
    row.banner = row.banner.toString
    items.push(row)
    // console.log(row.status)
  }
  // console.log(items)
  const param = {
    list: items
  }
  await updateStatus(param)
  ElMessage.success('改变状态成功')
  // 重新渲染数据
  getListData()
}
</script>

<style lang="scss" scoped>
.square-container {
  .container {
    margin-bottom: 20px;
  }

  .icon {
    margin-left: 5px;
  }

  ::v-deep(.avatar) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}
</style>
