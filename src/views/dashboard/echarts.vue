<template>
  <div class="flex">
    <div id="myChart" class="myChart"></div>
    <div id="myChart2" class="myChart2"></div>
    <div id="myChart3" class="myChart3"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'
const options = defineProps({
  option: {
    type: Object
  },
  option2: {
    type: Object
  },
  option3: {
    type: Object
  }
})
onMounted(() => {
  const aaa = echarts.init(document.getElementById('myChart'))
  aaa.setOption(options.option)
  const bbb = echarts.init(document.getElementById('myChart2'))
  bbb.setOption(options.option2)
  const ccc = echarts.init(document.getElementById('myChart3'))
  ccc.setOption(options.option3)
})
</script>

<style scoped="scoped">
.flex {
  display: flex;
}
.myChart {
  position: relative;
  height: 70vh;
  width: 33.3333vw;
  border-radius: 10px;
  background-color: white;
}
.myChart2 {
  position: relative;
  height: 70vh;
  width: 33.3333vw;
  border-radius: 10px;
}
.myChart3 {
  position: relative;
  height: 70vh;
  width: 33.3333vw;
  border-radius: 10px;
}
</style>
