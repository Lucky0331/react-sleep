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
  Checkbox,
  Select,
  Divider,
  Cascader,
  DatePicker,
  Popconfirm,
  Popover
} from "antd";
import "./index.scss";
import moment from "moment";
const CheckboxGroup = Checkbox.Group;
import Config from "../../../../config/config";
import tools from "../../../../util/tools"; // 工具
import _ from "lodash";
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
  refundList,
  refundAudit,
  refundAuditEgis,
  onChangeCheck,
  warning
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const plainOptions = [];
const { TextArea } = Input;
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
      searchrefundBeginTime: "", // 搜索 - 申请退款开始时间
      searchrefundEndTime: "", // 搜索- 申请退款结束时间
      searchorderFrom: "", //搜索 - 订单来源
      searchName: "", // 搜索 - 状态
      searchMainOrderId:'',//搜索 - 主订单号
      searchorderNo: "", //搜索 - 订单号
      searchUserName: "", //搜索 - 用户id
      searchActivity: "", //搜索 - 活动方式
      addnewModalShow: false, // 添加模态框是否显示
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [], // 符合Cascader组件的城市数据
      indeterminate: true,
      checkAll: false, // 全选按钮是否被勾选
      checkReturnAll: false, //反选按钮是否被勾选
      selectedKeys: [], // 被选中的项 列进数组
      visible: false, //控制悬浮层属性
      AuditShow: false, //控制右侧按钮悬浮层是否显示
      refundDetail: "退款审核未通过，如有疑问，请联系客服：4001519999"
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
      userId: this.state.searchUserName, //用户id
      productType: this.state.searchProductType, //产品类型
      orderNo: this.state.searchorderNo.trim(), //订单号查询
      mainOrderId:this.state.searchMainOrderId.trim(),//主订单号查询
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      userType: this.state.searchType, //用户身份
      activityType: this.state.searchActivity, //活动方式
      beginTime: this.state.searchrefundBeginTime
        ? `${tools.dateToStr(this.state.searchrefundBeginTime.utc()._d)} `
        : "",
      endTime: this.state.searchrefundEndTime
        ? `${tools.dateToStr(this.state.searchrefundEndTime.utc()._d)} `
        : ""
    };
    this.props.actions.refundAudit(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
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

  //工具 - 根据ID拿到退款中的refundId
  getRefundId(selectedKeys) {
    const t = this.state.data.filter((item, index) =>
      selectedKeys.includes(index)
    );
    console.log("是个什么：", String(t.map(item => item.id).join(",")));
    return String(t.map(item => item.id).join(","));
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

  // 工具 - 订单状态
  getListByModelId(id) {
    switch (String(id)) {
      case "1":
        return "待审核";
      case "2":
        return "待发货";
      case "3":
        return "退款中";
      case "4":
        return "已退款";
      default:
        return "";
    }
  }

  // 工具 - 退款状态
  getListByRefund(id) {
    switch (String(id)) {
      case "1":
        return "待审核";
      case "3":
        return "已拒绝";
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

  //工具 - 用户具体收货地体
  getAddress(s, c, q, x) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}${x}`;
  }
  
  //搜索 - 主订单号
  searchMainOrderIdChange(e) {
    this.setState({
      searchMainOrderId: e.target.value
    });
  }

  //搜索 - 子订单号
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

  //悬浮层显示框
  hide() {
    this.setState({
      visible: false
    });
  }

  //悬浮层显示框
  handleVisibleChange() {
    this.setState({
      visible: true
    });
  }

  handleVisibleChange2() {
    this.setState({
      AuditShow: true
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      AuditShow: false
    });
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

  // 搜索 - 申请退款开始时间
  searchApplyBeginTime(v, v1) {
    console.log("是什么：", v, v1);
    this.setState({
      searchrefundBeginTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 申请退款结束时间
  searchApplyEndTime(v) {
    console.log("触发：", v);
    this.setState({
      searchrefundEndTime: _.cloneDeep(v)
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
  
  emitEmpty3() {
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
  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }

  // 导出退款审核列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      activityType: this.state.searchActivity,
      userType: this.state.searchType,
      userId: this.state.searchUserName,
      productType: this.state.searchProductType,
      orderNo: this.state.searchorderNo.trim(),
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      minAuditTime: this.state.searchrefundBeginTime
        ? `${tools.dateToStr(this.state.searchrefundBeginTime.utc()._d)}`
        : "", //申请退款时间 - 开始
      maxAuditTime: this.state.searchrefundEndTime
        ? `${tools.dateToStr(this.state.searchrefundEndTime.utc()._d)}`
        : "" //申请退款时间 - 结束
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/refund/audit`,'post','退款审核.xls')
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
    this.setState({
      nowData: record,
      queryModalShow: true,
      typeId: record.typeId,
      refundId: record.refundId,
      refundStatus: record.refundStatus,
      refundDetail: record.refundDetail
    });
    console.log("refundId的数值是：", record.refundId);
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  //操作全选按钮逻辑功能
  onCheckAllChange(e) {
    this.setState({
      checkAll: e.target.checked
    });
    if (e.target.checked) {
      // 选中
      this.setState({
        selectedKeys: this.state.data.map((item, index) => index)
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
    const all = this.state.data.map((item, index) => index);
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
        console.log("选择了什么：", selectedRowKeys, selectedRows);
        if (selectedRowKeys.length === this.state.data.length) {
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

  //批量审核拒绝按钮配置
  onAdoptNo() {
    const params = {
      refundId: String(this.getRefundId(this.state.selectedKeys)),
      refundStatus: "2",
      refundDetail: String(this.state.refundDetail || "")
    };
    this.setState({
      visible: false,
      AuditShow: false,
      checkAll: false,
      selectedKeys: []
    });
    this.props.actions
      .refundAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功", 1);
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error("请选择正确的退款申请", 1);
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  //批量审核通过按钮配置
  onAdopt() {
    const params = {
      refundId: this.getRefundId(this.state.selectedKeys),
      refundStatus: "1"
    };
    this.setState({
      visible: false
    });
    this.props.actions
      .refundAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功", 1);
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error("请选择正确的退款申请", 1);
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  //审核拒绝要传进来的值
  RefundDetail(e) {
    this.setState({
      refundDetail: e.target.value
    });
  }

  //单独某条审核通过按钮配置
  onAdoptAlone(record) {
    const params = {
      refundId: record.refundId,
      refundStatus: "1"
    };
    this.setState({
      visible: false
    });
    this.props.actions
      .refundAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功", 1);
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  //单独某条审核拒绝按钮配置
  onAdoptAloneNo(record) {
    const params = {
      refundId: record.refundId,
      refundStatus: "2",
      refundDetail: this.state.refundDetail || ""
    };
    this.setState({
      visible: false,
      AuditShow: false
    });
    this.props.actions
      .refundAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功", 1);
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  //单独某条撤回审核通过
  onAdoptAloneRefuse(record) {
    const params = {
      refundId: record.refundId,
      refundStatus: "3"
    };
    this.props.actions
      .refundAuditEgis(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功", 1);
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
    this.setState({
      checkAll: false,
      selectedKeys: []
    });
  }

  // 页码每页显示多少条展示
  onShowSizeChange(current, pageSize) {
    console.log("显示多少条:", current, pageSize);
    this.onGetData(current, pageSize);
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title:'主订单号',
        dataIndex:'mainOrderId',
        key:'mainOrderId',
        fixed: "left",
        width:150
      },
      {
        title: "子订单号",
        dataIndex: "orderNo",
        key: "orderNo",
        width: 150
      },
      {
        title: "退款状态",
        dataIndex: "refundStatus",
        key: "refundStatus",
        render: text => this.getListByRefund(text)
      },
      {
        title: "申请退款时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "订单状态",
        dataIndex: "activityStatus",
        key: "activityStatus",
        render: text => this.getListByModelId(text)
      },
      {
        title: "用户身份",
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
        title: "产品名称",
        dataIndex: "detail",
        key: "detail"
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
        title: "订单总金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 100,
        render: (text, record) => {
          const controls = [];
          record.refundStatus === 1 &&
            controls.push(
              <Popconfirm
                placement="bottom"
                title="确定审核通过吗?"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.onAdoptAlone(record)}
              >
                <span key="0" className="control-btn green">
                  <Tooltip placement="top" title="审核通过">
                    <Icon type="check-circle-o" style={{ color: "green" }} />
                  </Tooltip>
                </span>
              </Popconfirm>
            );
          record.refundStatus === 1 &&
            controls.push(
              <Popconfirm
                 title={
                  <div style={{height:'65px'}}>
                    <TextArea
                      placeholder="请输入拒绝理由"
                      autosize={{ minRows: 1, maxRows: 4 }}
                      value={this.state.refundDetail}
                      defaultValue="退款审核未通过，如有疑问，请联系客服：4001519999"
                      onChange={e => this.RefundDetail(e)}
                    />
                  </div>
                }
                trigger="click"
                placement="bottom"
                onCancel={() => this.onAddNewClose()}
                onConfirm={() => this.onAdoptAloneNo(record)}
              >
                <span key="1" className="control-btn red">
                  <Tooltip placement="top" title="审核拒绝">
                    <Icon type="cross-circle-o" style={{ color: "red" }} />
                  </Tooltip>
                </span>
              </Popconfirm>
            );
          record.refundStatus === 3 &&
            controls.push(
              <span
                key="2"
                className="control-btn red"
                onClick={() => this.onAdoptAloneRefuse(record)}
              >
                <Tooltip placement="top" title="撤销审核">
                  <Icon type="logout" style={{ color: "red" }} />
                </Tooltip>
              </span>
            );
          record.refundStatus === 3 &&
            controls.push(
              <span
                key="3"
                className="control-btn green"
                onClick={() => this.onQueryClick(record)}
              >
                <Tooltip placement="top" title="详情">
                  <Icon type="eye" style={{ color: "green" }} />
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
        payType: item.payRecord ? item.payRecord.payType : "",
        orderNo: item.orderId,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.product ? item.product.name : "",
        modelId: item.product ? item.product.typeCode : "",
        typeId: item.product.productType ? item.product.productType.code : "",//产品类型codee值
        company: item.product.productType ? item.product.productType.code : "",//产品公司
        activityStatus: item.orders ? item.orders.activityStatus : "",
        userId: item.orders ? item.orders.userInfo.id : "",
        userType: item.orders ? item.orders.userInfo.userType : "",
        activityType: item.orders ? item.orders.activityType : "",
        count: item.orders ? item.orders.count : "",
        fee: item.orders ? item.orders.fee : "",
        realName: item.distributor ? item.distributor.realName : "",
        ambassadorName: item.distributor ? item.distributor.mobile : "",
        modelType: item.orders ? item.orders.modelType : "",
        mchOrderId: item.refundRecord ? item.refundRecord.tradeNo : "",
        customerName: item.customer ? item.customer.realName : "",
        customerPhone: item.customer ? item.customer.phone : "",
        createTime: item.createTime,
        detail: item.product.name ? item.product.name : "",
        auditTime: item.orders ? item.orders.auditTime : "",
        refundStatus: item.refundStatus,
        refundId: item.id,
        selectedKeys: item.selectedKeys,
        refundDetail: item.refundDetail || "",
        mainOrderId:item.orders ? item.orders.mainOrderId : '',//主订单号
      };
    });
  }

  render(record) {
    const me = this;
    const { form } = me.props;
    // const { getFieldDecorator } = form;
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
    const { searchMinPrice } = this.state;
    const { searchMaxPrice } = this.state;
    const { searchMainOrderId } = this.state;
    const suffix = searchorderNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix2 = searchUserName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix4 = searchMainOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    const suffix8 = searchMinPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty5()} />
    ) : null;
    const suffix9 = searchMaxPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty6()} />
    ) : null;

    return (
      <div className="page-refundaudit">
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>主订单号</span>
              <Input
                style={{ width: "172px" }}
                onChange={e => this.searchMainOrderIdChange(e)}
                suffix={suffix4}
                value={searchMainOrderId}
              />
            </li>
            <li>
              <span>订单号查询</span>
              <Input
                style={{ width: "172px" }}
                onChange={e => this.searchOrderNoChange(e)}
                suffix={suffix}
                value={searchorderNo}
              />
            </li>
            <li>
              <span>用户身份</span>
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
              <span>用户id</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix2}
                value={searchUserName}
                onChange={e => this.searchUserNameChange(e)}
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
              <span style={{ marginRight: "10px" }}>申请退款时间</span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={(e, s) => this.searchApplyBeginTime(e, s)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                // value={this.state.searchEndTime}
                onChange={e => this.searchApplyEndTime(e)}
                onOk={onOk}
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
              <Button icon="download" type="primary" onClick={() => this.onExport()}>导出</Button>
              {/*<Button icon="download" type="primary" onClick={this.warning2}>*/}
                {/*导出*/}
              {/*</Button>*/}
            </li>
          </ul>
        </div>
        <div className="system-table">
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <span style={{ margin: "0 10px" }}>
              <Checkbox
                onChange={e => this.onCheckAllChange(e)}
                checked={this.state.checkAll}
                style={{ margin: "0 10px 0 0" }}
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
              onConfirm={() => this.onAdopt(1)}
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
                    placeholder="请输入拒绝的理由"
                    autosize={{ minRows: 1, maxRows: 4 }}
                    value={this.state.refundDetail}
                    defaultValue="退款审核未通过，如有疑问，请联系客服：4001519999"
                    onChange={e => this.RefundDetail(e)}
                  />
                  <ul
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <li style={{ width: "40px" }}>
                      <a onClick={e => this.onAdoptNo()}>确定</a>
                    </li>
                    <li style={{ width: "40px" }}>
                      <a onClick={e => this.hide()}>取消</a>
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
        <Table
          columns={this.makeColumns()}
          dataSource={this.makeData(this.state.data)}
          rowSelection={this.initChose()}
          scroll={{ x: 2300 }}
          pagination={{
            total: this.state.total,
            current: this.state.pageNum,
            pageSize: this.state.pageSize,
            showQuickJumper: true,
            showSizeChanger: true,
            defaultCurrent: 3,
            pageSizeOptions: ["10", "30", "50"],
            onShowSizeChange: (current, pageSize) =>
              this.onShowSizeChange(current, pageSize),
            showTotal: (total, range) => `共 ${total} 条数据`,
            onChange: (page, pageSize) => this.onTablePageChange(page, pageSize)
          }}
        />
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
        onChange,
        onOk,
        refundList,
        refundAudit,
        refundAuditEgis,
        onChangeCheck,
        warning
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
