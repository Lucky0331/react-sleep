// ============================================
// ============================================
// 系统管理模块reducer

const initState = {
  allMenu: [], // 所有的菜单
  allRoles: [], // 所有的角色
  allOrganizer: [], // 所有的组织机构
  citys: [], // 保存省市区，cascader有用
  test: {},
  detail:{},
  detail2:{},
  cardlist:{},
  orderdetail:{},//订单列表详情
};

// ============================================
// action handling function

const actDefault = state => state;

const findAllMenu = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    allMenu: payload.data ? payload.data.result : []
  });
};

const findAllRole = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    allRoles: payload
  });
};

const findAllOrganizer = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    allOrganizer: payload
  });
};

const findAllProvince = (state, action) => {
  const { payload } = action;
  console.log("reducer:", payload);
  return Object.assign({}, state, {
    citys: payload
  });
};

const saveTest = (state, action) => {
  const { payload } = action;
  console.log("传的是个什么：", payload);
  return Object.assign({}, state, {
    test: payload
  });
};

const detailRecord = (state, action) => {
  const { payload } = action;
  console.log("跳转到详情传的是什么：", payload);
  return Object.assign({}, state, {
    detail: payload
  });
};


const userinfoRecord = (state, action) => {
  const { payload } = action;
  console.log("跳转到详情传的是什么：", payload);
  return Object.assign({}, state, {
    detail2: payload
  });
};

const OrderListDetail = (state, action) => {
  const { payload } = action;
  console.log("跳转到订单详情传的是什么：", payload);
  return Object.assign({}, state, {
    orderdetail: payload
  });
};

const recordCard = (state,action) => {
  const { payload } = action;
  console.log("优惠卡参数：", payload);
  return Object.assign({}, state, {
    cardlist: payload
  });
}

// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
    case "SYS::findAllMenu": // 各模块下子路由改变时，保存路由状态
      return findAllMenu(state, action);
    case "SYS::findAllRole":
      return findAllRole(state, action);
    case "SYS::findAllOrganizer": // 查询所有的组织部门
      return findAllOrganizer(state, action);
    case "SYS::findAllProvince": // 保存所有的省市区
      return findAllProvince(state, action);
    case "TEST::saveTest": //结算详情 页面跳转传参
      return saveTest(state, action);
    case "Detail::detailRecord": //经销商信息 页面跳转查看详情
      return detailRecord(state, action);
    case "Detail2::userinfoRecord": //用户信息 页面跳转查看详情
      return userinfoRecord(state, action);
    case "Orderdetail::OrderListDetail": //订单列表 页面跳转订单详情
      return OrderListDetail(state, action);
    case "CardList::recordCard": //经销商id - 优惠卡信息
      return recordCard(state,action);
    default:
      return actDefault(state, action);
  }
};

export default reducerFn;
