/* List 商城管理/产品管理/产品列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Config from "../../../../../config/config";
import {
  Form,
  Button,
  Icon,
  Input,
  InputNumber,
  Table,
  message,
  Popconfirm,
  Modal,
  Radio,
  Tooltip,
  Select,
  Upload
} from "antd";
import "./index.scss";
import tools from "../../../../../util/tools"; // 工具
import Power from "../../../../../util/power"; // 权限
import { power } from "../../../../../util/data";
import _ from "lodash";
// ==================
// 所需的所有组件
// ==================

import UrlBread from "../../../../../a_component/urlBread";

// ==================
// 本页面所需action
// ==================

import {
  findProductByWhere,
  findProductTypeByWhere,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteImage
} from "../../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      searchName: "", // 搜索 - 名称
      searchMin: undefined, // 搜索 - 最小价格
      searchMax: undefined, // 搜索 - 最大价格
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
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productName: this.state.searchName,
      minPrice: this.state.searchMin,
      maxPrice: this.state.searchMax
    };
    this.props.actions.findProductByWhere(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result,
          pageNum,
          pageSize
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

  // 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => Number(item.id) === Number(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据ID获取销售方式的名字
  getNameBySaleModeName(code) {
    switch (Number(code)) {
      case 1:
        return "租赁";
      case 2:
        return "买卖";
      case 3:
        return "服务";
      default:
        return "";
    }
  }

  // 搜索 - 用户名输入框值改变时触发
  searchNameChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchName: e.target.value
      });
    }
  }

  // 搜索 - 最小价格改变
  searchMinChange(e) {
    this.setState({
      searchMin: e
    });
  }

  // 搜索 - 最大价格改变
  searchMaxChange(e) {
    this.setState({
      searchMax: e
    });
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;

    form.setFieldsValue({
      addnewName: record.name,
      addnewPrice: record.price,
      addnewTypeId: `${record.typeId}`,
      addnewTypeCode: record.typeCode,
      addnewSaleMode: String(record.saleMode),
      addnewMarketPrice: record.marketPrice,
      addnewAmount: record.amount,
      addnewOnShelf: record.onShelf ? "1" : "0"
    });
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
      fileList: record.productImg
        .split(",")
        .map((item, index) => ({ uid: index, url: item, status: "done" })), // 产品图片已上传的列表
      fileListDetail: record.detailImg
        ? [{ uid: -1, url: record.detailImg, status: "done" }]
        : [] // 详细图片已上传的列表
    });
  }

  // 删除某一条数据
  onDeleteClick(id) {
    this.props.actions.deleteProduct({ id: id }).then(res => {
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
      "addnewOnShelf"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
      addnewModalShow: true
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
        "addnewName",
        "addnewPrice",
        "addnewTypeId",
        "addnewTypeCode",
        "addnewSaleMode",
        "addnewMarketPrice",
        "addnewAmount",
        "addnewOnShelf"
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
          typeCode: values.addnewTypeCode,
          saleMode: Number(values.addnewSaleMode),
          marketPrice: values.addnewMarketPrice,
          amount: values.addnewAmount,
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
              //修改
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

  // 产品图片 - 上传中、上传成功、上传失败的回调
  onUpLoadChange(obj) {
    console.log("图片上传：", obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.imageUrl) {
        const list = _.cloneDeep(this.state.fileList);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.imageUrl;
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

  // 产品图片 - 上传前
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

  // 产品图片 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }

  // 详细图片 - 上传前
  onUploadDetailBefore(f, fl) {
    if (
      ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileListDetail);
      newList.push(f);
      this.setState({
        fileListDetail: newList
      });
      return true;
    }
  }

  // 详细图片 - 上传中、成功、失败
  onUpLoadDetailChange(obj) {
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.imageUrl) {
        const list = _.cloneDeep(this.state.fileListDetail);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.imageUrl;
        this.setState({
          fileListDetail: list,
          fileDetailLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileListDetail);
        this.setState({
          fileListDetail: list.filter(item => item.uid !== obj.file.uid),
          fileDetailLoading: false
        });
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileDetailLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileListDetail);
      this.setState({
        fileListDetail: list.filter(item => item.uid !== obj.file.uid),
        fileLoading: false
      });
      message.error("图片上传失败");
    }
  }

  // 详细图片 - 删除
  onUpLoadDetailRemove() {
    const list = _.cloneDeep(this.state.fileListDetail);
    this.setState({
      fileListDetail: list.filter(item => item.uid !== f.uid)
    });
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        width: 50
      },
      {
        title: "产品名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "产品型号",
        dataIndex: "typeCode",
        key: "typeCode"
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.findProductNameById(text)
      },
      {
        title: "销售方式",
        dataIndex: "saleMode",
        key: "saleMode",
        render: text => this.getNameBySaleModeName(text)
      },
      {
        title: "单价",
        dataIndex: "price",
        key: "price"
      },
      {
        title: "市场价",
        dataIndex: "marketPrice",
        key: "marketPrice"
      },
      {
        title: "产品图片",
        dataIndex: "productImg",
        key: "productImg",
        width: 300,
        render: text => {
          if (text) {
            return text
              .split(",")
              .map((item, index) => (
                <img className="table-img" key={index} src={item} />
              ));
          }
          return "";
        }
      },
      {
        title: "详情图片",
        dataIndex: "detailImg",
        key: "detailImg",
        width: 200,
        render: text => {
          if (text) {
            return <img className="table-img" src={text} />;
          }
          return "";
        }
      },
      {
        title: "库存",
        dataIndex: "amount",
        key: "amount"
      },
      {
        title: "是否上架",
        dataIndex: "onShelf",
        key: "onShelf",
        render: text =>
          text ? (
            <span style={{ color: "green" }}>是</span>
          ) : (
            <span style={{ color: "red" }}>否</span>
          )
      },
      {
        title: "操作",
        key: "control",
        width: 120,
        render: (text, record) => {
          const controls = [];

          Power.test(power.system.role.query.code) &&
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
          Power.test(power.system.role.update.code) &&
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
          Power.test(power.system.role.del.code) &&
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
        marketPrice: item.marketPrice,
        newProduct: item.newProduct,
        offShelfTime: item.offShelfTime,
        onShelf: item.onShelf,
        onShelfTime: item.onShelfTime,
        price: item.price,
        productImg: item.productImg,
        saleMode: item.saleMode,
        typeId: item.typeId,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id
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
      <div style={{ width: "100%" }}>
        <UrlBread location={this.props.location} />
        <div className="system-search">
          {Power.test(power.system.role.add.code) && (
            <ul className="search-func">
              <li>
                <Button type="primary" onClick={() => this.onAddNewShow()}>
                  <Icon type="plus-circle-o" />添加新产品
                </Button>
              </li>
            </ul>
          )}
          <span className="ant-divider" />
          {Power.test(power.system.role.query.code) && (
            <ul className="search-ul">
              <li>
                <Input
                  placeholder="产品名称"
                  onChange={e => this.searchNameChange(e)}
                  value={this.state.searchName}
                />
              </li>
              <li>
                <InputNumber
                  min={0}
                  max={99999}
                  placeholder="最小价格"
                  onChange={e => this.searchMinChange(e)}
                  value={this.state.searchMin}
                />
              </li>
              <li>
                <InputNumber
                  min={0}
                  max={99999}
                  placeholder="最大价格"
                  onChange={e => this.searchMaxChange(e)}
                  value={this.state.searchMax}
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
          )}
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
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
          title="添加新产品"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品名称" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品名称"
                  },
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
            <FormItem label="单价" {...formItemLayout}>
              {getFieldDecorator("addnewPrice", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入单价" }]
              })(
                <InputNumber placeholder="请输入单价" min={0} max={9999999} />
              )}
            </FormItem>
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
                <Select placeholder="请选择产品类型">
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={`${item.id}`}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {getFieldDecorator("addnewTypeCode", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品型号"
                  },
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
              })(<Input placeholder="请输入产品型号" />)}
            </FormItem>
            <FormItem label="销售方式" {...formItemLayout}>
              {getFieldDecorator("addnewSaleMode", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择销售方式" }]
              })(
                <Select placeholder="请选择销售方式">
                  <Option value={`1`}>租赁</Option>
                  <Option value={`2`}>买卖</Option>
                  <Option value={`3`}>服务</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="市场价" {...formItemLayout}>
              {getFieldDecorator("addnewMarketPrice", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入市场价" }]
              })(<InputNumber min={0} max={9999999} />)}
            </FormItem>
            <FormItem label="产品图片" {...formItemLayout}>
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/uploadImage`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.fileList}
                beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                onChange={f => this.onUpLoadChange(f)}
                onRemove={f => this.onUpLoadRemove(f)}
              >
                {this.state.fileList.length >= 8 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="详情图片" {...formItemLayout}>
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/uploadImage`}
                listType="picture-card"
                withCredentials
                fileList={this.state.fileListDetail}
                beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}
                onChange={f => this.onUpLoadDetailChange(f)}
                onRemove={f => this.onUpLoadDetailRemove(f)}
              >
                {this.state.fileListDetail.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="库存" {...formItemLayout}>
              {getFieldDecorator("addnewAmount", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入库存" }]
              })(
                <InputNumber min={0} max={9999999} placeholder="请输入库存" />
              )}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator("addnewOnShelf", {
                rules: [],
                initialValue: "0"
              })(
                <RadioGroup>
                  <Radio value="1">上架</Radio>
                  <Radio value="0">下架</Radio>
                </RadioGroup>
              )}
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
            <FormItem label="产品名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="单价" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.price : ""}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.findProductNameById(this.state.nowData.typeId)
                : ""}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.typeCode : ""}
            </FormItem>
            <FormItem label="销售方式" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.saleMode : ""}
            </FormItem>
            <FormItem label="市场价" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.marketPrice : ""}
            </FormItem>
            <FormItem label="市场价" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.marketPrice : ""}
            </FormItem>
            <FormItem label="产品图片" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.productImg
                ? this.state.nowData.productImg
                    .split(",")
                    .map((item, index) => {
                      return (
                        <img className="small-img" src={item} key={index} />
                      );
                    })
                : ""}
            </FormItem>
            <FormItem label="详情图片" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.detailImg ? (
                <img src={this.state.nowData.detailImg} />
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="库存" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.amount : ""}
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
        findProductByWhere,
        findProductTypeByWhere,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteImage
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
