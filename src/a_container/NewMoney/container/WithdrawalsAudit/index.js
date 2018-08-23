/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import moment from "moment";
import _ from "lodash";
import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  Modal,
  Tooltip,
  Popconfirm,
  Select,
  Divider,
  DatePicker,
  Checkbox,
  Popover
} from "antd";
import "./index.scss";
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
  onChange,
  onOk,
  onChange4,
  warning,
  findProductTypeByWhere,
  WithdrawalsAudit,
  WithdrawalsAuditEgis
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productModels: [], // 所有的产品型号
      productTypes: [], //所有产品类型
      searchProductName: "", // 搜索 - 产品名称
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      searchBeginTime: "", // 搜索 - 申请提现开始时间
      searchEndTime: "", // 搜索- 申请提现结束时间
      searchUserType: "", //搜索 - 用户类型
      searchMobile: "", //搜索 - 用户手机号
      searchWithdrawType: "", //搜索 - 提现方式
      searchtradeNo: "", //搜索 - 流水号
      searchUserName: "", //搜索 - 用户昵称
      searchRealName: "", // 搜索 - 用户真实姓名
      searchUserMallId: "", // 搜索 - 用户翼猫id
      searchPartnerTradeNo: "", //搜索 - 提现单号
      defaultValue: "", // 拒绝理由
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
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
      visible2: false, //控制右侧悬浮层属性
      reason: "提现审核未通过，如有疑问，请联系客服：4001519999"
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
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

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,//用户身份
      withdrawType: this.state.searchWithdrawType,
      nickName: this.state.searchUserName,//用户昵称
      username: this.state.searchRealName,//用户姓名
      ambassadorName: this.state.searchambassadorName,
      tradeNo: this.state.searchtradeNo,
      phone: this.state.searchMobile,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      userId: this.state.searchUserMallId,//用户iD
      partnerTradeNo: this.state.searchPartnerTradeNo,
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
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else if (res.status === "1") {
        this.setState({
          data: [],
        });
        message.warning(res.message || "获取数据失败，请重试" , 1.5);
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

  //工具 - 根据ID拿到退款中的partnerTradeNo
  getPartnerTradeNo(selectedKeys) {
    const t = this.state.data.filter((item, index) =>
      selectedKeys.includes(index)
    );
    console.log("是个什么：", t.map(item => item.partnerTradeNo).join(","));
    return t.map(item => item.partnerTradeNo).join(",");
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

  //根据提现方式id返回名称
  WithdrawType(id) {
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

  // 搜索 - 产品类型输入框值改变时触发
  searchProductTypesChange(e) {
    this.setState({
      searchproductType: e
    });
  }

  //搜索 - 提现方式改变时触发
  searchCashTypeChange(e) {
    this.setState({
      searchWithdrawType: e
    });
  }

  //搜索 - 流水号
  searchPartnerTradeNoChange(e) {
    this.setState({
      searchPartnerTradeNo: e.target.value
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

  //搜索 - 用户手机号查询
  searchPhoneChange(e) {
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

  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: _.cloneDeep(v)
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

  handleVisibleChange2() {
    this.setState({
      visible2: true
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
  
  // 导出提现审核列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchUserType,
      withdrawType: this.state.searchWithdrawType,
      nickName: this.state.searchUserName,
      username: this.state.searchRealName,
      ambassadorName: this.state.searchambassadorName,
      tradeNo: this.state.searchtradeNo,
      phone: this.state.searchMobile,
      minAmount: this.state.searchMinPrice,
      maxAmount: this.state.searchMaxPrice,
      userId: this.state.searchUserMallId,
      partnerTradeNo: this.state.searchPartnerTradeNo,
      minApplyTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      maxApplyTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)} `
        : ""
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/export/withdraw/audit`;
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
    if (params.userType) {
      newElement3.setAttribute("name", "userType");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.userType);
      form.appendChild(newElement3);
    }
    
    const newElement4 = document.createElement("input");
    if (params.withdrawType) {
      newElement4.setAttribute("name", "withdrawType");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.withdrawType);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.username) {
      newElement5.setAttribute("name", "username");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.username);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.nickName) {
      newElement6.setAttribute("name", "nickName");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.nickName);
      form.appendChild(newElement6);
    }
    
    const newElement7 = document.createElement("input");
    if (params.ambassadorName) {
      newElement7.setAttribute("name", "ambassadorName");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.ambassadorName);
      form.appendChild(newElement7);
    }
    
    const newElement8 = document.createElement("input");
    if (params.tradeNo) {
      newElement8.setAttribute("name", "tradeNo");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.tradeNo);
      form.appendChild(newElement8);
    }
    
    const newElement9 = document.createElement("input");
    if (params.phone) {
      newElement9.setAttribute("name", "phone");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.phone);
      form.appendChild(newElement9);
    }
    
    const newElement10 = document.createElement("input");
    if (params.maxAmount) {
      newElement10.setAttribute("name", "maxAmount");
      newElement10.setAttribute("type", "hidden");
      newElement10.setAttribute("value", params.maxAmount);
      form.appendChild(newElement10);
    }
    
    const newElement11 = document.createElement("input");
    if (params.minAmount) {
      newElement11.setAttribute("name", "minAmount");
      newElement11.setAttribute("type", "hidden");
      newElement11.setAttribute("value", params.minAmount);
      form.appendChild(newElement11);
    }
    
    const newElement12 = document.createElement("input");
    if (params.userId) {
      newElement12.setAttribute("name", "userId");
      newElement12.setAttribute("type", "hidden");
      newElement12.setAttribute("value", params.userId);
      form.appendChild(newElement12);
    }
    
    const newElement13 = document.createElement("input");
    if (params.minApplyTime) {
      newElement13.setAttribute("name", "minApplyTime");
      newElement13.setAttribute("type", "hidden");
      newElement13.setAttribute("value", params.minApplyTime);
      form.appendChild(newElement13);
    }
    
    const newElement14 = document.createElement("input");
    if (params.maxApplyTime) {
      newElement14.setAttribute("name", "maxApplyTime");
      newElement14.setAttribute("type", "hidden");
      newElement14.setAttribute("value", params.maxApplyTime);
      form.appendChild(newElement14);
    }
    
    const newElement15 = document.createElement("input");
    if (params.partnerTradeNo) {
      newElement15.setAttribute("name", "partnerTradeNo");
      newElement15.setAttribute("type", "hidden");
      newElement15.setAttribute("value", params.partnerTradeNo);
      form.appendChild(newElement15);
    }
    
    form.submit();
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
    this.setState({
      nowData: record,
      queryModalShow: true,
      partnerTradeNo: record.partnerTradeNo
    });
    console.log("refundId的数值是：", record.partnerTradeNo);
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
        console.log("这是什么！", selectedRowKeys, selectedRows);
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
                    <Icon type="cross-circle-o" />
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

  // 构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        count: item.count,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        pay: item.pay,
        paymentTime: item.paymentTime,
        name: item.product ? item.product.name : "",
        modelId: item.product ? item.product.typeCode : "",
        typeId: item.product ? item.product.typeId : "",
        userName: item.userId,
        ambassadorName: item.distributor ? item.distributor.mobile : "",
        name2: item.station ? item.station.name : "",
        userId: item.userId,
        crediBeginTime: item.crediBeginTime,
        crediEndTime: item.crediEndTime,
        totalAmount: item.totalAmount,
        amount: item.amount,
        nickName: item.nickName,
        username: item.username,
        userType: item.userType,
        applyTime: item.applyTime,
        withdrawStatus: item.withdrawStatus,
        withdrawType: item.withdrawType,
        phone: item.phone,
        partnerTradeNo: item.partnerTradeNo
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

    return (
      <div className="page-refundaudit">
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>提现单号查询</span>
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
              <Button icon="download" type="primary" onClick={()=>this.onExport()}>
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
          <Table
            columns={this.makeColumns()}
            dataSource={this.makeData(this.state.data)}
            rowSelection={this.initChose()}
            pagination={{
              total: this.state.total,
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
                this.onTablePageChange(page, pageSize)
            }}
          />
        </div>
        {/* 查看详情模态框 */}
        <Modal
          title="查看提现审核详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="提现单号" {...formItemLayout}>
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
                ? this.WithdrawStatus(this.state.nowData.withdrawStatus)
                : ""}
            </FormItem>
            <FormItem label="提现方式" {...formItemLayout}>
              {!!this.state.nowData
                ? this.WithdrawType(this.state.nowData.withdrawType)
                : ""}
            </FormItem>
            <FormItem label="用户id" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.userId : ""}
            </FormItem>
            <FormItem label="用户身份" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getListByModelId(this.state.nowData.userType)
                : ""}
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
            {/*<FormItem*/}
            {/*label="结算主体"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*/!*{!!this.state.nowData ? this.state.nowData.amount : ''}*!/*/}
            {/*</FormItem>*/}
            {/*<FormItem*/}
            {/*label="付款说明"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*/!*{!!this.state.nowData ? this.state.nowData.amount : ''}*!/*/}
            {/*</FormItem>*/}
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
      {
        onChange,
        onOk,
        onChange4,
        warning,
        findProductTypeByWhere,
        WithdrawalsAudit,
        WithdrawalsAuditEgis
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
