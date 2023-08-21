import { axiosDefInstance, PaginationModel, Result } from '@/utils/axios';

export interface SchoolModel {
  /** 学校id */
  id: string;
  /** 学校代码 */
  code: string;
  /** 学校名称 */
  name: string;
  /** 本地化后端api版本 */
  version: string;
  /** 学校url */
  accessUrl: string;
}

export interface ConfigModel {
  /** 学院code */
  collegeCode: string;
  /** 学院id */
  collegeId: string;
  configKey: string;
  configValue: string;
  id: string;
  scope: string;
  scopeTitle: string;
}

/**
 * 取学校列表
 */
export const getSchoolList = () => {
  return axiosDefInstance.get<PaginationModel<SchoolModel>>(
    '/base/schools?scope=app&organNature=Normal',
  );
};

/**
 * 取学院配置列表
 */
export const getConfigList = () => {
  return axiosDefInstance.get<Result<ConfigModel[]>>('/base/config/college?param=UPLUS');
};
