/** 体检模块相关接口 **/
import Fetchapi from "../util/fetch-api";
import { message } from "antd";

// 获取体检列表
export function ticketList(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 获取预约列表
export function listReserve(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/listReserve", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 新增体检人信息
export function ticketSave(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改体检人信息
export function ticketUpdate(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}
