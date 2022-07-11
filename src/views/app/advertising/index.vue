<template>
  <el-card>
    <el-row>
      <el-form inline>
        <el-button type="primary" @click="showAdvertiseModule()" v-if="isAuth(['ROOT', 'ADVERTISING:INSERT'])"
          >新增广告</el-button
        >
        <el-button
          type="danger"
          @click="onRemoveClick()"
          v-if="isAuth(['ROOT', 'ADVERTISING:DELETE'])"
          style="margin-right: 10px"
          >批量删除广告</el-button
        >
        <el-form-item label="请选择展示类型" prop="type">
          <el-select placeholder="请选择展示类型" v-model="type" clearable style="width: 140px">
            <el-option label="富文本" value="0" />
            <el-option label="外链" value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否在首页展示" prop="showFlag">
          <el-select placeholder="是否在首页展示" v-model="showFlag" clearable style="width: 140px">
            <el-option label="否" value="0" />
            <el-option label="是" value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="请选择展示客户端" prop="showType">
          <el-select placeholder="请选择展示客户端" v-model="showType" clearable style="width: 140px">
            <el-option label="业主端" value="0" />
            <el-option label="物业端" value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="请选择推送状态" prop="pushStatus">
          <el-select placeholder="请选择推送状态" v-model="pushStatus" clearable style="width: 140px">
            <el-option label="未推送" value="0" />
            <el-option label="已推送" value="1" />
          </el-select>
        </el-form-item>
        <el-button
          type="info"
          :icon="Search"
          @click="getListData()"
          v-if="isAuth(['ROOT', 'ADVERTISING:SELECT'])"
          style="margin-right: 10px"
          >搜索</el-button
        >
      </el-form>
    </el-row>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column
        v-for="(item, index) in advertise"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :align="item.align"
      >
        <template #default="{ row }" v-if="item.prop == 'imageUrl'">
          <el-image :src="row.imageUrl" style="height: 50px; width: 140px" />
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'showType'">
          <el-tag v-if="row.showType == 0"> 业主端 </el-tag>
          <el-tag v-else type="warning"> 物业端 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 0" type="success"> 富文本 </el-tag>
          <el-tag v-else type="info"> 外链 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'showFlag'">
          <el-tag v-if="row.showFlag == 0"> 否 </el-tag>
          <el-tag v-else type="danger"> 是 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'pushStatus'">
          <el-tag v-if="row.pushStatus == 0"> 否 </el-tag>
          <el-tag v-else type="danger"> 是 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'linkUrl'">
          <el-tag v-if="row.linkUrl == null"> 暂无跳转链接 </el-tag>
          <el-row>{{ row.linkUrl }}</el-row>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="danger" size="mini" @click="sendWs(row)" :disabled="row.pushStatus === 1">{{
            row.pushStatus === 0 ? '推送' : '已推送'
          }}</el-button>
          <el-button type="success" size="mini" @click="showEditAdvertise(row)">修改</el-button>
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
    <!-- 广告详情 -->
    <el-dialog
      v-model="advertiseModule"
      :title="!advertising.id ? '新增广告' : '编辑广告'"
      width="35%"
      @close="closeAdvertiseModule()"
    >
      <el-form :model="advertising" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="广告名称" :label-width="formLabelWidth" prop="title">
          <el-input placeholder="请输入标题" clearable v-model="advertising.title" />
        </el-form-item>
        <el-form-item label="展示端" :label-width="formLabelWidth" prop="showType">
          <el-select placeholder="展示端" v-model="advertising.showType">
            <el-option label="业主端" value="0" />
            <el-option label="物业端" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示类型" prop="type">
          <el-radio-group v-model="advertising.type" @change="setTypeValue()">
            <el-radio label="1">外链</el-radio>
            <el-radio label="0">富文本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="外链地址" prop="linkUrl" v-if="advertising.type == 1" :label-width="formLabelWidth">
          <el-input placeholder="请输入外链地址" clearable v-model="advertising.linkUrl" />
        </el-form-item>
        <el-form-item label="富文本" v-if="advertising.type == 0" prop="content">
          <editor ref="infoEditor"></editor>
        </el-form-item>
        <el-form-item label="是否显示在首页" prop="showFlag">
          <el-radio-group v-model="advertising.showFlag">
            <el-radio label="0">否</el-radio>
            <el-radio label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="广告图" prop="imageUrl">
          <el-upload
            :class="{ 'avatar-uploader': !advertising.imageUrl }"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadFile"
          >
            <img v-if="advertising.imageUrl" :src="advertising.imageUrl" class="avatar" name="file" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAdvertiseModule()">取消</el-button>
          <el-button type="primary" @click="insertAdvertise()" v-if="!advertising.id">确定</el-button>
          <el-button type="primary" @click="editAdvertise(row)" v-else>确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { sendWebsocket } from '@/utils/websocket'
