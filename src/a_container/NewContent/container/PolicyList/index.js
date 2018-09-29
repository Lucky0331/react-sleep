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
  Tooltip,
  Popconfirm,
  Select,
  Divider,
  Popover,
  Radio,
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
  NewActivityList,
  upDateActivityList,
  deleteActivity,
  onChange,
  onOk,
  findProductByWhere,
  upDateOnlineList,
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productModels: [], // 所有的产品型号
      searchName: "", // 搜索 - 发布状态
      searchTitle:"" ,//搜索 - 活动名称
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      searchLiveStatus:'', //搜索 - 标签
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      fileList:[] ,//活动图片上传列表
    };
  }

  componentDidMount() {
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductByWhere({ pageNum: 0, pageSize: 9999 ,onShelf:1})
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productModels: res.data.result || []
          });
        }
      });
  }
  
  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      deleteFlag: this.state.searchName,
      title: this.state.searchTitle,
      apId: this.state.searchBanner
    };
    // this.props.actions.ActivityList(tools.clearNull(params)).then(res => {
    //   if (res.status === "0") {
    //     this.setState({
    //       data: res.data.result || [],
    //       pageNum,
    //       pageSize,
    //       total: res.data.total
    //     });
    //   } else {
    //     message.error(res.message || "获取数据失败，请重试");
    //   }
    //   console.log("啥活动：", res.data.result);
    // });
  }

  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  //搜索 - 活动名称输入框值改变时触发
  searchTitleChange(e) {
    this.setState({
      searchTitle: e.target.value
    });
  }

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 添加新活动模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTitle",
      "addnewUrl",
      "addnewProduct",
      "addnewDeletFlag",
      "addnewSorts"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      addnewModalShow: true,
      nowData: null
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 添加或修改确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewTitle",
        "addnewProduct",
        "addnewUrl",
        "addnewDeletFlag",
        "addnewSorts"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });
        const params = {
          title: values.addnewTitle,
          acUrl: values.addnewUrl,
          deleteFlag:values.addnewDeletFlag,
          recommend: values.addnewProduct ? String(values.addnewProduct) :undefined,
          sorts:Number(values.addnewSorts),
          acImg:this.state.fileList.map(item => item.url).join(","),
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .NewActivityList(tools.clearNull(params))
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
            .upDateActivityList(params)
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
    const params = {
      activityId:record.id,
    };
    this.props.actions.activityList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data || [],
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewTitle: String(record.title),
      addnewUrl: record.acUrl,
      addnewProduct: record.recommendProductList ? record.recommendProductList.map((item)=>{return String(item.productId)}) : undefined,
      addnewDeletFlag:record.deleteFlag ? 1 : 0,
      addnewSorts:record.sorts,
      addnewacImg: record.acImg
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
    });
  }

  // 发布或回撤
  onUpdateClick2(record) {
    const params = {
      id: Number(record.id)
    };
    this.props.actions
      .upDateOnlineList(params)
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
  onRemoveClick(id) {
    this.props.actions.deleteActivity({ id: id }).then(res => {
      if (res.status === "0") {
        message.success(res.message );
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
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

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchTitle: ""
    });
  }

  // 构建字段
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
        title: "文件分类",
      },
      {
        title: "文件标题",
      },
      {
        title:'状态',
      },
      {
        title:"在当前分类下的排序",
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
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="发布">
                <Icon type="login" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn red"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="撤回">
                <Icon type="logout" />
              </Tooltip>
            </span>
          );
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
          controls.push(
            <span
              key="3"
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
              key="4"
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
    return data.map((item, index) => {
      return {
        id: item.id,
        key: index,
        orderNo: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
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

    const { searchTitle } = this.state;
    const suffix = searchTitle ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    console.log('这是什么：', this.state.productModels);
    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>文件分类</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
              >
              </Select>
            </li>
            <li>
              <span>文件标题</span>
              <Input
                style={{ width: "172px", marginRight: "10px" }}
              />
            </li>
            <li>
              <span>状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
              >
                <Option value={1}>已发布</Option>
                <Option value={2}>未发布</Option>
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
            <ul className="search-func">
              <li style={{ marginTop: "2px" }}>
                <Button
                  icon="plus-circle-o"
                  type="primary"
                  onClick={() => this.onAddNewShow()}
                >
                  新增文件
                </Button>
              </li>
            </ul>
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
        {/* 添加模态框 */}
        <Modal
          title={this.state.addOrUp === "add" ? "新建文件" : "修改文件"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="文件分类" {...formItemLayout}>
              {getFieldDecorator("formEnd", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请选择文件分类" }
                ]
              })(
                <Select
                  placeholder="全部"
                  allowClear
                >
                </Select>
              )}
            </FormItem>
            <FormItem label="文件标题" {...formItemLayout}>
              {getFieldDecorator("addnewTitle", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入文件标题" },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 20) {
                          callback("最多输入20个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入活动名称" />)}
            </FormItem>
            <FormItem label="链接地址" {...formItemLayout}>
              {getFieldDecorator("addnewUrl", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入链接地址" }]
              })(<Input placeholder="请输入链接地址" />)}
            </FormItem>
            <FormItem label="是否发布" {...formItemLayout}>
              {getFieldDecorator("addnewDeletFlag", {
              initialValue: undefined,
              rules: [{ required: true, message: "请选择是否发布" }]
              })(
              <Select placeholder="请选择是否发布">
                <Option value={1}>否</Option>
                <Option value={0}>是</Option>
              </Select>
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("addnewSorts", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<Input placeholder="请输入排序序号" />)}
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
            <FormItem label="活动名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.title : ""}
            </FormItem>
            <FormItem label="活动链接" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.acUrl : ""}
            </FormItem>
            <FormItem label="发布时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updateTime : ""}
            </FormItem>
            <FormItem label="发布状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.deleteFlag) === true ? (
                  <span style={{ color: "red" }}>未发布</span>
                ) : (
                  <span style={{ color: "green" }}>已发布</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.sorts : ""}
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
        NewActivityList,
        upDateActivityList,
        deleteActivity,
        onChange,
        onOk,
        findProductByWhere,
        upDateOnlineList,
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
