/* 日志中心action */
import Fetchapi from "../util/fetch-api";
import { message } from "antd";

// 查询所有登录日志
export function findAllLoginLog(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/loginLog/findAllLoginLog", params)
      .then(msg => {
        dispatch({
          type: "LOG::findAllLoginLog",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}
// 根据条件查询登录日志
export function findLoginLogBykeys(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/loginLog/findLoginLogByWhere", params)
      .then(msg => {
        dispatch({
          type: "LOG::findLoginLogBykeys",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}
