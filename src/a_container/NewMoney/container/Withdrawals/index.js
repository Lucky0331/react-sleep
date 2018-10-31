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
  Popconfirm,
  message,
  Modal,
  Tooltip,
  Tabs,
  Checkbox,
  Popover,
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
  WithdrawLog,
  WithdrawalsAudit,
  WithdrawalsAuditEgis
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data0: [], // 提现审核全部数据
      data: [], // 提现记录全部数据
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
      defaultValue: "", // 拒绝理由
      searchMobile: "", //搜索 - 用户手机号
      searchRealName: "", // 搜索 - 用户真实姓名
      searchFlag: "", //搜索 - 提现状态
      searchFlag2:"", //搜索 - 操作方式
      searchUserMallId: "", // 搜索 - 用户翼猫id
      searchPartnerTradeNo: "", //搜索 - 提现单号
      searchOrderId: "", // 搜索 - 子订单号
      searchMainOrderId: '',//搜索 - 主订单号
      searchPresentNumber:"", //搜索 - 子提现单号
      searchMainNumber:'',//搜索 - 主提现单号
      searchOperationBegin:"",//搜索 - 操作开始时间
      searchOperationEnd:"", //搜索 - 操作结束时间
      searchRefundEndTime:'',//搜索 - 提现审核结束时间
      searchRefundTime:'',//搜索 - 提现审核开始时间
      searchMinTime:"", //搜索 - 操作开始时间-操作日志
      searchMaxTime:"", //搜索 - 操作结束时间-操作日志
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total0: 0, // 提现审核数据库总共多少条数据
      total: 0, // 提现记录数据库总共多少条数据
      total2: 0, // 提现明细数据库总共多少条数据
      total3: 0  , // 操作日志数据库总共多少条数据
      citys: [], // 符合Cascader组件的城市数据
      tabKey:1,//tab页默认值
      indeterminate: true,
      checkAll: false, // 全选按钮是否被勾选
      checkReturnAll: false, //反选按钮是否被勾选
      selectedKeys: [], // 被选中的项 列进数组
      visible: false, //控制悬浮层属性
      visible2: false, //控制右侧悬浮层属性
      reason: "提现审核未通过，如有疑问，请联系客服：4001519999"
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);//提现审核调用接口
    // this.onGetDataList(this.state.pageNum, this.state.pageSize);//提现记录调用接口
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
  
  // 提现审核 - 查询列表
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      tradeNo: this.state.searchtradeNo,
      phone: this.state.searchMobile.trim(), //用户手机号
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo.trim(), //子提现单号查询
      mainPartnerTradeNo:this.state.searchMainNumber.trim(),//主提现单号
      minApplyTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      maxApplyTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : ""
    };
    this.props.actions.WithdrawalsAudit(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data0: res.data.result || [],
          pageNum,
          pageSize,
          total0: res.data.total
        });
      } else if (res.status === "1") {
        this.setState({
          data0: [],
        });
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }

  // 查询当前页面 - 提现记录 - 所需列表数据
  onGetDataList(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,//用户身份
      withdrawType: this.state.searchWithdrawType, //提现方式
      nickName: this.state.searchUserName, //用户昵称
      username: this.state.searchRealName, //用户姓名
      paymentNo: this.state.searchtradeNo.trim(), //流水号查询
      flag: this.state.searchFlag, //提现状态
      phone: this.state.searchMobile.trim(), //用户手机号
      minAmount: this.state.searchMinPrice, //提现金额 小
      maxAmount: this.state.searchMaxPrice, //提现金额 大
      productType: this.state.searchTypeId,
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      orderId: this.state.searchOrderId.trim(), //子订单号
      userId: this.state.searchUserMallId.trim(), //用户id
      partnerTradeNo: this.state.searchPartnerTradeNo.trim(), //子提现单号查询
      mainPartnerTradeNo:this.state.searchMainNumber.trim(),//主提现单号
      minApplyTime: this.state.searchApplyBeginTime
        ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
        : "", //申请提现时间 - 开始
      maxApplyTime: this.state.searchApplyEndTime
        ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
        : "", //申请提现时间 - 结束
      minPaymentTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
        : "", //提现到账时间 - 开始
      maxPaymentTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : "", //提现到账时间 - 结束
      minAuditTime: this.state.searchRefundTime
        ? `${tools.dateToStr(this.state.searchRefundTime.utc()._d)} `
        : "", //提现审核时间 - 开始
      maxAuditTime: this.state.searchRefundEndTime
        ? `${tools.dateToStr(this.state.searchRefundEndTime.utc()._d)} `
        : "", //提现审核时间 - 结束
    };
    this.props.actions.cashRecord(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else if (res.status === "1") {
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
      userType: this.state.searchUserType,//用户身份
      withdrawType: this.state.searchWithdrawType, //提现方式
      nickName: this.state.searchUserName, //用户昵称
      username: this.state.searchRealName, //用户姓名
      paymentNo: this.state.searchtradeNo.trim(), //流水号查询
      flag: this.state.searchFlag, //提现状态
      phone: this.state.searchMobile.trim(), //用户手机号
      minAmount: this.state.searchMinPrice, //提现金额 小
      maxAmount: this.state.searchMaxPrice, //提现金额 大
      productType: this.state.searchTypeId,
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号
      orderId: this.state.searchOrderId.trim(), //子订单号
      userId: this.state.searchUserMallId.trim(), //用户id
      partnerTradeNo: this.state.searchPartnerTradeNo.trim(), //子提现单号查询
      mainPartnerTradeNo:this.state.searchMainNumber.trim(),//主提现单号
      minApplyTime: this.state.searchApplyBeginTime
        ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
        : "", //申请提现时间 - 开始
      maxApplyTime: this.state.searchApplyEndTime
        ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
        : "", //申请提现时间 - 结束
      minPaymentTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
        : "", //提现到账时间 - 开始
      maxPaymentTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : "", //提现到账时间 - 结束
      minAuditTime: this.state.searchRefundTime
        ? `${tools.dateToStr(this.state.searchRefundTime.utc()._d)} `
        : "", //提现审核时间 - 开始
      maxAuditTime: this.state.searchRefundEndTime
        ? `${tools.dateToStr(this.state.searchRefundEndTime.utc()._d)} `
        : "", //提现审核时间 - 结束
    };
    this.props.actions.RecordDetail(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data.result || [],
          pageNum,
          pageSize,
          total2: res.data.total
        });
      } else if (res.status === "1") {
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
      partnerTradeNo: String(this.state.searchPresentNumber),//子提现单号
      operation:this.state.searchFlag2,
      minTime: this.state.searchMinTime
        ? `${tools.dateToStr(this.state.searchMinTime.utc()._d)}`
        : "",
      maxTime: this.state.searchMaxTime
        ? `${tools.dateToStr(this.state.searchMaxTime.utc()._d)} `
        : ""
    };
    this.props.actions.WithdrawLog(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        console.log('data:', res);
        this.setState({
          data3: res.data.result || [],
          pageNum,
          pageSize,
          total3: res.data.total
        });
      }
    });
  }
  
  //工具 - 根据ID拿到退款中的partnerTradeNo
  getPartnerTradeNo(selectedKeys) {
    const t = this.state.data0.filter((item, index) =>
      selectedKeys.includes(index)
    );
    console.log("是个什么：", t.map(item => item.partnerTradeNo).join(","));
    return t.map(item => item.partnerTradeNo).join(",");
  }
  
  //操作全选按钮逻辑功能
  onCheckAllChange(e) {
    this.setState({
      checkAll: e.target.checked
    });
    if (e.target.checked) {
      // 选中
      this.setState({
        selectedKeys: this.state.data0.map((item, index) => index)
      });
    } else {
      this.setState({
        selectedKeys: []
      });
    }
  }
  
  // 反选按钮逻辑
  onCheckRuturnChange(e) {
    const ed = this.state.selectedKeys;
    const all = this.state.data0.map((item, index) => index);
    const res = all.filter((item, index) => {
      return !ed.includes(item);
    });
    this.setState({
      selectedKeys: res,
      checkReturnAll: e.target.checked
    });
    if (res.length === all.length) {
      this.setState({
        checkAll: true,
        checkReturnAll: false
      });
    } else {
      this.setState({
        checkAll: false
      });
    }
  }
  
  // 表格的全选反选逻辑配置
  initChose() {
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log("这是什么！", selectedRowKeys, selectedRows);
        if (selectedRowKeys.length === this.state.data0.length) {
          this.setState({
            checkAll: true
          });
        } else {
          this.setState({
            checkAll: false
          });
        }
        this.setState({
          selectedKeys: selectedRowKeys
        });
      },
      selectedRowKeys: this.state.selectedKeys
    };
    return rowSelection;
  }
  
  //批量审核通过按钮配置
  onAdopt() {
    const params = {
      partnerTradeNo: this.getPartnerTradeNo(this.state.selectedKeys),
      isAudit: true
    };
    this.setState({
      visible: false,
      visible2: false
    });
    this.props.actions
      .WithdrawalsAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else if (res.status === "1") {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  //单条审核通过按钮配置
  onAdoptAlone(record) {
    const params = {
      partnerTradeNo: record.partnerTradeNo,
      isAudit: true
    };
    this.setState({
      visible: false,
      visible2: false
    });
    this.props.actions
      .WithdrawalsAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success(res.message || "修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  //批量审核不通过按钮配置
  onAdoptNo() {
    const params = {
      partnerTradeNo: this.getPartnerTradeNo(this.state.selectedKeys),
      isAudit: false,
      reason: this.state.reason || ""
    };
    this.setState({
      visible: false,
      visible2: false,
      checkAll: false,
      selectedKeys: []
    });
    this.props.actions
      .WithdrawalsAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  //单条审核不通过的按钮配置
  onAdoptNoAlone(record) {
    const params = {
      partnerTradeNo: record.partnerTradeNo,
      isAudit: false,
      reason: this.state.reason || ""
    };
    this.setState({
      visible: false,
      visible2: false
    });
    this.props.actions
      .WithdrawalsAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  //审核不通过要传进来的值
  Reason(e) {
    this.setState({
      reason: e.target.value
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
        if (res.status === "0") {
          this.setState({
            productTypes: res.data.result
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
  
  emitEmpty11() {
    this.setState({
      searchMainOrderId: ""
    });
  }
  
  emitEmpty12() {
    this.setState({
      searchMainNumber: ""
    });
  }
  
  //悬浮层显示框
  hide() {
    this.setState({
      visible: false
    });
  }
  
  //悬浮层显示框
  handleVisibleChange(e) {
    this.setState({
      visible: e
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
  
  //根据提现方式id返回名称
  WithdrawType(id) {
    switch (String(id)) {
      case "1":
        return "微信零钱";
    }
  }
  
  //根据提现状态id返回名称
  WithdrawStatus(id) {
    switch (String(id)) {
      case "1":
        return "审核通过";
      case "2":
        return "审核不通过";
      case "3":
        return "待审核";
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
  
  //搜索 - 主订单号
  searchMainOrderIdChange(e) {
    this.setState({
      searchMainOrderId: e.target.value
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

  //搜索 - 子提现单号
  searchPartnerTradeNoChange(e) {
    this.setState({
      searchPartnerTradeNo: e.target.value
    });
  }
  
  //搜索 - 主提现单号
  searchMainNumberChange(e) {
    this.setState({
      searchMainNumber: e.target.value
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

  //搜索 - 子订单号
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
  
  //搜索 - 提现审核开始时间
  searchRefundTime(v) {
    this.setState({
      searchRefundTime: _.cloneDeep(v)
    });
  }
  
  //搜索 - 提现结束结束时间
  searchRefundEndTime(v) {
    this.setState({
      searchRefundEndTime: _.cloneDeep(v)
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
  
  //搜索 - 用户手机号查询
  searchPhoneChange(e) {
    this.setState({
      searchMobile: e.target.value
    });
  }

  // 搜索 - 提现审核
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  // 搜索 - 提现记录
  onSearchList() {
    this.onGetDataList(1, this.state.pageSize);
  }

  // 搜索 - 提现明细
  onSearchDetail() {
    this.onGetDataDetail(1, this.state.pageSize);
  }

  //搜索 - 操作日志
  onSearchJournal(){
    this.onGetDataJournal(1, this.state.pageSize);
  }
  
  //提现审核 - 导出
  onExportAuditing() {
    this.onExportDataAuditing(this.state.pageNum, this.state.pageSize);
  }

  //提现记录 - 导出
  onExportList() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }
  
  //提现明细 - 导出
  onExportDetail(){
    this.onExportDataDetail(this.state.pageNum, this.state.pageSize);
  }
  
  // 导出提现审核列表数据
  onExportDataAuditing(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      tradeNo: this.state.searchtradeNo,
      phone: this.state.searchMobile,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo.trim(), //子提现单号查询
      mainPartnerTradeNo:this.state.searchMainNumber.trim(),//主提现单号
      minApplyTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      maxApplyTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : ""
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/withdraw/audit`,'post', '提现审核.xls')
  }
  
  // 导出提现记录列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,//用户身份
      withdrawType: this.state.searchWithdrawType, //提现方式
      nickName: this.state.searchUserName, //用户昵称
      username: this.state.searchRealName, //用户姓名
      paymentNo: this.state.searchtradeNo.trim(), //流水号查询
      flag: this.state.searchFlag, //提现状态
      phone: this.state.searchMobile, //用户手机号
      minAmount: this.state.searchMinPrice, //提现金额 小
      maxAmount: this.state.searchMaxPrice, //提现金额 大
      productType: this.state.searchTypeId,
      userId: this.state.searchUserMallId, //用户id
      partnerTradeNo: this.state.searchPartnerTradeNo.trim(), //子提现单号查询
      mainPartnerTradeNo:this.state.searchMainNumber.trim(),//主提现单号
      minApplyTime: this.state.searchApplyBeginTime
        ? `${tools.dateToStr(this.state.searchApplyBeginTime.utc()._d)} `
        : "", //申请提现时间 - 开始
      maxApplyTime: this.state.searchApplyEndTime
        ? `${tools.dateToStr(this.state.searchApplyEndTime.utc()._d)} `
        : "", //申请提现时间 - 结束
      minPaymentTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)} `
        : "", //提现到账时间 - 开始
      maxPaymentTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : "", //提现到账时间 - 结束
      minAuditTime: this.state.searchRefundTime
        ? `${tools.dateToStr(this.state.searchRefundTime.utc()._d)} `
        : "", //提现审核时间 - 开始
      maxAuditTime: this.state.searchRefundEndTime
        ? `${tools.dateToStr(this.state.searchRefundEndTime.utc()._d)} `
        : "", //提现审核时间 - 结束
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/withdraw/record`,'post', '提现记录.xls')
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
      paymentNo: this.state.searchtradeNo.trim(),
      flag: this.state.searchFlag,
      phone: this.state.searchMobile,
      orderId: this.state.searchOrderId.trim(),
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      productType: this.state.searchTypeId,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo.trim(), //子提现单号查询
      mainPartnerTradeNo:this.state.searchMainNumber.trim(),//主提现单号
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
        : "",
      minAuditTime: this.state.searchRefundTime
        ? `${tools.dateToStr(this.state.searchRefundTime.utc()._d)} `
        : "",
      maxAuditTime: this.state.searchRefundEndTime
        ? `${tools.dateToStr(this.state.searchRefundEndTime.utc()._d)} `
        : "",
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/withdraw/detail`,'post', '提现明细.xls');
  }

  // 查询提现纪录某一条数据的详情
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
  
  // 提现审核--表单页码改变
  onTablePageChangeAudie(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }

  // 提现记录--表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetDataList(page, pageSize);
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
  
  // 页码每页显示多少条展示
  onShowSizeChange(current, pageSize) {
    console.log("显示多少条:", current, pageSize);
    this.onGetData(current, pageSize);
  }
  
  //运营数据 tab操作
  onSearchJump(e){
    if(e==1){
      this.onGetData(1, this.state.pageSize);
    }else if(e==2){
      this.onGetDataList(1, this.state.pageSize);
    }else if(e==3){
      this.onGetDataDetail(1, this.state.pageSize);
    }else if(e==4){
      this.onGetDataJournal(1, this.state.pageSize);
    }
    this.setState({
      tabKey:e
    })
  }
  
  // 构建字段 - 提现审核
  makeColumns() {
    const columns = [
      {
        title: "主提现单号",
        dataIndex:'mainPartnerTradeNo',
        key:'mainPartnerTradeNo'
      },
      {
        title: "子提现单号",
        dataIndex: "partnerTradeNo",
        key: "partnerTradeNo"
      },
      {
        title:'产品公司',
        dataIndex: "company",
        key: "company",
        render: text => this.Productcompany(text)
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
        dataIndex: "withdrawStatus",
        key: "withdrawStatus",
        render: text => this.WithdrawStatus(text)
      },
      {
        title: "提现方式",
        dataIndex: "withdrawType",
        key: "withdrawType",
        render: text => this.WithdrawType(text)
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
        width: 120,
        render: (text, record) => {
          const controls = [];
          record.withdrawStatus === 3 &&
          controls.push(
              <Popconfirm
                title="确定审核通过吗?"
                onConfirm={() => this.onAdoptAlone(record)}
                okText="确定"
                cancelText="取消"
              >
                <span key="0" className="control-btn green">
                  <Tooltip placement="top" title="审核通过">
                    <Icon type="check-circle-o" />
                  </Tooltip>
                </span>
              </Popconfirm>
          );
          record.withdrawStatus === 3 &&
          controls.push(
            <Popconfirm
              title={
                <div style={{height:'65px'}}>
                <TextArea
                  placeholder="请输入拒绝理由"
                  autosize={{ minRows: 1, maxRows: 4 }}
                  value={this.state.reason}
                  defaultValue="退款审核未通过，如有疑问，请联系客服：4001519999"
                  onChange={e => this.Reason(e)}
                />
                </div>
              }
                trigger="click"
                placement="bottom"
                onCancel={() => this.onAddNewClose()}
                onConfirm={() => this.onAdoptNoAlone(record)}
            >
              <span key="1" className="control-btn red">
                <Tooltip placement="top" title="审核不通过">
                  <Icon type="close-circle-o" />
                </Tooltip>
              </span>
            </Popconfirm>
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
  
  // 构建字段  -- 提现记录
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
        title: "主提现单号",
        dataIndex:'mainPartnerTradeNo',
        key:'mainPartnerTradeNo'
      },
      {
        title: "子提现单号",
        dataIndex: "partnerTradeNo",
        key: "partnerTradeNo"
      },
      {
        title:'产品公司',
        dataIndex: "company",
        key: "company",
        render: text => this.Productcompany(text)
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
        title: "提现审核时间",
        dataIndex: "auditTime",
        key: "auditTime"
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
  makeColumnsDetail() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title: "主提现单号",
        dataIndex:'mainPartnerTradeNo',
        key:'mainPartnerTradeNo'
      },
      {
        title: "子提现单号",
        dataIndex: "partnerTradeNo",
        key: "partnerTradeNo"
      },
      {
        title:'产品公司',
        dataIndex: "company",
        key: "company",
        render: text => this.Productcompany(text)
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
        title: "提现审核时间",
        dataIndex: "auditTime",
        key: "auditTime"
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
        render: text => this.findProductNameById(text)
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
      title: "子提现单号",
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
        partnerTradeNo: item.partnerTradeNo,//子提现单号
        mainPartnerTradeNo:item.mainPartnerTradeNo,//主提现单号
        paymentNo: item.paymentNo,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.createTime,
        pay: item.pay,
        mainOrderId:item.mainOrderId,//主订单号
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
        withdrawStatus:item.withdrawStatus,//提现状态
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
        partnerTradeNo: item.partnerTradeNo,//子提现单号
        mainPartnerTradeNo:item.mainPartnerTradeNo,//主提现单号
        paymentNo: item.paymentNo,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.createTime,
        mainOrderId:item.mainOrderId,//主订单号
        orderId:item.orderId,//子订单号
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
        orderId: String(item.orderId),//子提现单号
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
    const { searchMainOrderId } = this.state;
    const { searchMainNumber } = this.state;
    const suffix = searchtradeNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty0()} />
    ) : null;
    const suffix1 = searchMainNumber ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty12()} />
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
    const suffix10 = searchMainOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty11()} />
    ) : null;
    const suffix11 = searchPresentNumber ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty10()} />
    ) : null;
    return (
      <div>
        <div className="system-search">
          <Tabs type="card" onChange={(e) => this.onSearchJump(e)}>
            <TabPane tab="提现审核" key="1">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主提现单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchMainNumberChange(e)}
                        value={searchMainNumber}
                        suffix={suffix1}
                      />
                    </li>
                    <li>
                      <span>子提现单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchPartnerTradeNoChange(e)}
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
                        onChange={e => this.searchEndTime(e)}
                        onOk={onOk}
                      />
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
                      <span>用户id</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchUserMallIdChange(e)}
                        value={searchUserMallId}
                        suffix={suffix3}
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
                        onChange={e => this.searchPhoneChange(e)}
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
                      <Button icon="download" type="primary" onClick={()=>this.onExportAuditing()}>
                        导出
                      </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <span style={{ margin: "0 10px" }}>
              <Checkbox
                onChange={e => this.onCheckAllChange(e)}
                checked={this.state.checkAll}
                style={{ margin: "0 10px" }}
              />全选
            </span>
            <span style={{ margin: "0 10px 0 0" }}>
              <Checkbox
                onChange={e => this.onCheckRuturnChange(e)}
                checked={this.state.checkReturnAll}
                style={{ margin: "0 20px 0 0" }}
              />反选
            </span>
            <Popconfirm
              title="确定批量审核通过吗?"
              placement="bottom"
              onConfirm={() => this.onAdopt()}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="primary"
                style={{ height: "25px", marginRight: "10px" }}
              >
                批量审核通过
              </Button>
            </Popconfirm>
            <Popover
              content={
                <div>
            <TextArea
              autosize={{ minRows: 1, maxRows: 4 }}
              value={this.state.reason}
              defaultValue="提现审核未通过，如有疑问，请联系客服：4001519999"
              onChange={e => this.Reason(e)}
            />
              <ul
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <li style={{ width: "40px" }}>
                  <a onClick={e => this.onAdoptNo()}>确定</a>
                </li>
                <li style={{ width: "40px" }}>
                  <a onClick={e => this.hide(e)}>取消</a>
                </li>
              </ul>
              </div>
              }
              title="请输入拒绝理由"
              trigger="click"
              placement="bottom"
              visible={this.state.visible}
              onVisibleChange={e => this.handleVisibleChange(e)}
              >
                <Button type="primary" style={{ height: "25px" }}>
                  批量审核不通过
                </Button>
                </Popover>
                </div>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns()}
                  dataSource={this.makeData(this.state.data0)}
                  rowSelection={this.initChose()}
                  pagination={{
                    total: this.state.total0,
                    current: this.state.pageNum,
                    pageSize: this.state.pageSize,
                    showQuickJumper: true,
                    showSizeChanger: true,
                    defaultCurrent: 3,
                    onShowSizeChange: (current, pageSize) =>
                      this.onShowSizeChange(current, pageSize),
                    pageSizeOptions: ["10", "30", "50"],
                    showTotal: (total, range) => `共 ${total} 条数据`,
                    onChange: (page, pageSize) =>
                      this.onTablePageChangeAudie(page, pageSize)
                  }}
                />
              </div>
              </div>
            </TabPane>
            <TabPane tab="提现记录" key="2">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主提现单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchMainNumberChange(e)}
                        value={searchMainNumber}
                        suffix={suffix1}
                      />
                    </li>
                    <li>
                      <span>子提现单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchPartnerTradeNoChange(e)}
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
                    <li>
                      <span style={{ marginRight: "10px" }}>提现审核时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchRefundTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchRefundEndTime(e)}
                        onOk={onOk}
                      />
                    </li>
                    <li style={{ marginLeft: "40px" }}>
                      <Button
                        icon="search"
                        type="primary"
                        onClick={() => this.onSearchList()}
                      >
                        搜索
                      </Button>
                    </li>
                    <li>
                    <Button icon="download" type="primary" onClick={()=>this.onExportList()}>
                      导出
                    </Button>
                    </li>
                  </ul>
                </div>
                <div className="system-table">
                  <Table
                    columns={this.makeColumnsList()}
                    dataSource={this.makeData(this.state.data)}
                    scroll={{ x: 2600 }}
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
                  <FormItem label="主提现单号" {...formItemLayout}>
                    {!!this.state.nowData? this.state.nowData.mainPartnerTradeNo : ""}
                  </FormItem>
                  <FormItem label="子提现单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.partnerTradeNo : ""}
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
                    label="提现审核时间"
                    {...formItemLayout}
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
            <TabPane tab="提现明细" key="3">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>主提现单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchMainNumberChange(e)}
                        value={searchMainNumber}
                        suffix={suffix1}
                      />
                    </li>
                    <li>
                      <span>子提现单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchPartnerTradeNoChange(e)}
                        value={searchPartnerTradeNo}
                        suffix={suffix6}
                      />
                    </li>
                    <li>
                      <span>主订单号</span>
                      <Input
                        style={{ width: "172px" }}
                        onChange={e => this.searchMainOrderIdChange(e)}
                        suffix={suffix10}
                        value={searchMainOrderId}
                      />
                    </li>
                    <li>
                      <span>子订单号</span>
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
                    <li>
                      <span style={{ marginRight: "10px" }}>提现审核时间</span>
                      <DatePicker
                        showTime={{
                          defaultValue: moment("00:00:00", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="开始时间"
                        onChange={e => this.searchRefundTime(e)}
                        onOk={onOk}
                      />
                      --
                      <DatePicker
                        showTime={{
                          defaultValue: moment("23:59:59", "HH:mm:ss")
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="结束时间"
                        onChange={e => this.searchRefundEndTime(e)}
                        onOk={onOk}
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
                    columns={this.makeColumnsDetail()}
                    dataSource={this.makeDataDetail(this.state.data2)}
                    scroll={{ x: 2600 }}
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
                  <FormItem label="主提现单号" {...formItemLayout}>
                    {!!this.state.nowData?this.state.nowData.mainPartnerTradeNo : ""}
                  </FormItem>
                  <FormItem label="子提现单号" {...formItemLayout}>
                    {!!this.state.nowData?this.state.nowData.partnerTradeNo : ""}
                  </FormItem>
                  <FormItem label="主订单号" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.mainOrderId : ""}
                  </FormItem>
                  <FormItem label="子订单号" {...formItemLayout}>
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
                  <FormItem label="提现审核时间" {...formItemLayout}>
                    {!!this.state.nowData ? this.state.nowData.auditTime : ""}
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
            <TabPane tab="操作日志" key="4">
              <div className="system-table">
                <div className="system-table">
                  <ul className="search-ul more-ul">
                    <li>
                      <span>子提现单号查询</span>
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
                        <Option value={'审核通过[成功]'}>审核通过[成功]</Option>
                        <Option value={'审核通过[失败]'}>审核通过[失败]</Option>
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
        WithdrawLog,
        WithdrawalsAudit,
        WithdrawalsAuditEgis
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
