import { UUID } from './uuid';
import {
  DefaultQueryName,
  addLocalTrackingData,
  getLocalTrackingData,
  getReportUrl,
  removeLocalTrackingData,
  splitDataHalf,
} from './utils';

type PrefixStr<T extends string> = `${T}${string}`;

/**
 * 用户id类型
 * - `nologin`：未登录传'nologin'；
 * - `quc_customer_id:${id}`：默认使用customerId
 * - `member_id:${id}`：如果拿不到customerId, 使用member_id
 */
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
  /** 数据魔方 */
  Datacube = 'datacube',
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

/** 判断是否初始化完成 */
const trackingMgrInitialized = () => {
  if (!trackingMgr.option) {
    // throw new Error('TrackingMgr is not initialized. Please config TrackingMgr first.');
    console.error('TrackingMgr is not initialized. Please TrackingMgr.setOption(option) first.');
    return false;
  } else {
    return true;
  }
};

/** 设置埋点管理器选项 */
const setOption = (option: TrackingMgrOption) => {
  trackingMgr.option = Object.assign({}, trackingMgr.option, option);
  if (!trackingMgr.initialized) trackingMgr.initialized = true;
};

/** 处理用户id: 如果能取得id,则根据类型增加前缀；id位空返回'nologin' */
const getResolvedUserId = (): UserId => {
  if (!trackingMgrInitialized()) return;
  const id = trackingMgr.option.getUserId();
  if (id) {
    if (trackingMgr.option.userIdType === UserIdType.MemberId) {
      return `member_id:${id}`;
    } else {
      return `quc_customer_id:${id}`;
    }
  } else {
    return 'nologin';
  }
};

/** 生成一条埋点数据 */
const createTrackingData = (params: TrackingParam): TrackingData => {
  if (!trackingMgrInitialized()) return;
  const time = new Date();
  return {
    uid: getResolvedUserId(),
    url: location.href,
    type: params.type,
    guid: new UUID().toString(),
    source: trackingMgr.option.source,
    platform: params.platform,
    local_time: time.toLocaleString(),
    event_time: time.getTime(),
    bdata: params.bdata,
  };
};

/**
 * 通过请求img来实现最终的埋点数据上报，同时对上报失败的数据进行重新上报和暂存处理
 */
const report = (
  url: string,
  data: TrackingData[],
  onSuccess?: (data: TrackingData[], evt: Event) => void,
  onError?: (data: TrackingData[], evt: Event) => void,
  retryTime = 0,
) => {
  const img = new Image();
  img.src = url;
  img.onload = (evt: Event) => {
    if (typeof onSuccess === 'function') onSuccess(data, evt);
    // 上报成功后，尝试上报ocalStorage里暂存的上报失败的埋点数据
    reportStoragedData(onSuccess, onError);
  };
  img.onerror = (evt: Event) => {
    if (typeof onError === 'function') onError(data, evt);
    // 上报失败后尝试重新上报
    if (window.navigator.onLine && retryTime <= trackingMgr.option.retryLimit) {
      // 网络没掉线，且没有超过最大重试次数，尝试20s后重新上报
      setTimeout(() => {
        report(url, data, onSuccess, onError, retryTime + 1);
      }, trackingMgr.option.retryDelay);
    } else {
      // 网络掉线，或者超过了最大重试次数，直接暂存到localStorage
      addLocalTrackingData(data);
    }
  };
};

/** 上报指定的埋点数据 */
const reportTrackingData = (
  data: TrackingData[],
  onSuccess?: (data: TrackingData[], evt: Event) => void,
  onError?: (data: TrackingData[], evt: Event) => void,
) => {
  if (!trackingMgrInitialized()) return;
  const url = getReportUrl(trackingMgr.option.url, data, trackingMgr.option.queryName);
  if (url) {
    report(url, data, onSuccess, onError);
  } else {
    const dataList = splitDataHalf(data);
    dataList.forEach((item) => {
      reportTrackingData(item, onSuccess, onError);
    });
  }
};

/** 上报单条埋点数据的快捷方法 */
const reportOne = (
  data: TrackingParam,
  onSuccess?: (data: TrackingData[], evt: Event) => void,
  onError?: (data: TrackingData[], evt: Event) => void,
) => {
  reportTrackingData([createTrackingData(data)], onSuccess, onError);
};

/** 上报localStorage里暂存的上报失败的埋点数据 */
const reportStoragedData = (
  onSuccess?: (data: TrackingData[], evt: Event) => void,
  onError?: (data: TrackingData[], evt: Event) => void,
) => {
  const localTrackingData = getLocalTrackingData();
  if (localTrackingData && localTrackingData.length > 0) {
    // 检测有没有暂存的上报数据，如果有，尝试上报
    reportTrackingData(localTrackingData, onSuccess, onError);
    // 清除暂存的数据，防止重复上报
    removeLocalTrackingData();
  }
};

/** 埋点管理器 */
export type TrackingMgr = {
  /** 选项，用来配置上报地址，来源，用户id类型，获取用户id的方法等 */
  option: TrackingMgrOption;
  /** 是否已初始化 */
  initialized: boolean;
  /** 设置埋点管理器选项 */
  setOption: (option: TrackingMgrOption) => void;
  /** 处理用户id: 如果能取得id,则根据类型增加前缀；id位空返回'nologin' */
  getResolvedUserId: () => UserId;
  /** 创建一条埋点数据 */
  createTrackingData: (params: TrackingParam) => TrackingData;
  /** 上报埋点数据 */
  reportTrackingData: (
    data: TrackingData[],
    onSuccess?: (data: TrackingData[], evt: Event) => void,
    onError?: (data: TrackingData[], evt: Event) => void,
  ) => void;
  /** 上报单条埋点数据的快捷方法 */
  reportOne: (
    data: TrackingParam,
    onSuccess?: (data: TrackingData[], evt: Event) => void,
    onError?: (data: TrackingData[], evt: Event) => void,
  ) => void;
  reportStoragedData: (
    onSuccess?: (data: TrackingData[], evt: Event) => void,
    onError?: (data: TrackingData[], evt: Event) => void,
  ) => void;
};

/** 埋点管理器 */
export const trackingMgr: TrackingMgr = {
  option: {
    url: '',
    source: Source.Saas,
    userIdType: UserIdType.CustomerId,
    getUserId: () => '',
    queryName: DefaultQueryName,
    retryDelay: 10000,
    retryLimit: 5,
  },
  initialized: false,
  setOption,
  getResolvedUserId,
  createTrackingData,
  reportTrackingData,
  reportOne,
  reportStoragedData,
};
