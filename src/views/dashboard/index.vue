<template>
  <div class="home">
    <div class="bigBox">
      <el-row type="flex" justify="space-between">
        <el-card class="box-card" v-for="(item, index) in title" :key="index">
          <div class="contest">
            <img class="contestImg" :src="item.avatar" alt="" />
            <div class="text">
              <h3 style="padding-left: 10px; padding-top: 10px; margin: 0 auto">{{ item.title }}</h3>
              <p class="number">
                {{ list[index] }}
              </p>
            </div>
          </div>
        </el-card>
      </el-row>
    </div>
    <echarts class="myChart" :option="option" :option2="option2" :option3="option3"></echarts>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { searchCountUser, selectEcharts } from '@/api/dashboard'
import { useStore } from 'vuex'
import echarts from './echarts'

// 拿到小区id
const store = useStore()
// 用户数
const list = ref([])
// 标题数组
const title = ref([
  {
    title: '用户量',
    avatar: 'https://chl-bucket.oss-cn-hangzhou.aliyuncs.com/icon/icon/renshu.png'
  },
  {
    title: '物业费',
    avatar: 'https://chl-bucket.oss-cn-hangzhou.aliyuncs.com/md/202206061409601.png'
  },
  {
    title: '报修消息',
    avatar: 'https://chl-bucket.oss-cn-hangzhou.aliyuncs.com/md/202206061409227.png'
  },
  {
    title: '投诉数量',
    avatar: 'https://chl-bucket.oss-cn-hangzhou.aliyuncs.com/md/202206061411671.png'
  }
])
// const option = {
//   title: {
//     text: 'Stacked Line'
//   },
//   tooltip: {
//     trigger: 'axis'
//   },
//   legend: {
//     data: ['Email', 'Union Ads']
//   },
//   grid: {
//     left: '3%',
//     right: '4%',
//     bottom: '3%',
//     containLabel: true
//   },
//   toolbox: {
//     feature: {
//       saveAsImage: {}
//     }
//   },
//   xAxis: {
//     type: 'category',
//     boundaryGap: false,
//     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//   },
//   yAxis: {
//     type: 'value'
//   },
//   series: [
//     {
//       symbol: 'none',
//       name: 'Email',
//       type: 'line',
//       data: [120, 668, 156, 634, 90, 930, 210],
//       smooth: true
//     },
//     {
//       symbol: 'none',
//       name: 'Union Ads',
//       type: 'line',
//       data: [111, 182, 291, 134, 490, 230, 310],
//       smooth: true
//     }
//   ]
// }
const option = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '各个端人数',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '手机端' },
        { value: 735, name: '小程序端' },
        { value: 580, name: '网页端' },
        { value: 484, name: 'uniApp端' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}
const option2 = {
  dataset: [
    {
      dimensions: ['name', 'age', 'profession', 'score', 'date'],
      source: [
        ['Hannah Krause', 41, 'Engineer', 314, '2011-02-12'],
        ['Zhao Qian', 20, 'Teacher', 351, '2011-03-01'],
        ['Jasmin Krause ', 52, 'Musician', 287, '2011-02-14'],
        ['Li Lei', 37, 'Teacher', 219, '2011-02-18'],
        ['Karle Neumann', 25, 'Engineer', 253, '2011-04-02'],
        ['Adrian Groß', 19, 'Teacher', '-', '2011-01-16'],
        ['Mia Neumann', 71, 'Engineer', 165, '2011-03-19'],
        ['Böhm Fuchs', 36, 'Musician', 318, '2011-02-24'],
        ['Han Meimei', 67, 'Engineer', 366, '2011-03-12']
      ]
    },
    {
      transform: {
        type: 'sort',
        config: { dimension: 'score', order: 'desc' }
      }
    }
  ],
  xAxis: {
    type: 'category',
    axisLabel: { interval: 0, rotate: 30 }
  },
  yAxis: {},
  series: {
    type: 'bar',
    encode: { x: 'name', y: 'score' },
    datasetIndex: 1
  }
}
const option3 = {
  legend: {
    data: ['Allocated Budget', 'Actual Spending']
  },
  radar: {
    // shape: 'circle',
    indicator: [
      { name: 'Sales', max: 6500 },
      { name: 'Administration', max: 16000 },
      { name: 'Information Technology', max: 30000 },
      { name: 'Customer Support', max: 38000 },
      { name: 'Development', max: 52000 },
      { name: 'Marketing', max: 25000 }
    ]
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: 'Allocated Budget'
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: 'Actual Spending'
        }
      ]
    }
  ]
}
const searchUser = () => {
  console.log(store.getters.userInfo.communityId)
  searchCountUser(store.getters.userInfo.communityId).then((res) => {
    list.value = res.data
    console.log(list.value)
    console.log(res.data)
  })
}
selectEcharts(store.getters.userInfo.communityId).then((res) => {
  console.log(res.data)
})
searchUser()
</script>

<style lang="scss" scoped="scoped">
.text {
  font-size: 14px;
}

.box-card {
  width: 260px;
  margin-right: 20px;
  margin-top: 20px;
}
.contest {
  display: flex;
}
.contestImg {
  display: block;
  width: 50px;
  height: 50px;
  margin: 10px;
}
.text {
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.bigBox {
  display: flex;
  flex-direction: column;
}
.number {
  padding-left: 10px;
  padding-top: 5px;
  margin: 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@keyframes border-style-3 {
  0%,
  100% {
    background-position: 0%, 50%;
  }
  50% {
    background-position: 100%, 50%;
  }
}
/**
 * 原理简述：底层使用倾斜的七彩渐变背景并加上位移动画，上面再加一层白色遮罩，使得最终只能看到流动的边框
 */
.myChart {
  margin-top: 50px;
  width: auto;
  height: auto;
  /**
   * 居中
   */
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    border-radius: 10px;
    background-image: linear-gradient(60deg, aquamarine, cornflowerblue, goldenrod, salmon, lightgreen);
    background-size: 300%;
    z-index: -1;
    animation: border-style-3 5s infinite;
  }
}
</style>
