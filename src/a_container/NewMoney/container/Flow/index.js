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
import { power } from "../../../../util/data";
import _ from "lodash";
import moment from "moment";

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
  fBIncome
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
      dataDetail: [], //分配详情数据
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      searchTypeId: undefined, // 搜索 - 类型名
      searchDistributionType: undefined, // 搜索 - 分配类型
      searchName: "", // 搜索 - 名称
      searchOrderId: "", // 搜索 - 子订单号
      searchMainOrderId:"",//搜索 - 主订单号
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
      searchAddress: [], // 搜索 - 地址
      searchActivity: "", //搜索 - 活动方式
      searchRefer: "", //搜索 - 云平台工单号
      addOrUp: "add", // 当前操作是新增还是修改
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

  // 查询当前页面所需经营收益列表数据
  onGetData(pageNum, pageSize) {
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
          data2: res.data.result || [],
          detail: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else if(res.status === "1") {
        this.setState({
          data2:[],
        })
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
      }
    });
  }

  // 导出经营收益所需列表数据
  onExportData(pageNum, pageSize) {
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
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/ticket/settleAccounts/record`,'post','健康评估-经营收益.xls')
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
  
  // 搜索 - 主订单号
  searchMainOrderIdChange(id) {
    this.setState({
      searchMainOrderId: id.target.value
    });
  }

  //搜索 - 云平台工单号
  searchReferChange(e) {
    this.setState({
      searchRefer: e.target.value
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

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchOrderId: ""
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

  // 查询经营收益数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true,
      userType: record.userType
    });
    console.log("是什么：", record);
    console.log("userType是什么：", record.userType);
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

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
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

  // 构建经营收益字段
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

  // 构建table所需数据
  makeData(data2) {
    console.log("data2是：", data2);
    return data2.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        typeCode: item.typeCode,
        orderCompleteTime: item.orderCompleteTime,
        count: item.count,
        productTypeName: item.productTypeName,
        productName: item.productName,
        productModel: item.productModel,
        orderId: item.orderId,
        serialNumber: item.serialNumber,
        undistributedFee: item.undistributedFee,
        headquartersIncome: item.headquartersIncome,
        stationIncome: item.stationIncome,
        distributorIncome: item.distributorIncome,
        balanceMonth: item.balanceMonth,
        distributorAccount: item.distributorAccount,
        distributorName: item.distributorName,
        distributorId: item.distributorId,
        distributorMoney: item.distributorMoney,
        stationArea: item.stationArea,
        userReceiveAddress: item.userReceiveAddress,
        userMobile: item.userMobile,
        activityType: item.activityType,
        stationCompanyName: item.stationCompanyName,
        stationMoney: item.stationMoney,
        orderTotalFee: item.orderTotalFee,
        orderFrom: item.orderFrom,
        userId: item.userId,
        refer: item.refer,
        distributorType: item.distributorType,
        orderCreateTime: item.orderCreateTime,
        orderPayType: item.orderPayType,
        orderStatus: item.orderStatus,
        userType: item.userType,
        mainOrderId:item.mainOrderId,//主订单号
        saleMode: item.saleMode,
        updateTime: item.updateTime,
        updater: item.updater,
        userSaleMoney: item.userSaleMoney,
        userSaleName: item.userSaleName,
        userSaleId: item.userSaleId,
        userSaleNickName: item.userSaleNickName,
        control: item.id,
        orderProductCount: item.orderProductCount,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        supplierMoney: item.supplierMoney
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

    // console.log('是啥：', this.state.productModels.filter((item) => String(item.typeId) === String(form.getFieldValue('addnewTypeId'))));
    const modelId = form.getFieldValue("addnewTypeCode");

    const { searchOrderId } = this.state;
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
            scroll={{ x: 3600 }}
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
        {/* 查看经营收益详情模态框 */}
        <Modal
          title="查看经营收益详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onChange={() => this.onQueryClick()}
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
        fBIncome
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
