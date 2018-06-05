/* Role 系统管理/角色管理 */

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
  Popconfirm,
  Modal,
  Radio,
  Tooltip
} from "antd";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

import TreeTable from "../../../../a_component/menuTree/treeTable";

// ==================
// 本页面所需action
// ==================

import {
  findAllRole,
  findRolesByKeys,
  updateRoleInfo,
  deleteRoleInfo,
  deleteAdminUserInfo,
  AssigningMenuToRoleId,
  updateAdminUserInfo,
  findAllMenu,
  findAllMenuByRoleId,
  addRoleInfo
} from "../../../../a_action/sys-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
class Role extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      searchRoleName: "", // 搜索 - 角色名
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      upLoading: false, // 是否正在修改用户中
      menuTreeShow: false, // 菜单树是否显示
      menuDefault: [], // 用于菜单树，默认需要选中的项
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      treeLoading: false, // 控制树的loading状态，因为要先加载当前role的菜单，才能显示树
      treeOnOkLoading: false, // 是否正在分配菜单
      roleTreeData: [] // 通过findMenuByRoleId查询的所有数据，包含了全部tree带btnList
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
    if (this.props.allMenu.length <= 0) {
      this.getAllMenu();
    }
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      roleName: this.state.searchRoleName
    };
    this.props.actions.findRolesByKeys(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res);
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

  // 获取所有的菜单数据，当前页面分配菜单要用
  getAllMenu() {
    this.props.actions.findAllMenu();
  }

  // 搜索 - 用户名输入框值改变时触发
  searchRoleNameChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchRoleName: e.target.value
      });
    }
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record:", record);
    form.setFieldsValue({
      upRoleName: record.roleName,
      upRoleDuty: record.roleDuty
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
    form.validateFields(["upRoleName", "upRoleDuty"], (err, values) => {
      if (err) {
        return;
      }

      me.setState({
        upLoading: true
      });
      const params = {
        id: me.state.nowData.roleId,
        roleName: values.upRoleName,
        roleDuty: values.upRoleDuty
      };

      this.props.actions
        .updateRoleInfo(params)
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

  // 删除某一条数据
  onDeleteClick(id) {
    this.props.actions.deleteRoleInfo({ id: id }).then(res => {
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
    form.resetFields(["addnewRoleName", "addnewRoleDuty"]);
    this.setState({
      addnewModalShow: true
    });
  }

  // 添加新用户确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(["addnewRoleName", "addnewRoleDuty"], (err, values) => {
      if (err) {
        return false;
      }
      me.setState({
        addnewLoading: true
      });
      const params = {
        roleName: values.addnewRoleName,
        roleDuty: values.addnewRoleDuty
      };

      me.props.actions
        .addRoleInfo(params)
        .then(res => {
          console.log("添加用户返回数据：", res);
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
    });
  }

  // 添加新用户取消
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 分配菜单按钮点击，菜单出现
  onMenuClick(record) {
    this.setState({
      nowData: record,
      menuTreeShow: true,
      treeLoading: true
    });

    // 获取当前角色所拥有的菜单，然后默认选中
    this.props.actions
      .findAllMenuByRoleId({ roleId: record.roleId })
      .then(res => {
        if (res.status === "0") {
          console.log("当前角色所拥有的菜单：", res, record);
          const menuDefault = res.data.result
            .filter(item => item.menuAfiliation === "Y")
            .map(item => ({
              key: `${item.id}`,
              id: item.id,
              title: item.menuName,
              p: item.parentId
            }));
          this.setState({
            roleTreeData: res.data.result,
            menuDefault
          });
        }
        this.setState({
          treeLoading: false
        });
      })
      .catch(() => {
        this.setState({
          treeLoading: false
        });
      });
  }

  // 关闭菜单树
  onMenuTreeClose() {
    this.setState({
      menuTreeShow: false
    });
  }

  // 菜单树确定 给角色分配菜单
  onMenuTreeOk(arr) {
    console.log("所选择的：", arr);
    const params = {
      roleId: this.state.nowData.roleId,
      menus: arr.menus.join(","),
      btnIds: arr.btns.join(",")
    };
    this.setState({
      treeOnOkLoading: true
    });
    this.props.actions
      .AssigningMenuToRoleId(params)
      .then(res => {
        if (res.status === "0") {
          message.success("菜单分配成功");
          this.onMenuTreeClose();
        } else {
          message.error(res.message || "菜单分配失败");
        }
        this.setState({
          treeOnOkLoading: false
        });
      })
      .catch(() => {
        this.setState({
          treeOnOkLoading: false
        });
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
        title: "角色名",
        dataIndex: "roleName",
        key: "roleName"
      },
      {
        title: "角色权限",
        dataIndex: "roleDuty",
        key: "roleDuty"
      },
      // {
      //     title: '菜单权限',
      //     dataIndex: 'menus',
      //     key: 'menus',
      //     render: (text, record) => text.join(','),
      // },
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
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onMenuClick(record)}
            >
              <Tooltip placement="top" title="分配权限">
                <Icon type="tool" />
              </Tooltip>
            </span>
          );
          controls.push(
            <Popconfirm
              key="3"
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
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        id: item.id,
        key: index,
        roleId: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        roleName: item.roleName,
        roleDuty: item.roleDuty,
        menus: item.menus,
        createTime: item.createTime,
        creator: item.creator,
        // control: item.id,
        updateTime: item.updateTime,
        updater: item.updater
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
        <div className="system-search">
          <ul className="search-func">
            <li>
              <Button type="primary" onClick={() => this.onAddNewShow()}>
                <Icon type="plus-circle-o" />添加角色
              </Button>
            </li>
          </ul>
          <span className="ant-divider" />
          <ul className="search-ul">
            <li>
              <Input
                placeholder="请输入角色名"
                onChange={e => this.searchRoleNameChange(e)}
                value={this.state.searchRoleName}
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
        {/* 添加角色模态框 */}
        <Modal
          title="新增角色"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="角色名" {...formItemLayout}>
              {getFieldDecorator("addnewRoleName", {
                initialValue: undefined,
                rules: [
                  { required: true, whitespace: true, message: "请输入角色名" },
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
              })(<Input placeholder="请输入角色名" />)}
            </FormItem>
            <FormItem label="职责" {...formItemLayout}>
              {getFieldDecorator("addnewRoleDuty", {
                initialValue: undefined,
                rules: [
                  { required: true, whitespace: true, message: "请输入职责" },
                  { max: 100, message: "最多输入100个字符" }
                ]
              })(<Input placeholder="请输入职责" />)}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改用户模态框 */}
        <Modal
          title="修改用户"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem label="角色名" {...formItemLayout}>
              {getFieldDecorator("upRoleName", {
                initialValue: undefined,
                rules: [
                  { required: true, whitespace: true, message: "请输入角色名" },
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
              })(<Input placeholder="请输入角色名" />)}
            </FormItem>
            <FormItem label="职责" {...formItemLayout}>
              {getFieldDecorator("upRoleDuty", {
                initialValue: undefined,
                rules: [
                  { required: true, whitespace: true, message: "请输入职责" },
                  { max: 100, message: "最多输入100个字符" }
                ]
              })(<Input placeholder="请输入职责" />)}
            </FormItem>
          </Form>
        </Modal>
        {/* 查看用户详情模态框 */}
        <Modal
          title="角色详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="角色名" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.roleName : ""}
            </FormItem>
            <FormItem label="角色权限" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.roleDuty : ""}
            </FormItem>
            {/*<FormItem*/}
            {/*label="菜单权限"*/}
            {/*{...formItemLayout}*/}
            {/*>*/}
            {/*{!!this.state.nowData ? this.state.nowData.menus.join(',') : ''}*/}
            {/*</FormItem>*/}
            <FormItem label="创建时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="创建人" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.creator : ""}
            </FormItem>
            <FormItem label="最后修改" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updateTime : ""}
            </FormItem>
            <FormItem label="修改人" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updater : ""}
            </FormItem>
          </Form>
        </Modal>
        <TreeTable
          title={
            this.state.nowData
              ? `分配菜单：${this.state.nowData.roleName}`
              : "分配菜单"
          }
          menuData={this.state.roleTreeData}
          defaultChecked={this.state.menuDefault}
          initloading={this.state.treeLoading}
          loading={this.state.treeOnOkLoading}
          modalShow={this.state.menuTreeShow}
          onOk={arr => this.onMenuTreeOk(arr)}
          onClose={() => this.onMenuTreeClose()}
        />
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
    allMenu: state.sys.allMenu
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findAllRole,
        findRolesByKeys,
        updateRoleInfo,
        deleteRoleInfo,
        deleteAdminUserInfo,
        AssigningMenuToRoleId,
        updateAdminUserInfo,
        findAllMenu,
        findAllMenuByRoleId,
        addRoleInfo
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
