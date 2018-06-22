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

import MenuTree from "../../../../a_component/menuTree";

// ==================
// 本页面所需action
// ==================
import { deleteImage } from "../../../../a_action/shop-action"
import {
  findAllMenu,
  addMenuInfo,
  deleteMenuInfo,
  updateMenuInfo,
  findMenusByKeys,
  findMenuByMainMenu,
} from "../../../../a_action/sys-action";

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
      nowData: null, // 当前选中的菜单项
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
      fileList: [], // 缩略图已上传的列表
      fileLoading: false, // 缩略图片正在上传
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
    this.getData();
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
    this.props.actions.findMenuByMainMenu(params).then(res => {
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
  // 确定删除当前菜单
  onDeleteClick(id) {
    this.props.actions.deleteMenuInfo({ menuId: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.getAllMenus();
        this.getData();
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
      if (item.children) {
        return (
          <TreeNode
            title={item.menuName}
            img={item.iconImg}
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
            img={item.iconImg}
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
  onAddOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      ["addMenuName", "addMenuUrl", "addConditions", "addSorts", "addMenuDesc"],
      (err, values) => {
        if (err) {
          return;
        }
        const params = {
          menuName: values.addMenuName,
          menuUrl: values.addMenuUrl,
          conditions: values.addConditions,
          sorts: values.addSorts,
          menuDesc: values.addMenuDesc,
          parentId: me.state.treeFatherValue
            ? `${me.state.treeFatherValue.id}`
            : "0" // 如果没有的话就是顶级菜单，顶级菜单默认为0
        };
        this.setState({ addLoading: true });
        me.props.actions
          .addMenuInfo(tools.clearNull(params))
          .then(res => {
            if (res.status === "0") {
              message.success("添加成功");
              this.getAllMenus(); // 重新获取菜单
              this.getData();
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
      nowData: null,
      treeFatherValue: null,
      addModalShow: false
    });
  }

  // 新增 - 模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addMenuName",
      "addMenuUrl",
      "addConditions",
      "addSorts",
      "addMenuDesc"
    ]);
    this.setState({
      fileList: [],
      treeFatherValue: null,
      addModalShow: true
    });
  }
  // 修改当前菜单
  onUpOk() {
    const me = this;
    const { form } = me.props;
    console.log("nowData是个啥：", me.state.nowData);
    form.validateFields(
      ["upMenuName", "upMenuUrl", "upConditions", "upSorts", "upMenuDesc","upIconImg"],
      (err, values) => {
        if (err) {
          return;
        }
        const params = {
          id: me.state.nowData.id,
          menuName: values.upMenuName,
          menuUrl: values.upMenuUrl,
          conditions: values.upConditions,
          sorts: values.upSorts,
          menuDesc: values.upMenuDesc,
          parentId: this.state.treeFatherValue
            ? `${this.state.treeFatherValue.id}`
            : "0" ,// 如果没有的话就是顶级菜单，顶级菜单默认为0
          iconImg: this.state.fileList.map(item => item.url).join(","),
        };
        this.setState({ upLoading: true });
        this.props.actions
          .updateMenuInfo(params)
          .then(res => {
            if (res.status === "0") {
              message.success("修改成功");
              this.getAllMenus(); // 重新获取菜单
              this.getData(me.state.nowData.parentId);
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
  
  // 菜单图标 - 上传中、上传成功、上传失败的回调
  onUpLoadChange(obj) {
    // console.log('图片上传：', obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.data) {
        const list = _.cloneDeep(this.state.fileList);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.data;
        this.setState({
          fileList: list,
          fileLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileList);
        this.setState({
          fileList: list.filter(item => item.uid !== obj.file.uid),
          fileLoading: false
        });
        message.error("图片上传失败");
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileList);
      this.setState({
        fileList: list.filter(item => item.uid !== obj.file.uid),
        fileLoading: false
      });
      message.error("图片上传失败");
    }
  }
  
  // 菜单图标 - 上传前
  onUploadBefore(f, fl) {
    console.log("上传前：", f, fl);
    if (
        ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileList);
      newList.push(f);
      this.setState({
        fileList: newList
      });
      return true;
    }
  }
  
  // 菜单图标 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }
  
  // 真正从服务端删除商品的图片
  deleteImg(uri) {
    const temp = uri.split("/");
    const fileName = temp.splice(-1, 1);
    const params = {
      path: `${temp.join("/")}${fileName}`,
      // fileName
    };
    console.log("删除后的是啥？", temp.join("/"), fileName);
    this.props.actions.deleteImage(params);
  }

  // 修改 - 模态框 出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("当前修改的：", record, form);
    form.setFieldsValue({
      upMenuName: record.menuName,
      upMenuUrl: record.menuUrl,
      upMenuDesc: record.menuDesc,
      upSorts: record.sorts,
      upConditions: record.conditions,
    });
    this.setState({
      nowData: record,
      fileList: record.iconImg
        ? record.iconImg
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], //菜单图标
      treeFatherValue: {
        id: record.parentId,
        title: this.getFather(record.parentId)
      },
      upModalShow: true
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
    console.log("父级选择的是什么：", obj);
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

  // 搜索 - 菜单名改变时触发
  searchMenuNameChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchMenuName: e.target.value
      });
    }
  }

  // 搜索 - 状态改变时触发
  searchConditionsChange(e) {
    this.setState({
      searchConditions: e
    });
  }

  // 系统目录结构点选
  onTreeMenuSelect(keys, e) {
    console.log("目录点选：", keys, e);
    if (e.selected) {
      // 选中
      this.getData(e.node.props.id);
    } else {
      this.getData();
    }
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
        title: "菜单名",
        dataIndex: "menuName",
        key: "menuName"
      },
      {
        title:'菜单图标',
        dataIndex:'iconImg',
        key:'iconImg',
        width: 200,
        render: (text, index) => {
         if (text) {
          const img = text.split(",");
          return (
              <Popover
                key={index}
                placement="right"
                content={<img className="table-img-big" src={img[0]} />}
              >
                <img className="table-img" src={img[0]} />
              </Popover>
           );
          }
          return "";
        }
      },
      {
        title: "菜单URL",
        dataIndex: "menuUrl",
        key: "menuUrl",
        render: (text, record) => {
          return text ? `/${text.replace(/^\//, "")}` : "";
        }
      },
      {
        title: "描述",
        dataIndex: "menuDesc",
        key: "menuDesc"
      },
      {
        title: "父级",
        dataIndex: "parentId",
        key: "parentId",
        render: (text, record) => this.getFather(text)
      },
      {
        title: "状态",
        dataIndex: "conditions",
        key: "conditions",
        render: (text, record) =>
          text === "0" ? (
            <span style={{ color: "green" }}>启用</span>
          ) : (
            <span style={{ color: "red" }}>禁用</span>
          )
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
        parentId: item.parentId,
        menuName: item.menuName,
        menuUrl: item.menuUrl,
        menuDesc: item.menuDesc,
        sorts: item.sorts,
        conditions: item.conditions,
        iconImg:item.iconImg,
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
              <span>系统目录结构</span>
            </div>
            <div>
              <Tree
                defaultExpandedKeys={["0"]}
                onSelect={(keys, e) => this.onTreeMenuSelect(keys, e)}
              >
                <TreeNode title="翼猫科技智能睡眠系统" key="0" id={0}>
                  {this.makeTreeDom(this.state.sourceData)}
                </TreeNode>
              </Tree>
            </div>
          </div>
          <div className="r system-table">
            <div className="menu-search">
              <ul className="search-func">
                <li>
                  <Button type="primary" onClick={() => this.onAddNewShow()}>
                    <Icon type="plus-circle-o" />添加菜单
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
        {/* 添加菜单模态框 */}
        <Modal
          title="添加菜单"
          visible={this.state.addModalShow}
          onOk={() => this.onAddOk()}
          onCancel={() => this.onAddClose()}
          confirmLoading={this.state.addLoading}
        >
          <Form>
            <FormItem label="菜单名" {...formItemLayout}>
              {getFieldDecorator("addMenuName", {
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
              {getFieldDecorator("addMenuUrl", {
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
            <FormItem label="添加菜单图" {...formItemLayout}>
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/product/uploadImage`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.fileList}
                beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                onChange={f => this.onUpLoadChange(f)}
                onRemove={f => this.onUpLoadRemove(f)}
              >
                {this.state.fileList.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="父级" {...formItemLayout}>
              <Input
                placeholder="请选择父级"
                readOnly
                value={
                  this.state.treeFatherValue && this.state.treeFatherValue.title
                }
                onClick={() => this.onFatherShow()}
              />
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {getFieldDecorator("addMenuDesc", {
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
              {getFieldDecorator("addSorts", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入排序号" }]
              })(<InputNumber min={0} max={99999} />)}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("addConditions", {
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
            <FormItem label="修改菜单图标" {...formItemLayout}>
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/product/uploadImage`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.fileList}
                beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                onChange={f => this.onUpLoadChange(f)}
                onRemove={f => this.onUpLoadRemove(f)}
              >
                {this.state.fileList.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="父级" {...formItemLayout}>
              <Input
                placeholder="请选择父级"
                readOnly
                value={
                  this.state.treeFatherValue && this.state.treeFatherValue.title
                }
                onClick={() => this.onFatherShow()}
              />
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

        {/* 查看用户详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.modalQueryShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="菜单名" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.menuName : ""}
            </FormItem>
            <FormItem label="URL" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.menuUrl : ""}
            </FormItem>
            <FormItem label="父级" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getFather(this.state.nowData.parentId)
                : ""}
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.menuDesc : ""}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                this.state.nowData.conditions === "0" ? (
                  <span style={{ color: "green" }}>启用</span>
                ) : (
                  <span style={{ color: "red" }}>禁用</span>
                )
              ) : (
                ""
              )}
            </FormItem>
          </Form>
        </Modal>
        <MenuTree
          title="父级选择"
          menuData={this.props.allMenu} // 所需菜单原始数据
          defaultKey={
            this.state.treeFatherValue
              ? [`${this.state.treeFatherValue.id}`]
              : []
          }
          noShowId={this.state.nowData && this.state.nowData.id}
          modalShow={this.state.fatherTreeShow} // Modal是否显示
          onOk={obj => this.onTreeOk(obj)} // 确定时，获得选中的项信息
          onClose={obj => this.onTreeClose(obj)} // 关闭
        />
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
        deleteImage,
        findAllMenu,
        addMenuInfo,
        deleteMenuInfo,
        updateMenuInfo,
        findMenusByKeys,
        findMenuByMainMenu
      },
      dispatch
    )
  })
)(WrappedHorizontalMenu);
