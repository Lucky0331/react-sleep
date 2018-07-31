/* Category 商城管理/产品管理/产品型号 */

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
  Tooltip,
  InputNumber,
  Select,
  Checkbox,
  Row
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
  findProductModelByWhere,
  addProductModel,
  findProductTypeByWhere,
  upProductModel,
  delProductModel,
  onChange3
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
      productTypes: [], // 所有的产品类型
      chargeTypes: [], //所有的计费方式
      searchTypeId: undefined, // 搜索 - 类型名
      addnewModalShow: false, // 添加模态框是否显示
      addnewLoading: false, // 是否正在添加中
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      code: undefined, //产品类型所对应的code值
      feeType: [] ,//计费方式的数组
      disabled:true,//是否可编辑
    };
  }

  componentDidMount() {
    this.getAllTypes(); // 获取所有产品类型
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      productTypeId: this.state.searchTypeId
    };
    this.props.actions
      .findProductModelByWhere(tools.clearNull(params))
      .then(res => {
        console.log("返回的什么：", res);
        if (res.status === "0") {
          this.setState({
            data: res.data.modelList.result || [],
            chargeTypes: res.data.chargeTypeList,
            pageNum,
            pageSize,
            total: res.data.modelList.total
          });
        } else {
          message.error(res.message || "获取数据失败，请重试");
        }
      });
  }

  // 获取所有的产品类型，当前页要用
  getAllTypes() {
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

  // 工具 - 根据有效期type和num组合成有效期
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0":
        return "长期有效";
      case "1":
        return `${time}日`;
      case "2":
        return `${time}月`;
      case "3":
        return `${time}年`;
      default:
        return "";
    }
  }

  // 工具 - 根据产品类型ID返回产品类型名称
  getNameByTypeId(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 搜索 - 产品类型输入框值改变时触发
  onSearchTypeId(typeId) {
    this.setState({
      searchTypeId: typeId
    });
  }

  //根据code值不同显示的字段不同
  Newproduct(e) {
    this.setState({
      code: e
    });
    console.log("e的数值是：", e);
    // //产品类型改变时，重置产品型号的值位undefined
    // const {form} = this.props;
    // form.resetFields(['addnewTypeCode']);
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record:", record);
    form.setFieldsValue({
      upName: record.name,
      upNickName:record.nickName,
      upTypeId: record.typeId,
      upDescription: record.description,
      upPrice: record.price,
      upShipFee: record.shipFee,
      upOpenAccountFee: record.openAccountFee,
      upBuildCount: record.buildCount,
      upInDate: record.inDate,
      upModelDetail:record.modelDetail,
      upTimeLimitNum: record.timeLimitNum,
      upTimeLimitType: record.timeLimitType,
      upCharges: record.chargeTypes
        ? record.chargeTypes.map(item => String(item.id))
        : []
    });
    me.setState({
      nowData: record,
      code: record.typeId,
      feeType: record.feeType,
      upModalShow: true
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    const uparr = [
      "upName",
      "upNickName",
      "upTypeId",
      "upDescription",
      "upPrice",
      "upBuildCount",
      "upModelDetail"
    ];
    if ([1].includes(this.state.code)) {
      uparr.push("upCharges", "upOpenAccountFee");
    }
    if ([2, 3, 4, 5].includes(this.state.code)) {
      uparr.push("upTimeLimitType", "upTimeLimitNum");
    }
    if ([2, 3].includes(this.state.code)) {
      uparr.push("upShipFee");
    }
    form.validateFields(uparr, (err, values) => {
      if (err) {
        return false;
      }
      me.setState({
        upLoading: true
      });
      const params = {
        id: me.state.nowData.id,
        name: values.upName,
        nickName:values.upNickName,
        typeId: values.upTypeId,
        updescription: values.upDescription,
        price: values.upPrice,
        shipFee: values.upShipFee,
        openAccountFee: values.upOpenAccountFee,
        charges: String(values.upCharges),
        buildCount: values.buildCount,
        useCount: values.upUseCount,
        modelDetail: values.upModelDetail,
        timeLimitType: values.upTimeLimitType,
        timeLimitNum: values.upTimeLimitNum
      };

      this.props.actions
        .upProductModel(params)
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
    this.props.actions.delProductModel({ id: id }).then(res => {
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
      code: record.typeId,
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
      "addnewNickName",
      "addnewTypeId",
      "addnewPrice",
      "addnewCharges",
      "addnewUseCount",
      "addnewBuildCount",
      "addnewInDate",
      "addnewModelDetail",
      "addnewTimeLimitType",
      "addnewShipFee",
      "addnewOpenAccountFee",
      "addnewTimeLimitNum"
    ]);
    this.setState({
      addnewModalShow: true,
      nowData: null,
      code: undefined
    });
  }

  // 添加新的确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    const newarr = [
      "addnewName",
      "addnewNickName",
      "addnewTypeId",
      "addnewPrice",
      "addnewInDate",
      "addnewModelDetail",
      "addnewTimeLimitType",
      "addnewTimeLimitNum"
    ];
    if ([4, 5].includes(this.state.code)) {
      newarr.push("addnewUseCount", "addnewBuildCount");
    }
    if ([2, 3].includes(this.state.code)) {
      newarr.push("addnewShipFee");
    }
    if ([1].includes(this.state.code)) {
      newarr.push("addnewOpenAccountFee", "addnewCharges");
    }
    form.validateFields(newarr, (err, values) => {
      if (err) {
        return false;
      }
      me.setState({
        addnewLoading: true
      });
      const params = {
        name: values.addnewName,
        nickName:values.addnewNickName,
        typeId: Number(values.addnewTypeId),
        price: Number(values.addnewPrice),
        charges:String(values.addnewCharges),
        useCount: Number(values.addnewUseCount),
        buildCount: Number(values.addnewBuildCount),
        inDate: Number(values.addnewInDate),
        shipFee: Number(values.addnewShipFee)
          ? Number(values.addnewShipFee)
          : 0,
        openAccountFee: Number(values.addnewOpenAccountFee)
          ? Number(values.addnewOpenAccountFee)
          : 0,
        modelDetail: values.addnewModelDetail,
        timeLimitType: values.addnewTimeLimitType,
        timeLimitNum: values.addnewTimeLimitNum
      };

      me.props.actions
        .addProductModel(params)
        .then(res => {
          console.log("添加返回数据：", res);
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
        title: "产品型号",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.getNameByTypeId(text)
      },
      {
        title:'型号别名',
        dataIndex:'nickName',
        key:'nickName'
      },
      {
        title: "价格",
        dataIndex: "price",
        key: "price"
      },
      {
        title: "有效期",
        dataIndex: "timeLimitNum",
        key: "timeLimitNum",
        render: (text, record) =>
          this.getNameForInDate(text, record.timeLimitType)
      },
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
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name, //产品型号
        typeId: item.typeId, //产品类型
        price: item.price,
        shipFee: item.shipFee,
        useCount: item.useCount,
        inDate: item.inDate,
        modelDetail: item.modelDetail,
        detail: item.detail,
        createTime: item.createTime,
        creator: item.creator,
        timeLimitNum: item.timeLimitNum,
        timeLimitType: item.timeLimitType,
        chargeName: item.chargeName,
        charges: item.charges,
        nickName:item.nickName,
        chargeTypes: item.chargeTypes,
        openAccountFee: item.openAccountFee
      };
    });
  }

  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    const addnewTimeLimitType = getFieldValue("addnewTimeLimitType") === 0;
    return (
      <div>
        <div className="system-search">
          <ul className="search-ul">
            <li>
              <span style={{ marginRight: "10px" }}>产品类型</span>
              <Select
                allowClear
                whitespace="true"
                placeholder="全部"
                value={this.state.searchTypeId}
                style={{ width: "200px" }}
                onChange={e => this.onSearchTypeId(e)}
              >
                {this.state.productTypes.map((item, index) => {
                  return (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <Button type="primary" onClick={() => this.onSearch()}>
                搜索
              </Button>
            </li>
            <ul className="search-func">
              <li>
                <Button type="primary" onClick={() => this.onAddNewShow()}>
                  <Icon type="plus-circle-o" />添加产品型号
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
        {/* 添加角色模态框 */}
        <Modal
          title="添加产品型号"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          wrapClassName={"codNum"}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select
                  style={{ width: "80%" }}
                  onChange={e => this.Newproduct(e)}
                >
                  {this.state.productTypes.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品型号名称"
                  },
                  { max: 30, message: "最多输入30个字" }
                ]
              })(<Input style={{ width: "80%" }} />)}
            </FormItem>
            <FormItem label="型号别名" {...formItemLayout}>
              {getFieldDecorator("addnewNickName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品型号别名"
                  },
                  { max: 20, message: "最多输入20个字" }
                ]
              })(<Input style={{ width: "80%" }} />)}
            </FormItem>
            <FormItem label="描述" {...formItemLayout}>
              {getFieldDecorator("addnewModelDetail", {
                initialValue: undefined,
                rules: [{ whitespace: true, message: "请对产品进行描述" }]
              })(<Input style={{ width: "80%" }} />)}
            </FormItem>
            <FormItem
              label="体检券数量"
              {...formItemLayout}
              className={
                this.state.code === 1 ||
                this.state.code === 2 ||
                this.state.code === 3
                  ? "hide"
                  : ""
              }
            >
              {getFieldDecorator("addnewBuildCount", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请填写体检券数量"
                  }
                ]
              })(<Input style={{ width: "80%" }} min={0} type="number" />)}
            </FormItem>
            <FormItem
              label="单张体检券可用次数"
              {...formItemLayout}
              className={
                this.state.code === 1 ||
                this.state.code === 2 ||
                this.state.code === 3
                  ? "hide"
                  : ""
              }
            >
              {getFieldDecorator("addnewUseCount", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入体检券数量"
                  }
                ]
              })(<Input style={{ width: "80%" }} min={0} type="number" />)}
            </FormItem>
          </Form>
          <FormItem label="价格" {...formItemLayout}>
            {getFieldDecorator("addnewPrice", {
              initialValue: undefined,
              rules: [{ required: true, message: "请输入价格" }]
            })(<Input style={{ width: "80%" }} min={0} type="number" />)}
          </FormItem>
          <FormItem
            label="计费方式"
            {...formItemLayout}
            className={
              this.state.code === 2 ||
              this.state.code === 3 ||
              this.state.code === 4 ||
              this.state.code === 5
                ? "show"
                : ""
            }
          >
            {getFieldDecorator("addnewCharges", {
              initialValue: undefined,
              rules: [{ required: true, message: "请选择计费方式" }]
            })(
              <Checkbox.Group style={{ width: "100%" }} onChange={onChange3}>
                <Row style={{ width: "80%" }}>
                  {this.state.chargeTypes.map((item, index) => {
                    return (
                      <Checkbox key={index} value={item.id}>
                        {item.chargeName}
                      </Checkbox>
                    );
                  })}
                </Row>
              </Checkbox.Group>
            )}
          </FormItem>
          <FormItem
            label="有效期"
            {...formItemLayout}
            className={
              this.state.code === 1 ||
              this.state.code === 2 ||
              this.state.code === 3
                ? "hide"
                : ""
            }
          >
            {getFieldDecorator("addnewTimeLimitNum", {
              initialValue: 0,
              rules: [{ required: true, message: "请输入有效期" }]
            })(<InputNumber min={0} max={31} placeholder="请输入有效期" />)}
            {getFieldDecorator("addnewTimeLimitType", {
              initialValue: 0,
              rules: [{ required: true, message: "请选择有效期" }]
            })(
              <Select style={{ marginLeft: "10px", width: "100px" }}>
                <Option value={0}>长期有效</Option>
                <Option value={1}>日</Option>
                <Option value={2}>月</Option>
                <Option value={3}>年</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            label="运费"
            {...formItemLayout}
            className={
              this.state.code === 1 ||
              this.state.code === 4 ||
              this.state.code === 5
                ? "show"
                : ""
            }
          >
            {getFieldDecorator("addnewShipFee", {
              initialValue: undefined,
              rules: [
                { required: true, whiteSpace: true, message: "请填写邮寄运费" }
              ]
            })(<Input style={{ width: "80%" }} min={0} type="number" />)}
          </FormItem>
          <FormItem
            label="开户费"
            {...formItemLayout}
            className={
              this.state.code === 2 ||
              this.state.code === 3 ||
              this.state.code === 4 ||
              this.state.code === 5
                ? "show"
                : ""
            }
          >
            {getFieldDecorator("addnewOpenAccountFee", {
              initialValue: undefined,
              rules: [
                { required: true, whiteSpace: true, message: "请填写开户费" }
              ]
            })(<Input style={{ width: "80%" }} min={0} type="number" />)}
          </FormItem>
        </Modal>
        {/* 修改用户模态框 */}
        <Modal
          title="修改产品型号"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          wrapClassName={"codNum"}
          confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem label="型号名称" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {getFieldDecorator("upName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品型号名称"
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
              })(<Input placeholder="请输入产品型号名称" disabled={this.state.disabled}/>)}
              {/*{!!this.state.nowData ? this.state.nowData.name : ""}*/}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {getFieldDecorator("upTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select onChange={e => this.Newproduct(e)} disabled={this.state.disabled}>
                  {this.state.productTypes.map((item, index) => {
                    return (
                      <Option key={index} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
              {/*{!!this.state.nowData*/}
                {/*? this.getNameByTypeId(this.state.nowData.typeId)*/}
                {/*: ""}*/}
            </FormItem>
            <FormItem label="型号别名" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {getFieldDecorator("upNickName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入产品型号别名"
                  },
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
              })(<Input placeholder="请输入产品型号别名" />)}
            </FormItem>
            <FormItem label="描述" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {getFieldDecorator("upModelDetail", {
                initialValue: undefined,
                rules: [{ whitespace: true, message: "请对产品进行描述" }]
              })(<TextArea style={{ width: "80%" }} rows={4}/>)}
            </FormItem>
            <FormItem label="价格" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {getFieldDecorator("upPrice", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入价格" }]
              })(<InputNumber min={0} max={99999} />)}
            </FormItem>
            <FormItem
              label="运费"
              {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={
                this.state.code == 1 ||
                this.state.code == 4 ||
                this.state.code == 5
                  ? "hide"
                  : ""
              }
            >
              {getFieldDecorator("upShipFee", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入运费" }]
              })(<InputNumber min={0} max={100000} />)}
            </FormItem>
            <FormItem
              label="开户费"
              {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={
                this.state.code == 2 ||
                this.state.code == 3 ||
                this.state.code == 4 ||
                this.state.code == 5
                  ? "hide"
                  : ""
              }
            >
              {getFieldDecorator("upOpenAccountFee", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入开户费" }]
              })(<InputNumber min={0} max={10000000} />)}
            </FormItem>
            <FormItem
              label="计费方式"
              {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={
                this.state.code == 2 ||
                this.state.code == 3 ||
                this.state.code == 4 ||
                this.state.code === 5
                  ? "show"
                  : ""
              }
            >
              {getFieldDecorator("upCharges", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择计费方式" }]
              })(
                <Checkbox.Group style={{ width: "100%" }} onChange={onChange3}>
                  <Row style={{ width: "80%" }}>
                    {this.state.chargeTypes.map((item, index) => {
                      return (
                        <Checkbox key={index} value={String(item.id)}>
                          {item.chargeName}
                        </Checkbox>
                      );
                    })}
                  </Row>
                </Checkbox.Group>
              )}
            </FormItem>
            <FormItem
              label="有效期"
              {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={this.state.code == 1 ? "hide" : ""}
            >
              {getFieldDecorator("upTimeLimitNum", {
                initialValue: 0,
                rules: [{ required: true, message: "请输入有效期" }]
              })(<InputNumber min={0} max={31} placeholder="请输入有效期" />)}
              {getFieldDecorator("upTimeLimitType", {
                initialValue: 0,
                rules: [{ required: true, message: "请选择有效期" }]
              })(
                <Select style={{ marginLeft: "10px", width: "40%" }}>
                  <Option value={0}>长期有效</Option>
                  <Option value={1}>日</Option>
                  <Option value={2}>月</Option>
                  <Option value={3}>年</Option>
                </Select>
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
            <FormItem label="产品型号" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {!!this.state.nowData ? this.getNameByTypeId(this.state.nowData.typeId) : ""}
            </FormItem>
            <FormItem label="价格" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {!!this.state.nowData ? this.state.nowData.price : ""}
            </FormItem>
            <FormItem label="有效期" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}>
              {!!this.state.nowData ? this.getNameForInDate(this.state.nowData.timeLimitNum,this.state.nowData.timeLimitType) : ""}
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
        findProductModelByWhere,
        addProductModel,
        findProductTypeByWhere,
        upProductModel,
        delProductModel,
        onChange3
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
