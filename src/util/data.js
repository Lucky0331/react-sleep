/* 统一维护的JSON */

// 所有页面权限对照表
export const power = {
  system: {
    // 系统管理
    manager: {
      // 管理员信息管理
      query: { code: "manager:query", title: "查询用户" },
      add: { code: "manager:add", title: "添加用户" },
      update: { code: "manager:update", title: "修改用户" },
      del: { code: "manager:del", title: "删除用户" },
      power: { code: "manager:power", title: "分配角色" }
    },
    role: {
      // 角色管理
      query: { code: "role:query", title: "查询角色" },
      add: { code: "role:add", title: "添加角色" },
      update: { code: "role:update", title: "修改角色" },
      del: { code: "role:del", title: "删除角色" },
      power: { code: "role:power", title: "分配菜单及权限" }
    },
    menu: {
      // 菜单管理
      query: { code: "menu:query", title: "查询菜单" },
      add: { code: "menu:add", title: "添加菜单" },
      update: { code: "menu:update", title: "修改菜单" },
      del: { code: "menu:del", title: "删除菜单" }
    },
    jurisdiction: {
      // 权限管理
      query: { code: "jurisdiction:query", title: "查询权限" },
      add: { code: "jurisdiction:add", title: "添加权限" },
      update: { code: "jurisdiction:update", title: "修改权限" },
      del: { code: "jurisdiction:del", title: "删除权限" }
    },
    organization: {
      // 组织机构管理
      query: { code: "organization:query", title: "查询机构" },
      add: { code: "organization:add", title: "添加机构" },
      update: { code: "organization:update", title: "修改机构" },
      del: { code: "organization:del", title: "删除机构" }
    }
  },
  log: {
    // 日志中心
    signin: {
      // 用户登录日志
      query: { code: "signin:query", title: "查询权限" }
    }
  }
};

// 所有的路由
const url = [
  {
    name: "系统管理",
    path: "system",
    children: [
      { name: "管理员信息管理", path: "manager" },
      { name: "角色管理", path: "role" },
      { name: "权限管理", path: "jurisdiction" },
      { name: "菜单管理", path: "menu" },
      { name: "app版本管理", path: "version" },
      { name: "组织机构管理", path: "organization" }
    ]
  },
  {
    name: "商城管理",
    path: "shop",
    children: [
      {
        name: "产品管理",
        path: "product",
        children: [
          { name: "产品列表", path: "list" },
          { name: "产品分类", path: "category" }
        ]
      },
      {
        name: "订单管理",
        path: "order",
        children: [
          { name: "订单列表", path: "list" },
          { name: "订单数据管理", path: "orderdata" }
        ]
      }
    ]
  },
  {
    name: "设备中心",
    path: "device",
    children: [
      { name: "设备类型管理", path: "type" },
      { name: "设备信息管理", path: "info" },
      { name: "设备数据管理", path: "data" },
      { name: "设备状态管理", path: "state" },
      { name: "固件管理", path: "firmanage" },
      { name: "固件升级", path: "firupdate" },
      { name: "升级历史", path: "history" }
    ]
  },
  {
    name: "用户中心",
    path: "user",
    children: [
      { name: "用户类型管理", path: "type" },
      { name: "用户设备信息管理", path: "devinfo" },
      { name: "用户亲友、售后、经销商、服务站查询", path: "query" },
      { name: "用户PK管理", path: "pk" },
      { name: "授权管理", path: "auth" },
      { name: "B端客户信息管理", path: "clientb" },
      { name: "C端客户信息管理", path: "clientc" }
    ]
  },
  {
    name: "健康评估",
    path: "health",
    children: [
      { name: "睡眠质量评估记录", path: "sleep" },
      { name: "亚健康评估记录", path: "sub" },
      { name: "日报管理", path: "daily" },
      { name: "周报管理", path: "weekly" },
      { name: "月报管理", path: "monthly" }
    ]
  },
  {
    name: "数据统计",
    path: "data",
    children: [
      { name: "新客户统计", path: "newcustomer" },
      { name: "新注册用户统计", path: "newregister" },
      { name: "活跃用户统计", path: "active" },
      { name: "功能点击率", path: "funcrate" },
      { name: "体检中心预约统计", path: "order" },
      { name: "广告点击率统计", path: "adrate" },
      { name: "设备统计", path: "facility" }
    ]
  },
  {
    name: "运营中心",
    path: "operate",
    children: [
      { name: "首页产品管理", path: "homeprod" },
      { name: "广告管理", path: "ad" },
      { name: "文章管理", path: "article" },
      { name: "文章类型管理", path: "articletype" },
      { name: "调查问卷", path: "quest" },
      { name: "消息推送管理", path: "newpush" },
      { name: "用户反馈管理", path: "feedback" }
    ]
  },
  {
    name: "体检中心",
    path: "physical",
    children: [
      { name: "预约查询", path: "bespeak" },
      { name: "体检中心管理", path: "coreadmin" },
      { name: "体检套餐", path: "package" },
      { name: "体检档案查询", path: "archives" }
    ]
  },
  {
    name: "日志中心",
    path: "log",
    children: [
      { name: "用户登录日志", path: "signin" },
      { name: "预警日志", path: "warning" },
      { name: "管理员操作日志", path: "adminopera" }
    ]
  },
  {
    name: "费用中心",
    path: "cost",
    children: [
      { name: "充值记录", path: "recharge" },
      { name: "欠费记录", path: "arrears" },
      { name: "余额查询", path: "balance" }
    ]
  },
  {
    name: "开放平台",
    path: "open",
    children: [{ name: "开放者信息管理", path: "developer" }]
  },
  {
    name: "积分活动",
    path: "activity",
    children: [
      { name: "积分礼品", path: "gift" },
      { name: "礼品类别", path: "product" },
      { name: "兑换记录", path: "exchange" }
    ]
  }
];
export default url;
