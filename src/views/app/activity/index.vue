<template>
  <el-card>
    <el-form inline>
      <el-button type="primary" v-if="isAuth(['ROOT', 'ACTIVITY:INSERT'])" @click="showModule()">新增活动</el-button>
      <el-button type="danger" v-if="isAuth(['ROOT', 'ACTIVITY:DELETE'])" @click="onRemoveClick()"
        >批量删除公告</el-button
      >
      <el-form-item label="请选择发布小区" :label-width="formLabelWidth" prop="communityId" style="margin-left: 10px">
        <el-select placeholder="请选择发布小区" v-model="communityId" clearable :disabled="user.communityId !== 0">
          <el-option
            :label="item.communityName"
            :value="item.communityId"
            v-for="(item, index) in communityList"
            :key="index"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="展示类型" prop="type">
        <el-select placeholder="展示类型" v-model="type" clearable style="width: 140px">
          <el-option label="外链" value="0" />
          <el-option label="富文本" value="1" />
        </el-select>
      </el-form-item>

      <el-form-item label="是否上架" prop="status">
        <el-select placeholder="是否上架" v-model="status" clearable style="width: 140px">
          <el-option label="是" value="0" />
          <el-option label="否" value="1" />
        </el-select>
      </el-form-item>
      <el-button
        type="info"
        :icon="Search"
        @click="getListData()"
        v-if="isAuth(['ROOT', 'ACTIVITY:SELECT'])"
        style="margin-right: 10px"
        >搜索</el-button
      >
    </el-form>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column
        v-for="(item, index) in activityColumn"
        :key="index"
        :label="item.label"
        :width="item.width"
        :prop="item.prop"
        :align="item.align"
      >
        <template #default="{ row }" v-if="item.prop == 'activeImg'">
          <el-image :src="row.activeImg" style="height: 50px; width: 140px" />
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'noticeUrl'">
          <el-tag v-if="row.noticeUrl == null || row.noticeUrl == ''">暂无跳转链接</el-tag>
          <el-row v-else>{{ row.noticeUrl.substring(0, 20) }}……</el-row>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 0">外链</el-tag>
          <el-tag v-else>富文本</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'status'">
          <el-tag v-if="row.status == 0">是</el-tag>
          <el-tag v-else>否</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'startTime'">
          {{ $filters.dateTimeFilter(row.startTime) }}
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'endTime'">
          {{ $filters.dateTimeFilter(row.endTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="success" size="mini" @click="editAdvertise(row)">修改</el-button>
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
      v-model="activityModule"
      :title="!activity.id ? '新增活动' : '编辑活动'"
      width="35%"
      @closed="closeActivityModule"
    >
      <el-form :model="activity" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="活动标题" :label-width="formLabelWidth" prop="activeTitle">
          <el-input placeholder="请输入活动标题" clearable v-model="activity.activeTitle" />
        </el-form-item>
        <el-form-item label="请选择发布小区" :label-width="formLabelWidth" prop="communityId">
          <el-select placeholder="请选择发布小区" v-model="activity.communityId" :disabled="user.communityId !== 0">
            <el-option
              :label="item.communityName"
              :value="item.communityId"
              v-for="(item, index) in communityList"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="展示类型" prop="type">
          <el-radio-group v-model="activity.type">
            <el-radio label="0">外链</el-radio>
            <el-radio label="1">富文本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外链地址" prop="linkUrl" v-if="activity.type == 0" :label-width="formLabelWidth">
          <el-input placeholder="请输入外链地址" clearable v-model="activity.noticeUrl" />
        </el-form-item>
        <el-form-item label="富文本" v-if="activity.type == 1">
          <editor ref="infoEditor"></editor>
        </el-form-item>
        <el-form-item label="是否上架" prop="status">
          <el-radio-group v-model="activity.status">
            <el-radio label="0">是</el-radio>
            <el-radio label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动开始时间" prop="startTime">
          <el-date-picker
            v-model="activity.startTime"
            type="date"
            placeholder="请选择活动开始时间"
            :disabledDate="startTimePicker"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="活动结束时间" prop="endTime">
          <el-date-picker
            v-model="activity.endTime"
            type="date"
            placeholder="请选择活动结束时间"
            :disabledDate="endTimePicker"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="封面图" prop="activeImg">
          <el-upload
            :class="{ 'avatar-uploader': !activity.activeImg }"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadFile"
          >
            <img v-if="activity.activeImg" :src="activity.activeImg" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeActivityModule()">取消</el-button>
          <el-button type="primary" @click="insertActivity()" v-if="!activity.id">确定</el-button>
          <el-button type="primary" @click="confirmEdit()" v-else>确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useStore } from 'vuex'
import { uploadAdvertise } from '@/api/advertising'
import { getActivityList, addActivity, updateActivity, deleteActivity } from '@/api/activity'
import { getCommunityNameList } from '@/api/community'
import activityColumn from './activity'
import { IMG_URL } from '@/constant'
import { ElMessageBox, ElMessage } from 'element-plus'
import Editor from '@/components/Editor'

// 活动对象
const activity = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()

const type = ref('')
const status = ref('')
const activityModule = ref(false)
const date = new Date()
// 富文本内容
const infoEditor = ref(null)
// 多选项
const multipleSelection = ref([])
// 小区列表
const communityList = ref([])
// 文本框校验规则
const ruleFormRef = ref(null)
const store = useStore()
const user = store.getters.userInfo
console.log(user.communityId)
const communityId = ref(user.communityId === 0 ? '' : user.communityId)
const rules = ref({
  activeTitle: [{ required: true, message: '请输入活动标题' }],
  communityId: [
    {
      required: true,
      message: '请选择发布小区'
    }
  ],
  type: [
    {
      required: true,
      message: '请选择展示类型'
    }
  ],
  status: [
    {
      required: true,
      message: '请选择是否上架'
    }
  ],
  startTime: [
    {
      required: true,
      message: '请选择开始时间'
    }
  ],
  endTime: [
    {
      required: true,
      message: '请选择结束时间'
    }
  ],
  activeImg: [
    {
      required: true,
      message: '请上传活动封面图'
    }
  ]
})
// 请求首页广告列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    communityId: communityId.value,
    type: type.value,
    status: status.value

  }
  const result = await getActivityList(param)
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

const showModule = () => {
  setContentValue()
  activityModule.value = true
  if (user.communityId !== 0) {
    activity.value.communityId = user.communityId
  }
}
// 请求楼栋列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityList.value = result.data
}
getCommunityList()
// 开始时间选择器
const startTimePicker = (time) => {
  return time.getTime() < new Date(date.getTime() - 24 * 60 * 60 * 1000)
}

