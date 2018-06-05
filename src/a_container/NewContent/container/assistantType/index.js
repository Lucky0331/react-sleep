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
  onChange,
  onOk,
} from "../../../../a_action/shop-action";
import {
  assistantTypeList,
  AddassistantTypeList,
  UpassistantTypeList,
  DelateassistantTypeList
} from "../../../../a_action/card-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Search = Input.Search;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 一级全部数据
      productTypes: [], //所有的产品类型
      searchOrderNo: "", //搜索 - 分类名称
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
      typeName: this.state.searchOrderNo,
    };
    this.props.actions.assistantTypeList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total || []
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchDeleteStatus: e
    });
  }

  //搜索 - 分类名称输入框值改变时触发
  searchOrderNoChange(e) {
    this.setState({
      searchOrderNo: e.target.value
    });
  }

  // 添加分类模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewColumnOne", //添加分类名称
      "addnewTypeCode",
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true,
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
    form.validateFields(
      [
        "addnewTypeName", //添加分类名称
        "addnewTypeCode",//添加唯一标识
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          typeName: values.addnewTypeName, //添加分类名称
          typeCode:Math.floor(Math.random()*99+1),//随机typeCode值
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .AddassistantTypeList(tools.clearNull(params))
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
            .UpassistantTypeList(params)
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
      addnewTypeCode:record.typeCode,
      addnewTypeName: record.typeName,
    });
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
    });
  }
  

  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.DelateassistantTypeList({ id: id }).then(res => {
      if (res.status === "0") {
        message.success(res.message || "删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error("该问答分类内容已关联问答列表的内容");
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
  
  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  // 分类构建字段
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
        title: "分类名称",
        dataIndex: 'typeName',
        key: 'typeName',
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

  // 构建分类table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        typeName: item.typeName,
        typeCode:item.typeCode,
        id:item.id,
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
          <div className="system-table">
            <ul className="search-ul more-ul">
              <li>
                <span>分类名称</span>
                <Input
                  style={{ width: "175px" }}
                  onChange={e => this.searchOrderNoChange(e)}
                />
              </li>
              <li style={{ marginRight: "10px" }}>
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
                  icon="plus-circle-o"
                  type="primary"
                  onClick={() => this.onAddNewShow()}
                >
                  添加分类
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
            title={this.state.addOrUp === "add" ? "添加分类" : "修改分类"}
            visible={this.state.addnewModalShow}
            onOk={() => this.onAddNewOk()}
            onCancel={() => this.onAddNewClose()}
            confirmLoading={this.state.addnewLoading}
          >
          <Form>
            <FormItem label="分类名称" {...formItemLayout}>
              {getFieldDecorator("addnewTypeName", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入分类名称" }]
              })(<Input placeholder="请输入分类名称" />)}
            </FormItem>
          </Form>
        </Modal>
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
        onOk,
        assistantTypeList,
        AddassistantTypeList,
        UpassistantTypeList,
        DelateassistantTypeList
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
