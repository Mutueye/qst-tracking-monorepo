import { createApp } from 'vue';
import { initQstTheme } from '@itshixun/qst-ui-system';
import { trackingMgr, Source, UserIdType } from '@itshixun/qst-tracking-mgr';

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

trackingMgr.setOption({
  url: '/assets/gif1px.gif',
  source: Source.Saas,
  userIdType: UserIdType.CustomerId,
  getUserId: () => 'ddd',
});

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
