<template>
  <el-card>
    <el-row>
      <el-button type="primary" size="default" v-if="isAuth(['ROOT', 'ROLE:INSERT'])" @click="addBuildingStatus()"
        >新增角色</el-button
      >
      <el-button type="danger" size="default" v-if="isAuth(['ROOT', 'ROLE:DELETE'])" @click="delRole()"
        >批量删除</el-button
      >
    </el-row>
    <el-table ref="tableRef" :data="tableData.value" border @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column
        show-overflow-tooltip="true"
        v-for="(item, index) in role"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
      >
        <template #default="{ row }" v-if="item.prop == 'systemic'">
          <el-tag v-if="row.systemic == 1"> 是 </el-tag>
          <el-tag v-else type="warning"> 否 </el-tag>
        </template>
        <template #default="{ row }" v-else-if="item.prop == 'permission'">
          <el-button type="primary" size="mini" @click="getPermissionList(row.roleId)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" #default="{ row }">
        <el-button
          type="warning"
          size="mini"
          v-if="isAuth(['ROOT', 'ROLE:UPDATE'])"
          @click="onUpdateClick(row)"
          :disabled="row.roleId == 1"
          >修改</el-button
        >
        <el-button
          type="danger"
          size="mini"
          v-if="isAuth(['ROOT', 'ROLE:DELETE'])"
          @click="delRole(row)"
          :disabled="row.systemic === 1"
          >删除</el-button
        >
      </el-table-column>
    </el-table>
    <div class="bottom">
      <el-pagination
        class="pagination"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[5, 10, 50, 100, 200]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <!-- 新增角色弹框 -->
    <el-dialog v-model="showWindow" title="新增" width="45%">
      <el-form :model="Roleing" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input placeholder="请输入角色名称" v-model="Roleing.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="des">
          <el-input placeholder="请输入角色描述" v-model="Roleing.des" />
        </el-form-item>
      </el-form>
      <el-tree
        :props="defaultProps"
        :data="data"
        render-after-expand="false"
        accordion
        show-checkbox
        ref="checkPermission"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showWindow = false">取消</el-button>
          <el-button type="primary" @click="btnInsertRole(Roleing)">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改角色弹窗 -->
    <el-dialog v-model="showUpdate" title="修改" width="45%">
      <el-form :model="onlyRole" label-width="120px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input placeholder="请输入角色名称" v-model="onlyRole.roleName" :disabled="onlyRole.id === 1" />
        </el-form-item>
        <el-form-item label="角色描述" prop="des">
          <el-input placeholder="请输入角色描述" v-model="onlyRole.des" :disabled="onlyRole.id === 1" />
        </el-form-item>
      </el-form>
      <el-tree
        :props="defaultProps"
        :data="data"
        render-after-expand="false"
        nodeKey="id"
        accordion
        show-checkbox
        :default-checked-keys="onlyRole.id === 1 ? [290, 291, 292, 293, 294, 295, 296] : null"
        ref="updatePermission"
      />

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpdate = false">取消</el-button>

          <el-button type="primary" :disabled="onlyRole.id === 1" @click="btnUpdateRole(onlyRole)">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限列表弹窗 -->
    <el-dialog v-model="showPermissionDialog" title="权限列表" width="45%">
      <div v-for="(item, index) in permissionList" :key="index">
        <span>{{ item.permissionName }}</span>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  getRoleList,
  deleteRole,
  getPermissionListById,
  insertRole,
  updateRole,
  selectRolePermissionsById
} from '@/api/role'
import role from './role.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { permissionTree } from '@/api/permission'

// 数据相关
const tableData = reactive([])
const total = ref(0)
const page = ref(1)
const size = ref(5)
// 选择框的选中数组
const multipleSelection = ref([])
// 控制新增遮罩层
const showWindow = ref(false)
// 修改遮罩层
const showUpdate = ref(false)

// 修改遮罩数据
const onlyRole = ref([])

// 权限数组
const dateList = ref([])
// test = ref(new Array())
// 新增遮罩层弹出显示数据
const Roleing = ref({
  id: []
})
// 选中的权限
const checkPermission = ref(null)
// 存放已有权限
const updatePermission = ref(null)

// 根据校验规则拦截
const ruleFormRef = ref(null)

