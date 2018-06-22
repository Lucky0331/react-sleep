/* Category 商城管理/产品管理/产品分类 */

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
  Modal,
  Radio,
  Tooltip,
  InputNumber,
  Select,
  Upload,
  Popover
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
  findProductTypeByWhere,
  addProductType,
  updateProductType,
  deleteProductType,
  deleteImage
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      fileList: [], // typeIcon已上传的列表
      searchproductName: undefined, // 搜索 - 类型名
      addnewModalShow: false, // 添加模态框是否显示
      addnewLoading: false, // 是否正在添加中
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  getCode(id) {
    switch (Number(id)) {
      case 1:
        return "智能净水";
      case 2:
        return "健康食品";
      case 3:
        return "生物理疗";
      case 4:
        return "健康睡眠";
      case 5:
        return "健康体检";
      default:
        return "";
    }
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productName: this.state.searchproductName
    };
    this.props.actions
      .findProductTypeByWhere(tools.clearNull(params))
      .then(res => {
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

  // 搜索 - 用户名输入框值改变时触发
  searchProductNameChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchproductName: e.target.value
      });
    }
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record:", record);
    form.setFieldsValue({
      upName: record.name,
      upDetail: record.detail,
      upCode: record.code
    });
    me.setState({
      fileList: record.typeIcon
        ? record.typeIcon
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // icon上传的列表
      nowData: record,
      upModalShow: true
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      ["upName", "upCode", "upDetail", "upSorts", "upConditions", "upIcon"],
      (err, values) => {
        if (err) {
          return;
        }
        console.log("values:", values);
        me.setState({
          upLoading: true
        });
        const params = {
          id: me.state.nowData.id,
          name: values.upName,
          code: values.upCode,
          detail: values.upDetail,
          sorts: values.upSorts,
          conditions: values.upConditions,
          typeIcon: this.state.fileList.map(item => item.url).join(",")
        };

        this.props.actions
          .updateProductType(params)
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
              // fileList: record.typeIcon ? record.typeIcon.split(',').map((item, index) => ({ uid: index, url: item, status: 'done' })) : [],   // 标题图上传的列表
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

  // 删除某一条数据
  onDeleteClick(id) {
    this.props.actions.deleteProductType({ id: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
    });
  }

  // icon图 - 上传中、上传成功、上传失败的回调
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

  // icon图 - 上传前
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

  // icon图 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }

  // 真正从服务端删除icon的图片
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
      fileList: [],
      addnewModalShow: true,
      nowData: null
    });
  }

  // 添加新的确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewName",
        "addnewDetail",
        "addnewSorts",
        "addnewConditions",
        "addnewCode",
        "addnewIcon"
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
          detail: values.addnewDetail,
          code: String(values.addnewCode),
          sorts: values.addnewSorts,
          conditions: values.addnewConditions,
          typeIcon: this.state.fileList.map(item => item.url).join(",")
        };

        me.props.actions
          .addProductType(params)
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
      }
    );
  }

  // 添加新用户取消
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
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
        title: "产品类型",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "App前台展示说明",
        dataIndex: "detail",
        key: "detail"
      },
      {
        title: "产品icon",
        dataIndex: "typeIcon",
        key: "typeIcon",
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
        title: "产品标识",
        dataIndex: "code",
        key: "code",
        render: (text, record) => this.getCode(text)
      },
      //组长说取消产品类型的编辑跟删除 我先注释掉
      // {
      //   title: "操作",
      //   key: "control",
      //   width: 200,
      //   render: (text, record) => {
      //     const controls = [];
      //     controls.push(
      //       <span
      //         key="1"
      //         className="control-btn blue"
      //         onClick={() => this.onUpdateClick(record)}
      //       >
      //         <Tooltip placement="top" title="编辑">
      //           <Icon type="edit" />
      //         </Tooltip>
      //       </span>
      //     );
      //     controls.push(
      //       <Popconfirm
      //         key="3"
      //         title="确定删除吗?"
      //         onConfirm={() => this.onDeleteClick(record.id)}
      //         okText="确定"
      //         cancelText="取消"
      //       >
      //         <span className="control-btn red">
      //           <Tooltip placement="top" title="删除">
      //             <Icon type="delete" />
      //           </Tooltip>
      //         </span>
      //       </Popconfirm>
      //     );
      //
      //     const result = [];
      //     controls.forEach((item, index) => {
      //       if (index) {
      //         result.push(
      //           <span key={`line${index}`} className="ant-divider" />
      //         );
      //       }
      //       result.push(item);
      //     });
      //     return result;
      //   }
      // }
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
        sorts: item.sorts,
        code: item.code,
        updateTime: item.updateTime,
        updater: item.updater,
        conditions: item.conditions,
        detail: item.detail,
        createTime: item.createTime,
        creator: item.creator,
        typeIcon: item.typeIcon
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
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 }
      }
    };
    return (
      <div>
        {/*<div className="system-search">*/}
          {/*<ul className="search-func">*/}
            {/*<li>*/}
              {/*<Button type="primary" onClick={() => this.onAddNewShow()}>*/}
                {/*<Icon type="plus-circle-o" />添加产品类型*/}
              {/*</Button>*/}
            {/*</li>*/}
          {/*</ul>*/}
        {/*</div>*/}
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
          title="新增产品类型"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品类型名称" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品类型名称"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入30个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入产品类型名称" />)}
            </FormItem>
            <FormItem label="APP前台展示名称" {...formItemLayout}>
              {getFieldDecorator("addnewDetail", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品APP前台展示名称"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入12个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入APP前台展示名称" />)}
            </FormItem>
            <FormItem label="添加产品icon" {...formItemLayout}>
              {getFieldDecorator("addnewIcon", {
                rules: [{ required: true }]
              })(
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
              )}
            </FormItem>
            <FormItem label="产品标识" {...formItemLayout}>
              {getFieldDecorator("addnewCode", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品标识" }]
              })(
                <Select placeholder="请选择产品标识">
                  <Option value={1}>智能净水</Option>
                  <Option value={2}>健康食品</Option>
                  <Option value={3}>生物理疗</Option>
                  <Option value={4}>健康睡眠</Option>
                  <Option value={5}>健康体检</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改用户模态框 */}
        <Modal
          title="修改产品类型"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("upName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品类型名称"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入30个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入产品类型名称" />)}
            </FormItem>
            <FormItem label="App前台名称" {...formItemLayout}>
              {getFieldDecorator("upDetail", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品类型名称"
                  },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入30个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入App前台展示说明" />)}
            </FormItem>
            <FormItem label="修改产品icon" {...formItemLayout}>
              {getFieldDecorator("upIcon", {
                rules: [{ required: true }]
              })(
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
              )}
            </FormItem>
            <FormItem label="产品标识" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getCode(this.state.nowData.code)
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
        findProductTypeByWhere,
        addProductType,
        updateProductType,
        deleteProductType,
        deleteImage
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
