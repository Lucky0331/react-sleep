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
  statementList
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], //所有的产品类型
      productModels: [], // 所有的产品型号
      searchProductName: "", // 搜索 - 产品名称
      searchProductType: "", // 搜索 - 产品类型
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      searchTime: "", // 搜索 - 对账时间
      searchorderFrom: "", //搜索 - 订单来源
      searchName: "", // 搜索 - 状态
      searchPayType: "", //搜索 - 支付类型
      searchmchOrderIdChange: "", // 流水号查询
      searchConditions: "", //搜索 - 订单状态
      searchorderNo: "", //搜索 - 订单号
      searchRefer: "", //搜索 - 云平台工单号
      searchUserName: "", //搜索 - 用户id
      searchActivity: "", //搜索 - 活动方式
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [] // 符合Cascader组件的城市数据
    };
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的产品类型
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

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      id: this.state.searchId,
      payType: this.state.searchPayType,
      conditions: this.state.searchConditions,
      userId: this.state.searchUserName,
      productType: this.state.searchProductType,
      orderNo: this.state.searchorderNo,
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      mchOrderId: this.state.searchmchOrderIdChange,
      userType: this.state.searchType,
      refer: this.state.searchRefer,
      activityType: this.state.searchActivity,
      payBeginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      payEndTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`
        : "",
      beginTime: this.state.searchTime
        ? `${tools.dateToStrQ(this.state.searchTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchTime
        ? `${tools.dateToStrQ(this.state.searchTime._d)} 23:59:59`
        : ""
    };
    this.props.actions.statementList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.messsageBody);
      if (res.returnCode === "0") {
        this.setState({
          data: res.messsageBody.result || [],
          pageNum,
          pageSize,
          total: res.messsageBody.total
        });
      } else {
        message.error(res.returnMessaage || "获取数据失败，请重试");
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
        if (res.returnCode === "0") {
          this.setState({
            productTypes: res.messsageBody.result || []
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

  //搜索 - 对账时间的变化
  searchTime(v) {
    this.setState({
      searchTime: v,
      searchEndTime: undefined,
      searchBeginTime: undefined
    });
  }

  //搜索 - 支付状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  //搜索 - 支付方式输入框值改变时触发
  searchPayTypeChange(e) {
    this.setState({
      searchPayType: e
    });
  }

  //搜索 - 订单状态改变时触发
  searchConditionsChange(e) {
    this.setState({
      searchConditions: e
    });
  }

  //搜索 - 订单号
  searchOrderNoChange(e) {
    this.setState({
      searchorderNo: e.target.value
    });
    console.log("e是什么；", e.target.value);
  }

  //搜索 - 用户账号
  searchUserNameChange(e) {
    this.setState({
      searchUserName: e.target.value
    });
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

  //搜索 - 用户类型
  onSearchType(v) {
    this.setState({
      searchType: v
    });
  }

  //搜索 - 活动类型
  searchActivityType(v) {
    this.setState({
      searchActivity: v
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

  //搜索 - 云平台工单号
  searchReferChange(v) {
    this.setState({
      searchRefer: v.target.value
    });
  }

  //搜索 - 活动类型
  searchActivityType(v) {
    this.setState({
      searchActivity: v
    });
  }

  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: v,
      searchTime: undefined
    });
  }

  // 搜索 - 结束时间变化
  searchEndTime(v) {
    console.log("触发：", v);
    let date = v;
    const now = new Date();
    if (
      v._d.getFullYear() === now.getFullYear() &&
      v._d.getMonth() === now.getMonth() &&
      v._d.getDate() === now.getDate()
    ) {
      date = moment();
    }
    this.setState({
      searchEndTime: date,
      searchTime: undefined
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
  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }

  // 导出订单对账列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      activityType: this.state.searchActivity,
      userType: this.state.searchType,
      payType: this.state.searchPayType,
      conditions: this.state.searchConditions,
      userId: this.state.searchUserName,
      productType: this.state.searchProductType,
      orderNo: this.state.searchorderNo,
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      mchOrderId: this.state.searchmchOrderIdChange,
      payBeginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      payEndTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`
        : ""
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    form.id = "download-form";
    form.action = `${Config.baseURL}/manager/order/statementExport`;
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
    if (params.activityType) {
      newElement3.setAttribute("name", "activityType");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.activityType);
      form.appendChild(newElement3);
    }

    const newElement4 = document.createElement("input");
    if (params.userType) {
      newElement4.setAttribute("name", "userType");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.userType);
      form.appendChild(newElement4);
    }

    const newElement5 = document.createElement("input");
    if (params.payBeginTime) {
      newElement5.setAttribute("name", "payBeginTime");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.payBeginTime);
      form.appendChild(newElement5);
    }

    const newElement6 = document.createElement("input");
    if (params.payEndTime) {
      newElement6.setAttribute("name", "payEndTime");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.payEndTime);
      form.appendChild(newElement6);
    }

    const newElement7 = document.createElement("input");
    if (params.conditions) {
      newElement7.setAttribute("name", "conditions");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.conditions);
      form.appendChild(newElement7);
    }

    const newElement8 = document.createElement("input");
    if (params.payType) {
      newElement8.setAttribute("name", "payType");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.payType);
      form.appendChild(newElement8);
    }

    const newElement9 = document.createElement("input");
    if (params.userId) {
      newElement9.setAttribute("name", "userId");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.userId);
      form.appendChild(newElement9);
    }

    const newElement10 = document.createElement("input");
    if (params.productType) {
      newElement10.setAttribute("name", "productType");
      newElement10.setAttribute("type", "hidden");
      newElement10.setAttribute("value", params.productType);
      form.appendChild(newElement10);
    }

    const newElement11 = document.createElement("input");
    if (params.orderNo) {
      newElement11.setAttribute("name", "orderNo");
      newElement11.setAttribute("type", "hidden");
      newElement11.setAttribute("value", params.orderNo);
      form.appendChild(newElement11);
    }

    const newElement12 = document.createElement("input");
    if (params.minPrice) {
      newElement12.setAttribute("name", "minPrice");
      newElement12.setAttribute("type", "hidden");
      newElement12.setAttribute("value", params.minPrice);
      form.appendChild(newElement12);
    }

    const newElement13 = document.createElement("input");
    if (params.mchOrderId) {
      newElement13.setAttribute("name", "mchOrderId");
      newElement13.setAttribute("type", "hidden");
      newElement13.setAttribute("value", params.mchOrderId);
      form.appendChild(newElement13);
    }

    form.submit();
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

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }

  // 构建字段
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
        title: "订单号",
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
        render: text => this.getListByModelId(text)
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
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.findProductNameById(text)
      },
      {
        title: "产品公司",
        dataIndex: "company",
        key: "company",
        render: text => this.Productcompany(text)
      },
      {
        title: "产品型号",
        dataIndex: "modelType",
        key: "modelType"
      },
      {
        title: "数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "订单总金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "流水号",
        dataIndex: "mchOrderId",
        key: "mchOrderId"
      },
      {
        title: "支付时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "支付方式",
        dataIndex: "payType",
        key: "payType",
        render: text => this.AllpayType(text)
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
        count: item.count,
        fee: item.fee,
        openAccountFee: item.openAccountFee,
        payType: item.payType,
        orderNo: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.payRecord ? item.payRecord.createTime : "",
        name: item.product ? item.product.name : "",
        modelId: item.product ? item.product.typeCode : "",
        typeId: item.product ? item.product.typeId : "",
        company: item.product ? item.product.typeId : "",
        conditions: item.conditions,
        userName: item.userId,
        userType: item.userInfo ? item.userInfo.userType : "",
        userType2: item.distributor ? item.distributor.userType : "",
        refer: item.refer,
        pay: item.pay,
        payTime: item.payTime,
        orderFrom: item.orderFrom,
        activityType: item.activityType,
        realName: item.distributor ? item.distributor.realName : "",
        company3: item.distributor ? item.distributor.company : "",
        distributorAccount: item.distributor
          ? item.distributor.distributorAccount
          : "",
        id: item.distributor ? item.distributor.id : "",
        userId: item.userInfo.id,
        modelType: item.modelType,
        mchOrderId: item.payRecord ? item.payRecord.mchOrderId : "",
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
        customerPhone: item.customer ? item.customer.phone : "",
        ambassadorAccount: item.ambassador
          ? item.ambassador.ambassadorAccount
          : "",
        userName2: item.ambassador ? item.ambassador.userName : "",
        companyName: item.customer ? item.customer.site.companyName : ""
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
    const { searchMinPrice } = this.state;
    const { searchMaxPrice } = this.state;
    const { searchRefer } = this.state;
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
    const suffix8 = searchMinPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty5()} />
    ) : null;
    const suffix9 = searchMaxPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty6()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>订单号查询</span>
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
              <span>用户id</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix2}
                value={searchUserName}
                onChange={e => this.searchUserNameChange(e)}
              />
            </li>
            <li>
              <span>用户类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.onSearchType(e)}
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
              <span>流水号查询</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix3}
                value={searchmchOrderIdChange}
                onChange={e => this.mchOrderIdChange(e)}
              />
            </li>
            <li>
              <span>支付方式</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchPayTypeChange(e)}
              >
                <Option value={1}>微信支付</Option>
                <Option value={2}>支付宝支付</Option>
              </Select>
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
            {/*<li>*/}
            {/*<span style={{width:'50px'}}>对账日期</span>*/}
            {/*<DatePicker*/}
            {/*value={this.state.searchTime}*/}
            {/*onChange={(e) =>this.searchTime(e)}*/}
            {/*/>*/}
            {/*</li>*/}
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
            scroll={{ x: 2000 }}
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
        <Modal
          title="查看地区"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="服务站地区" {...formItemLayout}>
              <span style={{ color: "#888" }}>
                {this.state.nowData &&
                this.state.addOrUp === "up" &&
                this.state.nowData.province &&
                this.state.nowData.city &&
                this.state.nowData.region
                  ? `${this.state.nowData.province}/${
                      this.state.nowData.city
                    }/${this.state.nowData.region}`
                  : null}
              </span>
              {getFieldDecorator("addnewCitys", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择区域" }]
              })(
                <Cascader
                  placeholder="请选择服务区域"
                  options={this.state.citys}
                  loadData={e => this.getAllCitySon(e)}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
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
            <FormItem label="订单号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.orderNo : ""}
            </FormItem>
            <FormItem label="云平台工单号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.refer : ""}
            </FormItem>
            <FormItem label="订单状态" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getListByModelId(this.state.nowData.conditions)
                : ""}
            </FormItem>
            <FormItem label="订单来源" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getSource(this.state.nowData.orderFrom)
                : ""}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.findProductNameById(this.state.nowData.typeId)
                : ""}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.modelType : ""}
            </FormItem>
            <FormItem label="产品名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="产品公司" {...formItemLayout}>
              {!!this.state.nowData
                ? this.Productcompany(this.state.nowData.company)
                : ""}
            </FormItem>
            <FormItem label="用户id" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.userId : ""}
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getActivity(this.state.nowData.activityType)
                : ""}
            </FormItem>
            <FormItem label="下单时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="数量" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.count : ""}
            </FormItem>
            <FormItem label="订单总金额" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.fee : ""}
            </FormItem>
            <FormItem label="用户类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getUserType(this.state.nowData.userType)
                : ""}
            </FormItem>
            <FormItem label="流水号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.mchOrderId : ""}
            </FormItem>
            <FormItem label="支付方式" {...formItemLayout}>
              {!!this.state.nowData
                ? this.AllpayType(this.state.nowData.payType)
                : ""}
            </FormItem>
            <FormItem label="支付状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.pay) === true ? (
                  <span>已支付</span>
                ) : (
                  <span>未支付</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="支付时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.payTime : ""}
            </FormItem>
            <FormItem label="经销商id" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.id : ""}
            </FormItem>
            <FormItem label="经销商账户" {...formItemLayout}>
              {!!this.state.nowData
                ? this.state.nowData.distributorAccount
                : ""}
            </FormItem>
            <FormItem label="经销商身份" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getUserType(this.state.nowData.userType2)
                : ""}
            </FormItem>
            <FormItem
              label="用户收货地址"
              {...formItemLayout}
              className={this.state.typeId == 5 ? "hide" : ""}
            >
              {!!this.state.nowData
                ? this.getAddress(
                    this.state.nowData.province,
                    this.state.nowData.city,
                    this.state.nowData.region,
                    this.state.nowData.street
                  )
                : ""}
            </FormItem>
            <FormItem
              label="用户收货手机号"
              {...formItemLayout}
              className={this.state.typeId == 5 ? "hide" : ""}
            >
              {!!this.state.nowData ? this.state.nowData.mobile : ""}
            </FormItem>
            <FormItem
              label="推荐人姓名"
              {...formItemLayout}
              className={
                this.state.typeId == 1 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.userName2 : ""}
            </FormItem>
            <FormItem
              label="推荐人账户"
              {...formItemLayout}
              className={
                this.state.typeId == 1 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.ambassadorAccount : ""}
            </FormItem>
            <FormItem
              label="服务站地区（推荐人）"
              {...formItemLayout}
              className={
                this.state.typeId == 1 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData
                ? this.getAddress2(
                    this.state.nowData.province2,
                    this.state.nowData.city2,
                    this.state.nowData.region2
                  )
                : ""}
            </FormItem>
            <FormItem
              label="服务站公司名称（推荐人）"
              {...formItemLayout}
              className={
                this.state.typeId == 1 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.company2 : ""}
            </FormItem>
            <FormItem
              label="服务站地区（经销商）"
              {...formItemLayout}
              className={
                this.state.typeId == 1 ||
                this.state.typeId == 2 ||
                this.state.typeId == 3
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData
                ? this.getAddress2(
                    this.state.nowData.province4,
                    this.state.nowData.city4,
                    this.state.nowData.region4
                  )
                : ""}
            </FormItem>
            <FormItem
              label="服务站公司名称（经销商）"
              {...formItemLayout}
              className={
                this.state.typeId == 1 ||
                this.state.typeId == 2 ||
                this.state.typeId == 3
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.company3 : ""}
            </FormItem>
            <FormItem
              label="服务站地区（安装工）"
              {...formItemLayout}
              className={
                this.state.typeId == 2 ||
                this.state.typeId == 3 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData
                ? this.getAddress3(
                    this.state.nowData.province3,
                    this.state.nowData.city3,
                    this.state.nowData.region3
                  )
                : ""}
            </FormItem>
            <FormItem
              label="服务站公司名称（安装工）"
              {...formItemLayout}
              className={
                this.state.typeId == 2 ||
                this.state.typeId == 3 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.companyName : ""}
            </FormItem>
            <FormItem
              label="安装工姓名"
              {...formItemLayout}
              className={
                this.state.typeId == 2 ||
                this.state.typeId == 3 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.customerName : ""}
            </FormItem>
            <FormItem
              label="安装工电话"
              {...formItemLayout}
              className={
                this.state.typeId == 2 ||
                this.state.typeId == 3 ||
                this.state.typeId == 4 ||
                this.state.typeId == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.customerPhone : ""}
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
      { findProductTypeByWhere, onChange, onOk, statementList },
      dispatch
    )
  })
)(WrappedHorizontalRole);
