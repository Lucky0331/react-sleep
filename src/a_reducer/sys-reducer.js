// ============================================
// ============================================
// 系统管理模块reducer

const initState = {
  allMenu: [], // 所有的菜单
  allRoles: [],   // 所有的角色
  allOrganizer: [], // 所有的组织机构
    citys: [],  // 保存省市区，cascader有用
    test: {},
};

// ============================================
// action handling function

const actDefault = (state) => state;


const findAllMenu = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    allMenu: payload.messsageBody ? payload.messsageBody.result : [],
  });
};

const findAllRole = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    allRoles: payload,
  });
};

const findAllOrganizer = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
      allOrganizer: payload,
  });
};

const findAllProvince = (state, action) => {
  const { payload } = action;
  console.log('reducer:', payload);
  return Object.assign({}, state, {
      citys: payload,
  });
};

const saveTest = (state, action) => {
    const { payload } = action;
    console.log('传的是个什么：', payload);
    return Object.assign({}, state, {
        test: payload,
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
  case 'SYS::findAllOrganizer': // 查询所有的组织部门
    return findAllOrganizer(state, action);
  case 'SYS::findAllProvince':  // 保存所有的省市区
    return findAllProvince(state, action);
      case 'TEST::saveTest':
        return saveTest(state, action);
  default:
    return actDefault(state, action);
  }
};

export default reducerFn;
