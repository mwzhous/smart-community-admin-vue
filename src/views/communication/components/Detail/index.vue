<template>
  <el-dialog title="帖子详情" :model-value="modelValue" width="35%" @close="closed">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="头像">
        <el-image
          class="avatar"
          style="width: 40px; height: 40px"
          :src="props.item.avatar"
          :preview-src-list="[props.item.avatar]"
        ></el-image>
      </el-descriptions-item>
      <el-descriptions-item label="发帖人">
        {{ props.item.username }}
      </el-descriptions-item>
      <template v-if="props.typeId === 1 || props.typeId === 2 || props.typeId === 3">
        <el-descriptions-item :label="props.typeId == 3 ? '上架时间' : '发帖时间'"
          >{{ props.item.createTime }}
        </el-descriptions-item>
      </template>
      <template v-else-if="props.typeId === 4">
        <el-descriptions-item label="出发时间">{{ props.item.goTime }} </el-descriptions-item>
      </template>
      <template v-if="props.typeId === 3">
        <el-descriptions-item label="原价">
          {{ props.item.oriPrice }}
        </el-descriptions-item>
        <el-descriptions-item label="现价">
          {{ props.item.nowPrice }}
        </el-descriptions-item>
      </template>
      <template v-if="props.typeId === 4">
        <el-descriptions-item label="是否有车">
          <el-tag size="small" v-if="props.item.status == 1" type="primary">有</el-tag>
          <el-tag size="small" v-else type="warning">无</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="起点">{{ props.item.origin }} </el-descriptions-item>
        <el-descriptions-item label="终点">{{ props.item.destination }} </el-descriptions-item>
      </template>
    </el-descriptions>
    <el-descriptions :column="1" border direction="vertical">
      <el-descriptions-item label="内容">
        {{ props.item.content }}
      </el-descriptions-item>
      <el-descriptions-item label="图片">
        <el-row>
          <el-col :span="6" v-for="(img, index) in props.item.banner" :key="index">
            <el-image
              :src="img"
              :preview-src-list="props.item.banner"
              fit="cover"
              style="margin: 0 auto; width: 130px"
            ></el-image>
          </el-col>
        </el-row>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  // 帖子id
  postId: {
    type: Number,
    requird: true
  },
  // 类型
  typeId: {
    type: Number,
    requird: true
  },
  openDialog: {
    type: Boolean,
    requird: true
  },
  item: {
    type: Object,
    requird: true
  }
})

const emits = defineEmits(['update:modelValue'])

// watch(
//   () => {
//     return props.postId
//   },
//   (val) => {
//     if (val) getListData()
//   }
// )

/**
 * 关闭评论弹窗
 */
const closed = () => {
  emits('update:modelValue', false)
}
</script>
<style lang="scss" scoped>
.container {
  margin: 20px 0;
}

.icon {
  margin-left: 5px;
}

::v-deep .el-col-6 {
  display: flex;
  width: 130px;
  height: 130px;
  margin-bottom: 10px;
}
</style>
