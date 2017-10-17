// ============================================
// ============================================
// Import modules

const initState = {
  num: 0,           // 初始值0
  fetchvalue: [],
  systemURL: null, // system 当前子路由选中哪一个
  deviceURL: null, // device 当前子路由选中哪一个
  healthURL: null, // health
  dataURL: null,    // data
};

// ============================================
// action handling function

const actDefault = (state) => state;

const testAdd = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    num: payload,
  });
};


const testFetch = (state, action) => {
  const { payload } = action;
  return Object.assign({}, state, {
    fetchvalue: payload,
  });
};

const saveURL = (state, action) => {
  const { payload } = action;
  const type = payload.split('/');
  let obj = {};
  switch(type[1]){
    case 'system': 
      obj.systemURL = payload;
      break;
    case 'device':
      obj.deviceURL = payload;
      break;
    case 'user':
      obj.userURL = payload;
    case 'health':
      obj.healthURL = payload;
    case 'data':
      obj.dataURL = payload;
      break;
  }
  return Object.assign({}, state, obj);
}
// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
  // 进入主页时，初始化左边box数据
  case 'TEST::add':
    return testAdd(state, action);
  case 'TEST::testFetch':
    return testFetch(state, action);
  case 'APP::saveURL': // 各模块下子路由改变时，保存路由状态
    return saveURL(state, action);
  default:
    return actDefault(state, action);
  }
};

export default reducerFn;
