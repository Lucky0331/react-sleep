/**
 * 各种不知道该放到哪里好的actions
 * */
import Fetchapi from "../util/fetch-api";
import { message } from "antd";

// 分页条件查询结算查询-总部收益查询列表
export function getSupplierIncomeMain(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/capital/supplierAccountIncome/main",
      params
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 分页条件查询结算查询-总部收益详情查询列表
export function getSupplierIncomeList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/capital/supplierAccountIncome/detail",
      params
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 分页条件查询结算查询-服务站收益查询列表
export function getStationIncomeMain(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/capital/stationAccountIncome/main",
      params
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询公司的总收益 以及 订单的总金额
export function searchCompanyIncome(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/capital/companyIncome/main", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//产品公司的多种选择
export function onChange(checkedValues) {
  console.log("checked = ", checkedValues);
}

//产品公司的多种选择
export function saveTest(v) {
  return {
    type: "TEST::saveTest",
    payload: v
  };
}

