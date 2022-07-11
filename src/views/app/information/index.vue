<template>
  <el-card>
    <el-form inline>
      <el-button type="primary" @click="showModule()" v-if="isAuth(['ROOT', 'INFORMATION:SELECT'])">新增资讯</el-button>
      <el-button
        type="danger"
        @click="onRemoveClick()"
        v-if="isAuth(['ROOT', 'INFORMATION:DELETE'])"
        style="margin-right: 10px"
        >批量删除资讯</el-button
      >

      <el-form-item label="资讯展示类型" prop="type">
        <el-select placeholder="请选择资讯展示类型" v-model="type" clearable style="width: 160px">
          <el-option label="富文本" value="0" />
          <el-option label="外链" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="资讯是否置顶" prop="isTop">
        <el-select placeholder="请选择资讯是否置顶" v-model="isTop" clearable style="width: 160px">
          <el-option label="否" value="0" />
          <el-option label="是" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="请选择发布小区" :label-width="formLabelWidth" prop="communityId" style="margin-left: 10px">
        <el-select
          placeholder="请选择发布小区"
          v-model="communityId"
          clearable
          style="width: 160px"
          :disabled="user.communityId !== 0"
        >
          <el-option
            :label="item.communityName"
            :value="item.communityId"
            v-for="(item, index) in communityList"
            :key="index"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="title" style="margin-left: 10px">
        <el-input placeholder="请输入资讯标题" style="width: 160px" v-model="title" clearable />
      </el-form-item>
      <el-button
        type="info"
        :icon="Search"
        @click="getListData()"
        v-if="isAuth(['ROOT', 'INFORMATION:SELECT'])"
        style="margin-right: 10px"
        >搜索</el-button
      >
    </el-form>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column
        v-for="(item, index) in information"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :align="item.align"
        :width="item.width"
      >
        <template #default="{ row }" v-if="item.prop == 'imageUrl'">
          <el-image :src="row.imageUrl" style="height: 50px; width: 140px" />
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'isTop'">
          <el-tag v-if="row.isTop == 0"> 否 </el-tag>
          <el-tag v-else type="warning"> 是 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 0" type="success"> 富文本 </el-tag>
          <el-tag v-else type="info"> 外链 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'link'">
          <el-tag v-if="row.link == null || row.link == ''" type="primary"> 暂无链接内容 </el-tag>
          <el-row v-else>{{ row.link }}</el-row>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="success" size="mini" @click="showEditANews(row)">修改</el-button>
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
    <!-- 资讯详情 -->
    <el-dialog v-model="newsModule" :title="!news.id ? '新增资讯' : '编辑资讯'" width="45%" @close="closeNewsModule()">
      <el-form :model="news" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="资讯名称" :label-width="formLabelWidth" prop="title">
          <el-input placeholder="请输入标题" clearable v-model="news.title" />
        </el-form-item>
        <el-form-item label="发布社区" :label-width="formLabelWidth" prop="communityId">
          <el-select placeholder="发布社区" v-model="news.communityId" :disabled="user.communityId !== 0">
            <el-option
              :label="item.communityName"
              :value="item.communityId"
              v-for="(item, index) in communityList"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="资讯标签" :label-width="formLabelWidth" prop="tagId">
          <el-select placeholder="资讯标签" v-model="news.tagId">
            <el-option :label="item.title" :value="item.id" v-for="(item, index) in tags" :key="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示类型" prop="type">
          <el-radio-group v-model="news.type">
            <el-radio label="1">外链</el-radio>
            <el-radio label="0">富文本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外链地址" prop="link" v-if="news.type == 1" :label-width="formLabelWidth">
          <el-input placeholder="请输入外链地址" clearable v-model="news.link" />
        </el-form-item>
        <el-form-item label="富文本" v-if="news.type == 0">
          <editor ref="infoEditor"></editor>
        </el-form-item>
        <el-form-item label="是否显示置顶" prop="isTop">
          <el-radio-group v-model="news.isTop">
            <el-radio label="0">否</el-radio>
            <el-radio label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="资讯封面图" prop="imageUrl">
          <el-upload
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadFile"
            :class="{ 'avatar-uploader': !news.imageUrl }"
          >
            <img v-if="news.imageUrl" :src="news.imageUrl" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeNewsModule()">取消</el-button>
          <el-button type="primary" @click="insertNews()" v-if="!news.id">确定</el-button>
          <el-button type="primary" @click="editNews()" v-else>确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { uploadAdvertise } from '@/api/advertising'
