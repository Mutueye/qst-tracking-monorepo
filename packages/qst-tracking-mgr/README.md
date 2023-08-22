# @itshixun/qst-tracking-mgr

QST 前端埋点工具库

## 安装

```bash
# pnpm
pnpm add @itshixun/qst-tracking-mgr
# npm
npm install @itshixun/qst-tracking-mgr
```

## 使用

#### 前提

- 本工具通过请求 1px 的 gif 文件来实现埋点数据的上报，所以服务端需要提供 1 像素 gif 的 url 地址，来接收上报的埋点数据。
- 服务端/nginx 配置允许跨域。

#### 初始化

在项目入口比如 main.ts 配置埋点工具的初始化选项:

```ts
import { trackingMgr, Source, UserIdType } from '@itshixun/qst-tracking-mgr';

/**
 * 需要给trackingMgr提供获取userId的方法
 * 随着登录状态的变更，返回空字符串或登录用户的id
 */
const getUserId = () => {
  return userId ? userId : '';
};

trackingMgr.setOption({
  // 接收上报数据的地址(1像素gif地址)
  url: 'https://your.tracking.url/xxx/1px.gif',
  // 来源：SAAS版/本地版
  source: Source.Saas,
  // 用户id类型：customerId或memberId
  userIdType: UserIdType.CustomerId,
  // 获取用户id的方法，系统的登录状态可能随时变更，所以此处接收一个获取用户id的方法，已登录返id，未登录返空字符串
  getUserId,
});
```

#### 生成&上报埋点数据

```ts
import { trackingMgr, TrackingType, Platform } from '@itshixun/qst-tracking-mgr';

// 生成埋点数据
const data = trackingMgr.createTrackingData({
  /** 埋点类型
   * - Page 页面访问
   * - Click 点击事件
   * - Duration 驻留时间
   * - Error 错误信息 */
  type: TrackingType.Page,
  /** 当前埋点所在的平台/模块 */
  platform: Platform.Obe,
  /** 业务数据，预留字段，可存 json 结构数据 */
  bdata: '{ "data": "test" }',
});

// 上报埋点数据
trackingMgr.reportTrackingData(
  [data],
  (evt: Event) => console.log('上报成功', evt),
  (evt: Event) => console.log('上报失败', evt),
);

// 上报单条埋点数据的快捷方法，相当于合并上面的生成和上报操作
trackingMgr.reportOne(
  {
    type: TrackingType.page,
    platform: Platform.Obe,
  },
  (evt: Event) => console.log('上报成功', evt),
  (evt: Event) => console.log('上报失败', evt),
);
```
