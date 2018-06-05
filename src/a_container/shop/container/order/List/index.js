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
  Select
} from "antd";
import "./index.scss";
import tools from "../../../../../util/tools"; // 工具
import Power from "../../../../../util/power"; // 权限
import { power } from "../../../../../util/data";
// ==================
// 所需的所有组件
// ==================

import UrlBread from "../../../../../a_component/urlBread";

// ==================
// 本页面所需action
// ==================

import {
  findOrderByWhere,
  updateOrder,
  findProductTypeByWhere,
  addProductType,
  updateProductType,
  deleteProductType
} from "../../../../../a_action/shop-action";

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
      searchProductName: "", // 搜索 - 类型名
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productName: this.state.searchProductName,
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice
    };
    this.props.actions.findOrderByWhere(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res);
      if (res.status === "0") {
        this.setState({
          data: res.data.result,
          pageNum,
          pageSize
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 工具 - 根据受理状态码查询对应的名字
  getConditionNameById(id) {
    switch (id) {
      case 1:
        return "未受理";
      case 2:
        return "已受理";
      case 3:
        return "处理中";
      case 4:
        return "已完成";
      case -1:
        return "审核中";
      case -2:
        return "未通过";
      default:
        return "";
    }
  }

  // 搜索 - 用户名输入框值改变时触发
  searchProductNameChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchProductName: e.target.value
      });
    }
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
  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record:", record);
    form.setFieldsValue({
      upOrderStatus: `${record.conditions}`
    });
    me.setState({
      nowData: record,
      upModalShow: true
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

  // 查询某一条数据的详情
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
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "订单号",
        dataIndex: "id",
        key: "id"
      },
      {
        title: "订单生成时间",
        dataIndex: "createTime",
        key: "createTime"
      },
      {
        title: "商品名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "商品型号",
        dataIndex: "typeCode",
        key: "typeCode"
      },
      {
        title: "购买数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "总费用",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "支付状态",
        dataIndex: "pay",
        key: "pay",
        render: (text, record) =>
          text ? (
            <span style={{ color: "green" }}>已支付</span>
          ) : (
            <span style={{ color: "red" }}>未支付</span>
          )
      },
      {
        title: "支付时间",
        dataIndex: "payTime",
        key: "payTime",
        render: text => (text ? tools.dateToStr(new Date(text)) : "")
      },
      {
        title: "受理状态",
        dataIndex: "conditions",
        key: "conditions",
        render: (text, record) => this.getConditionNameById(text)
      },
      {
        title: "操作",
        key: "control",
        width: 200,
        render: (text, record) => {
          const controls = [];

          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="查看">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
              <Tooltip placement="top" title="修改">
                <Icon type="edit" />
              </Tooltip>
            </span>
          );

          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(
                <span key={`line${index}`} className="ant-divider" />
              );
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
        count: item.count,
        ecId: item.ecId,
        fee: item.fee,
        feeType: item.feeType,
        openAccountFee: item.openAccountFee,
        orderType: item.orderType,
        payTime: item.payTime,
        payType: item.payType,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        createTime: item.createTime,
        pay: item.pay,
        name: item.product ? item.product.name : "",
        typeCode: item.product ? item.product.typeCode : "",
        conditions: item.conditions,
        remark: item.remark,
        shipCode: item.shipCode,
        shipPrice: item.shipPrice,
        transport: item.transport,
        userId: item.userId
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
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      }
    };

    return (
      <div>
        <UrlBread location={this.props.location} />
        <div className="system-search">
          <ul className="search-ul">
            <li>
              <Input
                placeholder="产品名称"
                onChange={e => this.searchProductNameChange(e)}
                value={this.state.searchProductName}
              />
            </li>
            <li>
              <InputNumber
                min={0}
                max={999999}
                placeholder="最小价格"
                onChange={e => this.searchMinPriceChange(e)}
                value={this.state.searchMinPrice}
              />
            </li>
            <li>
              <InputNumber
                min={0}
                max={999999}
                placeholder="最大价格"
                onChange={e => this.searchMaxPriceChange(e)}
                value={this.state.searchMaxPrice}
              />
            </li>
            <li>
              <Button
                icon="search"
                type="primary"
                onClick={() => this.onSearch()}
              >
                搜索
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
        {/* 修改用户模态框 */}
        <Modal
          title="修改订单状态"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("upOrderStatus", {
                rules: [],
                initialValue: "1"
              })(
                <Select>
                  <Option value="1">未受理</Option>
                  <Option value="2">已受理</Option>
                  <Option value="3">处理中</Option>
                  <Option value="4">已完成</Option>
                  <Option value="-1">审核中</Option>
                  <Option value="-2">未通过</Option>
                </Select>
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
        >
          <Form>
            <FormItem label="订单号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.id : ""}
            </FormItem>
            <FormItem label="生成时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="商品名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="商品型号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.typeCode : ""}
            </FormItem>
            <FormItem label="购买数量" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.count : ""}
            </FormItem>
            <FormItem label="总费用" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.fee : ""}
            </FormItem>
            <FormItem label="开户费" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.openAccountFee : ""}
            </FormItem>
            <FormItem label="购买人" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.userId : ""}
            </FormItem>
            <FormItem label="支付状态" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.pay ? (
                <span style={{ color: "green" }}>已支付</span>
              ) : (
                <span style={{ color: "red" }}>未支付</span>
              )}
            </FormItem>
            <FormItem label="支付时间" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.payTime
                ? tools.dateToStr(new Date(this.state.nowData.payTime))
                : ""}
            </FormItem>
            <FormItem label="受理状态" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.conditions
                ? this.getConditionNameById(this.state.nowData.conditions)
                : ""}
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
        updateOrder,
        findProductTypeByWhere,
        addProductType,
        updateProductType,
        deleteProductType
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
