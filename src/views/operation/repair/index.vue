<template>
  <el-card class="square-container">
    <el-form inline>
      <el-button type="danger" v-if="isAuth(['ROOT', 'REPAIR:DELETE'])" @click="onRemoveClick()">批量删除</el-button>
      <el-button type="success" v-if="isAuth(['ROOT', 'REPAIR:EXPORT'])" @click="exportRepai()">批量导出</el-button>
      <el-form-item>
        <el-input v-model="search" style="width: 150px; margin-left: 10px" clearable placeholder="搜索">
          <template #prefix>
            <span><svg-icon icon="search" class="icon" /></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="社区列表">
        <el-select
          v-model="searchCommunityId"
          style="width: 150px"
          clearable
          :disabled="!isRoot"
          placeholder="请选择社区"
          @change="handleCommunityChange"
        >
          <el-option
            v-for="item in communityList"
            :key="item.communityId"
            :label="item.communityName"
            :value="item.communityId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="报修状态">
        <el-select v-model="status" style="width: 130px" clearable placeholder="处理状态" @change="handleStatusChange">
          <el-option v-for="item in statusFilter" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="物业回复状态">
        <el-select
          v-model="repairResult"
          style="width: 130px"
          clearable
          placeholder="是否回复"
          @change="handleRepairResultChange"
        >
          <el-option v-for="item in repairResultFilter" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="维修满意度">
        <el-select
          v-model="satisfaction"
          style="width: 130px"
          clearable
          placeholder="满意度"
          @change="handleSatisfactionChange"
        >
          <el-option v-for="item in satisfactionFilter" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业主评价状态">
        <el-select
          v-model="repairAssess"
          style="width: 130px"
          clearable
          placeholder="评价内容"
          @change="handleRepairAssessChange"
        >
          <el-option v-for="item in repairAssessFilter" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-button type="info" @click="searchList">
        <span><svg-icon icon="search" /></span>
        搜索</el-button
      >
    </el-form>
    <el-table :data="tableData" border style="width: 100%" class="container" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" />
      <el-table-column
        v-for="(item, index) in repair"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
        width="120"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="报修类型" align="center" width="100">
        <template #default="{ row }">
          <template v-if="row.repairType == 1"> 公共维修 </template>
          <template v-else-if="row.repairType == 0"> 居家维修 </template>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="报修状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status == 0" type="danger">未处理</el-tag>
          <el-tag v-else-if="row.status == 2" type="warning">处理中</el-tag>
          <el-tag v-else-if="row.status == 1" type="success">已处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="repairContent"
        label="报修内容"
        align="center"
        width="250"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="报修图片" align="center" width="210">
        <template v-slot="{ row }">
          <el-image
            :src="row.repairImg[0]"
            :preview-src-list="row.repairImg"
            fit="cover"
            style="width: 50px; height: 50px"
          ></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="orderTime" label="期望上门时间" align="center" width="170"></el-table-column>
      <el-table-column prop="createTime" label="维修申报时间" align="center" width="170"></el-table-column>
      <el-table-column prop="workerName" label="维修工姓名" align="center" width="120">
        <template #default="{ row }">
          <template v-if="!row.workerName">
            <el-tag type="info">未指派</el-tag>
          </template>
          <template v-else>
            <div>{{ row.workerName }}</div>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="workerPhone" label="维修工联系方式" align="center" width="120">
        <template #default="{ row }">
          <template v-if="!row.workerPhone">
            <el-tag type="info">未指派</el-tag>
          </template>
          <template v-else>
            <div>{{ row.workerPhone }}</div>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" width="300">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showRecord(row)"> 详情 </el-button>
          <el-button type="info" size="small" @click="showRepair(row)"> 维修 </el-button>
          <el-button type="warning" size="small" v-if="row.status == 0" @click="showOptionDialog(row)">
            指派
          </el-button>
          <el-button
            type="success"
            size="small"
            v-if="isAuth(['ROOT', 'REPAIR:UPDATE']) && multipleSelection.length == 0 && row.status == 2"
            @click="changeStatus(row)"
          >
            完成
          </el-button>
          <el-button
            type="success"
            size="small"
            disabled
            v-if="isAuth(['ROOT', 'REPAIR:UPDATE']) && multipleSelection.length == 0 && row.status == 1"
          >
            已完成
          </el-button>
          <el-button
            type="danger"
            size="small"
            v-if="isAuth(['ROOT', 'REPAIR:DELETE']) && multipleSelection.length == 0"
            @click="onRemoveClick(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 维修记录详情 -->
    <el-dialog v-model="repairModule" title="维修详情" width="35%" @close="closeRepairModule()">
      <template v-if="repairRecord == null">
        <el-empty description="暂无维修记录" />
      </template>
      <template v-else>
        <el-form :model="repairRecord" disabled label-width="120px">
          <el-form-item label="维修工姓名" :label-width="formLabelWidth" prop="workerName">
            <el-input v-model="repairRecord.workerName" />
          </el-form-item>
          <el-form-item label="维修工联系方式" :label-width="formLabelWidth" prop="workerPhone">
            <el-input v-model="repairRecord.workerPhone" />
          </el-form-item>
          <el-form-item label="物业回复" :label-width="formLabelWidth" prop="repairResult">
            <el-input v-model="repairRecord.repairResult" />
          </el-form-item>
          <el-form-item label="回复时间" :label-width="formLabelWidth" prop="resultTime">
            <el-input v-model="repairRecord.resultTime" />
          </el-form-item>
          <el-form-item label="满意度" :label-width="formLabelWidth" prop="satisfaction" style="align-items: center">
            <el-rate v-model="repairRecord.satisfaction" />
          </el-form-item>
          <el-form-item label="报修评价内容" :label-width="formLabelWidth" prop="repairAssess">
            <el-input type="textarea" v-model="repairRecord.repairAssess" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRepairModule()">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 申报记录详情 -->
    <el-dialog v-model="recordModule" title="申报详情" width="35%" @close="closeRecordModule()">
      <el-form :model="selectRecord" disabled label-width="120px">
        <el-form-item label="申报人" :label-width="formLabelWidth" prop="username">
          <el-input v-model="selectRecord.username" />
        </el-form-item>
        <el-form-item label="期望上门时间" :label-width="formLabelWidth" prop="orderTiime">
          <el-input v-model="selectRecord.orderTime" />
        </el-form-item>
        <el-form-item label="报修类型" :label-width="formLabelWidth" prop="repairType">
          <el-input v-model="selectRecord.repairType" />
        </el-form-item>
        <el-form-item label="联系方式" :label-width="formLabelWidth" prop="phone">
          <el-input v-model="selectRecord.phone" />
        </el-form-item>
        <el-form-item label="地址" :label-width="formLabelWidth" prop="address">
          <el-input v-model="selectRecord.address" />
        </el-form-item>
        <el-form-item label="内容" :label-width="formLabelWidth" prop="repairContent">
          <el-input type="textarea" v-model="selectRecord.repairContent" />
        </el-form-item>
        <el-form-item label="图片">
          <el-row>
            <el-col :span="6" v-for="(img, index) in selectRecord.repairImg" :key="index">
              <el-image
                :src="img"
                :preview-src-list="selectRecord.repairImg"
                fit="cover"
                style="margin: 0 auto; width: 130px"
              ></el-image>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRecordModule()">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 指派人员 -->
    <el-dialog v-model="repairObjModule" title="指派" width="35%" @close="closeRepairObjModule()">
      <el-form :model="repairObj" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="维修内容" :label-width="formLabelWidth" prop="repairContent">
          <el-input disabled type="textarea" v-model="repairObj.repairContent" />
        </el-form-item>
        <el-form-item label="指派人员" prop="worker">
          <el-select
            v-model="repairObj.worker"
            style="width: 150px"
            placeholder="人员名称"
            no-match-text="无匹配数据"
            no-data-text="无数据"
            @change="handleWorkerChange"
          >
            <el-option
              v-for="item in workers"
              :disabled="item.isRepair == 1"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRepairObjModule()">取消</el-button>
          <el-button type="primary" @click="repairOption()">指派</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import {
  getRepairList,
  getRepairRecord,
  addRepairRecord,
  deleteRepair,
  updateRepairRecord,
  getInRepairStatusWorkerId,
  exportRepair
} from '@/api/repair'
import { getCommunityNameList } from '@/api/community'
import { selWorkerBycId } from '@/api/worker'
import repair from './repair'
import { ElMessageBox, ElMessage } from 'element-plus'

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

