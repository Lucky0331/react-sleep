/* List 服务站/服务站管理 */

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
  Popconfirm,
  Table,
  message,
  Modal,
  Radio,
  Tooltip,
  Select,
  Divider,
  Cascader
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
  addProductLine,
  updateProductLine,
  deleteStation,
  editProductLine,
  buyPower
} from "../../../../a_action/shop-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      userTypes: [], //所有的用户的类型
      healthTypes: [], //所有的健康大使的类型
      searchTypeId: undefined, // 搜索 - 产品类型
      searchUserType: "", // 搜索 - 用户类型
      searchDistributorType: "", //搜索 - 健康大使类型
      searchCanbuy: "", // 搜索 - 购买权限状态
      addOrUp: "add", // 当前操作是新增还是修改
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  componentWillReceiveProps(nextP) {}

  // 工具 - 根据产品类型ID返回产品类型名称
  getNameByTypeId(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  //工具 - 根据用户类型ID返回用户类型的名称
  getUserTypes(id) {
    const t = this.state.userTypes.find(item => String(item.id) === String(id));
    return t ? t.typeName : "";
  }

  //工具 - 根据健康大使ID返回用户类型的名称
  getHeathType(id) {
    const t = this.state.healthTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.typeName : "";
  }

  // 搜索 - 产品类型输入框值改变时触发
  onSearchTypeId(typeId) {
    this.setState({
      searchTypeId: typeId
    });
  }

  //搜索 - 用户类型输入框值改变时触发
  onSearchUserType(v) {
    this.setState({
      searchUserType: v
    });
  }

  //搜索 - 购买权限框值改变时触发
  onSearchCanbuy(e) {
    this.setState({
      searchCanbuy: e
    });
  }

  //搜索 - 健康大使类型输入框改变时触发
  onSearchDistributorType(v) {
    this.setState({
      searchDistributorType: v
    });
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum: 0,
      pageSize,
      productType: this.state.searchTypeId,
      userType: this.state.searchUserType,
      distributorType: this.state.searchDistributorType,
      canBuy: Boolean(this.state.searchCanbuy)
    };
    this.props.actions.buyPower(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.bpPage.result || [],
          productTypes: res.data.ptList || [],
          userTypes: res.data.utList || [],
          healthTypes: res.data.dtList || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
      // console.log('是谁:',res.data.ptList)
    });
  }

  // 下线或上线
  onUpdateClick2(record) {
    const params = {
      canBuy: record.canBuy ? 1 : 2
    };
    this.props.actions
      .updateProductLine(params)
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

  // 删除某一条数据
  onDeleteClick(record) {
    const params = {
      id: Number(record.id),
      canBuy: record.canBuy ? 2 : 1
    };
    this.props.actions.deleteStation(params).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
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

  // 权限设置模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewId",
      "addnewContactPerson",
      "addnewContactPhone",
      "addnewTypeId",
      "addnewUserType",
      "addnewHealthType"
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true
    });
  }

  // 添加或修改确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewId",
        "addnewContactPerson",
        "addnewContactPhone",
        "addnewTypeId",
        "addnewUserType",
        "addnewHealthType"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          id: Number(values.addnewId),
          productType: Number(values.addnewTypeId),
          userType: Number(values.addnewUserType),
          healthType: Number(values.addnewHealthType),
          canBuy: false,
          deviceId: String(values.addnewId)
        };

        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addProductLine(tools.clearNull(params))
            .then(res => {
              if (res.status === "0") {
                me.setState({
                  addnewLoading: false
                });
                this.onGetData(this.state.pageNum, this.state.pageSize);
                this.onAddNewClose();
              } else {
                message.error(res.message || "操作失败");
                this.onAddNewClose();
              }
            })
            .catch(() => {
              this.onAddNewClose();
            });
        } else {
          params.id = this.state.nowData.id;
          me.props.actions
            .editProductLine(params)
            .then(res => {
              //修改
              if (res.status === "0") {
                me.setState({
                  addnewLoading: false
                });
                this.onGetData(this.state.pageNum, this.state.pageSize);
                this.onAddNewClose();
              } else {
                message.error(res.message || "操作失败");
                this.onAddNewClose();
              }
            })
            .catch(() => {
              this.onAddNewClose();
            });
        }
      }
    );
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
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
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
        render: text => this.getNameByTypeId(text)
      },
      {
        title: "用户类型",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getUserTypes(text)
      },
      {
        title: "健康大使类型",
        dataIndex: "distributorType",
        key: "distributorType",
        render: text => this.getHeathType(text)
      },
      {
        title: "购买权限",
        dataIndex: "canBuy",
        key: "canBuy",
        render: text =>
          String(text) === "true" ? (
            <span style={{ color: "green" }}>已开启</span>
          ) : (
            <span style={{ color: "red" }}>未开启</span>
          )
      },
      {
        title: "操作",
        key: "control",
        width: 150,
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
              key="3"
              className="control-btn blue"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="启用">
                <Icon type="caret-up" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="4"
              className="control-btn red"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="禁用">
                <Icon type="caret-down" />
              </Tooltip>
            </span>
          );
          controls.push(
            <Popconfirm
              key="5"
              title="确定删除吗?"
              onConfirm={() => this.onDeleteClick(record)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <Icon type="delete" />
                </Tooltip>
              </span>
            </Popconfirm>
          );

          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider type="vertical" key={`line${index}`} />);
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
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        typeId: item.typeId,
        typeName: this.getNameByTypeId(item.typeId),
        city: item.city,
        region: item.region,
        contactPhone: item.contactPhone,
        name: item.name,
        state: item.state,
        onlineId: item.onlineId,
        deviceType: item.deviceType,
        deviceId: item.deviceId,
        createTime: item.createTime,
        productType: item.productType,
        userType: item.userType,
        distributorType: item.distributorType,
        canBuy: item.canBuy
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
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };
    console.log("是啥：", form.getFieldValue("addnewTypeId"));
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-ul">
            <li>
              <span style={{ marginRight: "10px" }}>产品类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "200px" }}
                onChange={e => this.onSearchTypeId(e)}
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
              <span style={{ marginRight: "10px" }}>用户类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "200px" }}
                onChange={e => this.onSearchUserType(e)}
              >
                {this.state.userTypes.map((item, index) => {
                  return (
                    <Option key={index} value={item.id}>
                      {item.typeName}
                    </Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>健康大使类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "200px" }}
                onChange={e => this.onSearchDistributorType(e)}
              >
                {this.state.healthTypes.map((item, index) => {
                  return (
                    <Option key={index} value={item.id}>
                      {item.typeName}
                    </Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>购买权限</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "200px" }}
                onChange={e => this.onSearchCanbuy(e)}
              >
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
              </Select>
            </li>
            <li style={{ width: "80px", marginRight: "15px" }}>
              <Button type="primary" onClick={() => this.onSearch()}>
                搜索
              </Button>
            </li>
          </ul>
          <ul className="search-func">
            <li>
              <Button type="primary" onClick={() => this.onAddNewShow()}>
                权限设置
              </Button>
            </li>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
            dataSource={this.makeData(this.state.data)}
            pagination={{
              total: this.state.total,
              page: this.state.pageNum,
              pageSize: this.state.pageSize,
              showQuickJumper: true,
              showTotal: (total, range) => `共 ${total} 条数据`,
              onChange: (page, pageSize) =>
                this.onTablePageChange(page, pageSize)
            }}
          />
        </div>
        {/* 添加模态框 */}
        <Modal
          title={this.state.addOrUp === "add" ? "权限设置" : "修改产品上线"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select placeholder="请选择产品类型">
                  {this.state.productTypes.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="用户类型" {...formItemLayout}>
              {getFieldDecorator("addnewUserType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择用户类型" }]
              })(
                <Select placeholder="请选择用户类型">
                  {this.state.userTypes.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.typeName}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="健康大使类型" {...formItemLayout}>
              {getFieldDecorator("addnewHealthType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择健康大使类型" }]
              })(
                <Select placeholder="请选择健康大使类型">
                  {this.state.healthTypes.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.typeName}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="购买权限" {...formItemLayout}>
              {getFieldDecorator("addnewBuyType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择是否启用购买权限" }]
              })(
                <Select placeholder="请选择是否启用购买权限">
                  <Option value={1}>是</Option>
                  <Option value={2}>否</Option>
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
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByTypeId(this.state.nowData.productType)
                : ""}
            </FormItem>
            <FormItem label="用户类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getUserTypes(this.state.nowData.userType)
                : ""}
            </FormItem>
            <FormItem label="健康大使类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getHeathType(this.state.nowData.distributorType)
                : ""}
            </FormItem>
            <FormItem label="购买权限" {...formItemLayout}>
              {!!this.state.nowData
                ? this.state.nowData.canBuy
                  ? "已开启"
                  : "未上架"
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
  actions: P.any,
  form: P.any
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
        editProductLine,
        updateProductLine,
        buyPower,
        deleteStation,
        addProductLine
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
