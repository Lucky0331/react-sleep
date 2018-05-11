/* Banner 商城管理/内容管理/banner管理 */

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
  Modal,
  Tabs,
  Tooltip,
  Popconfirm,
  Select,
  Divider,
  Popover,
  InputNumber,
  Upload
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
  deleteImage,
  onChange,
  onOk,
  advertPositionList,
  findProductModelByWhere,
  findProductTypeByWhere
} from "../../../../a_action/shop-action";
import {
  Cardlist,
  deleteCard,
  addCard,
  UpdateCard,
  UpdateOnline
} from "../../../../a_action/card-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 一级全部数据
      data2:[],//二级全部数据
      productTypes: [], //所有的产品类型
      titleList: [], // 所有的标题位置
      titles: [], //所有的标题
      searchTitle: "", //搜索 - 标题
      searchDeleteStatus: "", //搜索 - 是否发布
      searchTypeCode: "", //搜索 - 产品类型
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 添加一级模态框是否显示
      addnewTwoShow: false, // 添加二级模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      fileList: [], // 代言卡上传的列表
      fileListDetail: [], //背景图上传列表
      fileLoading: false, // 缩略图片正在上传
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 一级分类数据库总共多少条数据
      total2: 0 // 一级分类数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.getAllAdvertPosition(); // 获取所有代言卡列表
    this.getAllProductType(); // 获取所有的产品类型
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      deleteStatus: this.state.searchDeleteStatus,
      title: this.state.searchTitle,
      productTypeCode: this.state.searchTypeCode
    };
    // this.props.actions.Cardlist(tools.clearNull(params)).then(res => {
    //   console.log("返回的什么：", res.data.result);
    //   if (res.status === 200) {
    //     this.setState({
    //       data: res.data.result || [],
    //       pageNum,
    //       pageSize,
    //       total: res.data.total || []
    //     });
    //   } else {
    //     message.error(res.returnMessaage || "获取数据失败，请重试");
    //   }
    //   console.log("啥代言卡信息：", res.data.result);
    // });
  }

  // 获取代言卡信息
  getAllAdvertPosition() {
    this.props.actions
      .advertPositionList({ pageNum: 0, pageSize: 10 })
      .then(res => {
        if (res.returnCode === "0") {
          this.setState({
            titleList: res.messsageBody.result
          });
        }
      });
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

  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchDeleteStatus: e
    });
  }

  //搜索 - 标题输入框值改变时触发
  searchTitleChange(e) {
    this.setState({
      searchTitle: e.target.value
    });
  }

  // 搜索 - 产品类型输入框值改变时触发
  searchProductType(typeId) {
    this.setState({
      searchTypeCode: typeId
    });
  }

  // 添加一级分类模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTypeId", //添加产品类型
      "addnewTitle", // 添加标题
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true,
      nowData: null
    });
  }
  
  // 添加二级分类模态框出现
  onAddNewShowTwo() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTypeId", //添加产品类型
      "addnewTitle", // 添加标题
    ]);
    this.setState({
      addOrUp: "add",
      addnewTwoShow: true,
      nowData: null
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false,
      addnewTwoShow:false,
    });
  }

  // 添加或修改确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    if (me.state.fileLoading || me.state.fileDetailLoading) {
      message.warning("有图片正在上传...");
      return;
    }

    form.validateFields(
      [
        "addnewTypeId", //添加产品类型
        "addnewTitle", // 添加标题
        "addnewSlogan", //添加标语
        "addnewContent", //添加分享文案的内容
        "addnewConditions", //添加是否发布
        "addnewColor", //添加文字颜色
        "addnewBtnColor", // 添加按钮颜色
        "addnewSorts", // 添加排序的顺序
        "addnewProductImg"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          productTypeCode: values.addnewTypeId, //添加产品类型
          productTypeName: this.findProductNameById(values.addnewTypeId), //添加产品名称
          name: values.addnewTitle, // 添加标题
          title: values.addnewSlogan, //添加标语
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addCard(tools.clearNull(params))
            .then(res => {
              me.setState({
                addnewLoading: false
              });
              this.onGetData(1, this.state.pageSize);
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
            .UpdateCard(params)
            .then(res => {
              // 修改
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

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewTypeId: record.productTypeCode,
      addnewTitle: String(record.title),
      addnewSlogan: String(record.name),
      addnewContent: String(record.content),
      addnewConditions: Boolean(record.deleteStatus) ? false : true,
      addnewBtnColor: String(record.colorTwo),
      addnewColor: String(record.colorOne),
      addnewSorts: Number(record.sorts)
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
      // fileList: record.contentImage ? record.contentImage.split(',').map((item, index) => ({ uid: index, url: item, status: 'done' })) : [],   // 标题图上传的列表
    });
  }
  

  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.deleteCard({ id: id }).then(res => {
      if (res.status === 200) {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.returnMessaage || "删除失败，请重试");
      }
    });
  }
  

  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
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

  // 一级分类构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      {
        title: "一级分类名称",
        // dataIndex: 'productTypeCode',
        // key: 'productTypeCode',
      },
      {
        title: "操作",
        key: "control",
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
  
  //二级分类构建字段
  makeColumnsTwo() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      {
        title: "二级分类名称",
        // dataIndex: 'productTypeCode',
        // key: 'productTypeCode',
      },
      {
        title:'一级分类',
      },
      {
        title: "操作",
        key: "control",
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

  // 构建一级分类table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        typeId: item.product ? item.product.typeId : "",
        sorts: item.sorts,
      };
    });
  }
  
  // 构建二级分类table所需数据
  makeDataTwo(data2) {
    return data2.map((item, index) => {
      return {
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        typeId: item.product ? item.product.typeId : "",
        sorts: item.sorts,
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
          <Tabs type="card">
            <TabPane tab="一级分类" key="1">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>一级分类名称</span>
                    <Input
                      style={{ width: "172px" }}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li style={{ marginTop: "2px" }}>
                    <Button
                      icon="plus-circle-o"
                      type="primary"
                      onClick={() => this.onAddNewShow()}
                    >
                      添加一级分类
                    </Button>
                  </li>
                </ul>
               </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumns()}
                  dataSource={this.makeData(this.state.data)}
                  // scroll={{ x: 400 }}
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
              {/* 添加模态框 */}
              <Modal
                title={this.state.addOrUp === "add" ? "添加二级分类" : "修改二级分类"}
                visible={this.state.addnewTwoShow}
                onOk={() => this.onAddNewOk()}
                onCancel={() => this.onAddNewClose()}
                confirmLoading={this.state.addnewLoading}
              >
                <Form>
                  <FormItem label="一级分类" {...formItemLayout}>
                    {getFieldDecorator("addnewTypeId", {
                      initialValue: undefined,
                      rules: [{ required: true, message: "请输入一级分类名称" }]
                    })(<Input placeholder="请输入一级分类名称" />)}
                  </FormItem>
                  <FormItem label="二级分类名称" {...formItemLayout}>
                    {getFieldDecorator("addnewTypeId", {
                      initialValue: undefined,
                      rules: [{ required: true, message: "请输入二级分类名称" }]
                    })(<Input placeholder="请输入二级分类名称" />)}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
            <TabPane tab="二级分类" key="2">
              <div className="system-table">
                <ul className="search-ul more-ul">
                  <li>
                    <span>二级分类名称</span>
                    <Input
                      style={{ width: "172px" }}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li>
                    <span>一级分类</span>
                    <Input
                      style={{ width: "172px" }}
                      onChange={e => this.searchOrderNoChange(e)}
                    />
                  </li>
                  <li style={{ marginTop: "2px" }}>
                    <Button
                      icon="plus-circle-o"
                      type="primary"
                      onClick={() => this.onAddNewShowTwo()}
                    >
                      添加二级分类
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="system-table">
                <Table
                  columns={this.makeColumnsTwo()}
                  dataSource={this.makeDataTwo(this.state.data2)}
                  // scroll={{ x: 400 }}
                  pagination={{
                    total: this.state.total2,
                    current: this.state.pageNum,
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
                title={this.state.addOrUp === "add" ? "添加一级分类" : "修改一级分类"}
                visible={this.state.addnewModalShow}
                onOk={() => this.onAddNewOk()}
                onCancel={() => this.onAddNewClose()}
                confirmLoading={this.state.addnewLoading}
              >
                <Form>
                  <FormItem label="一级分类名称" {...formItemLayout}>
                    {getFieldDecorator("addnewTypeId", {
                      initialValue: undefined,
                      rules: [{ required: true, message: "请输入一级分类名称" }]
                    })(<Input placeholder="请输入一级分类名称" />)}
                  </FormItem>
                </Form>
              </Modal>
            </TabPane>
          </Tabs>
        </div>
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
        onChange,
        deleteImage,
        onOk,
        Cardlist,
        advertPositionList,
        findProductModelByWhere,
        findProductTypeByWhere,
        deleteCard,
        addCard,
        UpdateCard,
        UpdateOnline
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
