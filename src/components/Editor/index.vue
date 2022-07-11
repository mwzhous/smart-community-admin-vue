<template>
  <div class="editor-container">
    <div id="editor-box"></div>
  </div>
</template>

<script setup>
import E from 'wangeditor'
import { onMounted, watch } from 'vue'
// Editor实例
let editor
// 处理离开页面切换语言导致 dom 无法被获取
let el
onMounted(() => {
  el = document.querySelector('#editor-box')
  initEditor()
})

const setValue = (content) => {
  editor.txt.html(content)
}
const getValue = () => {
  console.log(editor.txt)
  return editor.txt.html()
}

const initEditor = () => {
  editor = new E(el)
  editor.config.zIndex = 1
  // 菜单栏提示
  editor.config.showMenuTooltips = true
  editor.config.menuTooltipPosition = 'down'
  editor.create()
}
// 编辑相关
watch(
  (val) => {
    if (val && val.content) {
      editor.txt.html(val.content)
    }
  },
  {
    immediate: true
  }
)

defineExpose({
  setValue,
  getValue
})
</script>

<style lang="scss" scoped>
.editor-container {
  .bottom {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
