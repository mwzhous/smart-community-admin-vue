<template>
  <el-card>
    <el-row>
      <el-button type="primary" v-if="isAuth(['ROOT', 'GOODS_TYPE:INSERT'])" @click="addgoodstypeModal()"
        >新增商品类别</el-button
      >
      <el-button type="danger" v-if="isAuth(['ROOT', 'GOODS_TYPE:DELETE'])" @click="batchDel()">批量删除</el-button>
    </el-row>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in goodstype"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :height="item.height"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'image_url'">
          <el-image :src="row.imageUrl" style="width: 80px; height: 80px" />
        </template>

        <template #default="{ row }" v-else-if="item.prop == 'type'">
          <el-tag v-if="row.type == 1"> 跳蚤市场 </el-tag>
          <el-tag v-else type="warning"> 小区商城 </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" align="center">
        <template #default="{ row }">
          {{ $filters.dateTimeFilter(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column #default="{ row }" label="操作" align="center">
        <el-button
          type="success"
          size="mini"
          @click="updateIntegrationModel(row)"
          v-if="isAuth(['ROOT', 'GOODS_TYPE:UPDATE'])"
          >修改</el-button
        >
        <el-button type="danger" size="mini" @click="deleteIntegrat(row)" v-if="isAuth(['ROOT', 'GOODS_TYPE:DELETE'])"
          >删除</el-button
        >
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
  </el-card>

  <el-dialog v-model="addModel" :title="integration.id == undifined ? '添加商品类型' : '修改商品类型'" width="40%">
    <el-form :model="integration" label-width="120px" style="width: 80%" :rules="rules" ref="ruleFormRef">
      <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
        <el-input placeholder="请输入类型名称" clearable v-model="integration.title" />
      </el-form-item>
      <el-form-item label="商品类型" :label-width="formLabelWidth" prop="type">
        <el-select placeholder="商品类型" v-model="integration.type">
          <el-option label="跳蚤市场" value="1" />
          <el-option label="小区商城" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="图标" prop="image_url">
        <el-upload class="avatar-uploader" :show-file-list="false" :auto-upload="false" :on-change="uploadFile">
          <img v-if="integration.imageUrl" :src="integration.imageUrl" class="avatar" name="file" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelModel">取消</el-button>
        <el-button type="primary" @click="addgoodstype()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { getGoodsType, delGoodsType, addGoodsType, updateGoodsType } from '@/api/goodstype'
import { uploadEstate } from '@/api/estateTransaction'
import { ElMessage, ElMessageBox } from 'element-plus'
import { IMG_URL } from '@/constant'
import goodstype from './goodstype'
// 类型对象
const integration = ref({})
// 数据相关
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const fileName = ref()
// 多选项
const multipleSelection = ref([])
// 请求首页广告列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value
  }
  const result = await getGoodsType(param)
  console.log(result.data.records)
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
const addModel = ref(false)
// 新增弹框
const addgoodstypeModal = () => {
  addModel.value = !addModel.value
}
// 修改 填充值
const updateIntegrationModel = (row) => {
  addModel.value = !addModel.value
  integration.value = row
  integration.value.createTime = null
  integration.value.updateTime = null
}
// 取消
const cancelModel = () => {
  addModel.value = false
  integration.value = {}
}

// 文件上传
const uploadFile = async (event) => {
  const fileInfo = await uploadEstate({ file: event.raw })
  console.log(fileInfo)
  if (fileInfo.total === 0) {
    fileName.value = fileInfo.data
    integration.value.imageUrl = IMG_URL + 'admin-api/' + fileInfo.data
    ElMessage.success('文件上传成功')
  }
}

// 文本框校验规则
const ruleFormRef = ref(null)
const rules = ref({})
// 新增/修改通知提交请求
const addgoodstype = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      console.log(integration.value)
      if (integration.value.id === undefined) {
        addGoodsType(integration.value)
        ElMessage.success('商品类型新增成功')
      } else {
        updateGoodsType(integration.value)
        ElMessage.success('商品类型修改成功')
      }
      addModel.value = false
      getListData()
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
    await delGoodsType(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
const deleteIntegrat = (row) => {
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
    await delGoodsType(param)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>

<style lang="scss" scoped>
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
  height: 135px;
  border-radius: 6px;
  margin-top: 20px;
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