import { getNewsList, addNews, deleteNews, updateNews } from '@/api/news'
import { getCommunityNameList } from '@/api/community'
import { getNewsTagByCommunityId } from '@/api/news-tag'
import information from './information'
import { IMG_URL } from '@/constant'
import { ElMessageBox, ElMessage } from 'element-plus'
import Editor from '@/components/Editor'
import { useStore } from 'vuex'

// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const newsModule = ref(false)
const news = ref({})
const communityList = ref([])
const tags = ref([])
const fileName = ref()
// 富文本内容
const infoEditor = ref(null)
const type = ref('')
const isTop = ref('')
const title = ref('')
const store = useStore()
const user = store.getters.userInfo
const communityId = ref(user.communityId === 0 ? '' : user.communityId)
// 多选项
const multipleSelection = ref([])
// 请求首页资讯列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    type: type.value,
    isTop: isTop.value,
    communityId: communityId.value,
    title: title.value === '' ? null : title.value
  }
  const result = await getNewsList(
    param
  )
  tableData.value = result.data
  total.value = result.total
}
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
// 请求楼栋列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityList.value = result.data
}
getCommunityList()
// 资讯标签
const getTags = async () => {
  tags.value = []
  const param = {
    pageIndex: 1,
    pageSize: 10,
    id: news.value.communityId === undefined ? 1 : news.value.communityId
  }
  const result = await getNewsTagByCommunityId(param)
  tags.value = result.data.data
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadAdvertise({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    news.value.imageUrl = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}

// 校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [
    { required: true, message: '请输入资讯名称' }
  ],
  communityId: [
    {
      required: true,
      message: '请选择展示要发布的社区'
    }
  ],
  tagId: [
    {
      required: true,
      message: '请选择资讯Tag'
    }
  ],
  type: [
    {
      required: true,
      message: '请选择展示类型'
    }
  ],
  isTop: [
    {
      required: true,
      message: '是否置顶'
    }
  ],
  imageUrl: [
    {
      required: true,
      message: '请上传资讯封面图'
    }
  ]
})
const showModule = () => {
  newsModule.value = true
  getCommunityList()
  getTags()
  if (user.communityId !== 0) {
    news.value.communityId = user.communityId
  }
}

// 获取选中列表id
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const closeNewsModule = () => {
  newsModule.value = false
  ruleFormRef.value.resetFields()
}
// 新增资讯
const insertNews = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      news.value.imageUrl = IMG_URL + 'admin-api/' + fileName.value
      await addNews(news.value)
      newsModule.value = false
      ElMessage.success('资讯新增成功')
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}

// 富文本内容
const setContentValue = async () => {
  await nextTick()
  infoEditor.value.setValue(news.value.content)
}

// 修改资讯信息
const showEditANews = async (row) => {
  newsModule.value = true
  getCommunityList()
  getTags()
  await nextTick()
  news.value = {
    id: row.id,
    communityId: row.communityId,
    title: row.title,
    tagId: row.tagId,
    type: row.type.toString(),
    isTop: row.isTop.toString(),
    link: row.link,
    imageUrl: row.imageUrl,
    content: row.content
  }
  setContentValue()
}

// 修改资讯
const editNews = async () => {
  if (infoEditor.value != null) {
    if (infoEditor.value.getValue() === '') {
      ElMessage.warning('请输入富文本内容')
      return
    } else {
      news.value.content = infoEditor.value.getValue()
    }
  }
  await updateNews(news.value)
  newsModule.value = false
  ElMessage.success('修改成功')
  getListData()
}

// 批量删除数据
const onRemoveClick = () => {
  let ids = []
  if (multipleSelection.value.length === 0) {
    ElMessage.error('还未选中要删除的项目')
    return
  }
  ids = multipleSelection.value.map((item) => {
    return item.id
  })
  ElMessageBox.confirm('确认要删除吗？', {
    type: 'warning'
  })
    .then(async () => {
      await deleteNews(ids)
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
