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

### 前提

- 本工具通过请求 1px 的 gif 文件来实现埋点数据的上报，所以服务端需要提供 1 像素 gif 的 url 地址，来接收上报的埋点数据。
- 服务端/nginx 配置允许跨域。

### 初始化

在项目入口比如 main.ts 配置埋点工具的初始化选项:

```ts
import { trackingMgr, Source, UserIdType } from '@itshixun/qst-tracking-mgr';

// 初始化埋点管理器配置
trackingMgr.setOption({
  // 接收上报数据的地址(1像素gif地址)
  url: 'https://your.tracking.url/xxx/1px.gif',
  // 来源：SAAS版/本地版
  source: Source.Saas,
  // 用户id类型：customerId或memberId
  userIdType: UserIdType.CustomerId,
  // 获取用户id的方法，系统的登录状态可能随时变更，所以此处接收一个获取用户id的方法，已登录返id，未登录返空字符串
  getUserId: () => userId ? userId : '',
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
```
配置选项的详细定义如下：
```ts
/** 埋点控制器的配置选项 */
export type TrackingMgrOption = {
  /** 发送埋点信息的url */
  url: string;
  /** 来源：本地/SAAS */
  source: Source;
  /** 用户id类型：customerId还是memeberId */
  userIdType: UserIdType;
  /** 获取用户id的方法，系统的登录状态可能随时变更，所以此处接收一个获取用户id的方法，已登录返id，未登录，返空字符串 */
  getUserId: () => string;
  /** 上报url的参数名称，不传则默认为'payload' */
  queryName?: string;
  /** 上报失败后重新上报的等待时间(毫秒) ，默认10000毫秒(10秒)*/
  retryDelay?: number;
  /** 上报失败后重新上报的次数，默认5次 */
  retryLimit?: number;
};
```

### 生成&上报埋点数据

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
上面代码中生成的埋点数据的数据结构如下（其中有些字段在初始化选项中配置，比如source和uid；有些字段会自动填写，比如上报时间和当前页面的url地址等）：
```ts
/**
 * 埋点通用数据结构
 */
export type TrackingData = {
  /** 用户id */
  uid: UserId;
  /** 当前页面地址 */
  url: string;
  /** 埋点类型 */
  type: TrackingType;
  /** GUID */
  guid: string;
  /** 来源：本地/SAAS */
  source: Source;
  /** 平台 */
  platform: Platform;
  /** local time string eg. '2023/8/21 15:36:15' */
  local_time: string;
  /** 13位标准时间戳 eg. 1692603413368 */
  event_time: number;
  /** 业务数据，预留字段，可存 json 结构数据 比如 '{"data": 123}' */
  bdata?: string;
};
```

### 上报失败后的自动重试机制
当前埋点数据上报失败后，会自动尝试重新上报，每次尝试会等待配置项中设定的等待时间(retryDelay)，当判断当前网络连接已断开，或者超过最大重试次数(retryLimit)后，会将上报数据存储到localStorage。当下一次上报成功后，会自动检测localStorage中是否有暂存的上报数据，如果有，会通过trackingMgr.reportStoragedData()来重新上报。在业务端也可以根据实际情况，手动调用reportStoragedData方法上报暂存数据，比如上面初始化部分，初始化配置完成后即可执行一次。

### 上报数据过大时的自动拆分上报
浏览器和服务端对上报的url长度有限制，因此这里设定上报的url的最大字节长度为2048，如果上报的url长度超过2048字节，会自动将上报的数组切分为两个数组，逐个进行上报（此处递归处理，如果切分后仍然超长，会继续切分，直到长度合适再进行上报）。如果上报的数组仅有单条上报数据且url超长，目前无法做拆分，仍然会尝试直接上报。
