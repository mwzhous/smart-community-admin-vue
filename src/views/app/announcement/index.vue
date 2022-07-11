<template>
  <el-card>
    <el-form inline>
      <el-button type="primary" v-if="isAuth(['ROOT', 'ANNOUNCEMENT:INSERT'])" @click="showModule()"
        >新增公告</el-button
      >
      <el-button type="danger" v-if="isAuth(['ROOT', 'ANNOUNCEMENT:DELETE'])" @click="onRemoveClick()"
        >批量删除公告</el-button
      >
      <el-form-item label="请选择发布小区" :label-width="formLabelWidth" style="margin-left: 10px">
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
      <el-form-item label="请选择展示类型">
        <el-select placeholder="请选择展示类型" v-model="type" clearable style="width: 140px">
          <el-option label="富文本" value="0" />
          <el-option label="外链" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="公告类型" :label-width="formLabelWidth">
        <el-select placeholder="请选择公告类型" v-model="showType" clearable>
          <el-option label="社区公告" value="0" />
          <el-option label="跳蚤市场公告" value="1" />
          <el-option label="小区商城公告" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="请输入公告标题" v-model="keyWords" clearable />
      </el-form-item>
      <el-button
        type="info"
        :icon="Search"
        @click="getListData()"
        v-if="isAuth(['ROOT', 'ANNOUNCEMENT:SELECT'])"
        style="margin-right: 10px"
        >搜索</el-button
      >
    </el-form>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column
        v-for="(item, index) in announcement"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :align="item.align"
        :width="item.width"
      >
        <template #default="{ row }" v-if="item.prop == 'imageUrl'">
          <el-tag v-if="row.imageUrl == ''"> 暂无封面</el-tag>
          <el-image :src="row.imageUrl" style="height: 80px; width: 180px" v-else />
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'showType'">
          <el-tag v-if="row.showType == 0"> 社区公告 </el-tag>
          <el-tag v-else-if="row.showType == 1" type="warning"> 跳蚤市场公告 </el-tag>
          <el-tag v-else type="success"> 小区商城公告 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 0" type="success"> 富文本 </el-tag>
          <el-tag v-else type="info"> 外链 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'linkUrl'">
          <el-tag v-if="row.linkUrl == null"> 暂无跳转链接 </el-tag>
          <el-row>{{ row.linkUrl }} </el-row>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="success" size="mini" @click="showEditAnnouncement(row)">修改</el-button>
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
    <!-- 公告详情 -->
    <el-dialog
      v-model="announcementModule"
      :title="!bulletin.id ? '新增公告' : '编辑公告'"
      width="35%"
      @close="closeModule()"
    >
      <el-form :model="bulletin" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="公告名称" :label-width="formLabelWidth" prop="title">
          <el-input placeholder="请输入标题" clearable v-model="bulletin.title" />
        </el-form-item>
        <el-form-item label="发布社区" :label-width="formLabelWidth" prop="communityId">
          <el-select placeholder="发布社区" v-model="bulletin.communityId" :disabled="user.communityId !== 0">
            <el-option
              :label="item.communityName"
              :value="item.communityId"
              v-for="(item, index) in communityList"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公告类型" :label-width="formLabelWidth" prop="showType">
          <el-select placeholder="展示端" v-model="bulletin.showType">
            <el-option label="社区公告" value="0" />
            <el-option label="跳蚤市场公告" value="1" />
            <el-option label="小区商城公告" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示类型" prop="type">
          <el-radio-group v-model="bulletin.type">
            <el-radio label="1">外链</el-radio>
            <el-radio label="0">富文本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外链地址" prop="linkUrl" v-if="bulletin.type == 1" :label-width="formLabelWidth">
          <el-input placeholder="请输入外链地址" clearable v-model="bulletin.linkUrl" />
        </el-form-item>
        <el-form-item label="富文本" v-if="bulletin.type == 0">
          <editor ref="infoEditor"></editor>
        </el-form-item>
        <el-form-item label="公告封面图" prop="imageUrl">
          <el-upload
            :class="{ 'avatar-uploader': !bulletin.imageUrl }"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadFile"
          >
            <img v-if="bulletin.imageUrl" :src="bulletin.imageUrl" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeModule()">取消</el-button>
          <el-button type="primary" @click="insertAnnouncement()" v-if="!bulletin.id">确定</el-button>
          <el-button type="primary" @click="editAnnouncement()" v-else>确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useStore } from 'vuex'
