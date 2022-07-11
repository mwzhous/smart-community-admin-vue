<template>
  <el-dialog title="评论详情" :model-value="modelValue" @close="closed">
    <el-row :gutter="10" class="search-box">
      <el-col :span="6">
        <el-input v-model="search" class="w-50 m-2" clearable placeholder="用户名、内容搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="searchList">
          <span><svg-icon icon="search" /></span>
          搜索</el-button
        >
        <el-button
          type="danger"
          v-if="isAuth(['ROOT', 'SQUARE:DELETE', 'COOPERATION:DELETE', 'SECONDHAND:DELETE', 'CARPOOL:DELETE'])"
          @click="onRemoveClick()"
          >批量删除</el-button
        >
      </el-col>
    </el-row>
    <el-table :data="tableData" border style="width: 100%" class="container" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" />
      <el-table-column
        v-for="(item, index) in comment"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      ></el-table-column>
      <el-table-column label="头像" align="center">
        <template v-slot="{ row }">
          <el-image class="avatar" :src="row.avatar" :preview-src-list="[row.avatar]"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评论时间" align="center" width="200">
        <template #default="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            type="danger"
            size="small"
            v-if="
              isAuth(['ROOT', 'SQUARE:DELETE', 'COOPERATION:DELETE', 'SECONDHAND:DELETE', 'CARPOOL:DELETE']) &&
              multipleSelection.length == 0
            "
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
  </el-dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import { getDiscussList, deleteDiscuss } from '@/api/discuss'
import { ElMessageBox, ElMessage } from 'element-plus'
import comment from './comment'

const props = defineProps({
  // 帖子id
  postId: {
    type: Number,
    requird: true
  },
  // 类型
  typeId: {
    type: Number,
    requird: true
  },
  openDialog: {
    type: Boolean,
    requird: true
  }
})

const emits = defineEmits(['update:modelValue'])

watch(
  () => {
    return props.postId
  },
  (val) => {
    if (val) getListData()
  }
)

/**
 * 关闭评论弹窗
 */
const closed = () => {
  emits('update:modelValue', false)
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

// 请求首页广场列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    postId: props.postId,
    typeId: props.typeId,
    keywords: search.value
  }
  const result = await getDiscussList(param)
  tableData.value = result.data
  total.value = result.total
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
      await deleteDiscuss(ids)
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
</script>
<style lang="scss" scoped>
.container {
  margin: 20px 0;
}

.icon {
  margin-left: 5px;
}
</style>