import { getAdvertiseList, uploadAdvertise, addAdvertise, deleteAdvertise, updateAdvertise } from '@/api/advertising'
import advertise from './advertise'
import { IMG_URL } from '@/constant'
import { ElMessageBox, ElMessage } from 'element-plus'
import Editor from '@/components/Editor'

// 广告对象
const advertising = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()
const advertiseModule = ref(false)
// 多选项
const multipleSelection = ref([])
// 展示类型
const type = ref('')
// 展示客户端
const showFlag = ref('')
// 是否推送
const pushStatus = ref('')
// 是否在首页展示
const showType = ref('')
// 富文本内容
const infoEditor = ref(null)
// 请求首页广告列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    type: type.value,
    showFlag: showFlag.value,
    pushStatus: pushStatus.value,
    showType: showType.value

  }
  const result = await getAdvertiseList(param)
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
const setTypeValue = () => {
  setContentValue()
}

// 关闭广告弹框
const closeAdvertiseModule = () => {
  advertiseModule.value = false
  advertising.value = {}
}
// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadAdvertise({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    advertising.value.imageUrl = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}
// 富文本内容
const setContentValue = async () => {
  await nextTick()
  infoEditor.value.setValue(advertising.value.content)
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [{ required: true, message: '请输入广告名称', trigger: 'blur' }],
  showType: [
    {
      required: true,
      message: '请选择展示客户端',
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: '请选择展示类型',
      trigger: 'blur'
    }
  ],
  showFlag: [
    {
      required: true,
      message: '请选择是否显示在首页',
      trigger: 'blur'
    }
  ],
  imageUrl: [
    {
      required: true,
      message: '请上传广告图',
      trigger: 'blur'
    }
  ],
  content: [
    {
      required: true,
      message: '请输入富文本内容',
      trigger: 'change'
    }
  ],
  linkUrl: [
    {
      required: true,
      message: '请输入外链地址',
      trigger: 'change'
    }
  ]
})
// 新增广告
const insertAdvertise = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (infoEditor.value != null) {
        if (infoEditor.value.getValue() === '') {
          ElMessage.warning('请输入富文本内容')
          return
        } else {
          advertising.value.content = infoEditor.value.getValue()
        }
      }
      advertising.value.imageUrl = IMG_URL + 'admin-api/' + fileName.value
      advertising.value.pushStatus = 0
      await addAdvertise(advertising.value)
      advertiseModule.value = false
      ElMessage.success('广告新增成功')
      getListData()
      ruleFormRef.value.resetFields()
    } else {
      return false
    }
  })
}
// 获取选中列表id
const handleSelectionChange = (val) => {
  multipleSelection.value = val
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
      await deleteAdvertise(ids)
      ElMessage.success('删除成功')
      multipleSelection.value = []
      // 重新渲染数据
      getListData()
    })
    .catch(() => {
      multipleSelection.value = []
    })
}
// 修改广告弹框
const showEditAdvertise = async (row) => {
  advertiseModule.value = true
  await nextTick()
  advertising.value = {
    id: row.id,
    title: row.title,
    showFlag: row.showFlag.toString(),
    pushStatus: row.pushStatus.toString(),
    type: row.type.toString(),
    showType: row.showType.toString(),
    content: row.content,
    linkUrl: row.linkUrl,
    imageUrl: row.imageUrl
  }
  setContentValue()
}
// 修改广告
const editAdvertise = async () => {
  if (infoEditor.value != null) {
    if (infoEditor.value.getValue() === '') {
      ElMessage.warning('请输入富文本内容')
      return
    } else {
      advertising.value.content = infoEditor.value.getValue()
    }
  }
  await updateAdvertise(advertising.value)
  advertiseModule.value = false
  ElMessage.success('修改成功')
  getListData()
}
// 广告弹框
const showAdvertiseModule = () => {
  console.log(advertising.value)
  advertiseModule.value = true
  setContentValue()
}

// 消息推送
const message = ref({
  fromId: 75,
  toId: '',
  content: '',
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
  advertising.value = {
    id: row.id,
    title: row.title,
    showFlag: row.showFlag.toString(),
    pushStatus: 1,
    type: row.type.toString(),
    showType: row.showType.toString(),
    content: row.content,
    linkUrl: row.linkUrl,
    imageUrl: row.imageUrl
  }
  // 初始化websocket,向服务器发起连接请求，记录用户
  // 防止用户多次连续点击发起请求，所以要先关闭上次的ws请求。

  // 发起ws请求
  message.value.type = 2
  message.value.content = JSON.stringify(row)
  sendWebsocket(message.value, wsMessage, wsError)
  ElMessage.success('推送成功')
  await updateAdvertise(advertising.value)

  getListData()
}
// initWs()
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
