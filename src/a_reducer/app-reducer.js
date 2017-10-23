// ============================================
// ============================================
// 各模块通用API

const initState = {
  systemURL: null, // system 当前子路由选中哪一个
  deviceURL: null, // device 当前子路由选中哪一个
  healthURL: null, // health
  dataURL: null,    // data
  operateURL: null, // 运营中心
  physicalURL: null, // 体检中心
  logURL: null,   // 日志中心
  costURL: null, // 费用中心
  openURL: null, // 开放平台
  activityURL: null, // 积分活动
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
      break;
    case 'health':
      obj.healthURL = payload;
      break;
    case 'data':
      obj.dataURL = payload;
      break;
    case 'operate':
      obj.operateURL = payload;
      break;
    case 'physical':
      obj.physicalURL = payload;
      break;
    case 'log':
      obj.logURL = payload;
      break;
    case 'cost':
      obj.costURL = payload;
      break;
    case 'open':
      obj.openURL = payload;
      break;
    case 'activity':
      obj.activityURL = payload;
      break;
    default:;
  }
  return Object.assign({}, state, obj);
}
// ============================================
// reducer function

const reducerFn = (state = initState, action) => {
  switch (action.type) {
  case 'APP::saveURL': // 各模块下子路由改变时，保存路由状态
    return saveURL(state, action);
  default:
    return actDefault(state, action);
  }
};

export default reducerFn;
