/* List 服务站/产品上线/体检上线 */

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
  InputNumber,
  Table,
  message,
  Popconfirm,
  Popover,
  Modal,
  Radio,
  Tooltip,
  Select,
  Upload,
  Divider
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
import _ from "lodash";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  findReserveList,
  addProduct,
  upReserveList,
  deleteProduct,
  deleteImage,
  findProductModelByWhere
} from "../../../../a_action/shop-action";

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
      productModels: [], // 所有的产品型号
      searchMobile: "", // 搜索 - 手机号
      searchCode: "", // 搜索 - 体检卡号
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
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      mobile: this.state.searchMobile,
      code: this.state.searchCode
    };
    this.props.actions.findReserveList(tools.clearNull(params)).then(res => {
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

  // 工具 - 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据ID获取用户来源名字
  getNameByModelId(id) {
    switch (String(id)) {
      case "1":
        return "APP 预约";
      case "2":
        return "公众号预约";
      case "3":
        return "后台添加";
      default:
        return "";
    }
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

  // 工具 - 根据type获取状态名称
  getNameByType(type) {
    switch (String(type)) {
      case "0":
        return "未使用";
      case "1":
        return "成功";
      case "-1":
        return "失败";
      case "-2":
        return "过期";
      default:
        return "";
    }
  }

  // 搜索 - 手机号输入框值改变时触发
  searchMobileChange(e) {
    if (e.target.value.length < 12) {
      this.setState({
        searchMobile: e.target.value
      });
    }
  }

  // 搜索 - 体检卡输入框值改变时触发
  searchCodeChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchCode: e.target.value
      });
    }
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;

    form.setFieldsValue({
      addnewCode: record.code,
      addnewName: record.name,
      addnewIdCard: record.idCard,
      addnewMobile: record.mobile,
      addnewSex: record.sex,
      addnewHeight: record.height,
      addnewWeight: record.weight
    });
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true
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

    form.validateFields(
      [
        "addnewCode",
        "addnewName",
        "addnewIdCard",
        "addnewMobile",
        "addnewSex",
        "addnewHeight",
        "addnewWeight"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });
        const params = {
          code: values.addnewCode,
          name: values.addnewName,
          idCard: values.addnewIdCard,
          mobile: values.addnewMobile,
          sex: values.addnewSex,
          height: values.addnewHeight,
          weight: values.addnewWeight
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addReserveList(tools.clearNull(params))
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
            .upReserveList(params)
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

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        fixed: "left",
        width: 80
      },
      {
        title: "服务站地区",
        dataIndex: "stationName",
        key: "stationName",
        width: 200
      },
      {
        title: "服务站名称",
        dataIndex: "code",
        key: "code",
        width: 200
      },
      {
        title: "联系方式",
        dataIndex: "name",
        key: "name",
        width: 100
      },
      {
        title: "体检仪ID",
        dataIndex: "idCard",
        key: "idCard",
        width: 200
      },
      {
        title: "体检仪型号",
        dataIndex: "mobile",
        key: "mobile",
        width: 200
      },
      {
        title: "上线时间",
        dataIndex: "sex",
        key: "sex",
        width: 100,
        render: text => (text ? "男" : "女")
      },
      {
        title: "身高",
        dataIndex: "height",
        key: "height",
        width: 100,
        render: text => `${text}cm`
      },
      {
        title: "体重",
        dataIndex: "weight",
        key: "weight",
        width: 100,
        render: text => `${text}kg`
      },
      {
        title: "用户来源",
        dataIndex: "userSource",
        key: "userSource",
        width: 100,
        render: text => this.getNameByModelId(text)
      },
      {
        title: "预约体检日期",
        dataIndex: "reserveTime",
        key: "reserveTime",
        width: 200
      },
      {
        title: "实际体检日期",
        dataIndex: "arriveTime",
        key: "arriveTime",
        width: 200
      },
      {
        title: "体检卡状态 ",
        dataIndex: "conditions",
        key: "conditions",
        width: 200,
        render: text => this.getNameByType(text)
      },
      {
        title: "操作人",
        dataIndex: "updater",
        key: "updater",
        width: 100
      },
      {
        title: "操作时间",
        dataIndex: "updateTime",
        key: "updateTime",
        width: 200
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 120,
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

          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider type="vertical" />);
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
        arriveTime: item.arriveTime,
        code: item.code,
        conditions: item.conditions,
        createTime: item.createTime,
        creator: item.creator,
        height: item.height,
        idCard: item.idCard,
        mobile: item.mobile,
        name: item.name,
        reserveTime: item.reserveTime,
        sex: item.sex,
        stationId: item.stationId,
        stationName: item.stationName,
        updateTime: item.updateTime,
        updater: item.updater,
        userSource: item.userSource,
        weight: item.weight
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
    console.log("是啥：", form.getFieldValue("addnewTypeId"));
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-func">
            <li>
              <Button type="primary" onClick={() => this.onAddNewShow()}>
                <Icon type="plus-circle-o" />体检上线
              </Button>
            </li>
          </ul>
          <Divider type="vertical" />
          <ul className="search-ul">
            <li>
              <Input
                placeholder="服务站"
                onChange={e => this.searchMobileChange(e)}
                value={this.state.searchMobile}
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
            className="my-table"
            scroll={{ x: 2400 }}
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
          title="新增体检人"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="体检卡号" {...formItemLayout}>
              {getFieldDecorator("addnewCode", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入体检卡号"
                  }
                ]
              })(<Input placeholder="请输入体检卡号" />)}
            </FormItem>
            <FormItem label="体检人" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入体检人姓名"
                  },
                  { max: 12, message: "最多输入12位字符" }
                ]
              })(<Input placeholder="请输入体检人姓名" />)}
            </FormItem>
            <FormItem label="身份证号" {...formItemLayout}>
              {getFieldDecorator("addnewIdCard", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入身份证号"
                  },
                  { max: 18, message: "最多输入18位字符" }
                ]
              })(<Input placeholder="请输入身份证号" />)}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {getFieldDecorator("addnewMobile", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入手机号" },
                  {
                    validator: (rule, value, callback) => {
                      if (!tools.checkPhone(value)) {
                        callback("请输入正确的手机号");
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入手机号" />)}
            </FormItem>
            <FormItem label="性别" {...formItemLayout}>
              {getFieldDecorator("addnewSex", {
                initialValue: true,
                rules: [{ required: true, message: "请选择性别" }]
              })(
                <RadioGroup>
                  <Radio value={true}>男</Radio>
                  <Radio value={false}>女</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem label="身高" {...formItemLayout}>
              {getFieldDecorator("addnewHeight", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入身高" }]
              })(
                <InputNumber
                  min={0}
                  max={300}
                  precision={0}
                  placeholder="请输入身高(cm)"
                  style={{ width: "100%" }}
                />
              )}
            </FormItem>
            <FormItem label="体重" {...formItemLayout}>
              {getFieldDecorator("addnewWeight", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入体重" }]
              })(
                <InputNumber
                  min={0}
                  max={300}
                  placeholder="请输入体重(kg)"
                  style={{ width: "100%" }}
                />
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
            <FormItem label="服务站名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.stationName : ""}
            </FormItem>
            <FormItem label="体检卡号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.code : ""}
            </FormItem>
            <FormItem label="体检人" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="身份证" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.idCard : ""}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.mobile : ""}
            </FormItem>
            <FormItem label="性别" {...formItemLayout}>
              {!!this.state.nowData
                ? this.state.nowData.sex
                  ? "男"
                  : "女"
                : ""}
            </FormItem>
            <FormItem label="身高" {...formItemLayout}>
              {!!this.state.nowData ? `${this.state.nowData.height}cm` : ""}
            </FormItem>
            <FormItem label="体重" {...formItemLayout}>
              {!!this.state.nowData ? `${this.state.nowData.weight}kg` : ""}
            </FormItem>
            <FormItem label="用户来源" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByModelId(this.state.nowData.userSource)
                : ""}{" "}
            </FormItem>
            <FormItem label="预约日期" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.reserveTime : ""}
            </FormItem>
            <FormItem label="体检日期" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.arriveTime : ""}
            </FormItem>
            <FormItem label="操作人" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updater : ""}
            </FormItem>
            <FormItem label="操作时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updateTime : ""}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByType(this.state.nowData.conditions)
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
  actions: P.any,
  form: P.any
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
        findReserveList,
        addProduct,
        upReserveList,
        deleteProduct,
        deleteImage,
        findProductModelByWhere
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