// 条件筛选
// 维修状态
const status = ref('')
const statusFilter = [
  {
    value: 0,
    label: '未处理'
  },
  {
    value: 1,
    label: '已处理'
  },
  {
    value: 2,
    label: '处理中'
  }
]
// 监听状态改变
const handleStatusChange = (val) => {
  status.value = val
}

// 物业回复状态
const repairResult = ref('')
const repairResultFilter = [
  {
    value: 0,
    label: '未回复'
  },
  {
    value: 1,
    label: '已回复'
  }
]
// 监听状态改变
const handleRepairResultChange = (val) => {
  repairResult.value = val
}

// 物业回复状态
const satisfaction = ref('')
const satisfactionFilter = [
  {
    value: 'null',
    label: '未评价'
  },
  {
    value: '0',
    label: '0星'
  },
  {
    value: '1',
    label: '1星'
  },
  {
    value: '2',
    label: '2星'
  },
  {
    value: '3',
    label: '3星'
  },
  {
    value: '4',
    label: '4星'
  },
  {
    value: '5',
    label: '5星'
  }
]
// 监听状态改变
const handleSatisfactionChange = (val) => {
  satisfaction.value = val
}

// 业主评价回复状态
const repairAssess = ref('')
const repairAssessFilter = [
  {
    value: 0,
    label: '未评价'
  },
  {
    value: 1,
    label: '已评价'
  }
]
// 监听状态改变
const handleRepairAssessChange = (val) => {
  repairAssess.value = val
}

