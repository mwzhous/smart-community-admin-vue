<template>
  <el-card class="mt-2">
    <el-form inline>
      <el-form-item label="标题：">
        <el-input v-model="search" class="w-50 m-2" placeholder="请输入标题">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="消息类型：">
        <el-select v-model="type" clearable placeholder="请选择">
          <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否发送全部：">
        <el-select v-model="pushType" clearable placeholder="请选择">
          <el-option v-for="item in pushTypeList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="getListData()">搜索</el-button>
        <el-button type="primary" v-if="isAuth(['ROOT', 'NOTICE:INSERT'])" @click="addInformModal()"
          >新增通知</el-button
        >
        <el-button type="danger" v-if="isAuth(['ROOT', 'NOTICE:INSERT'])" @click="batchDel()">批量删除</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'NOTICE:EXPORT'])" @click="exportNoti()">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in informList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'content'">
          <div v-if="row.type == 0" v-html="row.content"></div>
          <div v-else>{{ row.link }}</div>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 0"> 文本类型 </el-tag>
          <el-tag v-else type="warning"> 链接类型 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'pushType'">
          <el-tag v-if="row.pushType == 0"> 发送全部 </el-tag>
          <el-tag v-else type="warning"> 不发送全部 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'createUserId'">
          <el-tag v-if="row.pushType != 1"> 未推送 </el-tag>
          <el-tag v-else type="warning"> 已推送 </el-tag>
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" min-width="150" align="center">
        <el-button type="primary" size="mini" @click="sendWs(row)" v-if="row.pushType != 1">推送</el-button>
        <el-button type="success" size="mini" @click="updateInformModel(row)" v-if="isAuth(['ROOT', 'NOTICE:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="deleteInform(row)" v-if="isAuth(['ROOT', 'NOTICE:DELETE'])"
          >删除</el-button
        >
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination mt-2 f-right mb-2"
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

  <el-dialog v-model="addModel" :title="inform.id == undifined ? '新增通知' : '修改通知'" width="40%">
    <el-form :model="inform" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="通知标题" :label-width="formLabelWidth" prop="title">
        <el-input placeholder="请输入标题" clearable v-model="inform.title" />
      </el-form-item>
      <el-form-item label="消息类型" :label-width="formLabelWidth" prop="type">
        <div v-if="inform.type == 0">
          <el-button type="primary" @click="inform.type = 0" plain>文本内容</el-button>
          <el-button type="white" @click="inform.type = 1" plain>链接内容</el-button>
        </div>
        <div v-else>
          <el-button type="white" @click="inform.type = 0" plain>文本内容</el-button>
          <el-button type="primary" @click="inform.type = 1" plain>链接内容</el-button>
        </div>
      </el-form-item>
      <el-form-item v-if="inform.type == 0" label="通知内容" :label-width="formLabelWidth">
        <Editor ref="infoEditor"></Editor>
      </el-form-item>
      <el-form-item v-else label="通知内容" :label-width="formLabelWidth">
        <el-input placeholder="请输入链接" clearable v-model="inform.link" />
      </el-form-item>

      <el-form-item label="发送全部" prop="pushType">
        <el-switch v-model="inform.pushType" @change="changePushType" active-color="danger" />
      </el-form-item>
      <el-form-item label="所属小区" :label-width="formLabelWidth" prop="communityId">
        <el-select placeholder="选择小区" v-model="inform.communityId">
          <el-option
            v-for="(item, index) in communityList"
            :key="index"
            :label="item.communityName"
            :value="item.communityId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="insertInform()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { getNoticeList, addNotice, updateNotice, deleteNotice, exportNotice } from '@/api/inform'
