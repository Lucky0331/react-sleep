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

//经销商信息管理详情跳转页面所带参数
export function detailRecord(v) {
    return {
        type:"Detail::detailRecord",
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
