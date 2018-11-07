/**
 * 商城管理模块actions
 * */
import Fetchapi from "../util/fetch-api";
import { message, Modal } from "antd";

// 条件查询产品类型(查询所有)
export function findProductTypeByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productType/list", params)
      .then(msg => {
        dispatch({
          type: "SHOP::findProductTypeByWhere",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 条件查询分配类型
export function findSaleRuleByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/saleRule/list", params)
      .then(msg => {
        dispatch({
          type: "SHOP::findSaleRuleByWhere",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加产品类型
export function addProductType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productType/save", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SHOP::addProductType",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改产品类型
export function updateProductType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productType/update", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SHOP::updateProductType",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除产品类型
export function deleteProductType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productType/delete", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SHOP::deleteProductType",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 产品类型标签
export function findProductLabel(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productType/productTag", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//产品活动方式
export function findActivityType(params = {}) {
  return dispatch =>{
    return Fetchapi.newPost("/manager/dictionary/listByDicType?dicType=activityType",params)
      .then(msg =>{
        return msg;
      })
      .catch(()=>{
        message.error("网络错误，请重试")
      })
  }
}

// 删除产品类型
export function hasRecommendProductType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/hasRecommend", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SHOP::deleteProductType",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询产品型号
export function findProductModelByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productModel/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询体检卡型号
export function findticketModelByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productModel/listByTypeId", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 启用/禁用体检卡
export function updateTicketStatus(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/updateStatus", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//体检统计列表
export function StatisticsList (params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/examination/count", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加新产品型号
export function addProductModel(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/productModel/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改产品型号
export function upProductModel(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/productModel/update",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除产品型号
export function delProductModel(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/productModel/delete",
      params,
      "post",
      true
    )
      .then(msg => {
        dispatch({
          type: "SHOP::delProductModel",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 查询产品列表
export function findProductByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加新产品
export function addProduct(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/save", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SHOP::addProduct",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改产品
export function updateProduct(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 上架或下架产品
export function deleteProduct(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/delete", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}
//删除产品
export function removeProduct(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/remove", params, "post", true)
      .then(msg => {
        dispatch({
          type: "SHOP::removeProduct",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//添加服务站地区
export function addStationList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//删除上线服务站信息
export function deleteStation(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/station/delete/online",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 条件查询订单
export function findOrderByWhere(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/order/list", params)
      .then(msg => {
        dispatch({
          type: "SHOP::findOrderByWhere",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查看体检卡
export function CheckupCard(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/hraTicketListByOrderId",params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//修改订单产品型号
export function updateType(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/productListByTypeCode",params)
      .then(msg => {
        dispatch({
          type: "SHOP::updateOrder",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      })
  }
}

//确定修改订单产品型号
export function updateOrderModel(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/order/updateOrderModel", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//确定修改订单收货人地址
export function updateGoods(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/order/updateOrderAddress", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改订单状态
export function updateOrder(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/order/update", params)
      .then(msg => {
        dispatch({
          type: "SHOP::updateOrder",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//获取所有的省
export function findAllProvince(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/area/findAllProvince", params)
      .then(msg => {
        if (msg.status === "0") {
          dispatch({
            type: "SYS::findAllProvince",
            payload: msg.data
          });
        }
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

export function findCityOrCounty(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/area/findCityOrCounty", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除商品的图片
export function deleteImage(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/product/deleteImage", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 条件查询体检列表
export function findReserveList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/allotList", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加预约体检
export function addReserveList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/reserve/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改预约体检
export function upReserveList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/reserve/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//产品上线列表查询
export function findProductLine(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/query/online", params)
      .then(msg => {
        dispatch({
          type: "SHOP::findProductLine",
          payload: msg
        });
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//服务站上线添加
export function addProductLine(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/add/online", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//服务站上线修改
export function editProductLine(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/station/edit/online",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//分配体检卡添加
export function addticket(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/allot", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//修改F卡的有效期和使用次数(总部才有)
export function alertTicket(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ticket/alertTicket", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询 资金流向-经营收益
export function addMoneyFlow(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/capital/earnedIncome/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//导出 资金流向-经营收益
export function exportMoneyFlow(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/capital/earnedIncome/export", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询 资金流向-服务收益
export function ServiceFlow(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/capital/serveIncome/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询 健康食品/生物理疗收益
export function fBIncome(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/capital/genericIncome/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

export function onChange2(date, dateString) {
  console.log(date, dateString);
}

//产品上线下线切换
export function updateProductLine(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/update/online", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//服务站信息管理列表查询
export function ContractList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//服务站承包上线 / 承包人信息修改
export function updateContract(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/contract/up  ", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//服务站承包下线
export function downContract(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/contract/down", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//承包信息编辑
export function updateStation(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/edit  ", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询经营结算规则列表
export function MoneyList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/saleRule/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//添加经营结算规则
export function addMoneyList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/saleRule/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//修改经营结算规则
export function updateMoneyList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/saleRule/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询服务结算规则列表
export function ServiceList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/hraServiceRule/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//修改服务收益结算规则
export function updateServiceList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost(
      "/manager/hraServiceRule/update",
      params,
      "post",
      true
    )
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询资金流向-经营收益列表
export function saleMoneyList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/sale/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//查询广告列表
export function adList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/advert/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//获取所有广告位列表
export function advertPositionList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/advertPosition/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 添加广告
export function advertPosition(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/advert/save", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 修改广告位
export function UpdatePosition(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/advert/update", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// banner图发布撤回
export function UpdateOnline(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/advert/online", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 删除广告位
export function deletePosition(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/advert/delete", params, "post", true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//获取所有活动列表
export function ActivityList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/activity/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//添加新活动
export function NewActivityList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/activity/save", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//修改新活动
export function upDateActivityList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/activity/update", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//删除活动
export function deleteActivity(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/activity/delete", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//发布/撤回活动
export function upDateOnlineList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/activity/outOff", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//清除活动中已下架的推荐产品
export function activityList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/activity/remove", params,)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 购买权限管理列表
export function buyPower(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/bp/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 提现对账列表
export function cashRecord(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/cashRecord/list/record", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 订单对账列表
export function statementList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/order/reconciliation", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

// 订单退款管理列表
export function refundList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/order/refundList", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("网络错误，请重试");
      });
  };
}

//退款审核列表
export function refundAudit(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/refund/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//退款审核通过、审核不通过
export function refundAuditEgis(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/refund/recallRefund", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//退款审核操作日志
export function AuditLog(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/auditLog/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//提现审核列表
export function WithdrawalsAudit(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/cashRecord/list/review", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//提现明细列表
export function RecordDetail(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/cashRecord/list/record/detail", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//提现操作日志
export function WithdrawLog(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/cashRecord/withdraw/operate/log", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
    });
  };
}

//提现审核通过、审核不通过
export function WithdrawalsAuditEgis(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/cashRecord/cash/audit", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//提现审核撤回
export function WithdrawalsRevoke(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/cashRecord/cash/revoke", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

// 用户数据统计页面获取数据
export function findUserInfoCount(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/userInfo/userStatistics", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//栏目列表
export function findColumnCount(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/column/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//栏目列表 - 添加数据
export function addColumnCount(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/column/add", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//栏目列表 - 修改栏目数据
export function updateColumnCount(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/column/update", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//活动产品列表
export function ActivityProductL(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/ActivityProduct/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//栏目列表 - 删除数据
export function deleteColumnCount(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/station/column/delete", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//营销管理 -- 兑换码列表
export function hraExchange(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/hraExchange/list", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//兑换码列表 -- 添加兑换码
export function hraExchangeSave(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/hraExchange/save", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}
//兑换码列表 -- 设置修改确定
export function upExchangeSave(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dictionary/update", params,'post',true)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//兑换码列表 -- 端
export function PortFromSave(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dictionary/listByDicType?dicType=side", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//兑换码列表 -- 渠道
export function ChannelFromSave(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dictionary/listByDicType?dicType=channel", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//兑换码列表 -- 兑换限制
export function exchangeSave(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/dictionary/listByDicType?dicType=exchange", params)
      .then(msg => {
        return msg;
      })
      .catch(() => {
        message.error("请求出现网络错误，请重试");
      });
  };
}

//导出的请求--汇总对账
export function AllExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/reconciliation/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//导出的请求--净水服务
export function WaterExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/water/reconciliation/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//导出的请求--健康食品
export function FoodExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/food/reconciliation/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//导出的请求--生物科技
export function BiologicalExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/biological/reconciliation/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//导出的请求--优惠卡
export function CordExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/m/ticket/reconciliation/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//导出的请求--健康评估
export function HealthyExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/ticket/reconciliation/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//导出的请求--退款记录导出
export function RefundExportList(params = {}) {
  return dispatch => {
    return Fetchapi.newPost("/manager/export/refund/record", params, 'post',false,false)
    .then(msg => {
      return msg;
    })
  };
}

//订单列表跳转订单详情所带参数
export function OrderListDetail(v) {
  return {
    type:"Orderdetail::OrderListDetail",
    payload:v
  };
}


//计费方式的选择
export function onChange3(feeType) {
  console.log("checked = ", feeType);
}

export function onChange(value, dateString) {
  console.log("Selected Time: ", value);
  console.log("Formatted Selected Time: ", dateString);
}

export function onChange4(date, dateString) {
  console.log(date, dateString);
}

export function onOk(value) {
  console.log("onOk: ", value);
}
//多选框 - 单选框
export function onChangeCheck(e) {
  console.log(`checked = ${e.target.checked}`);
}

// export function warning() {
//     Modal.warning({
//         title: '提示',
//         content: '导出功能尚在开发 敬请期待',
//     });
// }
