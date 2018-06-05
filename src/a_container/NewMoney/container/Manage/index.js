/* List 资金管理/收款管理 */

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
  Popconfirm,
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
  addProduct,
  updateProduct,
  updateProductType,
  deleteProduct,
  removeProduct,
  deleteImage,
  findProductModelByWhere,
  upProductModel
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
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchName: "", // 搜索 - 名称
      addOrUp: "add", // 当前操作是新增还是修改
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      fileList: [], // 产品图片已上传的列表
      fileListDetail: [], // 详细图片已上传的列表
      fileLoading: false, // 产品图片正在上传
      fileDetailLoading: false // 详细图片正在上传
    };
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的产品类型
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      onShelf: this.state.searchName,
      productType: this.state.searchTypeId
    };
    this.props.actions.findProductByWhere(tools.clearNull(params)).then(res => {
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

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewName: record.name,
      addnewTypeId: `${record.typeId}`,
      addnewPrice: record.price,
      addnewTypeCode: String(record.typeCode)
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
      fileList: record.productImg
        ? record.productImg
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // 产品图片已上传的列表
      fileListDetail: record.detailImg
        ? [{ uid: -1, url: record.detailImg, status: "done" }]
        : [] // 详细图片已上传的列表
    });
  }

  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.removeProduct({ id: id }).then(res => {
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

  // 添加新用户模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewName",
      "addnewPrice",
      "addnewTypeId",
      "addnewTypeCode",
      "addnewSaleMode",
      "addnewMarketPrice",
      "addnewAmount",
      "addnewOnShelf",
      "addnewProductImg",
      "addnewTimeLimitType",
      "addnewTimeLimitNum"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
      addnewModalShow: true,
      nowData: null
    });
  }

  // 添加或修改确定
  onAddNewOk() {
    console.log("AAAAAAAA");
    const me = this;
    const { form } = me.props;
    if (me.state.fileLoading || me.state.fileDetailLoading) {
      message.warning("有图片正在上传...");
      return;
    }

    form.validateFields(
      [
        "addnewName",
        "addnewPrice",
        "addnewTypeId",
        "addnewTypeCode",
        "addnewSaleMode",
        "addnewMarketPrice",
        "addnewAmount",
        "addnewOnShelf",
        "addnewProductImg",
        "addnewTimeLimitType",
        "addnewTimeLimitNum"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          name: values.addnewName,
          price: values.addnewPrice,
          typeId: Number(values.addnewTypeId),
          typeCode: Number(values.addnewTypeCode),
          saleMode: Number(values.addnewSaleMode),
          marketPrice: values.addnewMarketPrice,
          amount: values.addnewAmount,
          timeLimitType: values.addnewTimeLimitType,
          timeLimitNum: values.addnewTimeLimitNum,
          onShelf: values.addnewOnShelf ? 1 : 0,
          productImg: this.state.fileList.map(item => item.url).join(","),
          detailImg: this.state.fileListDetail.length
            ? this.state.fileListDetail[0].url
            : ""
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addProduct(tools.clearNull(params))
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
        } else {
          params.id = this.state.nowData.id;
          me.props.actions
            .updateProduct(params)
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
      }
    );
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

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "收款方名称"
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.findProductNameById(text)
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
          controls.push(
            <Popconfirm
              key="1"
              title="确定删除吗?"
              onConfirm={() => this.onRemoveClick(record.id)}
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
        title: "收款方式"
      },
      {
        title: "收款账号"
      },
      {
        title: "收款方名称"
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.findProductNameById(text)
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
          controls.push(
            <Popconfirm
              key="1"
              title="确定删除吗?"
              onConfirm={() => this.onRemoveClick(record.id)}
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
        detailImg: item.detailImg,
        itemNum: item.itemNum,
        newProduct: item.newProduct,
        offShelfTime: item.offShelfTime,
        onShelf: item.onShelf,
        onShelfTime: item.onShelfTime,
        price: item.typeModel ? item.typeModel.price : "",
        productImg: item.productImg,
        saleMode: item.saleMode,
        typeId: item.typeId,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id
      };
    });
  }

  // handleModeChange(e){
  //     const mode = e.target.value;
  //     this.setState({ mode });
  // }

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
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-func">
            <li>
              <div>
                <Tabs type="card">
                  <TabPane tab="收款方管理" key="1" style={{ width: "1630px" }}>
                    <div className="system-table">
                      <ul className="search-func">
                        <li style={{ margin: "10px" }}>
                          <Button
                            type="primary"
                            onClick={() => this.onAddNewShow()}
                          >
                            <Icon type="plus-circle-o" />添加收款方
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
                  <TabPane tab="收款方式管理" key="2">
                    <div className="system-table">
                      <ul className="search-func">
                        <li style={{ margin: "10px" }}>
                          <Button
                            type="primary"
                            onClick={() => this.onAddNewShow()}
                          >
                            <Icon type="plus-circle-o" />添加收款方式
                          </Button>
                        </li>
                      </ul>
                      <Table
                        columns={this.makeColumns2()}
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
                </Tabs>
              </div>
            </li>
          </ul>
        </div>
        {/* 添加模态框 */}
        <Modal
          title={this.state.addOrUp === "add" ? "添加产品" : "修改产品"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请选择产品类型"
                  }
                ]
              })(
                <Select
                  placeholder="请选择产品类型"
                  onChange={() => this.onTypeIdChange()}
                >
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={`${item.id}`}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品名称" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入产品名称" },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 12) {
                          callback("最多输入12位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入产品名称" />)}
            </FormItem>
            {/*<FormItem*/}
            {/*label="产品型号"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*{getFieldDecorator('addnewTypeCode', {*/}
            {/*initialValue: undefined,*/}
            {/*rules: [*/}
            {/*{required: true, message: '请选择产品型号'},*/}
            {/*{ validator: (rule, value, callback) => {*/}
            {/*console.log('value===', value);*/}
            {/*const v = tools.trim(value);*/}
            {/*if (v) {*/}
            {/*if (v.length > 12) {*/}
            {/*callback('最多输入12位字符');*/}
            {/*}*/}
            {/*}*/}
            {/*callback();*/}
            {/*}}*/}
            {/*],*/}
            {/*})(*/}
            {/*<Select*/}
            {/*placeholder="请选择产品型号"*/}
            {/*>*/}
            {/*{ this.state.productModels.filter((item) => String(item.typeId) === String(form.getFieldValue('addnewTypeId'))).map((item, index) => <Option key={index} value={`${item.id}`}>{this.getNameByModelId(item.id)}</Option>) }*/}
            {/*</Select>*/}
            {/*)}*/}
            {/*</FormItem>*/}
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
            <FormItem label="产品名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.findProductNameById(this.state.nowData.typeId)
                : ""}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByModelId(this.state.nowData.typeCode)
                : ""}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {!!this.state.nowData
                ? this.state.nowData.onShelf
                  ? "已上架"
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
        findProductByWhere,
        findProductTypeByWhere,
        addProduct,
        updateProductType,
        deleteProduct,
        removeProduct,
        deleteImage,
        findProductModelByWhere,
        upProductModel,
        updateProduct
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
