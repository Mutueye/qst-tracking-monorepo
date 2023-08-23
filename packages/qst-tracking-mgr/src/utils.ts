import { Base64 } from 'js-base64';
import type { TrackingData } from './index';

/**
 * @name maxUrlLengt 上报url的最大长度定为2048个字节。
 * @description According to the HTTP spec, there is no limit to a URL's length. Keep your URLs under 2048 characters; this will ensure the URLs work in all clients & server configurations. Also, search engines like URLs to remain under approximately 2000 characters. Chrome has a 2MB limit for URLs, IE8 and 9 have a 2084 character limit. So everything points in keeping your URLs limited to approx. 2000 characters.
 */
export const MaxUrlLength = 2048;

/** 暂存埋点数据的localStorage的key。上报失败的埋点数据会暂存到localStorage */
export const LocalTrackingDataKey = 'cached-qst-tracking-data';

/** 上报url中负载埋点数据的query字段默认名称 */
export const DefaultQueryName = 'payload';

/**
 * 获取字符串的字节长度
 * 字符编码数值对应的存储长度：
 * UCS-2编码(16进制) UTF-8 字节流(二进制)
 * 0000 - 007F       0xxxxxxx （1字节）
 * 0080 - 07FF       110xxxxx 10xxxxxx （2字节）
 * 0800 - FFFF       1110xxxx 10xxxxxx 10xxxxxx （3字节）
 * @param {string} str 字符串
 */
export const getStringBytes = (str: string) => {
  if (!str) return 0;
  let totalLength = 0;
  let charCode: number;
  for (let i = 0; i < str.length; i++) {
    charCode = str.charCodeAt(i);
    if (charCode < 0x007f) {
      totalLength++;
    } else if (0x0080 <= charCode && charCode <= 0x07ff) {
      totalLength += 2;
    } else if (0x0800 <= charCode && charCode <= 0xffff) {
      totalLength += 3;
    } else {
      totalLength += 4;
    }
  }
  return totalLength;
};

/** 从localStorage取得暂存的埋点数据 */
export const getLocalTrackingData = () => {
  const dataStr = localStorage.getItem(LocalTrackingDataKey);
  if (dataStr) {
    return JSON.parse(dataStr) as TrackingData[];
  } else {
    return null;
  }
};

/** 新增暂存的埋点数据到localStorage，合并&去重 */
export const addLocalTrackingData = (data: TrackingData[]) => {
  const currentData = getLocalTrackingData();
  if (currentData) {
    const newData = [...currentData];
    data.forEach((item) => {
      if (currentData.findIndex((one) => one.guid === item.guid) < 0) {
        newData.push(item);
      }
    });
    localStorage.setItem(LocalTrackingDataKey, JSON.stringify(newData));
  } else {
    localStorage.setItem(LocalTrackingDataKey, JSON.stringify(data));
  }
};

export const removeLocalTrackingData = () => {
  localStorage.removeItem(LocalTrackingDataKey);
};

/**
 * @name getReportUrl
 * @description 生成上报url，如果生成的url超过设定的最大字节长度，返回空字符串
 * @param {string} url 上报地址
 * @param {TrackingData[]} data 上报的数据
 * @param {string} queryName 上报url中负载埋点数据的query字段名称
 * */
export const getReportUrl = (url: string, data: TrackingData[], queryName = DefaultQueryName) => {
  const path = `${url}?${queryName}=${Base64.encode(JSON.stringify(data))}`;
  if (getStringBytes(path) >= MaxUrlLength && data.length > 1) {
    return '';
  } else {
    return path;
  }
};

/**
 * @description 将要上报的埋点数组切分成两部分
 * @param {TrackingData[]} data 要上报的埋点数据数组
 * @returns {TrackingData[][]} 返回两个数组
 */
export const splitDataHalf = (data: TrackingData[]) => {
  const half = Math.ceil(0.5 * data.length);
  return [data.slice(0, half), data.slice(half)];
};

// /**
//  * @description 递归处理：当上报的url超出设定的最大长度时，将要上报的埋点数组切分成两部分生成两个url，最终生成一个url数组
//  * @param {string} url 上报地址
//  * @param {TrackingData[]} data 上报的数据
//  * @param {string} queryName 上报url中负载埋点数据的query字段名称
//  */
// export const generateReportUrlList = (
//   url: string,
//   data: TrackingData[],
//   queryName = DefaultQueryName,
// ): TrackingData[][] => {
//   const reportUrl = getReportUrl(url, data, queryName);
//   if (reportUrl) {
//     return [data];
//   } else {
//     return splitDataHalf(data);
//   }
// };
