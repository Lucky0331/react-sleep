/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import moment from "moment";
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
  Select,
  Divider,
  DatePicker
} from "antd";
import "./index.scss";
import _ from "lodash";
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
  findProductModelByWhere,
  onChange,
  onOk,
  cashRecord,
  onChange4,
  warning,
  findProductTypeByWhere,
  WithdrawalsRevoke,
  RecordDetail,
  WithdrawLog
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      data2: [], //提现明细全部数据
      data3: [], //操作日志全部数据
      productModels: [], // 所有的产品型号
      productTypes: [], // 所有的产品类型
      searchProductName: "", // 搜索 - 产品名称
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      searchBeginTime: "", // 搜索 - 到账开始时间
      searchEndTime: "", // 搜索- 到账结束时间
      searchApplyBeginTime: "", // 搜索 - 申请退款开始时间
      searchApplyEndTime: "", // 搜索 - 申请退款结束时间
      searchUserType: "", //搜索 - 用户类型
      searchTypeId: "", //搜索 - 产品类型
      searchWithdrawType: "", //搜索 - 提现方式
      searchtradeNo: "", //搜索 - 流水号
      searchUserName: "", //搜索 - 用户昵称
      searchMobile: "", //搜索 - 用户手机号
      searchRealName: "", // 搜索 - 用户真实姓名
      searchFlag: "", //搜索 - 提现状态
      searchFlag2:"", //搜索 - 操作方式
      searchUserMallId: "", // 搜索 - 用户翼猫id
      searchPartnerTradeNo: "", //搜索 - 提现单号
      searchOrderId: "", // 搜索 - 订单号
      searchPresentNumber:"", //搜索 - 提现单号
      searchOperationBegin:"",//搜索 - 操作开始时间
      searchOperationEnd:"", //搜索 - 操作结束时间
      searchMinTime:"", //搜索 - 操作开始时间-操作日志
      searchMaxTime:"", //搜索 - 操作结束时间-操作日志
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 提现记录数据库总共多少条数据
      total2: 0, // 提现明细数据库总共多少条数据
      total3: 0  , // 操作日志数据库总共多少条数据
      citys: [] // 符合Cascader组件的城市数据
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
    this.onGetDataDetail(this.state.pageNum, this.state.pageSize);// 提现明细调用接口
    this.onGetDataJournal(this.state.pageNum, this.state.pageSize);//操作日志调用接口
    this.getAllProductType(); // 获取所有的产品类型
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

    warning2 = () =>{
        message.warning('导出功能尚在开发 敬请期待');
    };

  // 查询当前页面 - 提现记录 - 所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      id: this.state.searchId,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      ambassadorName: this.state.searchambassadorName,
      paymentNo: this.state.searchtradeNo,
      flag: this.state.searchFlag,
      phone: this.state.searchMobile,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      productType: this.state.searchTypeId,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo,
      minApplyTime: this.state.searchApplyBeginTime
        ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
        : "",
      maxApplyTime: this.state.searchApplyEndTime
        ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
        : "",
      minPaymentTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
        : "",
      maxPaymentTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : ""
    };
    this.props.actions.cashRecord(tools.clearNull(params)).then(res => {
      if (res.status === 200) {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else if (res.status === 400) {
        this.setState({
          data: []
        });
        message.error(res.message || "查询失败，请重试");
      }
    });
  }

  // 查询当前页面 - 提现明细 - 所需列表数据
  onGetDataDetail(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      id: this.state.searchId,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      ambassadorName: this.state.searchambassadorName,
      paymentNo: this.state.searchtradeNo,
      flag: this.state.searchFlag,
      phone: this.state.searchMobile,
      orderId: this.state.searchOrderId,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      productType: this.state.searchTypeId,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo,
      minApplyTime: this.state.searchApplyBeginTime
        ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
        : "",
      maxApplyTime: this.state.searchApplyEndTime
        ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
        : "",
      minPaymentTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
        : "",
      maxPaymentTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : ""
    };
    this.props.actions.RecordDetail(tools.clearNull(params)).then(res => {
      if (res.status === 200) {
        this.setState({
          data2: res.data.result || [],
          pageNum,
          pageSize,
          total2: res.data.total
        });
      } else if (res.status === 400) {
        this.setState({
          data2: []
        });
        message.error(res.message || "查询失败，请重试");
      }
    });
  }

  // 查询当前页面 - 操作日志 - 所需列表数据
  onGetDataJournal(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      withdrawType: String(this.state.searchWithdrawType),
      partnerTradeNo: String(this.state.searchPresentNumber),
      operation:this.state.searchFlag2,
      minTime: this.state.searchMinTime
        ? `${tools.dateToStr(this.state.searchMinTime.utc()._d)}`
        : "",
      maxTime: this.state.searchMaxTime
        ? `${tools.dateToStr(this.state.searchMaxTime.utc()._d)} `
        : ""
    };
    this.props.actions.WithdrawLog(tools.clearNull(params)).then(res => {
      if (res.returnCode === "0") {
        console.log('data:', res);
        this.setState({
          data3: res.messsageBody.result || [],
          pageNum,
          pageSize,
          total3: res.messsageBody.total
        });
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

  // 获取所有的产品类型，当前页要用
  getAllProductType() {
    this.props.actions
      .findProductTypeByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.returnCode === "0") {
          this.setState({
            productTypes: res.messsageBody.result
          });
        }
      });
  }

  //Input中的删除按钮所删除的条件
  emitEmpty0() {
    this.setState({
      searchtradeNo: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchUserName: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchUserMallId: ""
    });
  }

  emitEmpty3() {
    this.setState({
      searchRealName: ""
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

  emitEmpty7() {
    this.setState({
      searchMobile: ""
    });
  }

  emitEmpty8() {
    this.setState({
      searchPartnerTradeNo: ""
    });
  }

  emitEmpty9() {
    this.setState({
      searchOrderId: ""
    });
  }

  emitEmpty10() {
    this.setState({
      searchPresentNumber: ""
    });
  }

  // 工具 - 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据ID获取用户来源名字
  getListByModelId(id) {
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

  //提现id返回对应的提现状态
  flgType(id) {
    switch (String(id)) {
      case "1":
        return "提现成功";
      case "2":
        return "提现失败";
    }
  }

  //根据id拿到所对应的提现方式
  getWithdrawType(id) {
    switch (String(id)) {
      case "1":
        return "微信零钱";
    }
  }

  //搜索 - 用户类型输入框值改变时触发
  searchUserTypeChange(e) {
    this.setState({
      searchUserType: e
    });
  }

  //搜索 - 提现方式改变时触发
  searchCashTypeChange(e) {
    this.setState({
      searchWithdrawType: e
    });
  }

  //搜索 - 流水号
  searchTradeNoChange(e) {
    this.setState({
      searchtradeNo: e.target.value
    });
  }

  //搜索 - 用户昵称查询
  searchUserNameChange(e) {
    this.setState({
      searchUserName: e.target.value
    });
  }

  //搜索 - 用户昵称查询
  searchRealNameChange(e) {
    this.setState({
      searchRealName: e.target.value
    });
  }

  // 搜索 - 产品类型输入框值改变时触发
  searchProductType(e) {
    this.setState({
      searchTypeId: e
    });
  }

  //搜索 - 用户手机号
  searchMobileChange(e) {
    this.setState({
      searchMobile: e.target.value
    });
  }

  //搜索 - 用户id
  searchUserMallIdChange(e) {
    this.setState({
      searchUserMallId: e.target.value
    });
  }

  //搜索 - 提现单号
  searchPresentNumber(e){
   this.setState({
     searchPresentNumber:e.target.value
   })
  }

    // 点击查看地区模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields(["addnewCitys"]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
      addnewModalShow: true
    });
  }

  //搜索 - 提现状态
  searchFlagChange(e) {
    this.setState({
      searchFlag: e
    });
  }

  //搜索 - 操作方式
  searchFlagChange2(e) {
    this.setState({
      searchFlag2: e
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  //搜索 - 提现单号
  searchPartnerTradeNoChange(e) {
    this.setState({
      searchPartnerTradeNo: e.target.value
    });
  }

  // 搜索 - 最小价格变化
  searchMinPriceChange(v) {
    this.setState({
      searchMinPrice: v.target.value
    });
  }

  // 搜索 - 最大价格变化
  searchMaxPriceChange(v) {
    this.setState({
      searchMaxPrice: v.target.value
    });
  }

  //搜索 - 订单号
  searchOrderIdChange(v) {
    this.setState({
      searchOrderId: v.target.value
    });
  }

  // 搜索 - 申请提现开始时间变化
  searchApplyBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchApplyBeginTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 申请提现结束时间变化
  searchApplyEndTime(v) {
    console.log("触发：", v);
    // let date = v;
    // const now = new Date();
    // if (v._d.getFullYear() === now.getFullYear() && v._d.getMonth() === now.getMonth() && v._d.getDate() === now.getDate()) {
    //     v = moment();
    // }
    this.setState({
      searchApplyEndTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 提现到账开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 提现到账结束时间变化
  searchEndTime(v) {
    console.log("触发：", v);
    // let date = v;
    // const now = new Date();
    // if (v._d.getFullYear() === now.getFullYear() && v._d.getMonth() === now.getMonth() && v._d.getDate() === now.getDate()) {
    //     v = moment();
    // }
    this.setState({
      searchEndTime: _.cloneDeep(v)
    });
  }

  //搜索 - 操作开始时间
  searchOperationBegin(v) {
    this.setState({
      searchOperationBegin: _.cloneDeep(v)
    });
  }

  //搜索 - 操作结束时间
  searchOperationEnd(v) {
    this.setState({
      searchOperationEnd: _.cloneDeep(v)
    });
  }

  //操作开始时间
  searchMinTime(v){
    this.setState({
      searchMinTime: _.cloneDeep(v)
    });
  }

  //操作结束时间
  searchMaxTime(v){
    this.setState({
      searchMaxTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 提现记录
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  // 搜索 - 提现明细
  onSearchDetail() {
    this.onGetDataDetail(1, this.state.pageSize);
  }

  //搜索 - 操作日志
  onSearchJournal(){
    this.onGetDataJournal(1, this.state.pageSize);
  }

  //点击操作日志时发起请求
  auditList(){
    this.onGetDataJournal(this.state.pageNum, this.state.pageSize)
  }

  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }
  
  //提现明细 - 导出
  onExportDetail(){
    this.onExportDataDetail(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出提现记录列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      id: this.state.searchId,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      ambassadorName: this.state.searchambassadorName,
      paymentNo: this.state.searchtradeNo,
      flag: this.state.searchFlag,
      phone: this.state.searchMobile,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      productType: this.state.searchTypeId,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo,
      minApplyTime: this.state.searchApplyBeginTime
          ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
          : "",
      maxApplyTime: this.state.searchApplyEndTime
          ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
          : "",
      minPaymentTime: this.state.searchBeginTime
          ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
          : "",
      maxPaymentTime: this.state.searchEndTime
          ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
          : ""
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    form.id = "download-form";
    form.action = `${Config.baseURL}/manager/export/withdraw/record`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
    
    const newElement3 = document.createElement("input");
    if (params.conditions) {
      newElement3.setAttribute("name", "conditions");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.conditions);
      form.appendChild(newElement3);
    }
    
    const newElement4 = document.createElement("input");
    if (params.userId) {
      newElement4.setAttribute("name", "userId");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.userId);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.productType) {
      newElement5.setAttribute("name", "productType");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.productType);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.refundEndTime) {
      newElement6.setAttribute("name", "refundEndTime");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.refundEndTime);
      form.appendChild(newElement6);
    }
    
    const newElement7 = document.createElement("input");
    if (params.orderNo) {
      newElement7.setAttribute("name", "orderNo");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.orderNo);
      form.appendChild(newElement7);
    }
    
    const newElement8 = document.createElement("input");
    if (params.minPrice) {
      newElement8.setAttribute("name", "minPrice");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.minPrice);
      form.appendChild(newElement8);
    }
    
    const newElement9 = document.createElement("input");
    if (params.maxPrice) {
      newElement9.setAttribute("name", "maxPrice");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.maxPrice);
      form.appendChild(newElement9);
    }
    
    const newElement10 = document.createElement("input");
    if (params.mchOrderId) {
      newElement10.setAttribute("name", "mchOrderId");
      newElement10.setAttribute("type", "hidden");
      newElement10.setAttribute("value", params.mchOrderId);
      form.appendChild(newElement10);
    }
    
    const newElement11 = document.createElement("input");
    if (params.userType) {
      newElement11.setAttribute("name", "userType");
      newElement11.setAttribute("type", "hidden");
      newElement11.setAttribute("value", params.userType);
      form.appendChild(newElement11);
    }
    
    const newElement12 = document.createElement("input");
    if (params.activityType) {
      newElement12.setAttribute("name", "activityType");
      newElement12.setAttribute("type", "hidden");
      newElement12.setAttribute("value", params.activityType);
      form.appendChild(newElement12);
    }
    
    const newElement13 = document.createElement("input");
    if (params.refundBeginTime) {
      newElement13.setAttribute("name", "refundBeginTime");
      newElement13.setAttribute("type", "hidden");
      newElement13.setAttribute("value", params.refundBeginTime);
      form.appendChild(newElement13);
    }
    
    const newElement14 = document.createElement("input");
    if (params.beginTime) {
      newElement14.setAttribute("name", "beginTime");
      newElement14.setAttribute("type", "hidden");
      newElement14.setAttribute("value", params.beginTime);
      form.appendChild(newElement14);
    }
    
    const newElement15 = document.createElement("input");
    if (params.endTime) {
      newElement15.setAttribute("name", "endTime");
      newElement15.setAttribute("type", "hidden");
      newElement15.setAttribute("value", params.endTime);
      form.appendChild(newElement15);
    }
    
    form.submit();
  }
  
  // 导出提现明细列表数据
  onExportDataDetail(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      id: this.state.searchId,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      ambassadorName: this.state.searchambassadorName,
      paymentNo: this.state.searchtradeNo,
      flag: this.state.searchFlag,
      phone: this.state.searchMobile,
      orderId: this.state.searchOrderId,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      productType: this.state.searchTypeId,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo,
      minApplyTime: this.state.searchApplyBeginTime
          ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
          : "",
      maxApplyTime: this.state.searchApplyEndTime
          ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
          : "",
      minPaymentTime: this.state.searchBeginTime
          ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
          : "",
      maxPaymentTime: this.state.searchEndTime
          ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
          : ""
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    form.id = "download-form";
    form.action = `${Config.baseURL}/manager/export/withdraw/detail`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
    
    const newElement3 = document.createElement("input");
    if (params.conditions) {
      newElement3.setAttribute("name", "conditions");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.conditions);
      form.appendChild(newElement3);
    }
    
    const newElement4 = document.createElement("input");
    if (params.userId) {
      newElement4.setAttribute("name", "userId");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.userId);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.productType) {
      newElement5.setAttribute("name", "productType");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.productType);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.refundEndTime) {
      newElement6.setAttribute("name", "refundEndTime");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.refundEndTime);
      form.appendChild(newElement6);
    }
    
    const newElement7 = document.createElement("input");
    if (params.orderNo) {
      newElement7.setAttribute("name", "orderNo");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.orderNo);
      form.appendChild(newElement7);
    }
    
    const newElement8 = document.createElement("input");
    if (params.minPrice) {
      newElement8.setAttribute("name", "minPrice");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.minPrice);
      form.appendChild(newElement8);
    }
    
    const newElement9 = document.createElement("input");
    if (params.maxPrice) {
      newElement9.setAttribute("name", "maxPrice");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.maxPrice);
      form.appendChild(newElement9);
    }
    
    const newElement10 = document.createElement("input");
    if (params.mchOrderId) {
      newElement10.setAttribute("name", "mchOrderId");
      newElement10.setAttribute("type", "hidden");
      newElement10.setAttribute("value", params.mchOrderId);
      form.appendChild(newElement10);
    }
    
    const newElement11 = document.createElement("input");
    if (params.userType) {
      newElement11.setAttribute("name", "userType");
      newElement11.setAttribute("type", "hidden");
      newElement11.setAttribute("value", params.userType);
      form.appendChild(newElement11);
    }
    
    const newElement12 = document.createElement("input");
    if (params.activityType) {
      newElement12.setAttribute("name", "activityType");
      newElement12.setAttribute("type", "hidden");
      newElement12.setAttribute("value", params.activityType);
      form.appendChild(newElement12);
    }
    
    const newElement13 = document.createElement("input");
    if (params.refundBeginTime) {
      newElement13.setAttribute("name", "refundBeginTime");
      newElement13.setAttribute("type", "hidden");
      newElement13.setAttribute("value", params.refundBeginTime);
      form.appendChild(newElement13);
    }
    
    const newElement14 = document.createElement("input");
    if (params.beginTime) {
      newElement14.setAttribute("name", "beginTime");
      newElement14.setAttribute("type", "hidden");
      newElement14.setAttribute("value", params.beginTime);
      form.appendChild(newElement14);
    }
    
    const newElement15 = document.createElement("input");
    if (params.endTime) {
      newElement15.setAttribute("name", "endTime");
      newElement15.setAttribute("type", "hidden");
      newElement15.setAttribute("value", params.endTime);
      form.appendChild(newElement15);
    }
    
    form.submit();
  }

  // 查询提新纪录某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
    this.setState({
      nowData: record,
      queryModalShow: true,
      flag: record.flag
    });
    console.log("flag是什么状态：", record.flag);
  }

  // 查询提现明细某一条数据的详情
  onQueryClick2(record) {
    console.log("是什么：", record);
    this.setState({
      nowData: record,
      queryModalShow2: true,
      flag: record.flag
    });
    console.log("flag是什么状态：", record.flag);
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false,
      queryModalShow2: false
    });
  }

  //单独某条撤回审核通过
  onAdoptAloneRefuse(record) {
    const params = {
      partnerTradeNo: record.partnerTradeNo
    };
    this.props.actions
      .WithdrawalsRevoke(params)
      .then(res => {
        if (res.status === 200) {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.returnMessaage || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  // 提现记录--表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }

  // 提现明细--表单页码改变
  onTablePageChangeDetail(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetDataDetail(page, pageSize);
  }

  // 操作日志--表单页码改变
  onTablePageChangeJournal(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetDataJournal(page, pageSize);
  }


  // 构建字段  -- 提现纪录
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
        title: "提现单号",
        dataIndex: "partnerTradeNo",
        key: "partnerTradeNo"
      },
      {
        title: "提现金额",
        dataIndex: "amount",
        key: "amount"
      },
      {
        title: "申请提现时间",
        dataIndex: "applyTime",
        key: "applyTime"
      },
      {
        title: "提现状态",
        dataIndex: "flag",
        key: "flag",
        render: text => this.flgType(text)
      },
      {
        title: "提现方式",
        dataIndex: "withdrawType",
        key: "withdrawType",
        render: text => this.getWithdrawType(text)
      },
      {
        title: "流水号",
        dataIndex: "paymentNo",
        key: "paymentNo"
      },
      {
        title: "提现到账时间",
        dataIndex: "paymentTime",
        key: "paymentTime"
      },
      {
        title: "用户身份",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getListByModelId(text)
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "用户昵称",
        dataIndex: "nickName",
        key: "nickName"
      },
      {
        title: "用户姓名",
        dataIndex: "username",
        key: "username"
      },
      {
        title: "用户手机号",
        dataIndex: "phone",
        key: "phone"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 100,
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

  //构建字段 -- 提现明细所对应列表
  makeColumnsList() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title: "提现单号",
        dataIndex: "partnerTradeNo",
        key: "partnerTradeNo"
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "提现金额",
        dataIndex: "amount",
        key: "amount"
      },
      {
        title: "申请提现时间",
        dataIndex: "applyTime",
        key: "applyTime"
      },
      {
        title: "提现状态",
        dataIndex: "flag",
        key: "flag",
        render: text => this.flgType(text)
      },
      {
        title: "提现方式",
        dataIndex: "withdrawType",
        key: "withdrawType",
        render: text => this.getWithdrawType(text)
      },
      {
        title: "流水号",
        dataIndex: "paymentNo",
        key: "paymentNo"
      },
      {
        title: "提现到账时间",
        dataIndex: "paymentTime",
        key: "paymentTime"
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
        render: text => this.findProductNameById(text)
      },
      {
        title: "产品公司",
        dataIndex: "company",
        key: "company",
        render: text => this.Productcompany(text)
      },
      {
        title: "用户身份",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getListByModelId(text)
      },
      {
        title: "用户id",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: "用户昵称",
        dataIndex: "nickName",
        key: "nickName"
      },
      {
        title: "用户姓名",
        dataIndex: "username",
        key: "username"
      },
      {
        title: "用户手机号",
        dataIndex: "phone",
        key: "phone"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        render: (text, record) => {
          const controls = [];

          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onQueryClick2(record)}
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

  //构建字段 - 操作日志所对应列表
  makeColumnsJournal(){
    const columns = [
    {
      title: "提现单号",
      dataIndex:'orderId',
      key:'orderId'
    },
    {
      title:'操作',
      dataIndex:'operation',
      key:'operation'
    },
    {
      title:'操作人',
      dataIndex:'creator',
      key:'creator'
    },
    {
      title:'操作时间',
      dataIndex:'createTime',
      key:'createTime',
    },
    {
      title:'审核理由',
      dataIndex:'auditReason',
      key:'auditReason'
    },
  ]
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        addrId: item.addrId,
        count: item.count,
        ecId: item.ecId,
        fee: item.fee,
        feeType: item.feeType,
        openAccountFee: item.openAccountFee,
        orderType: item.orderType,
        payTime: item.payTime,
        flag: item.flag,
        partnerTradeNo: item.partnerTradeNo,
        paymentNo: item.paymentNo,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.createTime,
        pay: item.pay,
        applyTime: item.applyTime,
        paymentTime: item.paymentTime,
        productType: item.productType,
        company: item.productType,
        conditions: item.conditions,
        username: item.username,
        phone: item.phone,
        orderFrom: item.orderFrom,
        withdrawType: item.withdrawType,
        userId: item.userId,
        crediBeginTime: item.crediBeginTime,
        crediEndTime: item.crediEndTime,
        totalAmount: item.totalAmount,
        amount: item.amount,
        nickName: item.nickName,
        userType: item.userType,
        orderId: item.orderId,
        reason: item.reason,
        auditTime:item.auditTime
      };
    });
  }

  //提现明细 - table所需数据
  makeDataDetail(data2) {
    return data2.map((item, index) => {
      return {
        key: index,
        addrId: item.addrId,
        count: item.count,
        ecId: item.ecId,
        fee: item.fee,
        feeType: item.feeType,
        openAccountFee: item.openAccountFee,
        orderType: item.orderType,
        payTime: item.payTime,
        flag: item.flag,
        partnerTradeNo: item.partnerTradeNo,
        paymentNo: item.paymentNo,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.createTime,
        pay: item.pay,
        applyTime: item.applyTime,
        paymentTime: item.paymentTime,
        productType: item.productType,
        company: item.productType,
        conditions: item.conditions,
        username: item.username,
        phone: item.phone,
        orderFrom: item.orderFrom,
        withdrawType: item.withdrawType,
        userId: item.userId,
        crediBeginTime: item.crediBeginTime,
        crediEndTime: item.crediEndTime,
        totalAmount: item.totalAmount,
        amount: item.amount,
        nickName: item.nickName,
        userType: item.userType,
        orderId: item.orderId,
        reason: item.reason,
        auditTime:item.auditTime,
      };
    });
  }

    //操作日志 - table所需数据
  makeDataJournal(data3) {
    return data3.map((item, index) => {
      return {
        key: index,
        orderId: String(item.orderId),
        company: item.productType,
        conditions: item.conditions,
        username: item.username,
        operation: item.operation,
        createTime: item.createTime,
        creator:item.creator,
        auditReason:item.auditReason
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
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };

    const { searchtradeNo } = this.state;
    const { searchUserName } = this.state;
    const { searchUserMallId } = this.state;
    const { searchRealName } = this.state;
    const { searchMinPrice } = this.state;
    const { searchMaxPrice } = this.state;
    const { searchMobile } = this.state;
    const { searchPartnerTradeNo } = this.state;
    const { searchOrderId } = this.state;
    const { searchPresentNumber } = this.state;
    const suffix = searchtradeNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty0()} />
    ) : null;
    const suffix2 = searchUserName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix3 = searchUserMallId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;
    const suffix4 = searchRealName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    const suffix8 = searchMinPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty5()} />
    ) : null;
    const suffix9 = searchMaxPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty6()} />
    ) : null;
    const suffix5 = searchMobile ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty7()} />
    ) : null;
    const suffix6 = searchPartnerTradeNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty8()} />
    ) : null;
    const suffix7 = searchOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty9()} />
    ) : null;
    const suffix11 = searchPresentNumber ? (
        <Icon type="close-circle" onClick={() => this.emitEmpty10()} />
    ) : null;
    return (
      <div>
        <div className="system-search">
          {/*<Tabs type="card" onTabClick={()=>this.auditList()}>*/}
          <Tabs type="card">
            <TabPane tab="提现记录" key="1">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>提现单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={v => this.searchPartnerTradeNoChange(v)}
                        value={searchPartnerTradeNo}
                        suffix={suffix6}
                      />
                    </li>
                    <li>
                      <span>提现金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinPriceChange(v)}
                        value={searchMinPrice}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxPriceChange(e)}
                        value={searchMaxPrice}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>申请提现时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchApplyBeginTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchApplyEndTime(e)}
                        onOk={onOk}
                      />
                    </li>
                    <li>
                      <span>提现状态</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchFlagChange(e)}
                      >
                        <Option value={1}>提现成功</Option>
                        <Option value={2}>提现失败</Option>
                      </Select>
                    </li>
                    <li>
                      <span>提现方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchCashTypeChange(e)}
                      >
                        <Option value={1}>微信零钱</Option>
                      </Select>
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchTradeNoChange(e)}
                        suffix={suffix}
                        value={searchtradeNo}
                      />
                    </li>
                    <li>
                      <span>用户身份</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserTypeChange(e)}
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
                      <span style={{ marginRight: "10px" }}>提现到账时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchBeginTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchEndTime(e)}
                        onOk={onOk}
                      />
                    </li>
                    <li>
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserMallIdChange(e)}
                        value={searchUserMallId}
                        suffix={suffix3}
                      />
                    </li>
                    <li>
                      <span>用户昵称</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserNameChange(e)}
                        value={searchUserName}
                        suffix={suffix2}
                      />
                    </li>
                    <li>
                      <span>用户姓名</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchRealNameChange(e)}
                        value={searchRealName}
                        suffix={suffix4}
                      />
                    </li>
                    <li>
                      <span>用户手机号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchMobileChange(e)}
                        value={searchMobile}
                        suffix={suffix5}
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
                    <Button icon="download" type="primary" onClick={()=>this.onExport()}>
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
              </div>
              {/* 查看详情模态框 */}
              <Modal
                title="查看详情"
                visible={this.state.queryModalShow}
                onOk={() => this.onQueryModalClose()}
                onCancel={() => this.onQueryModalClose()}
                wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="提现单号" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.state.nowData.partnerTradeNo
                      : ""}
                  </FormItem>
                  <FormItem label="提现金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.amount : ""}
                  </FormItem>
                  <FormItem label="申请提现时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.applyTime : ""}
                  </FormItem>
                  <FormItem label="提现状态" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.flgType(this.state.nowData.flag)
                      : ""}
                  </FormItem>
                  <FormItem label="提现方式" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.getWithdrawType(this.state.nowData.withdrawType)
                      : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentNo : ""}
                  </FormItem>
                  <FormItem label="提现到账时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentTime : ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.getListByModelId(this.state.nowData.userType)
                      : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="用户昵称" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.nickName : ""}
                  </FormItem>
                  <FormItem label="用户姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.username : ""}
                  </FormItem>
                  <FormItem label="用户手机号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.phone : ""}
                  </FormItem>
                  <FormItem
                      label="审核时间"
                      {...formItemLayout}
                      className={this.state.flag == 2 ? "hide" : ""}
                  >
                      {!!this.state.nowData ? this.state.nowData.auditTime : ""}
                  </FormItem>
                  <FormItem
                      label="审核时间"
                      {...formItemLayout}
                      className={this.state.flag == 1 ? "hide" : ""}
                  >
                      {!!this.state.nowData ? this.state.nowData.auditTime : ""}
                  </FormItem>
                  <FormItem
                    label="提现失败理由"
                    {...formItemLayout}
                    className={this.state.flag == 1 ? "hide" : ""}
                  >
                    {!!this.state.nowData ? this.state.nowData.reason : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="提现明细" key="2">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>提现单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={v => this.searchPartnerTradeNoChange(v)}
                        value={searchPartnerTradeNo}
                        suffix={suffix6}
                      />
                    </li>
                    <li>
                      <span>订单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={v => this.searchOrderIdChange(v)}
                        value={searchOrderId}
                        suffix={suffix7}
                      />
                    </li>
                    <li>
                      <span>提现金额</span>
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最小价格"
                        onChange={v => this.searchMinPriceChange(v)}
                        value={searchMinPrice}
                        suffix={suffix8}
                      />
                      --
                      <Input
                        style={{ width: "80px" }}
                        min={0}
                        max={999999}
                        placeholder="最大价格"
                        onChange={e => this.searchMaxPriceChange(e)}
                        value={searchMaxPrice}
                        suffix={suffix9}
                      />
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>申请提现时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchApplyBeginTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchApplyEndTime(e)}
                        onOk={onOk}
                      />
                    </li>
                    <li>
                      <span>提现状态</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchFlagChange(e)}
                      >
                        <Option value={1}>提现成功</Option>
                        <Option value={2}>提现失败</Option>
                      </Select>
                    </li>
                    <li>
                      <span>提现方式</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchCashTypeChange(e)}
                      >
                        <Option value={1}>微信零钱</Option>
                      </Select>
                    </li>
                    <li>
                      <span>流水号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchTradeNoChange(e)}
                        suffix={suffix}
                        value={searchtradeNo}
                      />
                    </li>
                    <li>
                      <span>产品公司</span>
                      <Select
                        allowClear
                        placeholder="全部"
                        style={{ width: "172px" }}
                        onChange={e => this.searchProductType(e)}
                      >
                        <Option value={1}>翼猫科技发展（上海）有限公司</Option>
                        <Option value={2}>上海养未来健康食品有限公司</Option>
                        <Option value={3}>上海翼猫生物科技有限公司</Option>
                        <Option value={4}>上海翼猫智能科技有限公司</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>提现到账时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchBeginTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchEndTime(e)}
                        onOk={onOk}
                      />
                    </li>
                    <li>
                      <span>用户身份</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserTypeChange(e)}
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
                        onChange={e => this.searchUserMallIdChange(e)}
                        value={searchUserMallId}
                        suffix={suffix3}
                      />
                    </li>
                    <li>
                      <span>用户昵称</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserNameChange(e)}
                        value={searchUserName}
                        suffix={suffix2}
                      />
                    </li>
                    <li>
                      <span>用户姓名</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchRealNameChange(e)}
                        value={searchRealName}
                        suffix={suffix4}
                      />
                    </li>
                    <li>
                      <span>用户手机号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchMobileChange(e)}
                        value={searchMobile}
                        suffix={suffix5}
                      />
                    </li>
                    <li style={{ marginLeft: "40px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchDetail()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li>
                      <Button icon="download" type="primary" onClick={()=>this.onExportDetail()}>
                        导出
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsList()}
                    dataSource={this.makeDataDetail(this.state.data2)}
                    scroll={{ x: 2000 }}
                    pagination={{
                      total: this.state.total2,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeDetail(page, pageSize)
                    }}
                  />
                </div>
              </div>
              {/* 查看详情模态框 */}
              <Modal
                title="查看详情"
                visible={this.state.queryModalShow2}
                onOk={() => this.onQueryModalClose()}
                onCancel={() => this.onQueryModalClose()}
                wrapClassName={"list"}
              >
                <Form>
                  <FormItem label="提现单号" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.state.nowData.partnerTradeNo
                      : ""}
                  </FormItem>
                  <FormItem label="订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.orderId : ""}
                  </FormItem>
                  <FormItem label="提现金额" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.amount : ""}
                  </FormItem>
                  <FormItem label="申请提现时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.applyTime : ""}
                  </FormItem>
                  <FormItem label="提现状态" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.flgType(this.state.nowData.flag)
                      : ""}
                  </FormItem>
                  <FormItem label="提现方式" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.getWithdrawType(this.state.nowData.withdrawType)
                      : ""}
                  </FormItem>
                  <FormItem label="流水号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentNo : ""}
                  </FormItem>
                  <FormItem label="提现到账时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.paymentTime : ""}
                  </FormItem>
                  <FormItem label="产品类型" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.findProductNameById(this.state.nowData.productType)
                      : ""}
                  </FormItem>
                  <FormItem label="产品公司" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.Productcompany(this.state.nowData.company)
                      : ""}
                  </FormItem>
                  <FormItem label="用户身份" {...formItemLayout}>
                    {!!this.state.nowData
                      ? this.getListByModelId(this.state.nowData.userType)
                      : ""}
                  </FormItem>
                  <FormItem label="用户id" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.userId : ""}
                  </FormItem>
                  <FormItem label="用户昵称" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.nickName : ""}
                  </FormItem>
                  <FormItem label="用户姓名" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.username : ""}
                  </FormItem>
                  <FormItem label="用户手机号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.phone : ""}
                  </FormItem>
                  <FormItem
                    label="审核时间"
                    {...formItemLayout}
                    className={this.state.flag == 2 ? "hide" : ""}
                  >
                    {!!this.state.nowData ? this.state.nowData.auditTime : ""}
                  </FormItem>
                  <FormItem
                    label="审核时间"
                    {...formItemLayout}
                    className={this.state.flag == 1 ? "hide" : ""}
                  >
                    {!!this.state.nowData ? this.state.nowData.auditTime : ""}
                  </FormItem>
                  <FormItem
                    label="提现失败理由"
                    {...formItemLayout}
                    className={this.state.flag == 1 ? "hide" : ""}
                  >
                    {!!this.state.nowData ? this.state.nowData.reason : ""}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="操作日志" key="3">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>提现单号查询</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={v => this.searchPresentNumber(v)}
                        value={searchPresentNumber}
                        suffix={suffix11}
                      />
                    </li>
                    <li>
                      <span>操作</span>
                      <Select
                        placeholder="全部"
                        allowClear
                        style={{ width: "172px" }}
                        onChange={e => this.searchFlagChange2(e)}
                      >
                        <Option value={'审核通过'}>审核通过</Option>
                        <Option value={'审核不通过'}>审核不通过</Option>
                      </Select>
                    </li>
                    <li>
                      <span style={{ marginRight: "10px" }}>操作时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchMinTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchMaxTime(e)}
                        onOk={onOk}
                      />
                    </li>
                    <li style={{ marginLeft: "40px" }}>
                      <Button
                          icon="search"
                          type="primary"
                          onClick={() => this.onSearchJournal()}
                      >
                        搜索
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsJournal()}
                    dataSource={this.makeDataJournal(this.state.data3)}
                    pagination={{
                      total: this.state.total3,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      showQuickJumper: true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChangeJournal(page, pageSize)
                    }}
                  />
                </div>
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
        findProductModelByWhere,
        onChange,
        onOk,
        cashRecord,
        onChange4,
        warning,
        findProductTypeByWhere,
        WithdrawalsRevoke,
        RecordDetail,
        WithdrawLog
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