// 结束时间选择器
const endTimePicker = (time) => {
  return time.getTime() < activity.value.startTime
}

// 富文本内容
const setContentValue = async () => {
  await nextTick()
  infoEditor.value.setValue(activity.value.content)
}

const closeActivityModule = () => {
  activityModule.value = false
  ruleFormRef.value.resetFields()
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadAdvertise({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    activity.value.activeImg = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}
// 新增广告
const insertActivity = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (infoEditor.value != null) {
        if (infoEditor.value.getValue() === '') {
          ElMessage.warning('请输入富文本内容')
          return
        } else {
          activity.value.content = infoEditor.value.getValue()
        }
      }
      console.log(activity.value)
      await addActivity(activity.value)
      activityModule.value = false
      ElMessage.success('活动新增成功')
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}
// 修改活动弹框
const editAdvertise = async (row) => {
  activityModule.value = true
  await nextTick()
  activity.value = {
    id: row.id,
    activeTitle: row.activeTitle,
    communityId: row.communityId,
    type: row.type.toString(),
    status: row.status.toString(),
    content: row.content,
    startTime: row.startTime,
    endTime: row.endTime,
    noticeUrl: row.noticeUrl,
    activeImg: row.activeImg
  }
  setContentValue()
}

// 修改活动
const confirmEdit = () => {
  console.log(activity.value.startTime)
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (infoEditor.value != null) {
        if (infoEditor.value.getValue() === '') {
          ElMessage.warning('请输入富文本内容')
          return
        } else {
          activity.value.content = infoEditor.value.getValue()
        }
      }
      if (activity.value.type === 0) {
        activity.value.content = ''
      } else {
        activity.value.noticeUrl = ''
      }
      activity.value.type = parseInt(activity.value.type)
      activity.value.status = parseInt(activity.value.status)
      await updateActivity(activity.value)
      activityModule.value = false
      ElMessage.success('活动修改成功')
      getListData()
    } else {
      return false
    }
  })
}
// 获取选中列表id
const handleSelectionChange = (val) => {
  multipleSelection.value = val
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
      await deleteActivity(ids)
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

<style lang="scss" scoped>
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
