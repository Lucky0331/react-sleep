/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  Modal,
  Tooltip,
  Tabs,
  Spin,
  Alert,
  InputNumber,
  Select,
  Divider,
  Cascader,
  DatePicker
} from "antd";
import "./index.scss";
import moment from "moment";
import Config from "../../../../config/config";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  findProductTypeByWhere,
  onChange,
  onOk,
  statementList,
  AllExportList,
  WaterExportList,
  FoodExportList,
  BiologicalExportList,
  CordExportList,
  HealthyExportList
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      data2:[],//净水服务全部数据
      data3:[],//健康食品全部数据
      data4:[],//生物科技全部数据
      data5:[],//优惠卡全部数据
      data6:[],//健康评估全部数据
      productTypes: [], //所有的产品类型
      productModels: [], // 所有的产品型号
      searchProductName: "", // 搜索 - 产品名称
      searchProductType: "", // 搜索 - 产品类型
      searchType:"", //搜索 - 产品型号
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      searchTime: "", // 搜索 - 对账时间
      searchorderFrom: "", //搜索 - 订单来源
      searchName: "", // 搜索 - 状态
      searchPayType: "", //搜索 - 支付类型
      searchTicketNo:'',//搜索 - 体检卡号
      searchmchOrderIdChange: "", // 流水号查询
      searchConditions: "", //搜索 - 订单状态
      searchorderNo: "", //搜索 - 子订单号
      searchMainOrderId:"",//搜索 - 主订单号
      searchRefer: "", //搜索 - 云平台工单号
      searchUserName: "", //搜索 - 用户id
      searchActivity: "", //搜索 - 活动方式
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共数据
      total2: 0, // 净水服务总共数据
      total3:0,//健康食品总共数据
      total4:0,//生物科技总共数据
      total5:0,//优惠卡总共数据
      total6:0,//健康评估总共数据
      citys: [], // 符合Cascader组件的城市数据
      exportLoading: false, // 控制导出状态，导出需要时间加载
    };
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的产品类型
    this.onGetData(this.state.pageNum, this.state.pageSize);  //汇总对账
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

  // 查询当前页面所需列表数据 - 汇总对账
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName.trim(), //用户id
      orderType: this.state.searchProductType, //产品类型
      orderId: this.state.searchorderNo.trim(),  //子订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(), //主订单号查询
      paymentNo: this.state.searchmchOrderIdChange.trim(), //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 净水服务
  onGetData2(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      orderType:1,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName.trim(), //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo.trim(),  //订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(), //主订单号查询
      paymentNo: this.state.searchmchOrderIdChange.trim(), //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data2: res.data.result || [],
          pageNum,
          pageSize,
          total2: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 健康食品
  onGetData3(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      orderType:2,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName.trim(), //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo.trim(),  //订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(), //主订单号查询
      paymentNo: this.state.searchmchOrderIdChange.trim(), //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data3: res.data.result || [],
          pageNum,
          pageSize,
          total3: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 生物科技
  onGetData4(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      orderType:3,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName.trim(), //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo.trim(),  //订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(), //主订单号查询
      paymentNo: this.state.searchmchOrderIdChange.trim(), //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data4: res.data.result || [],
          pageNum,
          pageSize,
          total4: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 优惠卡
  onGetData5(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      orderType:5,
      modelType:'M',
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName.trim(), //用户id
      ticketNo: this.state.searchTicketNo.trim(), //体检卡号
      orderId: this.state.searchorderNo.trim(),  //订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(), //主订单号查询
      paymentNo: this.state.searchmchOrderIdChange.trim(), //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
          ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
          : "",
      maxTime: this.state.searchEndTime
          ? `${tools.dateToStr(this.state.searchEndTime._d)}`
          : "",
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data5: res.data.result || [],
          pageNum,
          pageSize,
          total5: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 健康评估
  onGetData6(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      orderType:5,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName.trim(), //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo.trim(),  //订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(), //主订单号查询
      paymentNo: this.state.searchmchOrderIdChange.trim(), //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
          ? `${tools.dateToStr(this.state.searchBeginTime._d)} `
          : "",
      maxTime: this.state.searchEndTime
          ? `${tools.dateToStr(this.state.searchEndTime._d)} `
          : "",
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data6: res.data.result || [],
          pageNum,
          pageSize,
          total6: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 工具 - 根据受理状态码查询对应的名字
  getConditionNameById(id) {
    switch (id) {
      case 0:
        return "已关闭";
      case 1:
        return "未完成";
      case 4:
        return "已完成";
      default:
        return "";
    }
  }

  // 工具 - 支付方式
  AllpayType(id) {
    switch (id) {
      case 1:
        return "微信支付";
      case 2:
        return "支付宝支付";
      case 3:
        return "银联支付";
      default:
        return "";
    }
  }

  // 获取所有的产品类型，当前页要用
  getAllProductType() {
    this.props.actions
      .findProductTypeByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productTypes: res.data.result || []
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

  // 工具 - 根据ID获取用户类型
  getUserType(id) {
    switch (String(id)) {
      case "0":
        return "经销商（体验版）";
      case "1":
        return "经销商（微创版）";
      case "2":
        return "经销商（个人版）";
      case "3":
        return "分享用户";
      case "4":
        return "普通用户";
      case "5":
        return "企业版经销商";
      case "6":
        return "企业版子账号";
      case "7":
        return "分销商";
      default:
        return "";
    }
  }

  // 工具 - 根据ID获取用户来源名字
  getListByModelId(id) {
    switch (id) {
      case 0:
        return "待付款";
      case 1:
        return "待审核";
      case 2:
        return "待发货";
      case 3:
        return "待收货";
      case 4:
        return "已完成";
      case -3:
        return "已取消";
      case -4:
        return "已关闭";
      default:
        return "";
    }
  }

  //工具 - 订单来源
  getSource(id) {
    switch (id) {
      case 1:
        return "终端app";
      case 2:
        return "微信公众号";
      case 3:
        return "经销商app";
    }
  }

  // 工具 - 根据ID获取支付方式
  getBypayType(id) {
    switch (String(id)) {
      case "1":
        return "微信支付";
      case "2":
        return "支付宝支付";
      case "3":
        return "银联支付";
      default:
        return "";
    }
  }

  //工具 - 根据活动类型id获取活动名称
  getActivity(id) {
    switch (String(id)) {
      case "1":
        return "普通商品";
      case "2":
        return "活动商品";
      default:
        return "";
    }
  }

  //产品类型所对应的公司
  Productcompany(id) {
    switch (String(id)) {
      case "1":
        return "翼猫科技发展（上海）有限公司";
      case "2":
        return "上海养未来健康食品有限公司";
      case "3":
        return "上海翼猫生物科技有限公司";
      case "5":
        return "上海翼猫智能科技有限公司";
    }
  }

  //工具
  getCity(s, c, q, j) {
    if (!s) {
      return " ";
    }
    return `${s}/${c}/${q}/${j}`;
  }

  //工具 - 用户具体收货地体
  getAddress(s, c, q, x) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}${x}`;
  }

  //工具 - 服务站地区（推荐人）收货地址
  getAddress2(s, c, q) {
    if (!q) {
      return `${s}${c}`;
    }
    return `${s}${c}${q}`;
  }

  //工具 - 服务站地区（安装工）收货地体
  getAddress3(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}`;
  }
  

  //搜索 - 支付状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e,
    });
  }
  

  //搜索 - 订单状态改变时触发
  searchConditionsChange(e) {
    this.setState({
      searchConditions: e,
      innerHTML:''
    });
  }

  //搜索 - 子订单号
  searchOrderNoChange(e) {
    this.setState({
      searchorderNo: e.target.value
    });
    console.log("e是什么；", e.target.value);
  }
  
  //搜索 - 主订单号
 searchMainOrderIdChange(e) {
    this.setState({
      searchMainOrderId: e.target.value
    });
  }
  
  //搜索 - 用户账号
  searchUserNameChange(e) {
    this.setState({
      searchUserName: e.target.value
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 搜索 - 流水号输入框值改变时触发
  mchOrderIdChange(e) {
    this.setState({
      searchmchOrderIdChange: e.target.value
    });
  }

  // 搜索 - 订单来源输入框值改变时触发
  searchProductType(v) {
    this.setState({
      searchProductType: v
    });
  }

  //搜索 - 云平台工单号
  searchReferChange(v) {
    this.setState({
      searchRefer: v.target.value
    });
  }
  
  //搜索 -体检卡号
  searchticketChange(v){
    this.setState({
      searchTicketNo: v.target.value
    });
  }
  
  
  //搜索 - 产品型号
  searchTypeChange(e){
    this.setState({
      searchType: e.target.value
    });
  }
  

  // // 搜索 - 开始时间变化
  // searchBeginTime(v) {
  //   console.log("是什么：", v);
  //   this.setState({
  //     searchBeginTime: v,
  //     searchTime: undefined
  //   });
  // }
  //
  // // 搜索 - 结束时间变化
  // searchEndTime(v) {
  //   console.log("触发：", v);
  //   let date = v;
  //   const now = new Date();
  //   if (
  //     v._d.getFullYear() === now.getFullYear() &&
  //     v._d.getMonth() === now.getMonth() &&
  //     v._d.getDate() === now.getDate()
  //   ) {
  //     date = moment();
  //   }
  //   this.setState({
  //     searchEndTime: date,
  //     searchTime: undefined
  //   });
  // }
  
  // 搜索 - 开始时间
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    });
  }
  
  // 搜索 - 结束时间
  searchEndTime(v) {
    this.setState({
      searchEndTime: _.cloneDeep(v)
    });
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchorderNo: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchUserName: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchmchOrderIdChange: ""
    });
  }

  emitEmpty3() {
    this.setState({
      searchRefer: ""
    });
  }
  
  emitEmpty4() {
    this.setState({
      searchMainOrderId: ""
    });
  }

  emitEmpty5() {
    this.setState({
      searchMinPrice: ""
    });
  }

  emitEmpty6() {
    this.setState({
      searchMaxPrice: ""
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  // 搜索 - 净水服务
  onSearch2() {
    this.onGetData2(1, this.state.pageSize);
  }
  
  // 搜索 - 健康食品
  onSearch3() {
    this.onGetData3(1, this.state.pageSize);
  }
  
  // 搜索 - 生物科技
  onSearch4() {
    this.onGetData4(1, this.state.pageSize);
  }
  
  // 搜索 - 优惠卡
  onSearch5() {
    this.onGetData5(1, this.state.pageSize);
  }
  
  // 搜索 - 健康评估
  onSearch6() {
    this.onGetData6(1, this.state.pageSize);
  }
  
  //汇总对账 tab操作
  onSearchJump(e){
    console.log('e是什么：',e)
    if(e==1){
      this.onGetData(1, this.state.pageSize);
    }else if(e==2){
      this.onGetData2(1, this.state.pageSize);
    }else if(e==3){
      this.onGetData3(1, this.state.pageSize);
    }else if(e==4){
      this.onGetData4(1, this.state.pageSize);
    }else if(e==5){
      this.onGetData5(1, this.state.pageSize);
    }else if(e==6){
      this.onGetData6(1, this.state.pageSize);
    }
    
  }
  
  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }

  // 导出订单对账列表数据 - 汇总对账
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName, //用户id
      orderType: this.state.searchProductType, //产品类型
      orderId: this.state.searchorderNo,  //子订单号查询
      mainOrderId:this.state.searchMainOrderId,//主订单号查询
      paymentNo: this.state.searchmchOrderIdChange, //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/reconciliation/record`,'post','汇总对账.xls')
  }
  
  //导出 - 净水服务
  onExport2() {
    this.onExportData2(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出订单对账列表数据 - 净水服务
  onExportData2(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName, //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo,  //订单号查询
      mainOrderId:this.state.searchMainOrderId,//主订单号查询
      paymentNo: this.state.searchmchOrderIdChange, //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/water/reconciliation/record`,'post','净水服务.xls')
  }
  
  //导出 - 健康食品
  onExport3() {
    this.onExportData3(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出订单对账列表数据 - 健康食品
  onExportData3(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName, //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo,  //订单号查询
      mainOrderId:this.state.searchMainOrderId,//主订单号查询
      paymentNo: this.state.searchmchOrderIdChange, //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/food/reconciliation/record`,'post','健康食品.xls')
  }
  
  //导出 - 生物科技
  onExport4() {
    this.onExportData4(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出订单对账列表数据 - 生物科技
  onExportData4(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      orderStatus: this.state.searchConditions, //订单状态
      userId: this.state.searchUserName, //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo,  //订单号查询
      mainOrderId:this.state.searchMainOrderId,//主订单号查询
      paymentNo: this.state.searchmchOrderIdChange, //流水号
      refer: this.state.searchRefer.trim(), //云平台工单号
      activityType: this.state.searchActivity,
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/biological/reconciliation/record`,'post','生物科技.xls')
    
  }
  
  //导出 - 优惠卡
  onExport5() {
    this.onExportData5(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出订单对账列表数据 - 优惠卡
  onExportData5(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      userId: this.state.searchUserName, //用户id
      orderId: this.state.searchorderNo,  //订单号查询
      mainOrderId:this.state.searchMainOrderId,//主订单号查询
      paymentNo: this.state.searchmchOrderIdChange, //流水号
      ticketNo: this.state.searchTicketNo, //体检卡号
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/m/ticket/reconciliation/record`,'post','优惠卡.xls')
  }
  
  //导出 - 健康评估
  onExport6() {
    this.onExportData6(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出订单对账列表数据 - 健康评估
  onExportData6(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      userId: this.state.searchUserName, //用户id
      modelType:this.state.searchType,//产品型号
      orderId: this.state.searchorderNo,  //订单号查询
      mainOrderId:this.state.searchMainOrderId,//主订单号查询
      paymentNo: this.state.searchmchOrderIdChange, //流水号
      minTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime._d)}`
        : "",
      maxTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime._d)}`
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/ticket/reconciliation/record`,'post','健康评估.xls')
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
    this.setState({
      nowData: record,
      queryModalShow: true,
      typeId: record.typeId
    });
    console.log("typeId的数值是：", record.typeId);
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  // 表单页码改变 - 汇总对账
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }
  
  // 表单页码改变 - 净水服务
  onTablePageChange2(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData2(page, pageSize);
  }
  
  // 表单页码改变 - 健康食品
  onTablePageChange3(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData3(page, pageSize);
  }
  
  // 表单页码改变 - 生物科技
  onTablePageChange4(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData4(page, pageSize);
  }
  
  // 表单页码改变 - 优惠卡
  onTablePageChange5(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData5(page, pageSize);
  }
  
  // 表单页码改变 - 健康评估
  onTablePageChange6(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData6(page, pageSize);
  }

  // 构建字段 - 汇总对账
  makeColumns() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderNo",
        key: "orderNo"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "订单状态",
        dataIndex: "conditions",
        key: "conditions",
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
      },
      {
        title: "产品公司",
        dataIndex: "company",
        key: "company",
      },
      {
        title: "产品型号",
        dataIndex: "modelType",
        key: "modelType"
      },
      {
        title: "产品数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "订单金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "支付时间",
        dataIndex: "payTime",
        key: "payTime"
      },
      {
        title: "流水号",
        dataIndex: "mchOrderId",
        key: "mchOrderId"
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 50,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
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
  
  // 构建字段 - 净水服务
  makeColumns2() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderNo",
        key: "orderNo"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "订单状态",
        dataIndex: "conditions",
        key: "conditions",
      },
      {
        title: "产品型号",
        dataIndex: "modelType",
        key: "modelType"
      },
      {
        title: "订单金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "支付时间",
        dataIndex: "payTime",
        key: "payTime"
      },
      {
        title: "流水号",
        dataIndex: "mchOrderId",
        key: "mchOrderId"
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 50,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
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
  
  //构建字段 - 优惠卡
  makeColumns3() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderNo",
        key: "orderNo"
      },
      {
        title: "体检卡号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "订单状态",
        dataIndex: "conditions",
        key: "conditions",
      },
      {
        title: "产品型号",
        dataIndex: "modelType",
        key: "modelType"
      },
      {
        title: "产品数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "订单金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "支付时间",
        dataIndex: "payTime",
        key: "payTime"
      },
      {
        title: "流水号",
        dataIndex: "mchOrderId",
        key: "mchOrderId"
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 50,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
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
  
  //构建字段 - 健康评估
  makeColumns4() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderNo",
        key: "orderNo"
      },
      {
        title: "下单时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "订单状态",
        dataIndex: "conditions",
        key: "conditions",
      },
      {
        title: "产品型号",
        dataIndex: "modelType",
        key: "modelType"
      },
      {
        title: "产品数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "订单金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "支付时间",
        dataIndex: "payTime",
        key: "payTime"
      },
      {
        title: "流水号",
        dataIndex: "mchOrderId",
        key: "mchOrderId"
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 50,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
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
  
  // 构建字段 - 健康食品、生物科技
  makeColumns5() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId'
      },
      {
        title: "子订单号",
        dataIndex: "orderNo",
        key: "orderNo"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "订单状态",
        dataIndex: "conditions",
        key: "conditions",
      },
      {
        title: "产品型号",
        dataIndex: "modelType",
        key: "modelType"
      },
      {
        title: "产品数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "订单金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "支付时间",
        dataIndex: "payTime",
        key: "payTime"
      },
      {
        title: "流水号",
        dataIndex: "mchOrderId",
        key: "mchOrderId"
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 50,
        render: (text, record) => {
          const controls = [];
          controls.push(
              <span
                  key="0"
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

  // 构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        addrId: item.addrId,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        count: item.productCount,
        fee: item.orderFee,
        openAccountFee: item.openAccountFee,
        payType: item.payType,
        orderNo: item.orderId,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.orderTime, //下单时间
        name: item.product ? item.product.name : "",
        modelId: item.product ? item.product.typeCode : "",
        typeId: item.productType,
        company: item.company,
        conditions: item.orderStatus,
        userName: item.userId,
        userType: item.userIdentity,
        refer: item.refer,
        pay: item.pay,
        payTime: item.payTime,  //支付时间
        orderFrom: item.orderFrom,
        activityType: item.activityType,
        realName: item.distributor ? item.distributor.realName : "",
        company3: item.distributor ? item.distributor.company : "",
        distributorAccount: item.distributorAccount,  //经销商账户
        id: item.distributorId,  //经销商id
        userId: item.userId,
        modelType: item.modelType,
        mchOrderId: item.paymentNo,
        mobile: item.shopAddress ? item.shopAddress.mobile : "",
        province: item.shopAddress ? item.shopAddress.province : "",
        city: item.shopAddress ? item.shopAddress.city : "",
        region: item.shopAddress ? item.shopAddress.region : "",
        province2: item.ambassador ? item.ambassador.province : "",
        city2: item.ambassador ? item.ambassador.city : "",
        region2: item.ambassador ? item.ambassador.region : "",
        company2: item.ambassador ? item.ambassador.company : "",
        province3: item.customer ? item.customer.province : "",
        city3: item.customer ? item.customer.city : "",
        region3: item.customer ? item.customer.region : "",
        city4: item.distributor ? item.distributor.city : "",
        region4: item.distributor ? item.distributor.region : "",
        province4: item.distributor ? item.distributor.province : "",
        street: item.shopAddress ? item.shopAddress.street : "",
        customerName: item.customer ? item.customer.realName : "",
        settlementSubjectArea: item.settlementSubjectArea, //销售主体地区
        settlementSubjectCompany:item.settlementSubjectCompany, //销售主体公司
        paymentInstructions:item.paymentInstructions,//付款说明
        recommendAccount: item.recommendAccount, //推荐人账户
        recommendName: item.recommendName, //推荐人姓名
        recommendProvince:item.recommendProvince, //推荐人省
        recommendCity:item.recommendCity,//推荐人市
        recommendRegion:item.recommendRegion,//推荐人区
        feeType: item.feeType, //计费方式
        distributorIdentity:item.distributorIdentity,//经销商身份
        distributorName:item.distributorName,//经销商姓名
        distributorProvince:item.distributorProvince, //经销商省
        distributorCity:item.distributorCity,//经销商所在市
        distributorRegion:item.distributorRegion,//经销商区
        isSonAccount:item.isSonAccount,//是否有子账号
        sonAccountId:item.sonAccountId ,//子账户id
        mainOrderId:item.mainOrderId, //主订单号
      };
    });
  }

  render() {
    const me = this;
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

    const { searchorderNo } = this.state;
    const { searchUserName } = this.state;
    const { searchmchOrderIdChange } = this.state;
    const { searchRefer } = this.state;
    const { searchMainOrderId } = this.state;
    const suffix = searchorderNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix2 = searchUserName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix3 = searchmchOrderIdChange ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;
    const suffix4 = searchRefer ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    const suffix5 = searchMainOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty4()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <Tabs type="card" onChange={(e) => this.onSearchJump(e)}>
            <TabPane tab="汇总对账" key="1">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>主订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix5}
                      value={searchMainOrderId}
                      onChange={e => this.searchMainOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>子订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix}
                      value={searchorderNo}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>云平台工单号</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix4}
                      value={searchRefer}
                      onChange={e => this.searchReferChange(e)}
                    />
                  </li>
                  <li>
                    <span>订单状态</span>
                    <Select
                      placeholder="全部"
                      allowClear
                      style={{ width: "172px" }}
                      onChange={e => this.searchConditionsChange(e)}
                    >
                      <Option value={2}>待发货</Option>
                      <Option value={3}>待收货</Option>
                      <Option value={4}>已完成</Option>
                    </Select>
                  </li>
                  <li>
                    <span>产品类型</span>
                    <Select
                      allowClear
                      placeholder="全部"
                      style={{ width: "172px" }}
                      onChange={e => this.searchProductType(e)}
                    >
                      {this.state.productTypes.map((item, index) => {
                        return (
                          <Option key={index} value={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </li>
                  <li>
                    <span style={{ marginRight: "10px" }}>支付时间</span>
                    <DatePicker
                      showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={e => this.searchBeginTime(e)}
                      onOk={onOk}
                    />
                    --
                    <DatePicker
                      showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      value={this.state.searchEndTime}
                      onChange={e => this.searchEndTime(e)}
                      onOk={onOk}
                    />
                  </li>
                  <li>
                    <span>流水号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix3}
                      value={searchmchOrderIdChange}
                      onChange={e => this.mchOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>用户id</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix2}
                      value={searchUserName}
                      onChange={e => this.searchUserNameChange(e)}
                    />
                  </li>
                  <li style={{ marginLeft: "40px" }}>
                    <Button
                      icon="search"
                      type="primary"
                      onClick={() => this.onSearch()}
                    >
                      搜索
                    </Button>
                  </li>
                  <li>
                    <Button
                      icon="download"
                      type="primary"
                      onClick={() => this.onExport()}
                      // initloading={this.state.exportLoading}
                    >
                      导出
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns()}
                  dataSource={this.makeData(this.state.data)}
                  scroll={{ x: 1800 }}
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
              {/* 查看详情模态框 */}
              <Modal
                title="查看详情"
                visible={this.state.queryModalShow}
                onOk={() => this.onQueryModalClose()}
                onCancel={() => this.onQueryModalClose()}
                onChange={() => this.onQueryClick()}
                wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderNo : ""}
                  </FormItem>
                  <FormItem label="云平台工单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.refer : ""}
                  </FormItem>
                  <FormItem label="订单状态" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.conditions: ""}
                  </FormItem>
                  <FormItem label="订单来源" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderFrom: ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userType : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.typeId : ""}
                  </FormItem>
                  <FormItem label="产品型号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.modelType : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.company: ""}
                  </FormItem>
                  <FormItem label="数量" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.count : ""}
                  </FormItem>
                  <FormItem label="订单金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.fee : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
                  </FormItem>
                  <FormItem label="下单时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.createTime : ""}
                  </FormItem>
                  <FormItem label="支付方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payType : ""}
                  </FormItem>
                  <FormItem label="支付时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payTime : ""}
                  </FormItem>
                  <FormItem label="销售主体省市区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectArea : ""}
                  </FormItem>
                  <FormItem label="销售主体公司名称" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectCompany : ""}
                  </FormItem>
                  <FormItem label="收款说明" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentInstructions : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="净水服务" key="2">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>主订单号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix5}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>子订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix}
                      value={searchorderNo}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>云平台工单号</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix4}
                      value={searchRefer}
                      onChange={e => this.searchReferChange(e)}
                    />
                  </li>
                  <li>
                    <span>订单状态</span>
                    <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchConditionsChange(e)}
                    >
                      <Option value={2}>待发货</Option>
                      <Option value={3}>待收货</Option>
                      <Option value={4}>已完成</Option>
                    </Select>
                  </li>
                  <li>
                    <span>产品型号</span>
                    <Input
                      style={{ width: "172px" }}
                      onChange={e => this.searchTypeChange(e)}
                    />
                    {/*<Select*/}
                        {/*allowClear*/}
                        {/*placeholder="全部"*/}
                        {/*style={{ width: "172px" }}*/}
                        {/*// onChange={e => this.searchProductType(e)}*/}
                    {/*>*/}
                      {/*{this.state.productModels.map((item, index) => {*/}
                        {/*return (*/}
                            {/*<Option key={index} value={item.id}>*/}
                              {/*{item.name}*/}
                            {/*</Option>*/}
                        {/*);*/}
                      {/*})}*/}
                    {/*</Select>*/}
                  </li>
                  <li>
                    <span style={{ marginRight: "10px" }}>支付时间</span>
                    <DatePicker
                        showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchBeginTime(e)}
                        onOk={onOk}
                    />
                    --
                    <DatePicker
                        showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        value={this.state.searchEndTime}
                        onChange={e => this.searchEndTime(e)}
                        onOk={onOk}
                    />
                  </li>
                  <li>
                    <span>流水号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix3}
                        value={searchmchOrderIdChange}
                        onChange={e => this.mchOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>用户id</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserName}
                        onChange={e => this.searchUserNameChange(e)}
                    />
                  </li>
                  <li style={{ marginLeft: "40px" }}>
                    <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearch2()}
                    >
                      搜索
                    </Button>
                  </li>
                  <li>
                    <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExport2()}
                    >
                      导出
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns2()}
                  dataSource={this.makeData(this.state.data2)}
                  scroll={{ x: 1800 }}
                  pagination={{
                    total: this.state.total2,
                    current: this.state.pageNum,
                    pageSize: this.state.pageSize,
                    showQuickJumper: true,
                    showTotal: (total, range) => `共 ${total} 条数据`,
                    onChange: (page, pageSize) =>
                      this.onTablePageChange2(page, pageSize)
                  }}
                />
              </div>
              {/* 查看详情模态框 */}
              <Modal
                title="查看详情"
                visible={this.state.queryModalShow}
                onOk={() => this.onQueryModalClose()}
                onCancel={() => this.onQueryModalClose()}
                onChange={() => this.onQueryClick()}
                wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderNo : ""}
                  </FormItem>
                  <FormItem label="云平台工单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.refer : ""}
                  </FormItem>
                  <FormItem label="订单来源" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderFrom: ""}
                  </FormItem>
                  <FormItem label="下单时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.createTime : ""}
                  </FormItem>
                  <FormItem label="订单状态" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.conditions: ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userType : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.typeId : ""}
                  </FormItem>
                  <FormItem label="产品型号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.modelType : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.company: ""}
                  </FormItem>
                  <FormItem label="计费方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.feeType: ""}
                  </FormItem>
                  <FormItem label="数量" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.count : ""}
                  </FormItem>
                  <FormItem label="订单金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.fee : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
                  </FormItem>
                  <FormItem label="支付方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payType : ""}
                  </FormItem>
                  <FormItem label="支付时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payTime : ""}
                  </FormItem>
                  <FormItem label="经销商身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorIdentity: ""}
                  </FormItem>
                  <FormItem label="经销商id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.id : ""}
                  </FormItem>
                  <FormItem label="经销商姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                  </FormItem>
                  <FormItem label="经销商账户" {...formItemLayout}>
                    {!!this.state.nowData
                        ? this.state.nowData.distributorAccount
                        : ""}
                  </FormItem>
                  <FormItem label="经销商省" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorProvince : ""}
                  </FormItem>
                  <FormItem label="经销商市" {...formItemLayout}>
                  {!!this.state.nowData ? this.state.nowData.distributorCity : ""}
                </FormItem>
                  <FormItem label="经销商区" {...formItemLayout}>
                   {!!this.state.nowData ? this.state.nowData.distributorRegion : ""}
                </FormItem>
                  <FormItem label="是否有子账号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.isSonAccount : ""}
                  </FormItem>
                  <FormItem label="子账号id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.sonAccountId : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="健康食品" key="3">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>主订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix5}
                      value={searchMainOrderId}
                      onChange={e => this.searchMainOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>子订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix}
                      value={searchorderNo}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>云平台工单号</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix4}
                      value={searchRefer}
                      onChange={e => this.searchReferChange(e)}
                    />
                  </li>
                  <li>
                    <span>订单状态</span>
                    <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchConditionsChange(e)}
                    >
                      <Option value={2}>待发货</Option>
                      <Option value={3}>待收货</Option>
                      <Option value={4}>已完成</Option>
                    </Select>
                  </li>
                  <li>
                    <span>产品型号</span>
                    <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchTypeChange(e)}
                    />
                    {/*<Select*/}
                        {/*allowClear*/}
                        {/*placeholder="全部"*/}
                        {/*style={{ width: "172px" }}*/}
                        {/*// onChange={e => this.searchProductType(e)}*/}
                    {/*>*/}
                      {/*{this.state.productModels.map((item, index) => {*/}
                        {/*return (*/}
                            {/*<Option key={index} value={item.id}>*/}
                              {/*{item.name}*/}
                            {/*</Option>*/}
                        {/*);*/}
                      {/*})}*/}
                    {/*</Select>*/}
                  </li>
                  <li>
                    <span style={{ marginRight: "10px" }}>支付时间</span>
                    <DatePicker
                        showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchBeginTime(e)}
                        onOk={onOk}
                    />
                    --
                    <DatePicker
                        showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        value={this.state.searchEndTime}
                        onChange={e => this.searchEndTime(e)}
                        onOk={onOk}
                    />
                  </li>
                  <li>
                    <span>流水号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix3}
                        value={searchmchOrderIdChange}
                        onChange={e => this.mchOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>用户id</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserName}
                        onChange={e => this.searchUserNameChange(e)}
                    />
                  </li>
                  <li style={{ marginLeft: "40px" }}>
                    <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearch3()}
                    >
                      搜索
                    </Button>
                  </li>
                  <li>
                    <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExport3()}
                    >
                      导出
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns5()}
                  dataSource={this.makeData(this.state.data3)}
                  scroll={{ x: 1800 }}
                  pagination={{
                    total: this.state.total3,
                    current: this.state.pageNum,
                    pageSize: this.state.pageSize,
                    showQuickJumper: true,
                    showTotal: (total, range) => `共 ${total} 条数据`,
                    onChange: (page, pageSize) =>
                      this.onTablePageChange3(page, pageSize)
                  }}
                />
              </div>
              {/* 查看详情模态框 */}
              <Modal
                title="查看详情"
                visible={this.state.queryModalShow}
                onOk={() => this.onQueryModalClose()}
                onCancel={() => this.onQueryModalClose()}
                onChange={() => this.onQueryClick()}
                wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderNo : ""}
                  </FormItem>
                  <FormItem label="云平台工单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.refer : ""}
                  </FormItem>
                  <FormItem label="订单来源" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderFrom: ""}
                  </FormItem>
                  <FormItem label="下单时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.createTime : ""}
                  </FormItem>
                  <FormItem label="订单状态" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.conditions: ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userType : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.typeId : ""}
                  </FormItem>
                  <FormItem label="产品型号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.modelType : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.company: ""}
                  </FormItem>
                  {/*<FormItem label="计费方式" {...formItemLayout}>*/}
                    {/*{!!this.state.nowData ? this.state.nowData.feeType: ""}*/}
                  {/*</FormItem>*/}
                  <FormItem label="数量" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.count : ""}
                  </FormItem>
                  <FormItem label="订单金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.fee : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
                  </FormItem>
                  <FormItem label="支付方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payType : ""}
                  </FormItem>
                  <FormItem label="支付时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payTime : ""}
                  </FormItem>
                  <FormItem label="经销商身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorIdentity: ""}
                  </FormItem>
                  <FormItem label="经销商id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.id : ""}
                  </FormItem>
                  <FormItem label="经销商姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                  </FormItem>
                  <FormItem label="经销商账户" {...formItemLayout}>
                    {!!this.state.nowData
                        ? this.state.nowData.distributorAccount
                        : ""}
                  </FormItem>
                  <FormItem label="经销商省" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorProvince : ""}
                  </FormItem>
                  <FormItem label="经销商市" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorCity : ""}
                  </FormItem>
                  <FormItem label="经销商区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorRegion : ""}
                  </FormItem>
                  <FormItem label="是否有子账号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.isSonAccount : ""}
                  </FormItem>
                  <FormItem label="子账号id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.sonAccountId : ""}
                  </FormItem>
                  <FormItem label="推荐人姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendName : ""}
                  </FormItem>
                  <FormItem label="推荐人账户" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.state.nowData.recommendAccount
                      : ""}
                  </FormItem>
                  <FormItem label="推荐人省" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendProvince : ""}
                  </FormItem>
                  <FormItem label="推荐人市" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendCity : ""}
                  </FormItem>
                  <FormItem label="推荐人区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendRegion : ""}
                  </FormItem>
                  <FormItem label="销售主体省市区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectArea : ""}
                  </FormItem>
                  <FormItem label="销售主体公司名称" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectCompany : ""}
                  </FormItem>
                  <FormItem label="收款说明" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentInstructions : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="生物科技" key="4">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>主订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix5}
                      value={searchMainOrderId}
                      onChange={e => this.searchMainOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>子订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix}
                      value={searchorderNo}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>云平台工单号</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix4}
                      value={searchRefer}
                      onChange={e => this.searchReferChange(e)}
                    />
                  </li>
                  <li>
                    <span>订单状态</span>
                    <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchConditionsChange(e)}
                    >
                      <Option value={2}>待发货</Option>
                      <Option value={3}>待收货</Option>
                      <Option value={4}>已完成</Option>
                    </Select>
                  </li>
                  <li>
                    <span>产品型号</span>
                    <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchTypeChange(e)}
                    />
                    {/*<Select*/}
                        {/*allowClear*/}
                        {/*placeholder="全部"*/}
                        {/*style={{ width: "172px" }}*/}
                        {/*// onChange={e => this.searchProductType(e)}*/}
                    {/*>*/}
                      {/*{this.state.productModels.map((item, index) => {*/}
                        {/*return (*/}
                            {/*<Option key={index} value={item.id}>*/}
                              {/*{item.name}*/}
                            {/*</Option>*/}
                        {/*);*/}
                      {/*})}*/}
                    {/*</Select>*/}
                  </li>
                  <li>
                    <span style={{ marginRight: "10px" }}>支付时间</span>
                    <DatePicker
                      showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={e => this.searchBeginTime(e)}
                      onOk={onOk}
                    />
                    --
                    <DatePicker
                      showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      value={this.state.searchEndTime}
                      onChange={e => this.searchEndTime(e)}
                      onOk={onOk}
                    />
                  </li>
                  <li>
                    <span>流水号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix3}
                        value={searchmchOrderIdChange}
                        onChange={e => this.mchOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>用户id</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserName}
                        onChange={e => this.searchUserNameChange(e)}
                    />
                  </li>
                  <li style={{ marginLeft: "40px" }}>
                    <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearch4()}
                    >
                      搜索
                    </Button>
                  </li>
                  <li>
                    <Button
                        icon="download"
                        type="primary"
                        onClick={() => this.onExport4()}
                    >
                      导出
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                    columns={this.makeColumns5()}
                    dataSource={this.makeData(this.state.data4)}
                    scroll={{ x: 1800 }}
                    pagination={{
                      total: this.state.total4,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                          this.onTablePageChange4(page, pageSize)
                    }}
                />
              </div>
              {/* 查看详情模态框 */}
              <Modal
                  title="查看详情"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                  onChange={() => this.onQueryClick()}
                  wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderNo : ""}
                  </FormItem>
                  <FormItem label="云平台工单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.refer : ""}
                  </FormItem>
                  <FormItem label="订单来源" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderFrom: ""}
                  </FormItem>
                  <FormItem label="下单时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.createTime : ""}
                  </FormItem>
                  <FormItem label="订单状态" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.conditions: ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userType : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.typeId : ""}
                  </FormItem>
                  <FormItem label="产品型号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.modelType : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.company: ""}
                  </FormItem>
                  <FormItem label="数量" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.count : ""}
                  </FormItem>
                  <FormItem label="订单金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.fee : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
                  </FormItem>
                  <FormItem label="支付方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payType : ""}
                  </FormItem>
                  <FormItem label="支付时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payTime : ""}
                  </FormItem>
                  <FormItem label="经销商身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorIdentity: ""}
                  </FormItem>
                  <FormItem label="经销商id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.id : ""}
                  </FormItem>
                  <FormItem label="经销商姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                  </FormItem>
                  <FormItem label="经销商账户" {...formItemLayout}>
                    {!!this.state.nowData
                        ? this.state.nowData.distributorAccount
                        : ""}
                  </FormItem>
                  <FormItem label="经销商省" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorProvince : ""}
                  </FormItem>
                  <FormItem label="经销商市" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorCity : ""}
                  </FormItem>
                  <FormItem label="经销商区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorRegion : ""}
                  </FormItem>
                  <FormItem label="是否有子账号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.isSonAccount : ""}
                  </FormItem>
                  <FormItem label="子账号id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.sonAccountId : ""}
                  </FormItem>
                  <FormItem label="推荐人姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendName : ""}
                  </FormItem>
                  <FormItem label="推荐人账户" {...formItemLayout}>
                    {!!this.state.nowData
                        ? this.state.nowData.recommendAccount
                        : ""}
                  </FormItem>
                  <FormItem label="推荐人省" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendProvince : ""}
                  </FormItem>
                  <FormItem label="推荐人市" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendCity : ""}
                  </FormItem>
                  <FormItem label="推荐人区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.recommendRegion : ""}
                  </FormItem>
                  <FormItem label="销售主体省市区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectArea : ""}
                  </FormItem>
                  <FormItem label="销售主体公司名称" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectCompany : ""}
                  </FormItem>
                  <FormItem label="收款说明" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentInstructions : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="优惠卡" key="5">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>主订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix5}
                      value={searchMainOrderId}
                      onChange={e => this.searchMainOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>子订单号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix}
                      value={searchorderNo}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>体检卡号</span>
                    <Input
                      style={{ width: "172px" }}
                      // suffix={suffix4}
                      // value={searchticketNo}
                      onChange={v => this.searchticketChange(v)}
                    />
                  </li>
                  <li>
                    <span style={{ marginRight: "10px" }}>支付时间</span>
                    <DatePicker
                      showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={e => this.searchBeginTime(e)}
                      onOk={onOk}
                    />
                    --
                    <DatePicker
                      showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      value={this.state.searchEndTime}
                      onChange={e => this.searchEndTime(e)}
                      onOk={onOk}
                    />
                  </li>
                  <li>
                    <span>流水号查询</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix3}
                      value={searchmchOrderIdChange}
                      onChange={e => this.mchOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>用户id</span>
                    <Input
                      style={{ width: "172px" }}
                      suffix={suffix2}
                      value={searchUserName}
                      onChange={e => this.searchUserNameChange(e)}
                    />
                  </li>
                  <li style={{ marginLeft: "40px" }}>
                    <Button
                      icon="search"
                      type="primary"
                      onClick={() => this.onSearch5()}
                    >
                      搜索
                    </Button>
                  </li>
                  <li>
                    <Button
                      icon="download"
                      type="primary"
                      onClick={() => this.onExport5()}
                    >
                      导出
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns3()}
                  dataSource={this.makeData(this.state.data5)}
                  scroll={{ x: 1800 }}
                  pagination={{
                    total: this.state.total5,
                    current: this.state.pageNum,
                    pageSize: this.state.pageSize,
                    showQuickJumper: true,
                    showTotal: (total, range) => `共 ${total} 条数据`,
                    onChange: (page, pageSize) =>
                      this.onTablePageChange5(page, pageSize)
                  }}
                />
              </div>
              {/* 查看详情模态框 */}
              <Modal
                  title="查看详情"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                  onChange={() => this.onQueryClick()}
                  wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderNo : ""}
                  </FormItem>
                  <FormItem label="体检卡号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.refer : ""}
                  </FormItem>
                  <FormItem label="订单状态" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.conditions: ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userType : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.typeId : ""}
                  </FormItem>
                  <FormItem label="产品型号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.modelType : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.company: ""}
                  </FormItem>
                  <FormItem label="数量" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.count : ""}
                  </FormItem>
                  <FormItem label="订单金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.fee : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
                  </FormItem>
                  <FormItem label="支付方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payType : ""}
                  </FormItem>
                  <FormItem label="支付时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payTime : ""}
                  </FormItem>
                  <FormItem label="收款说明" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentInstructions : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="健康评估" key="6">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>主订单号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix5}
                        value={searchMainOrderId}
                        onChange={e => this.searchMainOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>子订单号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix}
                        value={searchorderNo}
                        onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>产品型号</span>
                    <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchTypeChange(e)}
                    />
                    {/*<Select*/}
                        {/*allowClear*/}
                        {/*placeholder="全部"*/}
                        {/*style={{ width: "172px" }}*/}
                        {/*// onChange={e => this.searchProductType(e)}*/}
                    {/*>*/}
                      {/*{this.state.productModels.map((item, index) => {*/}
                        {/*return (*/}
                            {/*<Option key={index} value={item.id}>*/}
                              {/*{item.name}*/}
                            {/*</Option>*/}
                        {/*);*/}
                      {/*})}*/}
                    {/*</Select>*/}
                  </li>
                  <li>
                    <span style={{ marginRight: "10px" }}>支付时间</span>
                    <DatePicker
                      showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={e => this.searchBeginTime(e)}
                      onOk={onOk}
                    />
                    --
                    <DatePicker
                      showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      value={this.state.searchEndTime}
                      onChange={e => this.searchEndTime(e)}
                      onOk={onOk}
                    />
                  </li>
                  <li>
                    <span>流水号查询</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix3}
                        value={searchmchOrderIdChange}
                        onChange={e => this.mchOrderIdChange(e)}
                    />
                  </li>
                  <li>
                    <span>用户id</span>
                    <Input
                        style={{ width: "172px" }}
                        suffix={suffix2}
                        value={searchUserName}
                        onChange={e => this.searchUserNameChange(e)}
                    />
                  </li>
                  <li style={{ marginLeft: "40px" }}>
                    <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearch6()}
                    >
                      搜索
                    </Button>
                  </li>
                  <li>
                    <Button
                      icon="download"
                      type="primary"
                      onClick={() => this.onExport6()}
                    >
                      导出
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns4()}
                  dataSource={this.makeData(this.state.data6)}
                  scroll={{ x: 1800 }}
                  pagination={{
                    total: this.state.total6,
                    current: this.state.pageNum,
                    pageSize: this.state.pageSize,
                    showQuickJumper: true,
                    showTotal: (total, range) => `共 ${total} 条数据`,
                    onChange: (page, pageSize) =>
                      this.onTablePageChange6(page, pageSize)
                  }}
                />
              </div>
              {/* 查看详情模态框 */}
              <Modal
                  title="查看详情"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
                  onChange={() => this.onQueryClick()}
                  wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderNo : ""}
                  </FormItem>
                  <FormItem label="下单时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.createTime : ""}
                  </FormItem>
                  <FormItem label="订单状态" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.conditions: ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userType : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.typeId : ""}
                  </FormItem>
                  <FormItem label="产品型号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.modelType : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.company: ""}
                  </FormItem>
                  <FormItem label="数量" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.count : ""}
                  </FormItem>
                  <FormItem label="订单金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.fee : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
                  </FormItem>
                  <FormItem label="支付方式" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payType : ""}
                  </FormItem>
                  <FormItem label="支付时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.payTime : ""}
                  </FormItem>
                  <FormItem label="经销商身份" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorIdentity: ""}
                  </FormItem>
                  <FormItem label="经销商id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.id : ""}
                  </FormItem>
                  <FormItem label="经销商姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorName : ""}
                  </FormItem>
                  <FormItem label="经销商账户" {...formItemLayout}>
                    {!!this.state.nowData
                        ? this.state.nowData.distributorAccount
                        : ""}
                  </FormItem>
                  <FormItem label="经销商省" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorProvince : ""}
                  </FormItem>
                  <FormItem label="经销商市" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorCity : ""}
                  </FormItem>
                  <FormItem label="经销商区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.distributorRegion : ""}
                  </FormItem>
                  <FormItem label="是否有子账号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.isSonAccount : ""}
                  </FormItem>
                  <FormItem label="子账号id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.sonAccountId : ""}
                  </FormItem>
                  <FormItem label="销售主体省市区" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectArea : ""}
                  </FormItem>
                  <FormItem label="销售主体公司名称" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.settlementSubjectCompany : ""}
                  </FormItem>
                  <FormItem label="收款说明" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentInstructions : ""}
                  </FormItem>
                </Form>
              </Modal>
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
        findProductTypeByWhere,
        onChange, onOk,
        statementList,
        AllExportList,
        WaterExportList,
        FoodExportList,
        BiologicalExportList,
        CordExportList,
        HealthyExportList
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