// 是否是超管
const isRoot = ref(false)
// 社区管理员id
const userCommunityId = ref(0)
// 搜索社区
const searchCommunityId = ref(null)
// 获取当前登录用户社区id
const store = useStore()
const getAdminCommunityId = () => {
  const info = store.state.user.userInfo
  if (info.communityId === 0) {
    isRoot.value = true
    userCommunityId.value = 0
  } else {
    isRoot.value = false
    userCommunityId.value = info.communityId
    searchCommunityId.value = info.communityId
  }
}
getAdminCommunityId()
// 监听社区选择
const handleCommunityChange = (val) => {
  searchCommunityId.value = val
}

// 社区列表
const communityList = ref([])
// 请求社区列表
const getCommunityList = async () => {
  const result = await getCommunityNameList()
  communityList.value = result.data
}
// 获取社区列表
getCommunityList()

// 请求首页广场列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value,
    communityId: searchCommunityId.value,
    status: status.value,
    isRepairResult: repairResult.value,
    satisfaction: satisfaction.value,
    isRepairAssess: repairAssess.value,
    keywords: search.value
  }
  const result = await getRepairList(param)
  result.data = result.data.map((item) => {
    // 对banner图片数组处理
    // "[xxx.jpg, xxx.png,...]"
    item.repairImg = item.repairImg
      .substr(1)
      .substring(0, item.repairImg.length - 2)
      .split(',')
    return item
  })
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

// 搜索列表
const searchList = () => {
  getListData()
}

