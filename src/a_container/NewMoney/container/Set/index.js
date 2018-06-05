/* List 资金管理/分配规则配置 */

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
  Table,
  message,
  InputNumber,
  Popover,
  Modal,
  Radio,
  Tooltip,
  Select,
  Upload,
  Tabs,
  Divider
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
  findProductByWhere,
  findProductTypeByWhere,
  ServiceList,
  updateServiceList,
  onChange,
  addProduct,
  addMoneyList,
  updateProduct,
  updateProductType,
  deleteProduct,
  removeProduct,
  deleteImage,
  findProductModelByWhere,
  upProductModel,
  MoneyList,
  updateMoneyList
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "top",
      data: [], // 当前页面全部数据
      data2: [], // 当前页面全部数据
      productTypes: [], // 所有的结算类型
      productModels: [], // 所有的产品型号
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchName: "", // 搜索 - 名称
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      onUpdateClick: false, // 修改经营收益规则时模态框是否显示
      onUpdateClick2: false, // 修改服务收益规则时模态框是否显示
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      nowData2: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的结算类型
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
    this.onGetData2(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面经营收益所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize
    };
    this.props.actions.MoneyList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result,
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 查询当前页面服务收益所需列表数据
  onGetData2(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize
    };
    this.props.actions.ServiceList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data.result || [],
          pageNum,
          pageSize
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 获取所有的结算类型，当前页要用
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

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据产品类型ID返回产品类型名称
  getNameByTypeId(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
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

  // 添加新规则模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewProductType",
      "addnewUserSaleRatio",
      "addnewSupplierRatio",
      "addnewStationRatio",
      "addnewDistributorRatio"
    ]);
    this.setState({
      addnewModalShow: true,
      nowData: null
    });
  }

  // 添加确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewProductType",
        "addnewUserSaleRatio",
        "addnewSupplierRatio",
        "addnewStationRatio",
        "addnewDistributorRatio"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          productCode: Number(values.addnewProductType),
          userSaleRatio: Number(values.addnewUserSaleRatio),
          distributorRatio: Number(values.addnewDistributorRatio),
          stationRatio: Number(values.addnewStationRatio),
          supplierRatio: Number(values.addnewSupplierRatio)
        };
        me.props.actions
          .addMoneyList(params)
          .then(res => {
            me.setState({
              addnewLoading: false
            });
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onAddNewClose();
          })
          .catch(() => {
            me.setState({
              addnewLoading: false
            });
          });
      }
    );
  }

  // 添加新用户取消
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  //根据code值不同显示的字段不同
  Newproduct(e) {
    this.setState({
      code: e
    });
    console.log("e的数值是：", e);
    //产品类型改变时，重置结算类型的值位undefined
    const { form } = this.props;
    form.resetFields(["addnewProduct"]);
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record：", record);
    form.setFieldsValue({
      upProductType: Number(record.productType),
      upUserSaleRatio: Number(record.userSaleRatio),
      upSupplierRatio: Number(record.supplierRatio),
      upStationRatio: Number(record.stationRatio),
      upDistributorRatio: Number(record.distributorRatio)
    });
    // console.log('是什么：', record);
    me.setState({
      nowData: record,
      upModalShow: true
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "upProductType",
        "upUserSaleRatio",
        "upSupplierRatio",
        "upStationRatio",
        "upDistributorRatio"
      ],
      (err, values) => {
        if (err) {
          return;
        }

        me.setState({
          upLoading: true
        });
        const params = {
          productType: Number(record.productType),
          userSaleRatio: Number(values.upUserSaleRatio),
          distributorRatio: Number(values.upDistributorRatio),
          stationRatio: Number(values.upStationRatio),
          supplierRatio: Number(values.upSupplierRatio)
        };

        this.props.actions
          .updateMoneyList(params)
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
      }
    );
  }
  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 修改服务收益中某一条数据 模态框出现
  onUpdateClick2(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record：", record);
    form.setFieldsValue({
      upStationRatio: Number(record.stationRatio)
    });
    // console.log('是什么：', record);
    me.setState({
      nowData2: record,
      upModalShow2: true
    });
  }

  // 确定修改某一条数据
  onUpOk2() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "upStationRatio",
        "upUserSaleRatio",
        "upDistributorRatio",
        "upSupplierRatio"
      ],
      (err, values) => {
        if (err) {
          return;
        }

        me.setState({
          upLoading: true
        });
        const params = {
          productType: Number(record.productType),
          stationRatio: Number(values.upStationRatio),
          userSaleRatio: Number(values.upUserSaleRatio),
          distributorRatio: Number(values.upDistributorRatio),
          supplierRatio: Number(values.upSupplierRatio)
        };

        this.props.actions
          .updateServiceList(params)
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
      }
    );
  }
  // 关闭修改某一条数据
  onUpClose2() {
    this.setState({
      upModalShow2: false
    });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
    this.onGetData2(page, pageSize);
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
        title: "结算类型",
        dataIndex: "ruleName",
        key: "ruleName"
      },
      {
        title: "分销商",
        dataIndex: "userSaleRatio",
        key: "userSaleRatio",
        render: text => {
          return `${text}%`;
        }
      },
      {
        title: "经销商",
        dataIndex: "distributorRatio",
        key: "distributorRatio",
        render: text => {
          return `${text}%`;
        }
      },
      {
        title: "服务站",
        dataIndex: "stationRatio",
        key: "stationRatio",
        render: text => {
          return `${text}%`;
        }
      },
      {
        title: "总部",
        dataIndex: "supplierRatio",
        key: "supplierRatio",
        render: text => {
          return `${text}%`;
        }
      },
      {
        title: "操作",
        key: "control",
        width: 170,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
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

  // 构建字段
  makeColumns2() {
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
        title: "结算类型",
        dataIndex: "ruleName",
        key: "ruleName"
      },
      // {
      //     title: '收益类型',
      //     dataIndex:'earningsType',
      //     key: 'earningsType',
      // },
      {
        title: "服务站",
        dataIndex: "stationRatio",
        key: "stationRatio",
        render: text => {
          return `${text}%`;
        }
      },
      {
        title: "操作",
        key: "control",
        width: 170,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
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

  // 构建经营收益所需table数据
  makeData(data) {
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        typeCode: item.typeCode,
        amount: item.amount,
        buyCount: item.buyCount,
        createTime: item.createTime,
        creator: item.creator,
        itemNum: item.itemNum,
        ruleName: item.ruleName,
        newProduct: item.newProduct,
        productType: item.productType,
        saleMode: item.saleMode,
        typeId: item.typeId,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id,
        supplierRatio: item.supplierRatio,
        userSaleRatio: item.userSaleRatio,
        stationRatio: item.stationRatio,
        distributorRatio: item.distributorRatio,
        productCode: item.productCode
      };
    });
  }

  // 构建服务收益所需table数据
  makeData2(data2) {
    console.log("data2是个啥：", data2);
    return data2.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        typeCode: item.typeCode,
        amount: item.amount,
        buyCount: item.buyCount,
        newProduct: item.newProduct,
        productType: item.productType,
        saleMode: item.saleMode,
        typeId: item.typeId,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id,
        stationRatio: item.stationRatio,
        productCode: item.productCode,
        userSaleRatio: item.userSaleRatio,
        distributorRatio: item.distributorRatio,
        supplierRatio: item.supplierRatio
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
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };

    const modelId = form.getFieldValue("addnewTypeCode");

    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-func">
            <li>
              <div>
                <Tabs type="card">
                  <TabPane
                    tab="经营收益结算规则"
                    key="1"
                    style={{ width: "1630px" }}
                  >
                    <div className="system-table">
                      <ul className="search-func">
                        <li style={{ margin: "10px" }}>
                          <Button
                            type="primary"
                            onClick={() => this.onAddNewShow()}
                          >
                            <Icon type="plus-circle-o" />添加规则
                          </Button>
                        </li>
                      </ul>
                      <Table
                        columns={this.makeColumns()}
                        className="my-table"
                        scroll={{ x: 1600 }}
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
                  </TabPane>
                  <TabPane tab="服务收益结算规则" key="2">
                    <div className="system-table">
                      <Table
                        columns={this.makeColumns2()}
                        className="my-table"
                        scroll={{ x: 1600 }}
                        dataSource={this.makeData2(this.state.data2)}
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
                  </TabPane>
                </Tabs>
              </div>
            </li>
          </ul>
        </div>
        {/* 添加模态框 */}
        <Modal
          title="添加规则信息"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("addnewProductType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select
                  style={{ width: "60%" }}
                  placeholder="请选择产品类型"
                  onChange={e => this.Newproduct(e)}
                >
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="结算类型" {...formItemLayout}>
              {getFieldDecorator("addnewProduct", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请选择结算类型" },
                  {
                    validator: (rule, value, callback) => {
                      console.log("value===", value);
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 20) {
                          callback("最多输入20位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(
                <Select style={{ width: "60%" }} placeholder="请选择结算类型">
                  {/*{ this.state.productTypes.map((item, index) => <Option key={index} value={`${item.id}`}>{item.name}</Option>) }*/}
                </Select>
              )}
            </FormItem>
            {/*<FormItem*/}
            {/*label="收益类型"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*{getFieldDecorator('addnewProfit', {*/}
            {/*initialValue: undefined,*/}
            {/*rules: [*/}
            {/*{required: true, whitespace: true, message: '请选择收益类型',}*/}
            {/*],*/}
            {/*})(*/}
            {/*<Select style={{width:'60%'}} placeholder="请选择收益类型">*/}
            {/*/!*{ this.state.productTypes.map((item, index) => <Option key={index} value={`${item.id}`}>{item.name}</Option>) }*!/*/}
            {/*</Select>*/}
            {/*)}*/}
            {/*</FormItem>*/}
            <FormItem label="分销商" {...formItemLayout}>
              {getFieldDecorator("addnewUserSaleRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入分销商收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
            <FormItem label="经销商" {...formItemLayout}>
              {getFieldDecorator("addnewDistributorRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入经销商收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
            <FormItem label="服务站" {...formItemLayout}>
              {getFieldDecorator("addnewStationRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入服务站收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
            <FormItem label="总部" {...formItemLayout}>
              {getFieldDecorator("addnewSupplierRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入总部收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改模态框 */}
        <Modal
          title="修改规则信息"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk2()}
          onCancel={() => this.onUpClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByTypeId(this.state.nowData.productType)
                : ""}
            </FormItem>
            <FormItem label="结算类型" {...formItemLayout}>
              {/*{!!this.state.nowData ? this.getNameByTypeId(this.state.nowData.productType):''}*/}
            </FormItem>
            {/*<FormItem*/}
            {/*label="收益类型"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*/!*{!!this.state.nowData ? this.getNameByTypeId(this.state.nowData.productType):''}*!/*/}
            {/*</FormItem>*/}
            <FormItem label="分销商" {...formItemLayout}>
              {getFieldDecorator("upUserSaleRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入分销商收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
            <FormItem label="经销商" {...formItemLayout}>
              {getFieldDecorator("upDistributorRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入经销商收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
            <FormItem label="服务站" {...formItemLayout}>
              {getFieldDecorator("upStationRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入服务站收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
            <FormItem label="总部" {...formItemLayout}>
              {getFieldDecorator("upSupplierRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入总部收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
            </FormItem>
          </Form>
        </Modal>

        {/* 修改服务收益模态框 */}
        <Modal
          title="修改规则信息"
          visible={this.state.upModalShow2}
          onOk={() => this.onUpOk2()}
          onCancel={() => this.onUpClose2()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="结算类型" {...formItemLayout}>
              {/*{!!this.state.nowData ? this.getNameByTypeId(this.state.nowData.productType):''}*/}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByTypeId(this.state.nowData.productType)
                : ""}
            </FormItem>
            {/*<FormItem*/}
            {/*label="收益类型"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*/!*{!!this.state.nowData ? this.getNameByTypeId(this.state.nowData.productType):''}*!/*/}
            {/*</FormItem>*/}
            <FormItem label="服务站" {...formItemLayout}>
              {getFieldDecorator("upStationRatio", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入服务站收益百分比" }]
              })(
                <InputNumber
                  style={{ width: "60%" }}
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace("%", "")}
                  onChange={onChange}
                />
              )}
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
        findProductByWhere,
        addMoneyList,
        findProductTypeByWhere,
        ServiceList,
        onChange,
        updateServiceList,
        addProduct,
        updateProductType,
        deleteProduct,
        removeProduct,
        deleteImage,
        MoneyList,
        findProductModelByWhere,
        upProductModel,
        updateMoneyList,
        updateProduct
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
