<template>
  <el-card class="mt-2">
    <el-form inline>
      <el-form-item label="物业人员名称：">
        <el-input v-model="account" class="w-50 m-2" placeholder="请输入物业人员">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" style="margin-left: 5px" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="签到状态：">
        <el-select v-model="stateIn" clearable placeholder="请选择">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
       <el-form-item label="签退状态：">
        <el-select v-model="stateOut" clearable placeholder="请选择">
          <el-option v-for="item in stateList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属小区" clearable>
        <el-select placeholder="选择小区" v-model="communityId">
          <el-option
            v-for="(item, index) in communityList"
            :key="index"
            :label="item.communityName"
            :value="item.communityId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="getListData()">搜索</el-button>
        <el-button type="success" v-if="isAuth(['ROOT', 'CHECKING:EXPORT'])" @click="exportNoti()">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="tableRef" :data="tableData" class="mt-1" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        v-for="(item, index) in checkingList"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'signInState'">
          <el-tag type="warning" v-if="row.signInState == 0">默认</el-tag>
          <el-tag type="info" v-else-if="row.signInState == 1">正常打卡</el-tag>
          <el-tag type="success" v-else-if="row.signInState == 2">外勤打卡</el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'signOutState'">
          <el-tag type="warning" v-if="row.signInState == 0">默认</el-tag>
          <el-tag type="info" v-else-if="row.signInState == 1">正常打卡</el-tag>
          <el-tag type="success" v-else-if="row.signInState == 2">外勤打卡</el-tag>
        </template>
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
</template>

<script setup>
import { ref } from 'vue'
import {
  getCheckingList,
  exportChecking
} from '@/api/checking'
import { getCommunityNameList } from '@/api/community'
import checkingList from './checking'

const account = ref('')
const communityId = ref('')
const stateList = ref([
  {
    value: '0',
    label: '默认'
  },
  {
    value: '1',
    label: '正常打卡'
  },
  {
    value: '2',
    label: '外勤打卡'
  }
])
// 数据相关
const tableData = ref([])
const search = ref('')
const stateIn = ref('')
const stateOut = ref('')
const total = ref(0)
const page = ref(1)
const size = ref(10)
// 请求首页广告列表
const getListData = async () => {
  const param = {
    page: page.value,
    size: size.value,
    name: search.value,
    communityId: communityId.value,
    signInState: stateIn.value,
    signOutState: stateOut.value,
    account: account.value
  }
  console.log(param)
  const result = await getCheckingList(param)
  tableData.value = result.data
  total.value = result.total
  console.log(tableData.value)
  getCommunity()
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
  exportPurchase().then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '采购记录列表.xlsx'
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

</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
