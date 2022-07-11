<template>
  <el-card>
    <el-table ref="tableRef" :data="tableData" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column
        v-for="(item, index) in versionColumn"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :align="item.align"
      >
        <template #default="{ row }" v-if="item.prop == 'platform'">
          <el-tag v-if="row.platform == 0">Android</el-tag>
          <el-tag v-else>IOS</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'forceUpdate'">
          <el-tag v-if="row.forceUpdate == 0">是</el-tag>
          <el-tag v-else>否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="success" size="mini" @click="editVersion(row)">修改</el-button>
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
    <el-dialog v-model="versionModule" title="APP版本信息" width="35%">
      <el-form :model="version" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="版本名称" :label-width="formLabelWidth" prop="title">
          <el-input placeholder="请输入版本名称" clearable v-model="version.title" disabled />
        </el-form-item>
        <el-form-item label="版本更新描述" :label-width="formLabelWidth" prop="description">
          <el-input placeholder="版本更新描述" clearable v-model="version.description" />
        </el-form-item>
        <el-form-item label="限制最低版本" :label-width="formLabelWidth" prop="minimumVersion">
          <el-input placeholder="版本更新描述" clearable v-model="version.minimumVersion" />
        </el-form-item>
        <el-form-item label="最新版本" :label-width="formLabelWidth" prop="latestVersion">
          <el-input placeholder="最新版本" clearable v-model="version.latestVersion" />
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-radio-group v-model="version.platform" disabled>
            <el-radio label="0">Android</el-radio>
            <el-radio label="1">IOS</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否强制更新" prop="forceUpdate">
          <el-radio-group v-model="version.forceUpdate">
            <el-radio label="0">是</el-radio>
            <el-radio label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="安装包url" prop="url">
          <el-upload :show-file-list="false" :auto-upload="false" :on-change="uploadFile" accept=".apk,.aps">
            <el-button type="primary">更新安装包地址</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button>取消</el-button>
          <el-button type="primary" @click="confirmEdit()">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { uploadAdvertise } from '@/api/advertising'
import { getVersionList, updateVersion } from '@/api/version'
import versionColumn from './version'
import { IMG_URL } from '@/constant'
import { ElMessageBox, ElMessage } from 'element-plus'

// version对象
const version = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()
const versionModule = ref(false)
// 多选项
const multipleSelection = ref([])
// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({
  title: [{ required: true, message: '版本名称' }],
  description: [
    {
      required: true,
      message: '请输入更新版本描述'
    }
  ],
  minimumVersion: [
    {
      required: true,
      message: '请输入最低版本'
    }
  ],
  latestVersion: [
    {
      required: true,
      message: '请输入最高版本'
    }
  ],
  forceUpdate: [
    {
      required: true,
      message: '请选择是否强制更新'
    }
  ],
  endTime: [
    {
      required: true,
      message: '请选择结束时间'
    }
  ],
  url: [
    {
      required: true,
      message: '请上传更新的安装包'
    }
  ]
})
// 请求版本列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value
  }
  const result = await getVersionList(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)
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

// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadAdvertise({ file: event.raw })
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    version.value.url = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}
// 修改活动弹框
const editVersion = (row) => {
  versionModule.value = true
  version.value = row
  version.value.platform = version.value.platform.toString()
  version.value.forceUpdate = version.value.forceUpdate.toString()
}

// 修改活动
const confirmEdit = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await updateVersion(version.value)
      versionModule.value = false
      ElMessage.success('版本信息修改成功')
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

</script>

<style lang="scss" scoped>
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
