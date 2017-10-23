// ============================================
// ============================================
// 系统管理模块reducer

const initState = {
  allMenu: null, // 所有的菜单
};

// ============================================
// action handling function

const actDefault = (state) => state;


const findAllMenu = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    allMenu: payload,
  });
};

// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
  case 'SYS::findAllMenu': // 各模块下子路由改变时，保存路由状态
    return findAllMenu(state, action);
  default:
    return actDefault(state, action);
  }
};

export default reducerFn;
