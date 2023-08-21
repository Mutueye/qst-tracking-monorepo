import type { RouteRecordRaw } from 'vue-router';
import { LayoutEnum } from '@/layouts/layoutRouteConfig';

export type RouteRecordData = Partial<Record<LayoutEnum | 'route', RouteRecordRaw[]>>;

/** 路由meta中的菜单配置 */
export interface MenuConfig {
  /** 菜单图标样式名称 */
  iconClass?: string;
  /** 菜单顺序号 */
  order?: number;
  /** 菜单scope，相同的layout显示不同的菜单时，使用scope来过滤菜单 */
  menuScope?: string;
  /** 不在菜单中显示  */
  hidden?: boolean;
  /** 指定要高亮的菜单对应的路由名称 */
  activeRouteName?: string;
}

export interface ParentRouteData {
  parentRoute: RouteRecordRaw;
  baseRoute: RouteRecordRaw;
}