import { getAnnouncement, addAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/api/announcement'
import { getCommunityNameList } from '@/api/community'
import { uploadAdvertise } from '@/api/advertising'
import announcement from './announcement'
import Editor from '@/components/Editor/index.vue'
import { IMG_URL } from '@/constant'
import { ElMessageBox, ElMessage } from 'element-plus'

// 数据相关
const tableData = ref([])
const communityList = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()
const announcementModule = ref(false)
const type = ref('')
const showType = ref('')
const keyWords = ref('')
const store = useStore()
const user = store.getters.userInfo
const communityId = ref(user.communityId === 0 ? '' : user.communityId)
// 富文本内容
const infoEditor = ref(null)
// 多选项
const multipleSelection = ref([])
const bulletin = ref({})
// 请求公告列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    communityId: communityId.value,
    type: type.value,
    showType: showType.value,
    keyWords: keyWords.value === '' ? null : keyWords.value
  }
  const result = await getAnnouncement(
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
// 校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [
    { required: true, message: '请输入公告名称' }
  ],
  communityId: [
    {
      required: true,
      message: '请选择展示要发布的社区'
    }
  ],
  showType: [
    {
      required: true,
      message: '请选择展示客户端'
    }
  ],
  type: [
    {
      required: true,
      message: '请选择展示类型'
    }
  ],
  imageUrl: [
    {
      required: true,
      message: '请上传公告封面图'
    }
  ],
  content: [
    {
      required: false
    }
  ],
  linkUrl: [
    {
      required: false
    }
  ]
})
// 关闭弹框
const closeModule = () => {
  announcementModule.value = false
  ruleFormRef.value.resetFields()
}
// 获取选中列表id
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 富文本内容
const setContentValue = async () => {
  await nextTick()
  infoEditor.value.setValue(bulletin.value.content)
}
// 请求楼栋列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityList.value = result.data
}
// 新增公告弹框
const showModule = () => {
  announcementModule.value = true
  getCommunityList()
  if (user.communityId !== 0) {
    bulletin.value.communityId = user.communityId
  }
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadAdvertise({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    bulletin.value.imageUrl = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}
// 新增公告
const insertAnnouncement = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (infoEditor.value != null) {
        if (infoEditor.value.getValue() === '') {
          ElMessage.warning('请输入富文本内容')
          return
        } else {
          bulletin.value.content = infoEditor.value.getValue()
        }
      }
      bulletin.value.imageUrl = IMG_URL + 'admin-api/' + fileName.value
      await addAnnouncement(bulletin.value)
      ruleFormRef.value.resetFields()
      announcementModule.value = false
      ElMessage.success('公告新增成功')
      getListData()
    } else {
      return false
    }
  })
}

// 编辑公告
const editAnnouncement = async () => {
  await updateAnnouncement(bulletin.value)
  announcementModule.value = false
  ElMessage.success('修改成功')
  ruleFormRef.value.resetFields()
  getListData()
}
// 批量删除
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
      await deleteAnnouncement(ids)
      ElMessage.success('删除成功')
      multipleSelection.value = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      multipleSelection.value = []
    })
}
getCommunityList()
const showEditAnnouncement = async (row) => {
  announcementModule.value = true
  await nextTick()
  bulletin.value = {
    id: row.id,
    communityId: row.communityId,
    title: row.title,
    linkUrl: row.linkUrl,
    showType: row.showType.toString(),
    imageUrl: row.imageUrl,
    type: row.type.toString(),
    content: row.content
  }
  if (bulletin.value.content != null) {
    setContentValue()
  }
}

</script>

<style lang ="scss" scoped>
.el-row {
  margin-bottom: 10px;
}
.avatar-uploader {
  width: 220px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #8c939d;
  border-radius: 6px;
  cursor: pointer;
}
.avatar {
  width: 220px;
  height: 75px;
  border-radius: 6px;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 220px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
