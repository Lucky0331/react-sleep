/* Menu 系统管理/菜单管理 */

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
  Divider,
  Popover,
  InputNumber,
  Upload
} from "antd";
import P from "prop-types";
import _ from "lodash";
import "./index.scss";
import Config from "../../../../config/config";
import tools from "../../../../util/tools";
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

import ColumnTree from "../../../../a_component/ColumnTree";

// ==================
// 本页面所需action
// ==================

import {
  findAllMenu,
} from "../../../../a_action/sys-action";
import {
  Columnlist,
  delateColumnlist,
  addColumnlist,
  updateColumnlist,
} from "../../../../a_action/card-action"

// ==================
// Definition
// ==================

const TreeNode = Tree.TreeNode;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页数据 - 没有取store中的全部菜单，因为这里有条件查询
      data2:[],// 查看父级有哪些
      nowData: null, // 当前选中的菜单项
      sourceData: [], // 经过处理的原始数据
      addLoading: false, // 是否正在增加菜单中
      fatherTreeShow: false, // 选择父级tree是否出现
      modalQueryShow: false, // 查看 - 模态框 是否出现
      upModalShow: false, // 修改 - 模态框 是否出现
      upLoading: false, // 修改 - 是否loading中
      treeFatherValue: null, // 修改 - 父级树选择的父级信息
      addnewModalShow: false, // 添加 - 模态框 是否出现
      searchOrderNo: "", // 查询 - 分类名称
      searchConditions: undefined, // 查询 - 状态
      fileList: [], // 缩略图已上传的列表
      fileLoading: false, // 缩略图片正在上传
      total: 0, // 总数 直接全部查询，前端分页
      pageNum: 1, // 第几页 - 这里是前端分页，只是为了构建序号，由TABLE返回
      pageSize: 10 // 每页多少条 - 这里是前端分页，只是为了构建序号，由TABLE返回
    };
  }

  componentDidMount() {
    this.onGetData();
    this.onGetData2()
  }
  
  // 获取所有菜单
  getAllMenus() {
    this.props.actions.Columnlist();
  }

  // onGetData 条件查询 本页面TABLE用此数据
  onGetData(parentId = 0) {
    const params = {
      typeId: parentId,
      // name:this.state.searchOrderNo
    };
    this.props.actions.Columnlist(params).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
        });
      } else {
        this.setState({
          data: []
        });
      }
    });
  }
  
  onGetData2(pageNum,pageSize) {
    const params = {
      pageNum,
      pageSize,
    };
    this.props.actions.Columnlist(params).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data.result || [],
        });
      }
    });
  }
  
  // 确定删除当前菜单
  onRemoveClick(id) {
    this.props.actions.delateColumnlist({ id: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.getAllMenus();
        this.onGetData();
      } else {
        message.error(res.message || "删除失败");
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
    const sourceData = [];
    d.forEach(item => {
      if (item.parentId === 0) {
        // parentId === 0 的为顶级菜单
        const temp = this.dataToJson(d, item);
        sourceData.push(temp);
      }
    });
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
    console.log('data是什么：',data)
    return data.map((item, index) => {
      const k = key ? `${key}-${item.id}` : `${item.id}`;
      if ((item.subList).length >0) {
        return (
          <TreeNode
            title={item.name}
            key={k}
            id={item.id}
            p={item.parentId}
            data={item}
          >
            {this.makeTreeDom(item.subList, k)}
          </TreeNode>
        );
      } else {
        return (
          <TreeNode
            title={item.name}
            key={k}
            id={item.id}
            p={item.parentId}
            data={item}
            selectable={false}
          />
        );
      }
    });
  }


  // 添加子菜单提交
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewColumnOne", //添加一级分类名称
        "addnewColumnTwo", //父级id
      ],
      (err, values) => {
        if (err) {
          return;
        }
        const params = {
          name: values.addnewColumnOne, //添加分类名称
          parentId:Number(values.addnewColumnTwo),//父级id
        };
        this.setState({ addLoading: true });
        if (this.state.addOrUp === "add") {
          me.props.actions
            .addColumnlist(tools.clearNull(params)) //添加
            .then(res => {
            if (res.status === "0") {
              message.success("添加成功");
                this.getAllMenus(); // 重新获取菜单
                this.onGetData();
                this.onAddNewClose();
              } else {
                message.error("添加失败");
              }
              this.setState({ addLoading: false });
            })
            .catch(() => {
              this.setState({ addLoading: false });
            });
          } else {
          params.id = this.state.nowData.id;
          me.props.actions
            .updateColumnlist(params)  // 修改
            .then(res => {
              me.setState({
                addnewLoading: false
              });
              this.getAllMenus(); // 重新获取菜单
              this.onGetData();
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
  //搜索 - 按钮
  onSearch(){
    this.onGetData(1,this.state.pageSize)
  }
  
  //搜索 - 分类名称
  searchOrderNoChange(e){
    this.setState({
      searchOrderNo:e.target.value
    })
  }

  // 新增 - 取消
  onAddNewClose() {
    this.setState({
      nowData: null,
      treeFatherValue: null,
      addnewModalShow: false
    });
  }

  // 新增 - 模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewColumnOne", //添加一级分类名称
      "addnewColumnTwo",//二级分类名称
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true,
      nowData: null
    });
  }

  // 修改 - 模态框 出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("当前修改的：", record, form);
    form.setFieldsValue({
      id:record.id,
      addnewColumnOne: record.name,
    });
    this.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
    });
  }
  // 修改 - 模态框 关闭
  onUpClose() {
    this.setState({
      nowData: null,
      treeFatherValue: null,
      upModalShow: false
    });
  }

  // TABLE页码改变
  onTableChange(page, pageSize) {
    // this.onGetData(page, pageSize);
  }

  // 工具函数 - 根据父ID得到父名称
  getFather(parentId) {
    const p = this.props.allMenu.find(item => {
      return `${item.id}` === `${parentId}`;
    });
    if (p) {
      return p.menuName;
    }
    return "";
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
  

  // 系统目录结构点选
  onTreeMenuSelect(keys, e) {
    console.log("目录点选：", keys, e);
    if (e.selected) {
      // 选中
      this.onGetData(e.node.props.id);
    } else {
      this.onGetData();
    }
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      {
        title: "分类名称",
        dataIndex: 'name',
        key: 'name',
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
        name: item.name,
        parentId: item.parentId,
        menuName: item.menuName,
        menuUrl: item.menuUrl,
        menuDesc: item.menuDesc,
        sorts: item.sorts,
        subList:item.subList,
        conditions: item.conditions,
        iconImg:item.iconImg,
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
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };

    return (
      <div className="page-menu">
        <div className="menubox all_clear">
          <div className="l">
            <div className="title">
              <span>直播栏目分类</span>
            </div>
            <div>
              <Tree
                defaultExpandedKeys={["0"]}
                onSelect={(keys, e) => this.onTreeMenuSelect(keys, e)}
              >
                <TreeNode title="直播栏目" key="0" id={0}>
                  {this.makeTreeDom(this.state.data)}
                </TreeNode>
              </Tree>
            </div>
          </div>
          <div className="r system-table">
            <div className="menu-search">
              <ul className="search-func more-ul search-ul">
                <li>
                  <Button type="primary" onClick={() => this.onAddNewShow()}>
                    <Icon type="plus-circle-o" />添加分类
                  </Button>
                </li>
              </ul>
            </div>
            <Table
              columns={this.makeColumns()}
              dataSource={this.makeData(this.state.data)}
              pagination={{
                pageSize: this.state.pageSize,
                showQuickJumper: true,
                showTotal: (total, range) => `共 ${total} 条数据`,
                onChange: (page, pageSize) =>
                  this.onTableChange(page, pageSize)
              }}
            />
          </div>
        </div>
        {/* 添加菜单模态框 */}
        <Modal
          title={this.state.addOrUp === "add" ? "添加分类" : "修改分类"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="分类名称" {...formItemLayout}>
              {getFieldDecorator("addnewColumnOne", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入分类名称" }]
              })(<Input placeholder="请输入分类名称" />)}
            </FormItem>
            <FormItem label="父级" {...formItemLayout}>
              {getFieldDecorator("addnewColumnTwo", {
                initialValue: undefined,
              })(
                  <Select
                    style={{ width: '100%' }}
                    placeholder="请选择一级分类"
                  >
                  {
                    this.state.data2.map((item) => {
                      return (
                        <Option key={String(item.id)}>{item.name}</Option>
                      );
                    })
                  }
                  </Select>
              )}
              <p style={{color: '#F92A19'}}>（若添加二级分类请选择父级）</p>
            </FormItem>
          </Form>
        </Modal>
        {/* 修改用户模态框 */}
        <Modal
          title="修改菜单"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem label="菜单名" {...formItemLayout}>
              {getFieldDecorator("upMenuName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入菜单名" },
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
              })(<Input placeholder="请输入菜单名" />)}
            </FormItem>
            <FormItem label="菜单URL" {...formItemLayout}>
              {getFieldDecorator("upMenuUrl", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入菜单URL" },
                  {
                    validator: (rule, value, callback) => {
                      const v = value;
                      if (v) {
                        if (v.length > 20) {
                          callback("最多输入20位字符");
                        } else if (!tools.checkStr2(v)) {
                          callback("只能输入字母、数字及下划线");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入URL" />)}
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {getFieldDecorator("upMenuDesc", {
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
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("upSorts", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入排序号" }]
              })(<InputNumber min={0} max={99999} />)}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("upConditions", {
                rules: [],
                initialValue: "0"
              })(
                <RadioGroup>
                  <Radio value="0">启用</Radio>
                  <Radio value="-1">禁用</Radio>
                </RadioGroup>
              )}
            </FormItem>
          </Form>
        </Modal>
        {/*<ColumnTree*/}
          {/*title="父级选择"*/}
          {/*menuData= {this.makeTreeDom(this.state.data)}*/}
          {/*defaultKey={*/}
            {/*this.state.treeFatherValue*/}
              {/*? [`${this.state.treeFatherValue.id}`]*/}
              {/*: []*/}
          {/*}*/}
          {/*noShowId={this.state.nowData && this.state.nowData.id}*/}
          {/*modalShow={this.state.fatherTreeShow} // Modal是否显示*/}
          {/*onOk={obj => this.onTreeOk(obj)} // 确定时，获得选中的项信息*/}
          {/*onClose={obj => this.onTreeClose(obj)} // 关闭*/}
        {/*/>*/}
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

Menu.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  allMenu: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalMenu = Form.create()(Menu);
export default connect(
  state => ({
    allMenu: state.sys.allMenu // 所有的菜单缓存
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findAllMenu,
        Columnlist,
        delateColumnlist,
        addColumnlist,
        updateColumnlist
      },
      dispatch
    )
  })
)(WrappedHorizontalMenu);
