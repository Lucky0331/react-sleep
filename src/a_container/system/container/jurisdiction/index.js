/* Jurisdiction 系统管理/权限管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Tree,
  Button,
  Popconfirm,
  Form,
  Input,
  Radio,
  Select,
  message,
  Table,
  Tooltip,
  Icon,
  Modal,
  InputNumber
} from "antd";
import P from "prop-types";
import _ from "lodash";
import "./index.scss";
import tools from "../../../../util/tools";
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  findAllMenu,
  findButtonsByMenuId,
  addButtons,
  updateButtons,
  deleteButtons
} from "../../../../a_action/sys-action";

// ==================
// Definition
// ==================

const TreeNode = Tree.TreeNode;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Role extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页数据
      nowData: null, // 当前选中的Tree菜单项
      nowJurData: null, // 当前选中的权限项 - 修改和删除的时候要用
      sourceData: [], // 经过处理的原始数据
      addLoading: false, // 是否正在增加菜单中
      fatherTreeShow: false, // 选择父级tree是否出现
      modalQueryShow: false, // 查看 - 模态框 是否出现
      upModalShow: false, // 修改 - 模态框 是否出现
      upLoading: false, // 修改 - 是否loading中
      treeFatherValue: null, // 修改 - 父级树选择的父级信息
      addModalShow: false, // 添加 - 模态框 是否出现
      searchMenuName: "", // 查询 - 菜单名
      searchConditions: undefined, // 查询 - 状态
      total: 0, // 总数 直接全部查询，前端分页
      pageNum: 1, // 第几页 - 这里是前端分页，只是为了构建序号，由TABLE返回
      pageSize: 10 // 每页多少条 - 这里是前端分页，只是为了构建序号，由TABLE返回
    };
  }

  componentDidMount() {
    if (!this.props.allMenu || this.props.allMenu.length <= 0) {
      this.getAllMenus();
    } else {
      this.makeSourceData(this.props.allMenu);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allMenu !== this.props.allMenu) {
      // allMenu变化后，重新处理原始数据
      this.makeSourceData(nextProps.allMenu);
    }
  }
  // 获取所有菜单
  getAllMenus() {
    this.props.actions.findAllMenu();
  }

  // getData 条件查询 本页面TABLE用此数据
  getData(id = 0) {
    const params = {
      menuId: id
    };
    this.props.actions.findButtonsByMenuId(params).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data
        });
      } else {
        this.setState({
          data: []
        });
      }
    });
  }

  // 处理原始数据，将原始数据处理为层级关系
  makeSourceData(data) {
    const d = _.cloneDeep(data);
    // 按照sort排序
    d.sort((a, b) => {
      return a.sorts - b.sorts;
    });
    console.log("排序之后是怎样：", d);
    const sourceData = [];
    d.forEach(item => {
      if (item.parentId === 0) {
        // parentId === 0 的为顶级菜单
        const temp = this.dataToJson(d, item);
        sourceData.push(temp);
      }
    });
    console.log("jsonMenu是什么：", sourceData);
    this.setState({
      sourceData
    });
  }

  // 递归将扁平数据转换为层级数据
  dataToJson(data, one) {
    const child = _.cloneDeep(one);
    child.children = [];
    let sonChild = null;
    data.forEach(item => {
      if (item.parentId === one.id) {
        sonChild = this.dataToJson(data, item);
        child.children.push(sonChild);
      }
    });
    if (child.children.length <= 0) {
      child.children = null;
    }
    return child;
  }

  // 构建树结构
  makeTreeDom(data, key = "") {
    return data.map((item, index) => {
      const k = key ? `${key}-${item.id}` : `${item.id}`;
      if (item.children) {
        return (
          <TreeNode
            title={item.menuName}
            key={k}
            id={item.id}
            p={item.parentId}
            data={item}
          >
            {this.makeTreeDom(item.children, k)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            title={item.menuName}
            key={k}
            id={item.id}
            p={item.parentId}
            data={item}
          />
        );
      }
    });
  }

  // 添加子菜单提交
  onAddOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      ["addBtnName", "addBtnCode", "addBtnDesc", "addBtnDuty"],
      (err, values) => {
        if (err) {
          return;
        }
        const params = {
          btnName: values.addBtnName,
          btnCode: values.addBtnCode,
          btnDesc: values.addBtnDesc,
          btnDuty: values.addBtnDuty,
          menuId: this.state.nowData.id
        };
        this.setState({ addLoading: true });
        me.props.actions
          .addButtons(tools.clearNull(params))
          .then(res => {
            if (res.status === "0") {
              message.success("添加成功");
              this.getData(this.state.nowData.id);
              this.onAddClose();
            } else {
              message.error("添加失败");
            }
            this.setState({ addLoading: false });
          })
          .catch(() => {
            this.setState({ addLoading: false });
          });
      }
    );
  }

  // 新增 - 取消
  onAddClose() {
    this.setState({
      addModalShow: false
    });
  }

  // 新增 - 模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields(["addBtnName", "addBtnCode", "addBtnDesc", "addBtnDuty"]);
    this.setState({
      addModalShow: true
    });
  }
  // 修改当前菜单
  onUpOk() {
    const me = this;
    const { form } = me.props;
    console.log("nowData是个啥：", me.state.nowData);
    form.validateFields(
      ["upBtnName", "upBtnCode", "upBtnDesc", "upBtnDuty"],
      (err, values) => {
        if (err) {
          return;
        }
        const params = {
          btnName: values.upBtnName,
          btnCode: values.upBtnCode,
          btnDesc: values.upBtnDesc,
          btnDuty: values.upBtnDuty,
          menuId: this.state.nowData.id,
          id: this.state.nowJurData.id
        };
        this.setState({ upLoading: true });
        this.props.actions
          .updateButtons(params)
          .then(res => {
            if (res.status === "0") {
              message.success("修改成功");
              this.getData(this.state.nowData.id);
              this.onUpClose();
            } else {
              message.error("修改失败");
            }
            this.setState({ upLoading: false });
          })
          .catch(() => {
            this.setState({ upLoading: false });
          });
      }
    );
  }

  // 修改 - 模态框 出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("当前修改的：", record);
    form.setFieldsValue({
      upBtnName: record.btnName,
      upBtnCode: record.btnCode,
      upBtnDesc: record.btnDesc,
      upBtnDuty: record.btnDuty
    });
    this.setState({
      nowJurData: record,
      upModalShow: true
    });
  }
  // 修改 - 模态框 关闭
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 选择父级tree出现
  onFatherShow() {
    this.setState({
      fatherTreeShow: true
    });
  }

  // TABLE页码改变
  onTableChange(p) {
    this.setState({
      pageNum: p.current
    });
  }
  // 父级tree选择确定
  onTreeOk(obj) {
    this.setState({
      treeFatherValue: obj,
      fatherTreeShow: false
    });
  }
  // 父级tree选择取消
  onTreeClose() {
    this.setState({
      fatherTreeShow: false
    });
  }

  // 查看 - 模态框出现
  onQueryClick(record) {
    this.setState({
      nowData: record,
      modalQueryShow: true
    });
  }

  // 查看 - 模态框关闭
  onQueryModalClose() {
    this.setState({
      modalQueryShow: false
    });
  }

  // 选择一个菜单项
  onTreeSelect(keys, e) {
    console.log("当前选择：", keys, e);
    if (e.selected) {
      this.setState({
        nowData: e.node.props.data
      });
      this.getData(e.node.props.data.id);
    } else {
      this.setState({
        nowData: null,
        data: []
      });
    }
  }

  // 删除一项
  onDeleteClick(id) {
    this.props.actions.deleteButtons({ btnId: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.getData(this.state.nowData.id);
      } else {
        message.error(res.message || "删除失败");
      }
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
        title: "权限名",
        dataIndex: "btnName",
        key: "btnName"
      },
      {
        title: "按钮Code",
        dataIndex: "btnCode",
        key: "btnCode"
      },
      {
        title: "职责",
        dataIndex: "btnDuty",
        key: "btnDuty"
      },
      {
        title: "描述",
        dataIndex: "btnDesc",
        key: "btnDesc"
      },
      {
        title: "操作",
        key: "control",
        width: 200,
        render: (text, record) => {
          let controls = [];

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
          controls.push(
            <Popconfirm
              key="2"
              title="确定删除吗?"
              onConfirm={() => this.onDeleteClick(record.id)}
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
    console.log("DATA:", data);
    if (!data) {
      return [];
    }
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        btnName: item.btnName,
        btnCode: item.btnCode,
        btnDesc: item.btnDesc,
        btnDuty: item.btnDuty,
        menuId: item.menuId,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize
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
      <div className="page-jurisdiction">
        <div className="menubox all_clear">
          <div className="l">
            <div className="title">
              <span>系统目录结构</span>
            </div>
            <div className="all-the-menus">
              <Tree
                defaultExpandedKeys={["0"]}
                onSelect={(keys, e) => this.onTreeSelect(keys, e)}
              >
                <TreeNode title="翼猫科技智能睡眠系统" key="0" data={{}}>
                  {this.makeTreeDom(this.state.sourceData)}
                </TreeNode>
              </Tree>
            </div>
          </div>
          <div className="r system-table">
            <div className="menu-search">
              <ul className="search-func">
                <li className={this.state.nowData && "show"}>
                  <Button type="primary" onClick={() => this.onAddNewShow()}>
                    <Icon type="plus-circle-o" />添加权限
                  </Button>
                </li>
              </ul>
            </div>
            <Table
              columns={this.makeColumns()}
              dataSource={this.makeData(this.state.data)}
              onChange={p => this.onTableChange(p)}
              pagination={{
                pageSize: this.state.pageSize,
                showQuickJumper: true,
                showTotal: (total, range) => `共 ${total} 条数据`
              }}
            />
          </div>
        </div>
        {/* 添加权限模态框 */}
        <Modal
          title="添加权限"
          visible={this.state.addModalShow}
          onOk={() => this.onAddOk()}
          onCancel={() => this.onAddClose()}
          confirmLoading={this.state.addLoading}
        >
          <Form>
            <FormItem label="权限名称" {...formItemLayout}>
              {getFieldDecorator("addBtnName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入权限名" },
                  {
                    validator: (rule, value, callback) => {
                      const v = value;
                      if (v) {
                        if (v.length > 12) {
                          callback("最多输入12位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入权限名" />)}
            </FormItem>
            <FormItem label="按钮Code" {...formItemLayout}>
              {getFieldDecorator("addBtnCode", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入Code" },
                  {
                    validator: (rule, value, callback) => {
                      const v = value;
                      if (v) {
                        if (v.length > 24) {
                          callback("最多输入24位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入Code" />)}
            </FormItem>
            <FormItem label="职责" {...formItemLayout}>
              {getFieldDecorator("addBtnDuty", {
                rules: [{ max: 50, message: "最多输入50位字符" }],
                initialValue: undefined
              })(<Input placeholder="请输入职责" />)}
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {getFieldDecorator("addBtnDesc", {
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      const v = value;
                      if (v) {
                        if (v.length > 100) {
                          callback("最多输入100位字符");
                        }
                      }
                      callback();
                    }
                  }
                ],
                initialValue: undefined
              })(
                <TextArea
                  rows={4}
                  placeholoder="请输入描述"
                  autosize={{ minRows: 2, maxRows: 6 }}
                />
              )}
            </FormItem>
          </Form>
        </Modal>

        {/* 修改用户模态框 */}
        <Modal
          title="修改权限"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem label="权限名" {...formItemLayout}>
              {getFieldDecorator("upBtnName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入权限名" },
                  { max: 12, message: "最多输入12位字符" }
                ]
              })(<Input placeholder="请输入权限名" />)}
            </FormItem>
            <FormItem label="Code" {...formItemLayout}>
              {getFieldDecorator("upBtnCode", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入Code" },
                  { max: 50, message: "最多输入50位字符" }
                ]
              })(<Input placeholder="请输入Code" />)}
            </FormItem>
            <FormItem label="职责" {...formItemLayout}>
              {getFieldDecorator("upBtnDuty", {
                rules: [{ max: 50, message: "最多输入50位字符" }],
                initialValue: undefined
              })(<Input placeholder="请输入职责" />)}
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {getFieldDecorator("upBtnDesc", {
                rules: [{ max: 100, message: "最多输入100位字符" }],
                initialValue: undefined
              })(
                <TextArea
                  rows={4}
                  placeholoder="请输入描述"
                  autosize={{ minRows: 2, maxRows: 6 }}
                />
              )}
            </FormItem>
          </Form>
        </Modal>

        {/* 查看用户详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.modalQueryShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="权限名" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.btnName : ""}
            </FormItem>
            <FormItem label="按钮Code" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.btnCode : ""}
            </FormItem>
            <FormItem label="职责" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.btnDuty : ""}
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.btnDesc : ""}
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

Role.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  allMenu: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Role);
export default connect(
  state => ({
    allMenu: state.sys.allMenu // 所有的菜单缓存
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findAllMenu,
        findButtonsByMenuId,
        addButtons,
        updateButtons,
        deleteButtons
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
