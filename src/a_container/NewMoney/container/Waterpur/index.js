/* List 资金管理/资金流向/经营收益 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  Icon,
  Input,
  DatePicker,
  Table,
  message,
  InputNumber,
  Modal,
  Radio,
  Tooltip,
  Select,
  Cascader,
  Tabs,
  Divider,
  Popover
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import moment from "moment";
import { power } from "../../../../util/data";
import _ from "lodash";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  findAllProvince,
  findCityOrCounty,
  findSaleRuleByWhere,
  findProductTypeByWhere,
  findProductModelByWhere,
  fBIncome,
  ServiceFlow
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "top",
      data: [], // 当前页面全部数据 - 净水服务
      data2: [], // 当前页面全部数据 - 健康食品
      data3: [], // 当前页面全部数据 - 生物科技
      data4: [], // 当前页面全部数据 - 健康评估经营
      data5: [], // 当前页面全部数据 - 健康评估服务
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchName: "", // 搜索 - 名称
      searchOrderId: "", // 搜索 - 子订单号
      searchUserId: "", // 搜索 - 用户id
      searchUserType: "", //搜索 - 用户类型
      searchHraCardId: "", //搜索 - 体检卡号
      searchSerialNumber: "", // 搜索 - 流水号
      searchDistributorAccount: "", // 搜索 - 经销商账户
      searchDistributorName: "", // 搜索 - 经销商姓名
      searchDistributorId: "", // 搜索 -经销商id
      searchMinPayTime: "", //搜索 - 最小支付时间
      searchMaxPayTime: "", //搜索 - 最大支付时间
      searchPayMonth: moment(
        (() => {
          const d = new Date();
          d.setMonth(d.getMonth());
          return d;
        })()
      ), //搜索 - 结算月份
      searchMinOrderFee: "", //搜索 - 最小金额
      searchMaxOrderFee: "", //搜索 - 最大金额
      searchMainOrderId:"",//搜索 - 主订单号
      searchAddress: [], // 搜索 - 地址
      searchRefer: "", // 搜索 - 云平台工单号
      searchActivity: "", //搜索 - 活动方式
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示 - 净水服务
      queryModalShowFood: false, // 查看详情模态框是否显示 - 健康食品
      queryModalShowBiology: false, // 查看详情模态框是否显示 - 生物科技
      queryModalShowFlow: false, // 查看详情模态框是否显示 - 健康评估经营
      queryModalShowService: false, // 查看详情模态框是否显示 - 健康评估服务
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 净水服务 - 总共多少条数据
      total2: 0, // 健康食品 - 总共多少条数据
      total3: 0, // 生物科技 - 总共多少条数据
      total4: 0, // 健康评估经营 - 总共多少条数据
      total5: 0, // 健康评估服务 - 总共多少条数据
      citys: [], // 符合Cascader组件的城市数据
      tabKey:1,//tab页默认值
    };
  }

  componentDidMount() {
    if (!this.props.citys.length) {
      // 获取所有省，全局缓存
      this.getAllCity0();
    } else {
      this.setState({
        citys: this.props.citys.map((item, index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
    this.getAllProductType(); // 获取所有的产品类型
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  componentWillReceiveProps(nextP) {
    if (nextP.citys !== this.props.citys) {
      this.setState({
        citys: nextP.citys.map((item, index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
  }

  // 工具 - 订单状态
  getConditionNameById(id) {
    switch (String(id)) {
      case 0: return "待付款";
      case 1: return "未受理";
      case 2: return "待发货";
      case 3: return "待收货";
      case 4: return "已完成";
      case -1: return "审核中";
      case -2: return "未通过";
      case -3: return "已取消";
      case -4: return "已关闭";
      default: return "";
    }
  }

  // 工具 - 订单来源
  getListByModelId(id) {
    switch (String(id)) {
      case "1": return "终端App";
      case "2": return "微信公众号";
      case "3": return "经销商App";
      default : return "";
    }
  }

  // 工具 - 根据ID获取支付方式
  getBypayType(id) {
    switch (String(id)) {
      case "1": return "微信支付";
      case "2": return "支付宝支付";
      case "3": return "银联支付";
      default : return "";
    }
  }

  // 工具 - 根据ID获取用户类型
  getUserType(id) {
    switch (String(id)) {
      case "0": return "经销商（体验版）";
      case "1": return "经销商（微创版）";
      case "2": return "经销商（个人版）";
      case "3": return "分享用户";
      case "4": return "普通用户";
      case "5": return "企业版经销商";
      case "6": return "企业版子账号";
      case "7": return "分销商";
      default : return "";
    }
  }

  // 查询当前页面所需经营收益列表数据 - 净水服务
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productType: 1,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//订单号
      userId: this.state.searchUserId,
      userType: this.state.searchUserType,
      serialNumber: this.state.searchSerialNumber.trim(),
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      refer: this.state.searchRefer.trim(),
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    this.props.actions.fBIncome(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else if(res.status === "1") {
        this.setState({
          data:[],
        })
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }
  
  // 查询当前页面所需经营收益列表数据 - 健康食品
  onGetDataFood(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productType: 2,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//子订单号
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      userId: this.state.searchUserId,
      serialNumber: this.state.searchSerialNumber.trim(),
      distributionType: this.state.searchDistributionType,
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      userType: this.state.searchUserType,
      activityType: this.state.searchActivity,
      refer: this.state.searchRefer.trim(),
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    this.props.actions.fBIncome(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data.result || [],
          pageNum,
          pageSize,
          total2: res.data.total
        });
      } else if(res.status === "1") {
        this.setState({
          data2:[],
        })
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }
  
  // 查询当前页面所需经营收益列表数据 - 生物科技
  onGetDataBiology(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productType: 3,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//子订单号
      userId: this.state.searchUserId,
      userType: this.state.searchUserType,
      serialNumber: this.state.searchSerialNumber.trim(), //流水号
      distributionType: this.state.searchDistributionType,
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      refer: this.state.searchRefer.trim(),
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    this.props.actions.fBIncome(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data3: res.data.result || [],
          pageNum,
          pageSize,
          total3: res.data.total
        });
      } else if(res.status === "1") {
        this.setState({
          data3:[],
        })
        message.warning(res.message || "获取数据失败，请重试", 1.5);
      }
    });
  }
  
  // 查询当前页面所需经营收益列表数据
  onGetDataFlow(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productType: 5,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//子订单号
      userId: this.state.searchUserId,
      userType: this.state.searchUserType,
      serialNumber: this.state.searchSerialNumber.trim(),
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      refer: this.state.searchRefer
    };
    this.props.actions.fBIncome(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data4: res.data.result || [],
          pageNum,
          pageSize,
          total4: res.data.total
        });
      } else if(res.status === "1") {
        this.setState({
          data4:[],
        })
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }
  
  // 查询当前页面所需服务收益列表数据
  onGetDataService(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productTypeName: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(), // 搜索 - 子订单号
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      userId: this.state.searchUserId, // 搜索 - 用户id
      ticketNo: this.state.searchHraCardId, //搜索 - 体检卡号
      serialNumber: this.state.searchSerialNumber.trim(), //搜索 - 流水号
      distributionType: this.state.searchDistributionType, //搜索 - 分配类型
      userType:this.state.searchUserType,//搜索 - 用户类型
      useMinTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      useMaxTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      refer: this.state.searchRefer.trim(),
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    this.props.actions.ServiceFlow(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data5: res.data.result || [],
          pageNum,
          pageSize,
          total5: res.data.total
        });
      } else{
        this.setState({
          data5:[],
        })
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }

  // 导出 - 净水服务所需列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      // orderType: 1,
      productType: 1,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId,
      userId: this.state.searchUserId,
      userType: this.state.searchUserType,
      serialNumber: this.state.searchSerialNumber.trim(),
      mainOrderId:this.state.searchMainOrderId,//主订单号
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`: "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`: "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`: "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/water/settleAccounts/record`,"post",'净水服务.xls')
  }
  
  // 导出健康食品所需列表数据
  onExportDataFood(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productType: 2,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//子订单号
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      userId: this.state.searchUserId,
      serialNumber: this.state.searchSerialNumber.trim(),
      distributionType: this.state.searchDistributionType,
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      userType: this.state.searchUserType,
      activityType: this.state.searchActivity,
      refer: this.state.searchRefer.trim(),
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/food/settleAccounts/record`,'post','健康食品.xls')
  }
  
  // 导出所需列表数据 - 生物科技
  onExportDataBiology(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      orderType: 3,
      isServiceIncome:false,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//子订单号
      userId: this.state.searchUserId,
      userType: this.state.searchUserType,
      serialNumber: this.state.searchSerialNumber.trim(),
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/biological/settleAccounts/record`,'post','生物科技.xls')
  }
  
  // 导出所需列表数据 - 健康评估经营
  onExportDataFlow(pageNum, pageSize){
    const params = {
      pageNum,
      pageSize,
      productType: 5,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(),//子订单号
      userId: this.state.searchUserId,
      userType: this.state.searchUserType,
      serialNumber: this.state.searchSerialNumber.trim(),
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      minCompleteTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxCompleteTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      distributorAccount: this.state.searchDistributorAccount,
      distributorName: this.state.searchDistributorName,
      distributorId: this.state.searchDistributorId,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      refer: this.state.searchRefer
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/ticket/settleAccounts/record`,'post','健康评估经营.xls')
  }
  
  // 导出所需列表数据 - 健康评估服务
  onExportDataService(pageNum, pageSize){
    const params = {
      pageNum,
      pageSize,
      productTypeName: this.state.searchTypeId,
      orderId: this.state.searchOrderId.trim(), // 搜索 - 子订单号
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      userId: this.state.searchUserId, // 搜索 - 用户id
      ticketNo: this.state.searchHraCardId, //搜索 - 体检卡号
      serialNumber: this.state.searchSerialNumber.trim(), //搜索 - 流水号
      distributionType: this.state.searchDistributionType, //搜索 - 分配类型
      useMinTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      useMaxTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      balanceMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)} 00:00:00`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      activityType: this.state.searchActivity,
      refer: this.state.searchRefer.trim(),
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/m/ticket/settleAccounts/record`,'post', '健康评估服务.xls');
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }

  // 搜索 - 产品类型输入框值改变时触发
  onSearchTypeId(typeId) {
    this.setState({
      searchTypeId: typeId
    });
  }

  //搜索 - 云平台工单号
  searchReferChange(e) {
    this.setState({
      searchRefer: e.target.value
    });
  }

  //搜索 - 用户类型
  searchUserType(v) {
    this.setState({
      searchUserType: v
    });
  }

  // 搜索 - 订单号查询
  searchOrderIdChange(v) {
    this.setState({
      searchOrderId: v.target.value
    });
  }

  //搜索 - 用户id查询
  searchUserIdChange(v) {
    this.setState({
      searchUserId: v.target.value
    });
  }

  //搜索 - 流水号查询
  searchSerialNumberChange(v) {
    this.setState({
      searchSerialNumber: v.target.value
    });
  }

  // 搜索 - 最小支付时间
  searchMinPayTimeChange(v) {
    this.setState({
      searchMinPayTime: v
    });
  }

  // 搜索 - 最大支付时间
  searchMaxPayTimeChange(v) {
    this.setState({
      searchMaxPayTime: v
    });
  }
  
  // 搜索 - 最小使用时间
  searchMinPayTime(v) {
    this.setState({
      searchMinPayTime: v
    });
  }
  
  // 搜索 - 最大使用时间
  searchMaxPayTime(v) {
    this.setState({
      searchMaxPayTime: v
    });
  }

  // 搜索 - 最小金额
  searchMinOrderFeeChange(id) {
    this.setState({
      searchMinOrderFee: id.target.value
    });
  }

  // 搜索 - 最大金额
  searchMaxOrderFeeChange(id) {
    this.setState({
      searchMaxOrderFee: id.target.value
    });
  }
  
  // 搜索 - 主订单号
  searchMainOrderIdChange(id) {
    this.setState({
      searchMainOrderId: id.target.value
    });
  }

  // 搜索 - 结算月份
  searchPayMonthChange(v) {
    this.setState({
      searchPayMonth: v
    });
  }

  // 搜索 - 经销商账户
  searchDistributorAccountChange(v) {
    this.setState({
      searchDistributorAccount: v.target.value
    });
  }

  //搜索 - 经销商姓名
  searchDistributorName(v) {
    this.setState({
      searchDistributorName: v.target.value
    });
  }

  //搜索 - 经销商id
  searchDistributorId(v) {
    this.setState({
      searchDistributorId: v.target.value
    });
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }

  //搜索 - 活动类型
  searchActivityType(v) {
    this.setState({
      searchActivity: v
    });
  }
  
  //搜索 - 体检号查询
  searchHraCardIdChange(v) {
    this.setState({
      searchHraCardId: v.target.value
    });
  }

  // 搜索 - 净水
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  // 搜索 - 健康食品
  onSearchFood() {
    this.onGetDataFood(1, this.state.pageSize);
  }
  
  // 搜索 - 生物科技
  onSearchBiology() {
    this.onGetDataBiology(1, this.state.pageSize);
  }
  
  // 搜索 - 健康评估经营
  onSearchFlow() {
    this.onGetDataFlow(1, this.state.pageSize);
  }
  
  // 搜索 - 健康评估服务
  onSearchService() {
    this.onGetDataService(1, this.state.pageSize);
  }

  //导出 - 净水
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }
  
  //导出  - 健康食品
  onExportFood() {
    this.onExportDataFood(this.state.pageNum, this.state.pageSize);
  }
  
  //导出  - 生物科技
  onExportBiology() {
    this.onExportDataBiology(this.state.pageNum, this.state.pageSize);
  }
  
  //导出  - 健康评估经营
  onExportFlow() {
    this.onExportDataFlow(this.state.pageNum, this.state.pageSize);
  }
  
  //导出  - 健康评估经营
  onExportService() {
    this.onExportDataService(this.state.pageNum, this.state.pageSize);
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchOrderId: ""
    });
  }
  
  emitEmpty0() {
    this.setState({
      searchHraCardId: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchUserId: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchSerialNumber: ""
    });
  }

  emitEmpty3() {
    this.setState({
      searchDistributorName: ""
    });
  }

  emitEmpty4() {
    this.setState({
      searchDistributorAccount: ""
    });
  }

  emitEmpty5() {
    this.setState({
      searchDistributorId: ""
    });
  }

  emitEmpty6() {
    this.setState({
      searchRefer: ""
    });
  }

  emitEmpty8() {
    this.setState({
      searchMinOrderFee: ""
    });
  }

  emitEmpty9() {
    this.setState({
      searchMaxOrderFee: ""
    });
  }
  
  emitEmpty10() {
    this.setState({
      searchMainOrderId: ""
    });
  }

  // 获取所有的产品类型，当前页要用
  getAllProductType() {
    this.props.actions
      .findProductTypeByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productTypes: res.data.result
          });
        }
      });
  }

  // 工具 - 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  //工具 - 根据活动类型id获取活动名称
  getActivity(id) {
    switch (String(id)) {
      case "1": return "普通产品";
      case "2": return "活动产品";
      default: return "";
    }
  }

  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductModelByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productModels: res.data.result
          });
        }
      });
  }

  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }

  // 获取某省下面的市
  getAllCitySon(selectedOptions) {
    console.log("SSS", selectedOptions);
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    this.props.actions
      .findCityOrCounty({
        parentId: selectedOptions[selectedOptions.length - 1].id
      })
      .then(res => {
        if (res.status === "0") {
          targetOption.children = res.data.map((item, index) => {
            return {
              id: item.id,
              value: item.areaName,
              label: item.areaName,
              isLeaf: item.level === 2,
              key: index
            };
          });
        }
        targetOption.loading = false;
        this.setState({
          citys: [...this.state.citys]
        });
      });
  }
  
  //tab页不同 加载项不同
  onSearchJump(e){
    console.log('e是多少，',e)
    if(e == 1){
      this.onGetData(1,this.state.pageSize)
    }else if(e == 2){
      this.onGetDataFood(1,this.state.pageSize)
    }else if(e == 3){
      this.onGetDataBiology(1,this.state.pageSize)
    }else if(e == 4){
      this.onGetDataFlow(1,this.state.pageSize)
    }else{
      this.onGetDataService(1,this.state.pageSize)
    }
    this.setState({
      tabKey:e
    })
  }

  // 工具 - 根据有效期type获取有效期名称
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0": return "长期有效";
      case "1": return `${time}天`;
      case "2": return `${time}月`;
      case "3": return `${time}年`;
      default: return "";
    }
  }

  // 查询数据的详情 - 净水服务
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true,
      queryModalShowFood:false,
      queryModalShowBiology:false,
      queryModalShowFlow:false,
      queryModalShowService:false,
      userType: record.userType
    });
  }
  
  // 查询数据的详情 - 健康食品
  onQueryClickFood(record) {
    this.setState({
      nowData: record,
      queryModalShowFood:true,
      queryModalShow: false,
      queryModalShowBiology:false,
      queryModalShowFlow:false,
      queryModalShowService:false,
      userType: record.userType
    });
  }
  
  // 查询数据的详情 - 生物科技
  onQueryClickBiology(record) {
    this.setState({
      nowData: record,
      queryModalShowBiology:true,
      queryModalShow: false,
      queryModalShowFood:false,
      queryModalShowFlow:false,
      queryModalShowService:false,
      userType: record.userType
    });
  }
  
  // 查询数据的详情 - 健康评估经营
  onQueryClickFlow(record) {
    this.setState({
      nowData: record,
      queryModalShowFlow:true,
      queryModalShow: false,
      queryModalShowFood:false,
      queryModalShowBiology:false,
      queryModalShowService:false,
      userType: record.userType
    });
  }
  
  // 查询数据的详情 - 健康评估经营
  onQueryClickService(record) {
    this.setState({
      nowData: record,
      queryModalShowService:true,
      queryModalShowFlow:false,
      queryModalShow: false,
      queryModalShowFood:false,
      queryModalShowBiology:false,
      userType: record.userType
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false,
      queryModalShowFood:false,
      queryModalShowFlow:false,
      queryModalShowBiology:false,
      queryModalShowService:false,
    });
  }

  // 表单页码改变 - 净水服务
  onTablePageChange(page, pageSize) {
    this.onGetData(page, pageSize);
  }
  
  // 表单页码改变 - 健康食品
  onTablePageChangeFood(page, pageSize) {
    this.onGetDataFood(page, pageSize);
  }
  
  // 表单页码改变 - 生物科技
  onTablePageChangeBiology(page, pageSize) {
    this.onGetDataBiology(page, pageSize);
  }
  
  // 表单页码改变 - 健康评估经营
  onTablePageChangeFlow(page, pageSize) {
    this.onGetDataFlow(page, pageSize);
  }
  
  // 表单页码改变 - 健康评估经营
  onTablePageChangeService(page, pageSize) {
    this.onGetDataService(page, pageSize);
  }

  // 构建净水服务字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "产品类型",
        dataIndex: "productTypeName",
        key: "productTypeName"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getUserType(text)
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "订单总金额",
        dataIndex: "orderTotalFee",
        key: "orderTotalFee"
      },
      {
        title: "可分配金额",
        dataIndex: "undistributedFee",
        key: "undistributedFee"
      },
      {
        title: "流水号",
        dataIndex: "serialNumber",
        key: "serialNumber"
      },
      {
        title: "订单完成时间",
        dataIndex: "orderCompleteTime",
        key: "orderCompleteTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "经销商姓名",
        dataIndex: "distributorName",
        key: "distributorName"
      },
      {
        title: "经销商id",
        dataIndex: "distributorId",
        key: "distributorId"
      },
      {
        title: "经销商账户",
        dataIndex: "distributorAccount",
        key: "distributorAccount"
      },
      {
        title: "服务站地区（安装工）",
        dataIndex: "stationArea",
        key: "stationArea"
      },
      {
        title: "服务站公司名称（安装工）",
        dataIndex: "stationCompanyName",
        key: "stationCompanyName"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "经销商",
        dataIndex: "distributorMoney",
        key: "distributorMoney"
      },
      {
        title: "分销商",
        dataIndex: "userSaleMoney",
        key: "userSaleMoney"
      },
      {
        title: "服务站（安装工）",
        dataIndex: "stationMoney",
        key: "stationMoney"
      },
      {
        title: "总部",
        dataIndex: "supplierMoney",
        key: "supplierMoney"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="详情">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }
  
  // 构建健康食品字段
  makeColumnsFood() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "产品类型",
        dataIndex: "productTypeName",
        key: "productTypeName"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getUserType(text)
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "订单总金额",
        dataIndex: "orderTotalFee",
        key: "orderTotalFee"
      },
      {
        title: "可分配金额",
        dataIndex: "undistributedFee",
        key: "undistributedFee"
      },
      {
        title: "流水号",
        dataIndex: "serialNumber",
        key: "serialNumber"
      },
      {
        title: "订单完成时间",
        dataIndex: "orderCompleteTime",
        key: "orderCompleteTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "经销商姓名",
        dataIndex: "distributorName",
        key: "distributorName"
      },
      {
        title: "经销商id",
        dataIndex: "distributorId",
        key: "distributorId"
      },
      {
        title: "经销商账户",
        dataIndex: "distributorAccount",
        key: "distributorAccount"
      },
      {
        title: "推荐人姓名",
        dataIndex: "recommendName",
        key: "recommendName"
      },
      {
        title: "推荐人账户",
        dataIndex: "recommendAccount",
        key: "recommendAccount"
      },
      {
        title: "服务站地区（推荐人）",
        dataIndex: "stationArea",
        key: "stationArea"
      },
      {
        title: "服务站公司名称（推荐人）",
        dataIndex: "stationCompanyName",
        key: "stationCompanyName"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "经销商",
        dataIndex: "distributorMoney",
        key: "distributorMoney"
      },
      {
        title: "分销商",
        dataIndex: "userSaleMoney",
        key: "userSaleMoney"
      },
      {
        title: "推荐人",
        dataIndex: "recommendMoney",
        key: "recommendMoney"
      },
      {
        title: "推荐人区县级发起人",
        dataIndex: "regionSponsorMoney",
        key: "regionSponsorMoney"
      },
      {
        title: "推荐人区县级站长",
        dataIndex: "stationMasterMoney",
        key: "stationMasterMoney"
      },
      {
        title: "服务站（推荐人）",
        dataIndex: "stationMoney",
        key: "stationMoney"
      },
      {
        title: "推荐人市级发起人",
        dataIndex: "citySponsorMoney",
        key: "citySponsorMoney"
      },
      {
        title: "总部",
        dataIndex: "supplierMoney",
        key: "supplierMoney"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClickFood(record)}
            >
            <Tooltip placement="top" title="详情">
              <Icon type="eye" />
            </Tooltip>
          </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }
  
  // 构建生物科技字段
  makeColumnsBiology(){
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "产品类型",
        dataIndex: "productTypeName",
        key: "productTypeName"
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getUserType(text)
      },
      {
        title: "订单总金额",
        dataIndex: "orderTotalFee",
        key: "orderTotalFee"
      },
      {
        title: "可分配金额",
        dataIndex: "undistributedFee",
        key: "undistributedFee"
      },
      {
        title: "流水号",
        dataIndex: "serialNumber",
        key: "serialNumber"
      },
      {
        title: "订单完成时间",
        dataIndex: "orderCompleteTime",
        key: "orderCompleteTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "经销商名称",
        dataIndex: "distributorName",
        key: "distributorName"
      },
      {
        title: "经销商id",
        dataIndex: "distributorId",
        key: "distributorId"
      },
      {
        title: "经销商账户",
        dataIndex: "distributorAccount",
        key: "distributorAccount"
      },
      {
        title: "推荐人姓名",
        dataIndex: "recommendName",
        key: "recommendName"
      },
      {
        title: "推荐人账户",
        dataIndex: " recommendAccount",
        key: " recommendAccount"
      },
      {
        title: "服务站地区（推荐人）",
        dataIndex: "stationArea",
        key: "stationArea"
      },
      {
        title: "服务站公司名称（推荐人）",
        dataIndex: "stationCompanyName",
        key: "stationCompanyName"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "经销商",
        dataIndex: "distributorMoney",
        key: "distributorMoney"
      },
      {
        title: "分销商",
        dataIndex: "userSaleMoney",
        key: "userSaleMoney"
      },
      {
        title: "推荐人",
        dataIndex: "recommendMoney",
        key: "recommendMoney"
      },
      {
        title: "推荐人区县级发起人",
        dataIndex: "regionSponsorMoney",
        key: "regionSponsorMoney"
      },
      {
        title: "推荐人区县级站长",
        dataIndex: "stationMasterMoney",
        key: "stationMasterMoney"
      },
      {
        title: "服务站（推荐人）",
        dataIndex: "stationMoney",
        key: "stationMoney"
      },
      {
        title: "推荐人市级发起人",
        dataIndex: "citySponsorMoney",
        key: "citySponsorMoney"
      },
      {
        title: "总部",
        dataIndex: "supplierMoney",
        key: "supplierMoney"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClickBiology(record)}
            >
            <Tooltip placement="top" title="详情">
              <Icon type="eye" />
            </Tooltip>
          </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }
  
  // 构建字段 - 健康评估经营
  makeColumnsFlow(){
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "产品类型",
        dataIndex: "productTypeName",
        key: "productTypeName"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getUserType(text)
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "订单总金额",
        dataIndex: "orderTotalFee",
        key: "orderTotalFee"
      },
      {
        title: "可分配金额",
        dataIndex: "undistributedFee",
        key: "undistributedFee"
      },
      {
        title: "流水号",
        dataIndex: "serialNumber",
        key: "serialNumber"
      },
      {
        title: "订单完成时间",
        dataIndex: "orderCompleteTime",
        key: "orderCompleteTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "经销商姓名",
        dataIndex: "distributorName",
        key: "distributorName"
      },
      {
        title: "经销商id",
        dataIndex: "distributorId",
        key: "distributorId"
      },
      {
        title: "经销商账户",
        dataIndex: "distributorAccount",
        key: "distributorAccount"
      },
      {
        title: "服务站地区（经销商）",
        dataIndex: "stationArea",
        key: "stationArea"
      },
      {
        title: "服务站公司名称（经销商）",
        dataIndex: "stationCompanyName",
        key: "stationCompanyName"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "经销商",
        dataIndex: "distributorMoney",
        key: "distributorMoney"
      },
      {
        title: "分销商",
        dataIndex: "userSaleMoney",
        key: "userSaleMoney"
      },
      {
        title: "服务站（经销商）",
        dataIndex: "stationMoney",
        key: "stationMoney"
      },
      {
        title: "总部",
        dataIndex: "supplierMoney",
        key: "supplierMoney"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClickFlow(record)}
            >
            <Tooltip placement="top" title="详情">
              <Icon type="eye" />
            </Tooltip>
          </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }
  
  // 构建服务收益字段
  makeColumnsService(){
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "体检卡号",
        dataIndex: "ticketNo",
        key: "ticketNo"
      },
      {
        title: "子订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getUserType(text)
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "产品类型",
        dataIndex: "productTypeName",
        key: "productTypeName"
      },
      {
        title: "订单总金额",
        dataIndex: "orderTotalFee",
        key: "orderTotalFee"
      },
      {
        title: "可分配金额",
        dataIndex: "distributionFee",
        key: "distributionFee"
      },
      {
        title: "流水号",
        dataIndex: "serialNumber",
        key: "serialNumber"
      },
      {
        title: "使用时间",
        dataIndex: "useTime",
        key: "useTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "服务站地区（体检卡使用）",
        dataIndex: "useArea",
        key: "useArea"
      },
      {
        title: "服务站公司名称（体检卡使用）",
        dataIndex: "usedStationName",
        key: "usedStationName"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "服务站（体检卡使用）",
        dataIndex: "stationIncome",
        key: "stationIncome"
      },
      {
        title: (
          <Divider type="vertical" style={{ height: "40px", width: "2px" }} />
        )
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClickService(record)}
            >
            <Tooltip placement="top" title="详情">
              <Icon type="eye" />
            </Tooltip>
          </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        count: item.count,
        productType: item.productType,
        orderId: item.orderId,//子订单号
        activityType: item.activityType,//活动方式
        serialNumber: item.serialNumber,//流水号
        undistributedFee: item.undistributedFee,//可分配金额
        balanceMonth: item.balanceMonth,//结算月份
        distributorMoney: item.distributorMoney,//经销商收益
        distributorAccount: item.distributorAccount,//经销商账户
        distributorName: item.distributorName,//经销商姓名
        stationArea: item.stationArea,//服务站地区（安装工）
        refer: item.refer,//云平台工单号
        orderCompleteTime: item.orderCompleteTime,//订单完成时间
        supplierMoney: item.supplierMoney,//总部收益
        customerName: item.customerName,//安装工姓名
        distributorId: item.distributorId,//分销商id
        customerPhone: item.customerPhone,//安装工手机号
        userType: item.userType,//用户类型
        orderTotalFee: item.orderTotalFee,//订单总金额
        userId: item.userId,//用户id
        stationMoney: item.stationMoney,//服务站安装工收益
        stationCompanyName: item.stationCompanyName,//服务站公司名称（安装工）
        productTypeName: item.productTypeName,//产品类型
        productName: item.productName,//产品名称
        productModel: item.productModel,//产品型号
        userSaleNickName: item.userSaleNickName,//分销商昵称
        userSaleName: item.userSaleName,//分销商姓名
        orderPayTime: item.orderPayTime,//支付时间
        orderCreateTime: item.orderCreateTime,//下单时间
        userSaleMoney: item.userSaleMoney,//分销商收益
        userSaleId: item.userSaleId,//分销商id
        orderFrom: item.orderFrom,//订单来源
        orderProductCount: item.orderProductCount,//数量
        userReceiveAddress: item.userReceiveAddress,//用户收货地址
        userMobile: item.userMobile,//用户收货手机号
        orderPayType: item.orderPayType,//支付方式
        distributorType: item.distributorType,//经销商身份
        mainOrderId:item.mainOrderId,//主订单号
        recommendMoney:item.recommendMoney,//推荐人收益
        recommendName: item.recommendName,//推荐人姓名
        recommendAccount: item.recommendAccount,//推荐人账户
        regionSponsorMoney:item.regionSponsorMoney,//推荐人区县级发起人
        regionSponsorName: item.regionSponsorName,//推荐人区县级发起人姓名
        regionSponsorPhone:item.regionSponsorPhone,//推荐人区县级发起人账户
        stationMasterMoney:item.stationMasterMoney,//推荐人区县级站长收益
        stationMasterName:item.stationMasterName,//推荐人区县级站长姓名
        stationMasterPhone:item.stationMasterPhone,//推荐人区县级站长账户
        citySponsorMoney:item.citySponsorMoney,//推荐人市级发起人
        ticketNo:item.ticketNo,//体检卡号
        useTime:item.useTime,//使用时间
        useArea:item.useArea,//服务站地区（体检卡使用）
        usedStationName:item.usedStationName,//服务站公司名称（体检卡使用）
        stationIncome:item.stationIncome,//服务站（体检卡使用）
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
      };
    });
  }

  render() {
    const me = this;
    const { mode } = this.state;
    const { form } = me.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 9 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 }
      }
    };

    const modelId = form.getFieldValue("addnewTypeCode");

    const { searchOrderId } = this.state;
    const { searchHraCardId } = this.state;
    const { searchUserId } = this.state;
    const { searchSerialNumber } = this.state;
    const { searchDistributorName } = this.state;
    const { searchDistributorAccount } = this.state;
    const { searchDistributorId } = this.state;
    const { searchRefer } = this.state;
    const { searchMinOrderFee } = this.state;
    const { searchMaxOrderFee } = this.state;
    const { searchMainOrderId } = this.state;
    const suffix = searchOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix1 = searchHraCardId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty0()} />
    ) : null;
    const suffix2 = searchUserId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix3 = searchSerialNumber ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;
    const suffix4 = searchDistributorName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    const suffix5 = searchDistributorAccount ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty4()} />
    ) : null;
    const suffix6 = searchDistributorId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty5()} />
    ) : null;
    const suffix7 = searchRefer ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty6()} />
    ) : null;
    const suffix8 = searchMinOrderFee ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty8()} />
    ) : null;
    const suffix9 = searchMaxOrderFee ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty9()} />
    ) : null;
    const suffix10 = searchMainOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty10()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <Tabs type="card" onChange={(e) => this.onSearchJump(e)}>
            <TabPane tab="净水服务" key="1">
              <div>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix10}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>子订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix}
                        value={searchOrderId}
                        onChange={e => this.searchOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>云平台工单号</span>
                      <Input
                        style={{ width: "172px", marginLeft: "6px" }}
                        suffix={suffix7}
                        value={searchRefer}
                        onChange={e => this.searchReferChange(e)}
                      />
                    </li>
                    <li>
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserId}
                        onChange={e => this.searchUserIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "172px", marginLeft: "8px" }}
                        suffix={suffix3}
                        value={searchSerialNumber}
                        onChange={e => this.searchSerialNumberChange(e)}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "8px" }}>结算月份</span>
                      <MonthPicker
                        onChange={e => this.searchPayMonthChange(e)}
                        placeholder="选择月份"
                        value={this.state.searchPayMonth}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "6px" }}>服务站地区</span>
                      <Cascader
                        placeholder="请选择服务区域"
                        style={{ width: "172px" }}
                        onChange={v => this.onSearchAddress(v)}
                        options={this.state.citys}
                        loadData={e => this.getAllCitySon(e)}
                        changeOnSelect
                      />
                    </li>
                    <li>
                      <span>订单金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinOrderFeeChange(v)}
                        value={searchMinOrderFee}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxOrderFeeChange(e)}
                        value={searchMaxOrderFee}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span>用户类型</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserType(e)}
                      >
                        <Option value={0}>经销商（体验版）</Option>
                        <Option value={1}>经销商（微创版）</Option>
                        <Option value={2}>经销商（个人版）</Option>
                        <Option value={3}>分享用户</Option>
                        <Option value={4}>普通用户</Option>
                        <Option value={5}>企业版经销商</Option>
                        <Option value={6}>企业版子账号</Option>
                        <Option value={7}>分销商</Option>
                      </Select>
                    </li>
                    <li>
                      <span>经销商id查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix6}
                        value={searchDistributorId}
                        onChange={e => this.searchDistributorId(e)}
                      />
                    </li>
                    <li>
                      <span>经销商姓名查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix4}
                        value={searchDistributorName}
                        onChange={e => this.searchDistributorName(e)}
                      />
                    </li>
                    <li>
                      <span>经销商账户查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix5}
                        value={searchDistributorAccount}
                        onChange={e => this.searchDistributorAccountChange(e)}
                      />
                    </li>
                    <li>
                      <span>活动方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchActivityType(e)}
                      >
                        <Option value={1}>普通商品</Option>
                        <Option value={2}>活动商品</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>订单完成时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="开始时间"
                        onChange={e => this.searchMinPayTimeChange(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchMaxPayTimeChange(e)}
                      />
                    </li>
                    <li style={{ marginLeft: "30px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearch()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExport()}
                      >
                        导出
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumns()}
                    className="my-table"
                    scroll={{ x: 4000 }}
                    dataSource={this.makeData(this.state.data)}
                    pagination={{
                      total: this.state.total,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChange(page, pageSize)
                    }}
                  />
                </div>
                {/* 查看净水服务详情模态框 */}
                <Modal
                  title="查看详情"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                >
                  <Form>
                    <FormItem label="主订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                    </FormItem>
                    <FormItem label="子订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderId : ""}
                    </FormItem>
                    <FormItem label="云平台工单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.refer : ""}
                    </FormItem>
                    <FormItem label="订单来源" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getListByModelId(this.state.nowData.orderFrom)
                        : ""}
                    </FormItem>
                    <FormItem label="用户id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userId : ""}
                    </FormItem>
                    <FormItem label="用户类型" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.userType)
                        : ""}
                    </FormItem>
                    <FormItem label="数量" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderProductCount : ""}
                    </FormItem>
                    <FormItem label="订单总金额" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderTotalFee : ""}
                    </FormItem>
                    <FormItem label="活动方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getActivity(this.state.nowData.activityType)
                        : ""}
                    </FormItem>
                    <FormItem label="订单完成时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCompleteTime : ""}
                    </FormItem>
                    <FormItem label="流水号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.serialNumber : ""}
                    </FormItem>
                    <FormItem label="支付时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderPayTime : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="产品名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productName : ""}
                    </FormItem>
                    <FormItem label="产品类型" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productTypeName : ""}
                    </FormItem>
                    <FormItem label="产品型号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productModel : ""}
                    </FormItem>
                    <FormItem label="下单时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCreateTime : ""}
                    </FormItem>
                    <FormItem label="支付方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getBypayType(this.state.nowData.orderPayType)
                        : ""}
                    </FormItem>
                    <FormItem label="用户收货地址" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.userReceiveAddress
                        : ""}
                    </FormItem>
                    <FormItem label="用户收货手机号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userMobile : ""}
                    </FormItem>
                    <FormItem label="安装工姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.customerName : ""}
                    </FormItem>
                    <FormItem label="安装工手机号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.customerPhone : ""}
                    </FormItem>
                    <FormItem label="经销商名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                    </FormItem>
                    <FormItem label="经销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorId : ""}
                    </FormItem>
                    <FormItem label="经销商身份" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.distributorType)
                        : ""}
                    </FormItem>
                    <FormItem label="经销商账户" {...formItemLayout}>
                      {!!this.state.nowData? this.state.nowData.distributorAccount: ""}
                    </FormItem>
                    <FormItem label="服务站地区（安装工）" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.stationArea : ""}
                    </FormItem>
                    <FormItem label="服务站公司名称（安装工）" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationCompanyName
                        : ""}
                    </FormItem>
                    <FormItem label="分销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleId : ""}
                    </FormItem>
                    <FormItem label="分销商昵称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleNickName : ""}
                    </FormItem>
                    <FormItem label="分销商姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleName : ""}
                    </FormItem>
                    <FormItem>
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            分配详情
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "120px", textAlign: "center" }}>
                            收益主体身份
                          </td>
                          <td style={{ width: "250px", textAlign: "center" }}>
                            收益主体
                          </td>
                          <td style={{ width: "80px", textAlign: "center" }}>
                            收益金额
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.supplierMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>服务站（安装工）</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationCompanyName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>经销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>分销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleMoney
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
            <TabPane tab="健康食品" key="2">
              <div style={{ width: "100%" }}>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix10}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>子订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix}
                        value={searchOrderId}
                        onChange={e => this.searchOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>云平台工单号</span>
                      <Input
                        style={{ width: "172px", marginLeft: "6px" }}
                        suffix={suffix7}
                        value={searchRefer}
                        onChange={e => this.searchReferChange(e)}
                      />
                    </li>
                    <li>
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserId}
                        onChange={e => this.searchUserIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "172px", marginLeft: "8px" }}
                        suffix={suffix3}
                        value={searchSerialNumber}
                        onChange={e => this.searchSerialNumberChange(e)}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "8px" }}>结算月份</span>
                      <MonthPicker
                        onChange={e => this.searchPayMonthChange(e)}
                        placeholder="选择月份"
                        value={this.state.searchPayMonth}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "6px" }}>服务站地区</span>
                      <Cascader
                        placeholder="请选择服务区域"
                        style={{ width: "172px" }}
                        onChange={v => this.onSearchAddress(v)}
                        options={this.state.citys}
                        loadData={e => this.getAllCitySon(e)}
                        changeOnSelect
                      />
                    </li>
                    <li>
                      <span>订单总金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinOrderFeeChange(v)}
                        value={searchMinOrderFee}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxOrderFeeChange(e)}
                        value={searchMaxOrderFee}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span>用户类型</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserType(e)}
                      >
                        <Option value={0}>经销商（体验版）</Option>
                        <Option value={1}>经销商（微创版）</Option>
                        <Option value={2}>经销商（个人版）</Option>
                        <Option value={3}>分享用户</Option>
                        <Option value={4}>普通用户</Option>
                        <Option value={5}>企业版经销商</Option>
                        <Option value={6}>企业版子账号</Option>
                        <Option value={7}>分销商</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginLeft: "9px" }}>经销商id查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix6}
                        value={searchDistributorId}
                        onChange={e => this.searchDistributorId(e)}
                      />
                    </li>
                    <li>
                      <span>经销商姓名查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix4}
                        value={searchDistributorName}
                        onChange={e => this.searchDistributorName(e)}
                      />
                    </li>
                    <li>
                      <span>经销商账户查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix5}
                        value={searchDistributorAccount}
                        onChange={e => this.searchDistributorAccountChange(e)}
                      />
                    </li>
                    <li>
                      <span>活动方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchActivityType(e)}
                      >
                        <Option value={1}>普通商品</Option>
                        <Option value={2}>活动商品</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>订单完成时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                         );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="开始时间"
                        onChange={e => this.searchMinPayTimeChange(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchMaxPayTimeChange(e)}
                      />
                    </li>
                    <li style={{ marginLeft: "30px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchFood()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExportFood()}
                      >
                        导出
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsFood()}
                    className="my-table"
                    scroll={{ x: 4000 }}
                    dataSource={this.makeData(this.state.data2)}
                    pagination={{
                      total: this.state.total2,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeFood(page, pageSize)
                    }}
                  />
                </div>
                {/* 查看健康食品详情模态框 */}
                <Modal
                  title="查看详情"
                  visible={this.state.queryModalShowFood}
                  onOk={() => this.onQueryModalClose()}
                  onChange={() => this.onQueryClickFood()}
                  onCancel={() => this.onQueryModalClose()}
                  wrapClassName={"list"}
                >
                  <Form>
                    <FormItem label="主订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                    </FormItem>
                    <FormItem label="子订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderId : ""}
                    </FormItem>
                    <FormItem label="云平台工单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.refer : ""}
                    </FormItem>
                    <FormItem label="订单来源" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getListByModelId(this.state.nowData.orderFrom)
                        : ""}
                    </FormItem>
                    <FormItem label="产品名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productName : ""}
                    </FormItem>
                    <FormItem label="产品类型" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productTypeName : ""}
                    </FormItem>
                    <FormItem label="产品型号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productModel : ""}
                    </FormItem>
                    <FormItem label="支付时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderPayTime : ""}
                    </FormItem>
                    <FormItem label="用户类型" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.userType)
                        : ""}
                    </FormItem>
                    <FormItem label="数量" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderProductCount : ""}
                    </FormItem>
                    <FormItem label="订单总金额" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderTotalFee : ""}
                    </FormItem>
                    <FormItem label="活动方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getActivity(this.state.nowData.activityType)
                        : ""}
                    </FormItem>
                    <FormItem label="订单完成时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCompleteTime : ""}
                    </FormItem>
                    <FormItem label="下单时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCreateTime : ""}
                    </FormItem>
                    <FormItem label="支付方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getBypayType(this.state.nowData.orderPayType)
                        : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="流水号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.serialNumber : ""}
                    </FormItem>
                    <FormItem label="用户收货地址" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.userReceiveAddress
                        : ""}
                    </FormItem>
                    <FormItem label="用户收货手机号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userMobile : ""}
                    </FormItem>
                    <FormItem label="经销商名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                    </FormItem>
                    <FormItem label="经销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorId : ""}
                    </FormItem>
                    <FormItem label="经销商身份" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.distributorType)
                        : ""}
                    </FormItem>
                    <FormItem label="经销商账户" {...formItemLayout}>
                      {!!this.state.nowData? this.state.nowData.distributorAccount: ""}
                    </FormItem>
                    <FormItem label="经销商所在服务站名称" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationCompanyName
                        : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="推荐人姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.recommendName : ""}
                    </FormItem>
                    <FormItem label="推荐人账户" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.recommendAccount : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级发起人姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.regionSponsorName : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级发起人账户" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.regionSponsorPhone
                        : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级站长姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.stationMasterName : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级站长账户" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationMasterPhone
                        : ""}
                    </FormItem>
                    <FormItem label="服务站地区（推荐人）" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.stationArea : ""}
                    </FormItem>
                    <FormItem label="服务站公司名称（推荐人）" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationCompanyName
                        : ""}
                    </FormItem>
                    <FormItem label="分销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleId : ""}
                    </FormItem>
                    <FormItem label="分销商昵称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleNickName : ""}
                    </FormItem>
                    <FormItem label="分销商姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleName : ""}
                    </FormItem>
                    <FormItem
                      className={
                        this.state.userType == 1 || this.state.userType == 2 ||
                        this.state.userType == 3 || this.state.userType == 4 ||
                        this.state.userType == 5 || this.state.userType == 7 ||
                        this.state.userType == null ? "show" : ""
                      }
                    >
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            子账户归属关系
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "190px" }}>经销商身份</td>
                          <td style={{ width: "180px" }}>经销商id</td>
                          <td style={{ width: "100px" }}>经销商账户</td>
                        </tr>
                        <tr>
                          <td>企业版主账号</td>
                          <td>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorId
                              : ""}
                          </td>
                          <td>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorAccount
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                    <FormItem>
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            分配详情
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "130px", textAlign: "center" }}>
                            收益主体身份
                          </td>
                          <td style={{ width: "230px", textAlign: "center" }}>
                            收益主体
                          </td>
                          <td style={{ width: "80px", textAlign: "center" }}>
                            收益金额
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.supplierMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>经销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>分销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.recommendName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.recommendMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人区县级发起人</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.regionSponsorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.regionSponsorMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人区县级站长</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMasterName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMasterMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>服务站（推荐人）</td>
                          <td />
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人市级发起人</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.citySponsorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.citySponsorMoney
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
            <TabPane tab="生物科技" key="3">
              <div style={{ width: "100%" }}>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix10}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>子订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix}
                        value={searchOrderId}
                        onChange={e => this.searchOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>云平台工单号</span>
                      <Input
                        style={{ width: "172px", marginLeft: "6px" }}
                        suffix={suffix7}
                        value={searchRefer}
                        onChange={e => this.searchReferChange(e)}
                      />
                    </li>
                    <li>
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserId}
                        onChange={e => this.searchUserIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "172px", marginLeft: "8px" }}
                        suffix={suffix3}
                        value={searchSerialNumber}
                        onChange={e => this.searchSerialNumberChange(e)}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "8px" }}>结算月份</span>
                      <MonthPicker
                        onChange={e => this.searchPayMonthChange(e)}
                        placeholder="选择月份"
                        value={this.state.searchPayMonth}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "6px" }}>服务站地区</span>
                      <Cascader
                        placeholder="请选择服务区域"
                        style={{ width: "172px" }}
                        onChange={v => this.onSearchAddress(v)}
                        options={this.state.citys}
                        loadData={e => this.getAllCitySon(e)}
                        changeOnSelect
                      />
                    </li>
                    <li>
                      <span>订单总金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinOrderFeeChange(v)}
                        value={searchMinOrderFee}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxOrderFeeChange(e)}
                        value={searchMaxOrderFee}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span>用户类型</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserType(e)}
                      >
                        <Option value={0}>经销商（体验版）</Option>
                        <Option value={1}>经销商（微创版）</Option>
                        <Option value={2}>经销商（个人版）</Option>
                        <Option value={3}>分享用户</Option>
                        <Option value={4}>普通用户</Option>
                        <Option value={5}>企业版经销商</Option>
                        <Option value={6}>企业版子账号</Option>
                        <Option value={7}>分销商</Option>
                      </Select>
                    </li>
                    <li>
                      <span>经销商id查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix6}
                        value={searchDistributorId}
                        onChange={e => this.searchDistributorId(e)}
                      />
                    </li>
                    <li>
                      <span>经销商姓名查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix4}
                        value={searchDistributorName}
                        onChange={e => this.searchDistributorName(e)}
                      />
                    </li>
                    <li>
                      <span>经销商账户查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix5}
                        value={searchDistributorAccount}
                        onChange={e => this.searchDistributorAccountChange(e)}
                      />
                    </li>
                    <li>
                      <span>活动方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchActivityType(e)}
                      >
                        <Option value={1}>普通商品</Option>
                        <Option value={2}>活动商品</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>订单完成时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="开始时间"
                        onChange={e => this.searchMinPayTimeChange(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchMaxPayTimeChange(e)}
                      />
                    </li>
                    <li style={{ marginLeft: "30px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchBiology()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExportBiology()}
                      >
                        导出
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsBiology()}
                    className="my-table"
                    scroll={{ x: 4000 }}
                    dataSource={this.makeData(this.state.data3)}
                    pagination={{
                      total: this.state.total3,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeBiology(page, pageSize)
                    }}
                  />
                </div>
                {/* 查看生物科技详情模态框 */}
                <Modal
                  title="查看详情"
                  visible={this.state.queryModalShowBiology}
                  onOk={() => this.onQueryModalClose()}
                  onChange={() => this.onQueryClickBiology()}
                  onCancel={() => this.onQueryModalClose()}
                  wrapClassName={"list"}
                >
                  <Form>
                    <FormItem label="主订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                    </FormItem>
                    <FormItem label="子订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderId : ""}
                    </FormItem>
                    <FormItem label="云平台工单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.refer : ""}
                    </FormItem>
                    <FormItem label="订单来源" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getListByModelId(this.state.nowData.orderFrom)
                        : ""}
                    </FormItem>
                    <FormItem label="产品名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productName : ""}
                    </FormItem>
                    <FormItem label="产品类型" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productTypeName : ""}
                    </FormItem>
                    <FormItem label="产品型号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productModel : ""}
                    </FormItem>
                    <FormItem label="支付时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderPayTime : ""}
                    </FormItem>
                    <FormItem label="用户类型" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.userType)
                        : ""}
                    </FormItem>
                    <FormItem label="数量" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderProductCount : ""}
                    </FormItem>
                    <FormItem label="订单总金额" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderTotalFee : ""}
                    </FormItem>
                    <FormItem label="活动方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getActivity(this.state.nowData.activityType)
                        : ""}
                    </FormItem>
                    <FormItem label="订单完成时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCompleteTime : ""}
                    </FormItem>
                    <FormItem label="下单时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCreateTime : ""}
                    </FormItem>
                    <FormItem label="支付方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getBypayType(this.state.nowData.orderPayType)
                        : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="流水号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.serialNumber : ""}
                    </FormItem>
                    <FormItem label="用户收货地址" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.userReceiveAddress
                        : ""}
                    </FormItem>
                    <FormItem label="用户收货手机号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userMobile : ""}
                    </FormItem>
                    <FormItem label="经销商名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                    </FormItem>
                    <FormItem label="经销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorId : ""}
                    </FormItem>
                    <FormItem label="经销商身份" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.distributorType)
                        : ""}
                    </FormItem>
                    <FormItem label="经销商账户" {...formItemLayout}>
                      {!!this.state.nowData? this.state.nowData.distributorAccount: ""}
                    </FormItem>
                    <FormItem label="经销商所在服务站名称" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationCompanyName
                        : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="推荐人姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.recommendName : ""}
                    </FormItem>
                    <FormItem label="推荐人账户" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.recommendAccount : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级发起人姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.regionSponsorName : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级发起人账户" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.regionSponsorPhone
                        : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级站长姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.stationMasterName : ""}
                    </FormItem>
                    <FormItem label="推荐人区县级站长账户" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationMasterPhone
                        : ""}
                    </FormItem>
                    <FormItem label="服务站地区（推荐人）" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.stationArea : ""}
                    </FormItem>
                    <FormItem label="服务站公司名称（推荐人）" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationCompanyName
                        : ""}
                    </FormItem>
                    <FormItem label="分销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleId : ""}
                    </FormItem>
                    <FormItem label="分销商昵称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleNickName : ""}
                    </FormItem>
                    <FormItem label="分销商姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleName : ""}
                    </FormItem>
                    <FormItem
                      className={
                        this.state.userType == 1 ||
                        this.state.userType == 2 ||
                        this.state.userType == 3 ||
                        this.state.userType == 4 ||
                        this.state.userType == 5 ||
                        this.state.userType == 7 ||
                        this.state.userType == null
                          ? "show"
                          : ""
                      }
                    >
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            子账户归属关系
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "190px" }}>经销商身份</td>
                          <td style={{ width: "180px" }}>经销商id</td>
                          <td style={{ width: "100px" }}>经销商账户</td>
                        </tr>
                        <tr>
                          <td>企业版主账号</td>
                          <td>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorId
                              : ""}
                          </td>
                          <td>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorAccount
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                    <FormItem>
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            分配详情
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "130px", textAlign: "center" }}>
                            收益主体身份
                          </td>
                          <td style={{ width: "230px", textAlign: "center" }}>
                            收益主体
                          </td>
                          <td style={{ width: "80px", textAlign: "center" }}>
                            收益金额
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.supplierMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>经销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>分销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.recommendName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.recommendMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人区县级发起人</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.regionSponsorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.regionSponsorMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人区县级站长</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMasterName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMasterMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>服务站（推荐人）</td>
                          <td />
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>推荐人市级发起人</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.citySponsorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.citySponsorMoney
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
            <TabPane tab="健康评估经营" key="4">
              <div>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix10}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>子订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix}
                        value={searchOrderId}
                        onChange={e => this.searchOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>云平台工单号</span>
                      <Input
                        style={{ width: "172px", marginLeft: "6px" }}
                        suffix={suffix7}
                        value={searchRefer}
                        onChange={e => this.searchReferChange(e)}
                      />
                    </li>
                    <li>
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserId}
                        onChange={e => this.searchUserIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "172px", marginLeft: "8px" }}
                        suffix={suffix3}
                        value={searchSerialNumber}
                        onChange={e => this.searchSerialNumberChange(e)}
                      />
                    </li>
                    <li>
                      <span style={{ marginLeft: "8px" }}>结算月份</span>
                      <MonthPicker
                        onChange={e => this.searchPayMonthChange(e)}
                        style={{ width: "172px" }}
                        placeholder="选择月份"
                        value={this.state.searchPayMonth}
                     />
                    </li>
                    <li>
                      <span>服务站地区</span>
                      <Cascader
                        placeholder="请选择服务区域"
                        style={{ width: "172px" }}
                        onChange={v => this.onSearchAddress(v)}
                        options={this.state.citys}
                        loadData={e => this.getAllCitySon(e)}
                        changeOnSelect
                      />
                    </li>
                    <li>
                      <span>订单总金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinOrderFeeChange(v)}
                        value={searchMinOrderFee}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxOrderFeeChange(e)}
                        value={searchMaxOrderFee}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span>用户类型</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserType(e)}
                      >
                        <Option value={0}>经销商（体验版）</Option>
                        <Option value={1}>经销商（微创版）</Option>
                        <Option value={2}>经销商（个人版）</Option>
                        <Option value={3}>分享用户</Option>
                        <Option value={4}>普通用户</Option>
                        <Option value={5}>企业版经销商</Option>
                        <Option value={6}>企业版子账号</Option>
                        <Option value={7}>分销商</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginLeft: "9px" }}>经销商id查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix6}
                        value={searchDistributorId}
                        onChange={e => this.searchDistributorId(e)}
                      />
                    </li>
                    <li>
                      <span>经销商姓名查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix4}
                        value={searchDistributorName}
                        onChange={e => this.searchDistributorName(e)}
                      />
                    </li>
                    <li>
                      <span>经销商账户查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix5}
                        value={searchDistributorAccount}
                        onChange={e => this.searchDistributorAccountChange(e)}
                      />
                    </li>
                    <li>
                      <span>活动方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchActivityType(e)}
                      >
                        <Option value={1}>普通商品</Option>
                        <Option value={2}>活动商品</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>订单完成时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="开始时间"
                        onChange={e => this.searchMinPayTimeChange(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchMaxPayTimeChange(e)}
                      />
                    </li>
                    <li style={{ marginLeft: "30px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchFlow()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExportFlow()}
                      >
                        导出
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsFlow()}
                    className="my-table"
                    scroll={{ x: 3600 }}
                    dataSource={this.makeData(this.state.data4)}
                    pagination={{
                      total: this.state.total4,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeFlow(page, pageSize)
                    }}
                  />
                </div>
                {/* 查看经营收益详情模态框 */}
                <Modal
                  title="查看健康评估经营详情"
                  visible={this.state.queryModalShowFlow}
                  onOk={() => this.onQueryModalClose()}
                  onChange={() => this.onQueryClickFlow()}
                  onCancel={() => this.onQueryModalClose()}
                  wrapClassName={"list"}
                >
                  <Form>
                    <FormItem label="主订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                    </FormItem>
                    <FormItem label="子订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderId : ""}
                    </FormItem>
                    <FormItem label="云平台工单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.refer : ""}
                    </FormItem>
                    <FormItem label="订单来源" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getListByModelId(this.state.nowData.orderFrom)
                        : ""}
                    </FormItem>
                    <FormItem label="产品名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productName : ""}
                    </FormItem>
                    <FormItem label="产品类型" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productTypeName : ""}
                    </FormItem>
                    <FormItem label="产品型号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productModel : ""}
                    </FormItem>
                    <FormItem label="用户类型" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.userType)
                        : ""}
                    </FormItem>
                    <FormItem label="用户id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userId : ""}
                    </FormItem>
                    <FormItem label="数量" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderProductCount : ""}
                    </FormItem>
                    <FormItem label="订单总金额" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderTotalFee : ""}
                    </FormItem>
                    <FormItem label="活动方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getActivity(this.state.nowData.activityType)
                        : ""}
                    </FormItem>
                    <FormItem label="支付时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCompleteTime : ""}
                    </FormItem>
                    <FormItem label="支付方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getBypayType(this.state.nowData.orderPayType)
                        : ""}
                    </FormItem>
                    <FormItem label="流水号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.serialNumber : ""}
                    </FormItem>
                    <FormItem label="下单时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCreateTime : ""}
                    </FormItem>
                    <FormItem label="经销商姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                    </FormItem>
                    <FormItem label="经销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.distributorId : ""}
                    </FormItem>
                    <FormItem label="经销商身份" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getUserType(this.state.nowData.distributorType)
                        : ""}
                    </FormItem>
                    <FormItem label="经销商账户" {...formItemLayout}>
                      {!!this.state.nowData? this.state.nowData.distributorAccount: ""}
                    </FormItem>
                    <FormItem label="服务站地区（经销商）" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.stationArea : ""}
                    </FormItem>
                    <FormItem label="服务站公司名称（经销商）" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.state.nowData.stationCompanyName
                        : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="订单完成时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderCompleteTime : ""}
                    </FormItem>
                    <FormItem label="分销商id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleId : ""}
                    </FormItem>
                    <FormItem label="分销商昵称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleNickName : ""}
                    </FormItem>
                    <FormItem label="分销商姓名" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userSaleName : ""}
                    </FormItem>
                    <FormItem
                      className={
                        this.state.userType == null ||
                        this.state.userType == 1 ||
                        this.state.userType == 2 ||
                        this.state.userType == 3 ||
                        this.state.userType == 4 ||
                        this.state.userType == 5 ||
                        this.state.userType == 7 ||
                        this.state.userType == 8
                          ? "show"
                          : ""
                      }
                    >
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            子账户归属关系
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "180px" }}>经销商身份</td>
                          <td style={{ width: "160px" }}>经销商id</td>
                          <td style={{ width: "130px" }}>经销商账户</td>
                        </tr>
                        <tr>
                          <td>企业版主账号</td>
                          <td>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorId
                              : ""}
                          </td>
                          <td>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorAccount
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                    <FormItem>
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            分配详情
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "120px", textAlign: "center" }}>
                            收益主体身份
                          </td>
                          <td style={{ width: "240px", textAlign: "center" }}>
                            收益主体
                          </td>
                          <td style={{ width: "100px", textAlign: "center" }}>
                            收益金额
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>总部</td>
                          <td style={{ textAlign: "center" }}>翼猫总部</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.supplierMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>服务站（经销商）</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationCompanyName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.stationMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>经销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.distributorMoney
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>分销商</td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleName
                              : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData
                              ? this.state.nowData.userSaleMoney
                              : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
            <TabPane tab="健康评估服务" key="5">
              <div>
                <div className="system-search">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主订单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix10}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>体检卡号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix1}
                        value={searchHraCardId}
                        onChange={e => this.searchHraCardIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>子订单号查询</span>
                      <Input
                        style={{ width: "165px" }}
                        suffix={suffix}
                        value={searchOrderId}
                        onChange={e => this.searchOrderIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>用户类型</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserType(e)}
                      >
                        <Option value={0}>经销商（体验版）</Option>
                        <Option value={1}>经销商（微创版）</Option>
                        <Option value={2}>经销商（个人版）</Option>
                        <Option value={3}>分享用户</Option>
                        <Option value={4}>普通用户</Option>
                        <Option value={5}>企业版经销商</Option>
                        <Option value={6}>企业版子账号</Option>
                        <Option value={7}>分销商</Option>
                      </Select>
                    </li>
                    <li>
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserId}
                        onChange={e => this.searchUserIdChange(e)}
                      />
                    </li>
                    <li>
                      <span>活动方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchActivityType(e)}
                      >
                        <Option value={1}>普通商品</Option>
                        <Option value={2}>活动商品</Option>
                      </Select>
                    </li>
                    <li>
                      <span>订单总金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinOrderFeeChange(v)}
                        value={searchMinOrderFee}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxOrderFeeChange(e)}
                        value={searchMaxOrderFee}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "166px", marginLeft: "16px" }}
                        suffix={suffix3}
                        value={searchSerialNumber}
                        onChange={e => this.searchSerialNumberChange(e)}
                      />
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>结算月份</span>
                      <MonthPicker
                        onChange={e => this.searchPayMonthChange(e)}
                        placeholder="选择月份"
                        value={this.state.searchPayMonth}
                        style={{ width: "172px" }}
                      />
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>使用时间</span>
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="开始时间"
                        onChange={e => this.searchMinPayTime(e)}
                      />
                      --
                      <DatePicker
                        style={{ width: "130px" }}
                        dateRender={current => {
                          const style = {};
                          if (current.date() === 1) {
                            style.border = "1px solid #1890ff";
                            style.borderRadius = "45%";
                          }
                          return (
                            <div className="ant-calendar-date" style={style}>
                              {current.date()}
                            </div>
                          );
                        }}
                        format="YYYY-MM-DD"
                        placeholder="结束时间"
                        onChange={e => this.searchMaxPayTime(e)}
                      />
                    </li>
                    <li style={{ marginRight: "50px" }}>
                      <span>服务站地区（体检卡使用）</span>
                      <Cascader
                        placeholder="请选择服务区域"
                        style={{ width: "172px" }}
                        onChange={v => this.onSearchAddress(v)}
                        options={this.state.citys}
                        loadData={e => this.getAllCitySon(e)}
                        changeOnSelect
                      />
                    </li>
                    <li style={{ marginLeft: "30px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchService()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li style={{ marginLeft: "10px" }}>
                      <Button icon="download" type="primary" onClick={() => this.onExportService()} >导出</Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsService()}
                    className="my-table"
                    scroll={{ x: 2800 }}
                    dataSource={this.makeData(this.state.data5)}
                    pagination={{
                      total: this.state.total5,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeService(page, pageSize)
                    }}
                  />
                </div>
                {/* 查看服务收益详情模态框 */}
                <Modal
                  title="查看服务收益详情"
                  visible={this.state.queryModalShowService}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                >
                  <Form>
                    <FormItem label="主订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                    </FormItem>
                    <FormItem label="体检卡号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.ticketNo : ""}
                    </FormItem>
                    <FormItem label="子订单号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderId : ""}
                    </FormItem>
                    <FormItem label="订单来源" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getListByModelId(this.state.nowData.orderFrom)
                        : ""}
                    </FormItem>
                    <FormItem label="产品类型" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productTypeName : ""}
                    </FormItem>
                    <FormItem label="产品名称" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productName : ""}
                    </FormItem>
                    <FormItem label="产品型号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productModel : ""}
                    </FormItem>
                    <FormItem label="用户id" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.userId : ""}
                    </FormItem>
                    <FormItem label="数量" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.productCount : ""}
                    </FormItem>
                    <FormItem label="订单总金额" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderTotalFee : ""}
                    </FormItem>
                    <FormItem label="活动方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getActivity(this.state.nowData.activityType)
                        : ""}
                    </FormItem>
                    <FormItem label="流水号" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.serialNumber : ""}
                    </FormItem>
                    <FormItem label="支付方式" {...formItemLayout}>
                      {!!this.state.nowData
                        ? this.getBypayType(this.state.nowData.payType)
                        : ""}
                    </FormItem>
                    <FormItem label="使用时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.useTime : ""}
                    </FormItem>
                    <FormItem label="结算月份" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
                    </FormItem>
                    <FormItem label="下单时间" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.orderTime : ""}
                    </FormItem>
                    <FormItem label="服务站地区（体检卡使用）" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.useArea : ""}
                    </FormItem>
                    <FormItem label="服务站公司名称（体检卡使用）" {...formItemLayout}>
                      {!!this.state.nowData ? this.state.nowData.usedStationName : ""}
                    </FormItem>
                    <FormItem>
                      <div>
                        <tr>
                          <td style={{ fontSize: "20px", fontWeight: "bold" }}>
                            分配详情
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: "144px", textAlign: "center" }}>
                            收益主体身份
                          </td>
                          <td style={{ width: "240px", textAlign: "center" }}>
                            收益主体
                          </td>
                          <td style={{ width: "100px", textAlign: "center" }}>
                            收益金额
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData ? this.state.nowData.useArea : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData ? this.state.nowData.usedStationName : ""}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {!!this.state.nowData ? this.state.nowData.stationIncome : ""}
                          </td>
                        </tr>
                      </div>
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

Category.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  form: P.any,
  citys: P.array // 动态加载的省
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({
    citys: state.sys.citys
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findCityOrCounty,
        findSaleRuleByWhere,
        findAllProvince,
        findProductTypeByWhere,
        findProductModelByWhere,
        fBIncome,
        ServiceFlow
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
