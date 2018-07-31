import Vue from 'vue'
import App from './App'

// flex.css
import 'flex.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import screenfull from 'screenfull'
import '@/assets/svg-icons'
import '@/components'
import '@/plugin/axios'
import '@/mock/register'
import util from '@/utils/util'
import store from '@/store/index'
import pluginOpen from '@/plugin/open'

// 菜单和路由设置
import router from './router'
import menuHeader from '@/menu/header'
import menuAside from '@/menu/aside'
import { frameInRoutes } from '@/router/routes'

Vue.use(ElementUI)
Vue.use(pluginOpen)

Vue.config.productionTip = false

Vue.prototype.$env = process.env.NODE_ENV
Vue.prototype.$baseUrl = process.env.BASE_URL

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    // 处理路由 得到每一级的路由设置
    this.getAllPageFromRoutes()
    // 设置顶栏菜单
    this.$store.commit('menuHeaderSet', menuHeader)
    // 设置侧边栏菜单
    this.$store.commit('menuAsideSet', menuAside)
  },
  mounted() {
    // 获取并记录用户 UA
    this.$store.commit('uaGet')
    // 展示系统信息
    util.showInfo()
    // 用户登陆后从数据库加载一系列的设置
    this.$store.commit('loginSuccessLoad')
    // 初始化全屏监听
    this.fullscreenListenerInit()
  },
  methods: {
    /**
     * 初始化全屏监听
     */
    fullscreenListenerInit() {
      if (screenfull.enabled) {
        screenfull.on('change', () => {
          if (!screenfull.isFullscreen) {
            this.$store.commit('fullScreenSet', false)
          }
        })
      }
    },
    /**
     * 处理路由 得到所有的页面
     */
    getAllPageFromRoutes() {
      const pool = []
      const push = function(routes) {
        routes.forEach(route => {
          if (route.children) {
            push(route.children)
          } else {
            const { meta, name, path } = route
            pool.push({ meta, name, path })
          }
        })
      }
      push(frameInRoutes)
      this.$store.commit('pagePoolSet', pool)
    }
  }
}).$mount('#app')