import { getCommunityNameList } from '@/api/community'
import { sendWebsocket } from '@/utils/websocket'
import { ElMessage, ElMessageBox } from 'element-plus'
import Editor from '@/components/Editor'
import informList from './inform'
// 通知对象
const inform = ref({ type: 0 })
// 富文本内容
const infoEditor = ref(null)
const init = async () => {
  await nextTick()
  infoEditor.value.setValue(inform.value.content)
}
const changePushType = (e) => {
  inform.value.pushType = e
}
const type = ref('')
const pushType = ref('')
const typeList = ref([
  {
    value: '0',
    label: '文本类型'
  },
  {
    value: '1',
    label: '链接类型'
  }
])
const pushTypeList = ref([
  {
    value: '0',
    label: '发送全部'
  },
  {
    value: '1',
    label: '不发送全部'
  }
])
// 数据相关
const tableData = ref([])
const search = ref('')
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 多选项
const multipleSelection = ref([])
// 请求首页广告列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    title: search.value,
    type: type.value,
    pushType: pushType.value
  }
  console.log(param)
  const result = await getNoticeList(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)
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
// 导出
const exportNoti = () => {
  exportNotice().then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '通知列表.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
// 请求社区列表
const communityList = ref({})
const getCommunity = async () => {
  const result = await getCommunityNameList()
  console.log(result.data)
  communityList.value = result.data
}
const addModel = ref(false)
// 新增弹框
const addInformModal = () => {
  getCommunity()
  addModel.value = !addModel.value
}
// 修改 填充值
const updateInformModel = (row) => {
  getCommunity()
  addModel.value = !addModel.value
  inform.value = Object.assign({}, row)
  inform.value.pushType = JSON.parse(inform.value.pushType === 0 ? 'true' : 'false')
  init()
}
// 取消
const cancelModel = () => {
  addModel.value = false
  inform.value = {}
  ruleFormRef.value.resetFields()
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  communityId: [
    {
      required: true,
      message: '请选择所属小区',
      trigger: 'change'
    }
  ]
})
// 新增/修改通知提交请求
const insertInform = () => {
  if (infoEditor.value != null) {
    if (infoEditor.value.getValue() === '') {
      ElMessage.warning('请输入通知内容')
      return
    } else {
      inform.value.content = infoEditor.value.getValue()
    }
  }

  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      inform.value.pushType = inform.value.pushType ? 0 : 1
      console.log(inform.value)
      if (inform.value.id === undefined) {
        await addNotice(inform.value)
        ElMessage.success('通知新增成功')
      } else {
        await updateNotice(inform.value)
        ElMessage.success('通知修改成功')
      }
      addModel.value = false
      getListData()
      infoEditor.value.setValue('')
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}

// 多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const batchDel = () => {
  console.log(multipleSelection.value)
  if (multipleSelection.value.length === 0) {
    ElMessage.error('请至少选择一条数据')
    return
  }
  const ids = []
  multipleSelection.value.forEach((item) => {
    ids.push(item.id)
  })
  const param = {
    ids
  }
  console.log(param)
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await deleteNotice(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
const deleteInform = (row) => {
  const param = {
    ids: [row.id]
  }
  console.log(param)
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await deleteNotice(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}

// 消息推送
const message = ref({
  fromId: 75,
  toId: '',
  content: 'test',
  type: 0
})
const wsMessage = (data) => {
  console.log(data)
}
const wsError = (data) => {
  console.log(data)
}
const initWs = () => {
  // 初始化websocket,向服务器发起连接请求，记录用户
  // 防止用户多次连续点击发起请求，所以要先关闭上次的ws请求。

  // 发起ws请求
  sendWebsocket(message.value, wsMessage, wsError)
}
const sendWs = async (row) => {
  // 初始化websocket,向服务器发起连接请求，记录用户
  // 防止用户多次连续点击发起请求，所以要先关闭上次的ws请求。

  // 发起ws请求
  message.value.type = 2
  if (row.pushType === 0) {
    message.value.content = row.link
  } else {
    message.value.content = row.content
  }
  sendWebsocket(message.value, wsMessage, wsError)
  row.createUserId = 1
  await updateNotice(row)
  ElMessage.success('推送成功')
  getListData()
}
// initWs()
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
