/* List 产品管理/产品列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import moment from "moment";
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
  ServiceFlow,
  findSaleRuleByWhere,
  findProductTypeByWhere,
  findProductModelByWhere,
  warning
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
      data2: [], // 当前页面全部数据
      dataDetail: [], // 分配详情全部数据
      productTypes: [], // 所有的产品类型
      distributionTypes: [], //所有的分配类型
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchDistributionType: undefined, // 搜索 - 分配类型
      searchName: "", // 搜索 - 名称
      searchOrderId: "", // 搜索 - 子订单号
      searchMainOrderId:"",//搜索 - 主订单号
      searchUserId: "", // 搜索 - 用户账号
      searchHraCardId: "", //搜索 - 体检卡号
      searchSerialNumber: "", // 搜索 - 流水号
      searchRefer: "", // 搜索 - 经销商账户
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
      searchUserType:'',//用户类型
      searchAddress: [], // 搜索 - 地址
      searchActivity: "", //搜索 - 活动方式
      addOrUp: "add", // 当前操作是新增还是修改
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [] // 符合Cascader组件的城市数据
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
    this.getAllDistributionType(); //获取所有的分配类型
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

  // 查询当前页面所需服务收益列表数据
  onGetData(pageNum, pageSize) {
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
          data2: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else{
        this.setState({
          data2:[],
        })
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }

  // 导出服务收益所需列表数据
  onExportData(pageNum, pageSize) {
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
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/m/ticket/settleAccounts/record`,'post', '健康评估-服务收益.xls');
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

  // 搜索 - 子订单号查询
  searchOrderIdChange(v) {
    this.setState({
      searchOrderId: v.target.value
    });
  }
  
  // 搜索 - 主订单号
  searchMainOrderIdChange(id) {
    this.setState({
      searchMainOrderId: id.target.value
    });
  }

  //搜索 - 体检号查询
  searchHraCardIdChange(v) {
    this.setState({
      searchHraCardId: v.target.value
    });
  }

  //搜索 - 流水号查询
  searchSerialNumberChange(v) {
    this.setState({
      searchSerialNumber: v.target.value
    });
  }

  // 搜索 - 分配类型输入框值改变时触发
  searchDistributionTypeChange(id) {
    this.setState({
      searchDistributionType: id
    });
  }

  //搜索 - 流水号查询
  searchSerialNumberChange(v) {
    this.setState({
      searchSerialNumber: v.target.value
    });
  }

  // 搜索 - 最小支付时间
  searchMinPayTime(v) {
    this.setState({
      searchMinPayTime: v
    });
  }

  // 搜索 - 最大支付时间
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

  //搜索 - 活动类型
  searchActivityType(v) {
    this.setState({
      searchActivity: v
    });
  }

  // 搜索 - 结算月份
  searchPayMonthChange(v) {
    this.setState({
      searchPayMonth: v
    });
  }
  
  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 搜索 - 用户类型输入框值改变时触发
  searchUserType(c) {
    this.setState({
      searchUserType: c
    });
  }

  //工具 - 根据活动类型id获取活动名称
  getActivity(id) {
    switch (String(id)) {
      case "1":
        return "普通产品";
      case "2":
        return "活动产品";
      default:
        return "";
    }
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

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
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

  // 获取所有的分配类型
  getAllDistributionType() {
    this.props.actions
      .findSaleRuleByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            distributionTypes: res.data.result
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

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchOrderId: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchHraCardId: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchSerialNumber: ""
    });
  }

  emitEmpty3() {
    this.setState({
      searchUserId: ""
    });
  }

  emitEmpty4() {
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

  // 工具 - 根据产品类型ID返回产品类型名称
  getNameByTypeId(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据有效期type获取有效期名称
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0":
        return "长期有效";
      case "1":
        return `${time}天`;
      case "2":
        return `${time}月`;
      case "3":
        return `${time}年`;
      default:
        return "";
    }
  }

  // 工具 - 订单状态
  getConditionNameById(id) {
    switch (String(id)) {
      case 0:
        return "待付款";
      case 1:
        return "未受理";
      case 2:
        return "待发货";
      case 3:
        return "待收货";
      case 4:
        return "已完成";
      case -1:
        return "审核中";
      case -2:
        return "未通过";
      case -3:
        return "已取消";
      case -4:
        return "已关闭";
      default:
        return "";
    }
  }

  // 工具 - 订单来源
  getListByModelId(id) {
    switch (String(id)) {
      case "1":
        return "终端App";
      case "2":
        return "微信公众号";
      case "3":
        return "经销商App";
      default:
        return "";
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

  //搜索 - 用户账号查询
  searchUserIdChange(v) {
    this.setState({
      searchUserId: v.target.value
    });
  }

  // 查询服务收益数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    this.onGetData(page, pageSize);
  }

  // 产品类型改变时，重置产品型号的值位undefined
  onTypeIdChange() {
    const { form } = this.props;
    form.resetFields(["addnewTypeCode"]);
  }

  //构建分配详情字段
  columns() {
    const columns = [
      {
        title: "收益主体身份",
        dataIndex: "name",
        render: text => <a href="#">{text}</a>
      },
      {
        title: "收益主体",
        className: "column-money",
        dataIndex: "money"
      },
      {
        title: "收益金额",
        dataIndex: "address"
      }
    ];
    return columns;
  }

  // 构建服务收益字段
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
  makeData(data2) {
    console.log("data2是个啥：", data2);
    return data2.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        typeCode: item.typeCode,
        payTime: item.payTime,
        count: item.count,
        productType: item.productType,
        distributionType: item.distributionType,
        orderId: item.orderId,
        ticketNo: item.ticketNo,
        hraCardId: item.hraCardId,
        serialNumber: item.serialNumber,
        orderTime: item.orderTime,
        stationIncome: item.stationIncome,
        distributorIncome: item.distributorIncome,
        balanceMonth: item.balanceMonth,
        distributorAccount: item.distributorAccount,
        distributorName: item.distributorName,
        distributionFee: item.distributionFee,//可分配金额
        stationArea: item.stationArea,
        stationName: item.stationName,
        useTime: item.useTime,
        activityType: item.activityType,
        orderTotalFee: item.orderTotalFee,
        useArea: item.useArea,
        usedStationName: item.usedStationName,
        userId: item.userId,
        saleMode: item.saleMode,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id,
        payType: item.payType,
        productTypeName: item.productTypeName,
        productModel: item.productModel,
        productName: item.productName,
        orderFrom: item.orderFrom,
        userType:item.userType,//用户类型
        mainOrderId:item.mainOrderId,//主订单号
        allocatedAmount:item.allocatedAmount,
        orderStatus: item.orderStatus,
        productCount: item.productCount,
        userReceiveAddress: item.userReceiveAddress,
        userMobile: item.userMobile,
        orderPayType: item.orderPayType,
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
        sm: { span: 10 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    };

    const modelId = form.getFieldValue("addnewTypeCode");

    const { searchOrderId } = this.state;
    const { searchHraCardId } = this.state;
    const { searchSerialNumber } = this.state;
    const { searchUserId } = this.state;
    const { searchRefer } = this.state;
    const { searchMinOrderFee } = this.state;
    const { searchMaxOrderFee } = this.state;
    const { searchMainOrderId } = this.state;
    const suffix = searchOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix1 = searchHraCardId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix3 = searchSerialNumber ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;
    const suffix2 = searchUserId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    const suffix5 = searchRefer ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty4()} />
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
                onClick={() => this.onSearch()}
              >
                搜索
              </Button>
            </li>
            <li style={{ marginLeft: "10px" }}>
              <Button icon="download" type="primary" onClick={() => this.onExport()} >导出</Button>
            </li>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
            scroll={{ x: 2800 }}
            dataSource={this.makeData(this.state.data2)}
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
        {/* 查看服务收益详情模态框 */}
        <Modal
          title="查看服务收益详情"
          visible={this.state.queryModalShow}
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
        ServiceFlow,
        findAllProvince,
        findProductTypeByWhere,
        findProductModelByWhere,
        warning
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
