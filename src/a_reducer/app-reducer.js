// 各模块通用API

const initState = {
  menuSourceData: [], // 所有的已授权菜单层级数据（来自登录时获取）
  menuType: "sub0" // 当前头部导航选中的哪一个
};

// ============================================
// action handling function

const actDefault = state => state;

const saveMenuSourceData = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    menuSourceData: payload
  });
};

const saveMenuType = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    menuType: payload
  });
};

// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
    case "APP::saveMenuSourceData":
      return saveMenuSourceData(state, action);
    case "APP::saveMenuType":
      return saveMenuType(state, action);
    default:
      return actDefault(state, action);
  }
};

export default reducerFn;