// 请求角色列表
const getListData = async () => {
  const param = {
    pageIndex: page.value,
    pageSize: size.value
  }
  const result = await getRoleList(param)
  tableData.value = result.data
  total.value = result.total
}
// 获取列表数据
getListData()
// 分页请求
const handleSizeChange = (currentSize) => {
  size.value = currentSize
  getListData()
}
// const SystemRoot = (onlyRole) => {
//   console.log(onlyRole)
//   if (onlyRole.id === 1) {
//     return [290, 291, 292, 293, 294, 295, 296]
//   }
// }
const handleCurrentChange = (currentSize) => {
  page.value = currentSize
  getListData()
}
// 删除角色
const delRole = (val) => {
  console.log(val)
  let ids = []
  if (val === undefined) {
    if (multipleSelection.value.length === 0) {
      ElMessage.error('还未选中要删除的项目')
      return
    }
    // JSON.parse(JSON.stringify(multipleSelection.value))
    ids = multipleSelection.value.map((item) => {
      // 找出选中的id
      return { id: item.roleId }
    })
  } else {
    multipleSelection.value = []
    ids.push({ id: val.roleId })
  }
  ElMessageBox({
    title: '',
    message: '确认删除吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    showCancelButton: true
  }).then(async () => {
    await deleteRole(ids)
    ElMessage.success('删除成功')
    // 重新渲染数据
    getListData()
    ids = []
  })
}

// 遮罩层表单规则
const rules = ref({
  roleName: [
    {
      min: 1,
      required: true,
      message: '不能为空',
      trigger: 'blur'
    }
  ],
  des: [
    {
      min: 1,
      required: true,
      message: '不能为空',
      trigger: 'blur'
    }
  ]
})

// 表单勾选后执行的操作
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 新增角色
const addBuildingStatus = async () => {
  showWindow.value = !showWindow.value
}

const btnInsertRole = (role) => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      // 获取选中的权限数组
      console.log(checkPermission.value)
      console.log(checkPermission.value.getCheckedNodes(false, false))
      for (let i = 0; i < checkPermission.value.getCheckedNodes(false, false).length; i++) {
        if (checkPermission.value.getCheckedNodes(false, false)[i].id !== null) {
          dateList.value.push(checkPermission.value.getCheckedNodes(false, false)[i].id)
        }
      }
      console.log(dateList)
      // 把获取到的数据处理
      // dateList.value = checkPermission.value.getCheckedNodes(false, false)
      console.log(dateList.value)
      const permissionList = ref({
        permissions: dateList.value,
        des: role.des,
        roleName: role.roleName
      })
      console.log(permissionList.value)
      // 请求接口
      await insertRole(JSON.parse(JSON.stringify(permissionList.value)))
      ElMessage.success('新增成功')
      getListData()
      showWindow.value = false
      // 清除表单信息
      ruleFormRef.value.resetFields()
    }
  })
}
const data = ref()
// 权限树
const getPermissionTree = async () => {
  const perm = await permissionTree()
  data.value = perm.data
  console.log(data)
}
getPermissionTree()

const defaultProps = ref({
  children: 'children',
  label: 'label',
  id: 'id'
})

const resPermissionList = ref([])
// 弹出修改遮罩
const onUpdateClick = async (row) => {
  showUpdate.value = !showUpdate.value
  // console.log(typeof row.roleId)
  await selectRolePermissionsById(row.roleId).then((res) => {
    // console.log(res.data)
    resPermissionList.value = res.data
  })
  // console.log()
  // console.log(resPermissionList.value)
  onlyRole.value = {
    id: row.roleId,
    roleName: row.roleName,
    des: row.des
  }
  console.log(onlyRole.value.id)
  console.log(resPermissionList.value[0])
  // console.log(JSON.parse(JSON.stringify(resPermissionList.value)))
  updatePermission.value.setCheckedKeys(JSON.parse(JSON.stringify(resPermissionList.value)), false)
}
// 修改数据
const btnUpdateRole = (role) => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      // role.value.id = dateList.value
      // 获取选中的权限数组
      dateList.value = []
      for (let i = 0; i < updatePermission.value.getCheckedNodes(false, true).length; i++) {
        if (updatePermission.value.getCheckedNodes(false, true)[i].id !== null) {
          dateList.value.push(updatePermission.value.getCheckedNodes(false, true)[i].id)
        }
      }
      console.log(dateList)
      // 把获取到的数据处理
      // dateList.value = checkPermission.value.getCheckedNodes(false, false)
      console.log(dateList.value)
      console.log(role)
      const permissionList = ref({
        id: role.id,
        permissions: dateList.value,
        des: role.des,
        roleName: role.roleName
      })
      await updateRole(permissionList.value)
      ElMessage.success('修改成功')
      getListData()
      showUpdate.value = false
    }
  })
}

// 权限列表
const permissionList = ref(null)
// 权限列表弹出层控制
const showPermissionDialog = ref(false)
// 查看指定角色的权限列表
const getPermissionList = async (id) => {
  showPermissionDialog.value = !showPermissionDialog.value
  const result = await getPermissionListById(id)
  permissionList.value = result.data
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 10px;
}
.bottom {
  display: flex;
  justify-content: center;
}
.checkbox {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
</style>
