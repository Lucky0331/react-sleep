import Fetchapi from "../util/fetch-api";
import { message } from "antd";

//用户信息管理的查询
export function findUserInfo(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/userInfo/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

export function myCustomers(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/userInfo/myCustomers", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//经销商id查询-优惠卡赠送记录
export function CardList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/userInfo/ticketGiveByUserId", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//省级经理列表
export function AreaManagerList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/areaManager/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//添加省级经理
export function AddAreaManagerList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/areaManager/save", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//修改省级经理
export function UpAreaManagerList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/areaManager/update", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//客户留言
export function customerMessage(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/customerMessage/list", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//客户留言-加盟类型
export function listByDicType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dictionary/listByDicType", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//导出的请求--用户信息管理
export function ExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/userInfo/list", params, 'post', false, false)
      .then(msg => {
        console.log('msg是什么',msg)
        return msg;
      })
      .catch((e) => {
        console.log('错误：', e);
        message.error("网络错误，请重试", e);
      });
  };
}

//导出的请求--经销商信息管理
export function ExportdealerList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/userInfo/list", params,'post', false, false)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//导出的请求--经销商信息优惠卡管理
export function ExportCardList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/ticket/list", params,'post', false, false)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//数据统计 -运营查询
export function dataCountList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dataCount/operation", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//数据统计 -用户数据查询
export function userCountList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dataCount/user", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//数据统计 -订单数据查询
export function orderCountList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dataCount/order", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//数据统计 -收益数据查询
export function incomeCountList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dataCount/income", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//经销商信息管理 - 发放优惠卡
export function generateFreeCard(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/generateFreeCard", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//用户信息管理 - 解绑手机号
export function UntiePhone(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/userInfo/unBindPhone", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//经销商信息管理详情跳转页面所带参数
export function detailRecord(v) {
 return {
    type:"Detail::detailRecord",
    payload:v
 };
}

//经销商信息管理详情跳转页面所带参数
export function recordCard(v) {
  return {
    type:"CardList::recordCard",
    payload:v
  };
}

//用户信息管理详情跳转页面所带参数
export function userinfoRecord(v) {
 return {
    type:"Detail2::userinfoRecord",
    payload:v
 };
}
