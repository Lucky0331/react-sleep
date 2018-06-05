/* List 商城管理/发票管理/申请记录 */

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
  findOrderByWhere,
  findProductTypeByWhere,
  updateProductType,
  onChange,
  onOk
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
      productModels: [], // 所有的产品型号
      productTypes: [], // 所有的产品类型
      searchModelId: "", // 搜索 - 产品型号
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      searchorderFrom: "", //搜索 - 订单来源
      searchName: "", // 搜索 - 状态
      searchPayType: "", //搜索 - 支付类型
      searchConditions: "", //搜索 - 订单状态
      searchorderNo: "", //搜索 - 订单号
      searchUserName: "", //搜索 - 经销商账户
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的产品类型
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      isPay: this.state.searchName,
      payType: this.state.searchPayType,
      conditions: this.state.searchConditions,
      id: this.state.searchId,
      userName: this.state.searchUserName,
      modelId: this.state.searchModelId,
      orderFrom: this.state.searchorderFrom,
      orderNo: this.state.searchorderNo.trim(),
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`
        : ""
    };
    this.props.actions.findOrderByWhere(tools.clearNull(params)).then(res => {
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

  // 工具 - 根据受理状态码查询发票类型
  getConditionNameById(id) {
    switch (id) {
      case 0:
        return "公司";
      case 1:
        return "个人";
      case 2:
        return "其他";
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

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 搜索 - 订单来源输入框值改变时触发
  onSearchorderFrom(v) {
    this.setState({
      searchorderFrom: v
    });
  }

  // 搜索 - 最小价格变化
  searchMinPriceChange(v) {
    this.setState({
      searchMinPrice: v
    });
  }

  // 搜索 - 最大价格变化
  searchMaxPriceChange(v) {
    this.setState({
      searchMaxPrice: v
    });
  }

  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: v
    });
  }

  // 搜索 - 结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: v
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(["upOrderStatus"], (err, values) => {
      if (err) {
        return;
      }

      me.setState({
        upLoading: true
      });
      const params = {
        orderId: me.state.nowData.id,
        orderStatus: values.upOrderStatus
      };

      this.props.actions
        .updateProductType(params)
        .then(res => {
          if (res.status === "0") {
            message.success("修改成功");
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onUpClose();
          } else {
            message.error(res.message || "修改失败，请重试");
          }
          me.setState({
            upLoading: false
          });
        })
        .catch(() => {
          me.setState({
            upLoading: false
          });
        });
    });
  }
  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  //导出
  onExport() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
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
        title: "申请日期"
      },
      {
        title: "申请状态"
      },
      {
        title: "订单号"
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.findProductNameById(text)
      },
      {
        title: "用户账号",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "订单金额"
      },
      {
        title: "支付时间"
      },
      {
        title: "结算月份"
      },
      {
        title: "用户邮箱"
      },
      {
        title: "用户手机"
      },
      {
        title: "发票类型",
        render: text => this.getConditionNameById(text)
      },
      {
        title: "发票抬头"
      },
      {
        title: "税号"
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
        count: item.count,
        ecId: item.ecId,
        fee: item.fee,
        feeType: item.feeType,
        openAccountFee: item.openAccountFee,
        orderType: item.orderType,
        payTime: item.payTime,
        payType: item.payRecord ? item.payRecord.payType : "",
        orderNo: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.createTime,
        pay: item.pay,
        name: item.product ? item.product.name : "",
        modelId: item.product ? item.product.typeCode : "",
        typeId: item.product ? item.product.typeId : "",
        conditions: item.conditions,
        userName: item.userId,
        orderFrom: item.orderFrom,
        realName: item.distributor ? item.distributor.realName : ""
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

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span style={{ marginRight: "10px" }}>申请日期</span>
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
                placeholder="开始日期"
                onChange={e => this.searchBeginTime(e)}
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
                placeholder="结束日期"
                onChange={e => this.searchEndTime(e)}
              />
            </li>
            <li>
              <span>订单号</span>
              <Input
                style={{ width: "172px" }}
                onChange={e => this.searchOrderNoChange(e)}
              />
            </li>

            <li>
              <span style={{}}>产品类型</span>
              <Select allowClear placeholder="全部" style={{ width: "172px" }}>
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
              <span>用户账号</span>
              <Input
                style={{ width: "172px" }}
                onChange={e => this.searchUserNameChange(e)}
              />
            </li>
            <li>
              <span>发票类型</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchConditionsChange(e)}
              >
                <Option value={0}>公司</Option>
                <Option value={1}>个人</Option>
                <Option value={4}>其他</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>支付时间</span>
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
                onChange={e => this.searchBeginTime(e)}
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
                onChange={e => this.searchEndTime(e)}
              />
            </li>
            <li>
              <span>订单金额</span>
              <InputNumber
                style={{ width: "80px" }}
                min={0}
                max={999999}
                placeholder="最小价格"
                onChange={e => this.searchMinPriceChange(e)}
                value={this.state.searchMinPrice}
              />--
              <InputNumber
                style={{ width: "80px" }}
                min={0}
                max={999999}
                placeholder="最大价格"
                onChange={e => this.searchMaxPriceChange(e)}
                value={this.state.searchMaxPrice}
              />
            </li>
            <li>
              <span>结算月份</span>
              <DatePicker
                style={{ width: "172px" }}
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
                placeholder="选择月份"
              />
            </li>
            <li>
              <span>申请状态</span>
              <Select placeholder="全部" allowClear style={{ width: "172px" }}>
                <Option value="0">待处理</Option>
                <Option value="0">已确定</Option>
              </Select>
            </li>
            <li style={{ marginLeft: "40px", marginRight: "15px" }}>
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
        />
        {/* 查看详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="订单号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.orderNo : ""}
            </FormItem>
            <FormItem label="订单来源" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getListByModelId(this.state.nowData.orderFrom)
                : ""}
            </FormItem>
            <FormItem label="订单状态" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getConditionNameById(this.state.nowData.conditions)
                : ""}
            </FormItem>
            <FormItem label="用户账号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.userName : ""}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.findProductNameById(this.state.nowData.typeId)
                : ""}
            </FormItem>
            <FormItem label="订单总费用" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.fee : ""}
            </FormItem>
            <FormItem label="下单时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="支付方式" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getBypayType(this.state.nowData.payType)
                : ""}
            </FormItem>
            <FormItem label="支付状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                String(this.state.nowData.pay) === "true" ? (
                  <span style={{ color: "green" }}>已支付</span>
                ) : (
                  <span style={{ color: "red" }}>未支付</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="支付时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>

            <FormItem label="经销商名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.realName : ""}
            </FormItem>
            <FormItem label="经销商身份" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
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
  actions: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators(
      {
        findOrderByWhere,
        findProductTypeByWhere,
        updateProductType,
        onChange,
        onOk
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
