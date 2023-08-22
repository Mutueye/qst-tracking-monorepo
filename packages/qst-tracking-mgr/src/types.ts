type PrefixStr<T extends string> = `${T}${string}`;

/**
 * 用户id类型
 * - `nologin`：未登录传'nologin'；
 * - `quc_customer_id:${id}`：默认使用customerId
 * - `member_id:${id}`：如果拿不到customerId, 使用member_id*/
export type UserId = 'nologin' | PrefixStr<'quc_customer_id:' | 'member_id:'>;

/** 埋点类型枚举 */
export enum TrackingType {
  /** 页面访问 */
  Page = 'page',
  /** 点击事件 */
  Click = 'click',
  /** 页面停留时间 */
  Duration = 'duration',
  /** 错误事件 */
  Error = 'error',
}

/** 来源：本地版/SAAS版 */
export enum Source {
  /** SAAS版 */
  Saas = 'saas',
  /** 本地版 */
  Local = 'local',
}

/** 业务平台或模块，比如OBE、创新大赛、职业发展课 */
export enum Platform {
  /** 职业发展课 */
  OpenClass = 'openclass',
  /** 实习生计划 */
  InternProgram = 'internprogram',
  /** 产业项目 */
  IndustryProject = 'industryproject',
  /** 实验室 */
  Lab = 'lab',
  /** 创新大赛 */
  InnoCompetition = 'innocompetition',
  /** 工程教育认证辅助平台 */
  Obe = 'obe',
  /** 求职招聘 */
  Ujob = 'ujob',
  /** 宣讲会 */
  CareerTalk = 'careertalk',
  /** 双选会 */
  JobFair = 'jobfair',
}

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

/** 创建埋点数据时需要的字段 */
export type TrackingParam = Pick<TrackingData, 'type' | 'platform' | 'bdata'>;

/** 用户id类型：customerId还是memberId */
export enum UserIdType {
  CustomerId = 'CustomerId',
  MemberId = 'MemberId',
}

/** 埋点控制器的配置选项 */
export type TrackingMgrOption = {
  /** 发送买点信息的url */
  url: string;
  /** 来源：本地/SAAS */
  source: Source;
  /** 用户id类型：customerId还是memeberId */
  userIdType: UserIdType;
  /** 获取用户id的方法，系统的登录状态可能随时变更，所以此处接收一个获取用户id的方法，已登录返id，未登录，返空字符串 */
  getUserId: () => string;
};

/** 埋点管理器结 */
export type TrackingMgr = {
  /** 选项，用来配置上报地址，来源，用户id类型，获取用户id的方法等 */
  option: TrackingMgrOption | null;
  /** 设置埋点管理器选项 */
  setOption: (option: TrackingMgrOption) => void;
  /** 处理用户id: 如果能取得id,则根据类型增加前缀；id位空返回'nologin' */
  getResolvedUserId: () => UserId;
  /** 创建一条埋点数据 */
  createTrackingData: (params: TrackingParam) => TrackingData;
  /** 上报埋点数据 */
  reportTrackingData: (
    dataList: TrackingData[],
    onSuccess?: (evt: Event) => void,
    onError?: (evt: Event) => void,
  ) => void;
};
