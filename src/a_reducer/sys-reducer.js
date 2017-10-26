// ============================================
// ============================================
// 系统管理模块reducer

const initState = {
  allMenu: [], // 所有的菜单
  allRoles: [],   // 所有的角色
};

// ============================================
// action handling function

const actDefault = (state) => state;


const findAllMenu = (state, action) => {
  const { payload } = action;
  console.log('所有菜单111reducer：', payload);
  return Object.assign({}, state, {
    allMenu: payload.messsageBody,
  });
};

const findAllRole = (state, action) => {
  console.log('到这里了嘛：', state, action);
  const { payload } = action;
  return Object.assign({}, state, {
    allRoles: payload.messsageBody,
  });
};
// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
  case 'SYS::findAllMenu': // 各模块下子路由改变时，保存路由状态
    return findAllMenu(state, action);
  case 'SYS::findAllRole':
    return findAllRole(state, action);
  default:
    return actDefault(state, action);
  }
};

export default reducerFn;
