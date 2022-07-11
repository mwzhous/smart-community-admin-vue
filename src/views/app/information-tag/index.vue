<template>
  <el-card>
    <el-form inline style="margin-bottom: 15px">
      <el-button type="primary" v-if="isAuth(['ROOT', 'INFORMATION_TAG:INSERT'])" @click="showModule()"
        >新增标签</el-button
      >
      <el-button type="danger" v-if="isAuth(['ROOT', 'INFORMATION_TAG:DELETE'])" @click="deleteTag()"
        >批量删除标签
      </el-button>
      <el-form-item label="请选择筛选小区" style="margin-left: 10px">
        <el-select placeholder="请选择筛选小区" clearable v-model="communityId">
          <el-option
            v-for="(item, index) in communityList"
            :key="index"
            :label="item.communityName"
            :value="item.communityId"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-button type="info" v-if="isAuth(['ROOT', 'INFORMATION_TAG:SELECT'])" @click="getListData()">搜索</el-button>
    </el-form>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column v-for="(item, index) in tag" :key="index" :prop="item.prop" :label="item.label" align="center">
      </el-table-column>

      <el-table-column label="操作" align="center" width="200">
        <template #default="{ row }">
          <el-button type="success" size="mini" @click="showEditTag(row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

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
    <el-dialog
      v-model="tagModule"
      :title="!tagInfo.id ? '新增资讯标签' : '修改资讯标签'"
      width="35%"
      @close="closeEdit()"
    >
      <el-form :rules="rules" ref="ruleFormRef" :model="tagInfo" label-width="80px">
        <el-form-item label="标签名称" style="margin-left: 10px" prop="title">
          <el-input placeholder="请输入标签名称" v-model="tagInfo.title" />
        </el-form-item>
        <el-form-item label="发布社区" style="margin-left: 10px" prop="communityId">
          <el-select placeholder="请选择选择发布社区" clearable v-model="tagInfo.communityId" :disabled="tagInfo.id">
            <el-option
              v-for="(item, index) in communityList"
              :key="index"
              :label="item.communityName"
              :value="item.communityId"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEdit()" v-if="!tagInfo.id">取消</el-button>
          <el-button @click="closeModule()" v-else>取消</el-button>
          <el-button @click="saveTag()" v-if="!tagInfo.id">确定</el-button>
          <el-button @click="editTag()" v-else>确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { getNewsTagList, addNewsTag, updateNewsTag, deleteNewsTag } from '@/api/news-tag.js'
import { getCommunityNameList } from '@/api/community'
import tag from './tag'
import { ElMessageBox, ElMessage } from 'element-plus'

// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const tagModule = ref(false)
// 社区列表
const communityList = ref([])
// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [{ required: true, message: '请输入标签名称' }],
  communityId: [
    {
      required: true,
      message: '请选择发布社区'
    }
  ]
})
const communityId = ref('')
// 多选项
const multipleSelection = ref([])
const tagInfo = ref({})
// 资讯标签列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    id: communityId.value
  }
  const result = await getNewsTagList(
    param
  )
  tableData.value = result.data.data
  total.value = result.data.total
}

// 请求楼栋列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityList.value = result.data
}
getCommunityList()
getListData()
// 页码改变
const handleSizeChange = (currentSize) => {
  size.value = currentSize
  getListData()
}
const handleCurrentChange = (currentSize) => {
  page.value = currentSize
  getListData()
}
// 新增标签弹框
const showModule = () => {
  tagModule.value = true
}
// 显示编辑框
const showEditTag = (row) => {
  tagModule.value = true
  tagInfo.value = row
}
// 关闭新增弹框
const closeEdit = () => {
  tagModule.value = false
  ruleFormRef.value.resetFields()
}
// 关闭修改弹框
const closeModule = () => {
  tagModule.value = false
}
// 新增标签
const saveTag = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await addNewsTag(tagInfo.value)
      tagModule.value = false
      ElMessage.success('资讯标签新增成功')
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}

// 修改标签
const editTag = async () => {
  await updateNewsTag(tagInfo.value)
  tagModule.value = false
  ElMessage.success('修改成功')
  getListData()
}
// 获取选中列表id
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 批量修改
const deleteTag = async () => {
  let ids = []
  if (multipleSelection.value.length === 0) {
    ElMessage.error('还未选中要删除的标签')
    return
  }
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteNewsTag(ids)
      ElMessage.success('删除成功')
      multipleSelection.value = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      multipleSelection.value = []
    })
}

</script>

<style lang ="scss" scoped>
.el-row {
  margin-bottom: 10px;
}
.avatar-uploader {
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #8c939d;
  border-radius: 6px;
  cursor: pointer;
}
.avatar {
  width: 128px;
  height: 128px;
  border-radius: 6px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