// 删除数据
const onRemoveClick = (val) => {
  // 申报记录id
  let repairIds = []
  // 维修记录id
  let recordIds = []
  // 点击批量删除按钮
  if (val === undefined) {
    repairIds = []
    recordIds = []
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    repairIds = multipleSelection.value.map((item) => {
      return item.id
    })
    recordIds = multipleSelection.value.map((item) => {
      return item.recordId
    })
  } else {
    // 点击申报记录表格 操作中的 删除按钮
    multipleSelection.value = []
    repairIds.push(val.id)
    recordIds.push(val.recordId)
  }
  ElMessageBox.confirm('如果有维修记录，将将申报记录和维修记录一并删除，确认要删除吗？', {
    type: 'info',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    // 选择确认
    .then(async () => {
      // 对要删除的维修记录id数组进行过滤处理
      // 不需要id为null的
      // id为null是因为此时该申报记录还没指派人员
      // 所以就没有对应的维修记录 所以为null
      recordIds = recordIds.filter((item) => {
        return item != null
      })
      const param = {
        repairIds,
        recordIds
      }
      await deleteRepair(param)
      ElMessage.success('删除成功')
      repairIds = []
      recordIds = []
      // console.log(selectIds.value)
      // 重新渲染数据
      getListData()
    })
    // 选择取消
    .catch(() => {
      repairIds = []
      repairIds = []
    })
}

// 监听复选框
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 改变维修状态
const changeStatus = async (row) => {
  ElMessageBox.confirm('确认要通过吗？', {
    type: 'info',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
    // 选择确认
    .then(async () => {
      const param = {
        repairId: row.id,
        status: 1
      }
      // 改变维修状态为已完成
      await updateRepairRecord(param)
      ElMessage.success('改变状态成功')
      // 重新渲染数据
      getListData()
    })
    // 选择取消
    .catch(() => {})
}

// 维修记录对象
const repairRecord = ref({})
// 当前选中的record
const curRecord = ref({})
// 维修记录详情弹窗是否显示
const repairModule = ref(false)
// 关闭维修记录弹框
const closeRepairModule = () => {
  repairModule.value = false
}

// 显示维修记录弹窗并填充记录数据
const showRepair = (row) => {
  // 根据repairId来获取记录数据
  const param = {
    repairId: row.id
  }
  // 获取维修记录数据
  getRecord(param)
  // 显示维修记录详情弹窗
  repairModule.value = true
}

// 获取指定repair_id的维修记录
const getRecord = async (param) => {
  repairRecord.value = {}
  const result = await getRepairRecord(param)
  repairRecord.value = result.data
}

// 申报记录详情弹窗是否显示
const recordModule = ref(false)
// 选择的用于详情的当前记录数据
const selectRecord = ref({})
// 关闭申报记录弹框
const closeRecordModule = () => {
  recordModule.value = false
}

// 显示申报记录弹窗并填充记录数据
const showRecord = (row) => {
  row.repairType = row.repairType === 1 ? '公共维修' : '居家维修'
  selectRecord.value = row
  // 显示申报记录详情弹窗
  recordModule.value = true
}

// 维修记录对象
const repairObj = ref({})
// 指派人员弹窗是否显示
const repairObjModule = ref(false)
// 指派人员表单校验
const ruleFormRef = ref(null)
// select的option数据 显示和当前用户同小区的物业员工
const workers = ref([])
// select的 v-model绑定 物业人员名字
const worker = ref('')
// 正在执行维修（已被派遣）的所有物业员工的id
const statusWorkerIds = ref([])
// 校验规则
const rules = ref({
  worker: [{ required: true, message: '请选择要指派的人员' }]
})
// 关闭指派弹窗
const closeRepairObjModule = () => {
  repairObjModule.value = false
  ruleFormRef.value.resetFields()
  // 选择的指派的人置空
  worker.value = ''
}

// 显示指派人员弹框
// 进行人员的指派
const showOptionDialog = (row) => {
  // 状态改为2 处理中
  curRecord.value.status = 2
  // 获得维修申报记录的id
  curRecord.value.repairId = row.id
  // console.log(row.communityId)
  // 根据当前用户的社区id获取对应的物业人员列表
  getWorkers(row.communityId)
  repairObjModule.value = true
  repairObj.value = row
  // 该属性用于指派人员的校验
  repairObj.value.worker = worker.value
  // console.log(repairObj.value)
}

// 根据社区id获取物业人员
const getWorkers = async (param) => {
  // 根据社区id获取物业人员
  const result = await selWorkerBycId(param)
  // console.log(result.data)
  // 获取当前正在维修的物业人员的id
  await getWorkersId()
  // 处理后的该社区的物业人员列表
  const res = ref([])
  res.value = result.data.map((item) => {
    // 正在维修的物业人员的id是否包含 当前社区物业人员id
    if (statusWorkerIds.value.includes(item.id)) {
      // 包含
      // 这个属性用于 是否禁用该option
      // 1 被禁用 因为该员工已经被指派了
      item.isRepair = 1
      // 名字加上 指派中，表示被指派
      item.name = item.name + '（指派中）'
    } else {
      // 这个属性用于 是否禁用该option
      // 0 不会被禁用
      item.isRepair = 0
    }
    return item
  })
  // 把处理后的该社区的物业人员列表赋值给workers
  // 用于 option 的 for 循环
  workers.value = res.value
}

// 获取当前正在维修的物业人员的id
const getWorkersId = async () => {
  const res = await getInRepairStatusWorkerId()
  // 赋值获得的id数组 给 当前维修的物业员工id数组
  statusWorkerIds.value = res.data
}

// 监听指派时的 人员选择的值
const handleWorkerChange = (val) => {
  worker.value = val
}

// 指派人员
const repairOption = () => {
  // 数据校验
  ruleFormRef.value.validate(async (valid) => {
    // valid为true 校验正确
    if (valid) {
      // 该属性为 被指派人员的id
      curRecord.value.workerId = worker.value
      console.log(curRecord.value)
      // 添加维修记录 传入数据curRecord.value 为
      // （repairId, status, workerId）
      // 维修申报记录，处理状态，指派的工作人员id
      await addRepairRecord(curRecord.value)
      repairObjModule.value = false
      ElMessage.success('指派成功')
      ruleFormRef.value.resetFields()
      // 置空选择的指派人员
      worker.value = ''
      // 重新获取数据
      getListData()
    } else {
      return false
    }
  })
}

// 导出
const exportRepai = () => {
  const param = {
    status: status.value,
    isRepairResult: repairResult.value,
    satisfaction: satisfaction.value,
    isRepairAssess: repairAssess.value,
    keywords: search.value
  }
  exportRepair(param).then((res) => {
    const blob = new Blob([res], {
      type: 'application/vnd.ms-excel'
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = '申报维修记录列表.xlsx'
    a.click()
    URL.revokeObjectURL(objectUrl)
  })
}
</script>

<style lang="scss" scoped>
.square-container {
  .container {
    margin-bottom: 20px;
  }

  .icon {
    margin-left: 5px;
  }

  ::v-deep(.avatar) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  ::v-deep .el-col-6 {
    display: flex;
    width: 130px;
    height: 130px;
    margin-bottom: 10px;
  }
}
</style>
