import { Base64 } from 'js-base64';
import { UserIdType } from './types';
import type { TrackingData, TrackingMgr, TrackingMgrOption, TrackingParam, UserId } from './types';
import { UUID } from './uuid';

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
  if (!trackingMgr.option) {
    trackingMgr.option = option;
  } else {
    trackingMgr.option = Object.assign({}, trackingMgr.option, option);
  }
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
    uid: trackingMgr.getResolvedUserId(),
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

/** 上报指定的埋点数据 */
const reportTrackingData = (
  dataList: TrackingData[],
  onSuccess?: (evt: Event) => void,
  onError?: (evt: Event) => void,
) => {
  if (!trackingMgrInitialized()) return;
  const img = new Image();
  img.src = `${trackingMgr.option.url}?payload=${Base64.encode(JSON.stringify(dataList))}`;
  img.onload = (evt: Event) => {
    if (typeof onSuccess === 'function') onSuccess(evt);
    console.log('report success, evt:', evt);
  };
  img.onerror = (evt: Event) => {
    if (typeof onError === 'function') onError(evt);
    // TODO 上报失败后重新上报
    console.log('report error, evt:', evt);
  };
};

/** 埋点管理器 */
export const trackingMgr: TrackingMgr = {
  option: null,
  setOption,
  getResolvedUserId,
  createTrackingData,
  reportTrackingData,
};

export * from './types';
