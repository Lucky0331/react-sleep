// 各模块通用API

const initState = {
  menuSourceData: [], // 所有的已授权菜单层级数据（来自登录时获取）
};

// ============================================
// action handling function

const actDefault = (state) => state;

const saveMenuSourceData = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    menuSourceData: payload,
  });
};


// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
  case 'APP::saveMenuSourceData':
    return saveMenuSourceData(state, action);
  default:
    return actDefault(state, action);
  }
};

export default reducerFn;
