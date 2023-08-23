import { createApp } from 'vue';
import { initQstTheme } from '@itshixun/qst-ui-system';
import { trackingMgr, Source, UserIdType, TrackingData } from '@itshixun/qst-tracking-mgr';

import App from '@/App.vue';
import { router } from '@/router/index';
import pinia from '@/store';

// element-plus css variables
import 'element-plus/theme-chalk/el-var.css';
// element-plus darkmode css variables
import 'element-plus/theme-chalk/dark/css-vars.css';
// fix el-dialog el-message-box el-loading 样式丢失; 或可用uplugin-element-plus插件
import 'element-plus/theme-chalk/el-dialog.css';
import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-message-box.css';
import 'element-plus/theme-chalk/el-loading.css';

import 'uno.css';

initQstTheme();

// 初始化埋点管理器
trackingMgr.setOption({
  url: '/assets/gif1px.gif',
  source: Source.Saas,
  userIdType: UserIdType.CustomerId,
  getUserId: () => 'user_id_test',
  queryName: 'data',
});

// 上报localStorage中可能存储的上报失败的埋点数据
trackingMgr.reportStoragedData(
  (data: TrackingData[], evt: Event) => {
    console.log('上报暂存数据成功:', data, evt);
  },
  (data: TrackingData[], evt: Event) => {
    console.log('上报暂存数据失败:', data, evt);
  },
);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
