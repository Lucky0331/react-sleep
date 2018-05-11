import Fetchapi from "../util/fetch-api";
import { message } from "antd";

//体检统计列表
export function StatisticalList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/ticketStatistics", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

export function onOk(value) {
  console.log("onOk: ", value);
}