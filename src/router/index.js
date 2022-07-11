import { createRouter, createWebHashHistory } from 'vue-router'
import layout from '@/layout'

/**
 * 路由表
 */
const routes = [
  {
    path: '/',
    component: layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: {
          title: 'dashboard',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/role',
        name: 'role',
        component: () => import('@/views/system/role/index'),
        meta: {
          title: '角色管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/user',
        name: 'user',
        component: () => import('@/views/system/user/index'),
        meta: {
          title: '用户管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/property',
        name: 'property',
        component: () => import('@/views/base/property/index'),
        meta: {
          title: '物业公司',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/site',
        name: 'site',
        component: () => import('@/views/parking/car-site/index'),
        meta: {
          title: '车位管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/admin',
        name: 'admin',
        component: () => import('@/views/system/admin/index'),
        meta: {
          title: '管理员管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/department_config',
        name: 'department_config',
        component: () => import('@/views/base/department/index'),
        meta: {
          title: '部门配置',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/log',
        name: 'log',
        component: () => import('@/views/system/log/index'),
        meta: {
          title: '操作日志',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/site_buy',
        name: 'site_buy',
        component: () => import('@/views/parking/car-site-buy/index'),
        meta: {
          title: '停车位购买',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/community_config',
        name: 'community_config',
        component: () => import('@/views/base/community/index'),
        meta: {
          title: '社区配置',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/site_rent',
        name: 'site_rent',
        component: () => import('@/views/parking/car-site-rent/index'),
        meta: {
          title: '停车租赁管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/position_config',
        name: 'position_config',
        component: () => import('@/views/base/position/index'),
        meta: {
          title: '职位配置',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/carport',
        name: 'carport',
        component: () => import('@/views/parking/carport/index'),
        meta: {
          title: 'carport',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/building',
        name: 'building',
        component: () => import('@/views/base/building/index'),
        meta: {
          title: '楼栋配置',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/invitation',
        name: 'invitation',
        component: () => import('@/views/parking/invitation/index'),
        meta: {
          title: 'invitation',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/unit',
        name: 'unit',
        component: () => import('@/views/base/unit/index'),
        meta: {
          title: '单元管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/card',
        name: 'card',
        component: () => import('@/views/parking/park-card/index'),
        meta: {
          title: 'card',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/room',
        name: 'room',
        component: () => import('@/views/base/room/index'),
        meta: {
          title: '房间管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/detail',
        name: 'detail',
        component: () => import('@/views/parking/pay-detail/index'),
        meta: {
          title: 'carPay',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/car_exception_list',
        name: 'car_exception_list',
        component: () => import('@/views/parking/car-exception-list/index'),
        meta: {
          title: 'carPay',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/car_record',
        name: 'car_record',
        component: () => import('@/views/parking/car-record/index'),
        meta: {
          title: 'carPay',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/owner',
        name: 'owner',
        component: () => import('@/views/base/owner/index'),
        meta: {
          title: '业主管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/staff',
        name: 'staff',
        component: () => import('@/views/base/staff/index'),
        meta: {
          title: '员工管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/notice',
        name: 'notice',
        component: () => import('@/views/community/info/index'),
        meta: {
          title: '通知管理',
          icon: 'el-icon-bell'
        }
      },
      {
        path: '/checking',
        name: 'checking',
        component: () => import('@/views/community/checking/index'),
        meta: {
          title: '考勤管理',
          icon: 'el-icon-document-checked'
        }
      },
      {
        path: '/purchase',
        name: 'purchase',
        component: () => import('@/views/community/purchase/index'),
        meta: {
          title: '采购管理',
          icon: 'el-icon-goods'
        }
      },
      {
        path: '/square',
        name: 'square',
        component: () => import('@/views/communication/square/index'),
        meta: {
          title: '广场',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/cooperation',
        name: 'cooperation',
        component: () => import('@/views/communication/cooperation/index'),
        meta: {
          title: '互助',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/secondhand',
        name: 'secondhand',
        component: () => import('@/views/communication/secondhand/index'),
        meta: {
          title: '二手',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/carpool',
        name: 'carpool',
        component: () => import('@/views/communication/carpool/index'),
        meta: {
          title: '拼车',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/estate_transaction',
        name: 'estate_transaction',
        component: () => import('@/views/operation/estate-transaction/index'),
        meta: {
          title: '房产交易',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/flea_market',
        name: 'flea_market',
        component: () => import('@/views/operation/flea-market/index'),
        meta: {
          title: '跳蚤市场',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/goods_type',
        name: 'goods_type',
        component: () => import('@/views/operation/goods-type/index'),
        meta: {
          title: '商品类型',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/property_fee',
        name: 'property_fee',
        component: () => import('@/views/operation/property-fee/index'),
        meta: {
          title: '物业费管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/property_fee_type',
        name: 'property_fee_type',
        component: () => import('@/views/operation/property-fee-type/index'),
        meta: {
          title: '物业费类型',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/order',
        name: 'order',
        component: () => import('@/views/operation/order/index'),
        meta: {
          title: '账单管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/property_feedback',
        name: 'property_feedback',
        component: () => import('@/views/operation/property-feedback/index'),
        meta: {
          title: '物业投诉建议',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/community_shop',
        name: 'community_shop',
        component: () => import('@/views/operation/community-shop/index'),
        meta: {
          title: '在线社区商城',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/repair',
        name: 'repair',
        component: () => import('@/views/operation/repair/index'),
        meta: {
          title: '在线维修申报',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/activity',
        name: 'activity',
        component: () => import('@/views/app/activity/index'),
        meta: {
          title: '活动管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/advertising',
        name: 'advertising',
        component: () => import('@/views/app/advertising/index'),
        meta: {
          title: '广告管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/announcement',
        name: 'announcement',
        component: () => import('@/views/app/announcement/index'),
        meta: {
          title: '公告管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/information',
        name: 'information',
        component: () => import('@/views/app/information/index'),
        meta: {
          title: '资讯管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/information_tag',
        name: 'information_tag',
        component: () => import('@/views/app/information-tag/index'),
        meta: {
          title: '资讯标签',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/discount',
        name: 'discount',
        component: () => import('@/views/app/discount/index'),
        meta: {
          title: '优惠券管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/integration_list',
        name: 'integration_list',
        component: () => import('@/views/app/integration-list/index'),
        meta: {
          title: '积分列表',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/user_feed',
        name: 'user_feed',
        component: () => import('@/views/app/user-feed/index'),
        meta: {
          title: '用户反馈',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/version_control',
        name: 'version_control',
        component: () => import('@/views/app/version/index'),
        meta: {
          title: '版本管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/profile/index'),
        meta: {
          title: '个人中心',
          icon: 'el-icon-user'
        }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index')
  },
  {
    path: '/platform',
    component: () => import('@/views/platform/index')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
