/* 全局通用action */
import Fetchapi from "../util/fetch-api";
import { message } from "antd";

// 测试
export function onTestAdd(num) {
  return {
    type: "TEST::add",
    payload: num + 1
  };
}

// 用户登录
export function onLogin(params) {
  return dispatch => {
    return Fetchapi.newPost("/manager/submitLogin", params, "post", true)
      .then(msg => {
        console.log("axios返回的是：", msg);
        dispatch({
          type: "APP::LOGIN",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 路由切换状态保存
export function saveURL(url) {
  return {
    type: "APP::saveURL",
    payload: url
  };
}

// 保存菜单层级数据，别的地方可随时使用
export function saveMenuSourceData(data) {
  return {
    type: "APP::saveMenuSourceData",
    payload: data
  };
}

// 根据菜单ID查询该菜单下有哪些按钮
export function findButtonsByMenuId(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/buttons/findButtonsByMenuId", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 保存头部当前选中的哪一个
export function saveMenuType(type) {
  console.log("there:", type);
  return {
    type: "APP::saveMenuType",
    payload: type
  };
}
