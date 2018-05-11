/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import moment from "moment";
import "./index.scss";
import _ from "lodash";
import Config from "../../../../config/config";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

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
  InputNumber,
  Select,
  Tooltip,
  Divider,
  Cascader,
  Popover,
  DatePicker,
  Alert
} from "antd";
import RoleTree from "../../../../a_component/roleTree"; // 角色树 用于选角色

// ==================
// 本页面所需action
// ==================

import {
  findAllProvince,
  findCityOrCounty,
  findStationByArea
} from "../../../../a_action/sys-action";
import { findUserInfo, myCustomers,userinfoRecord } from "../../../../a_action/info-action";
import { onOk } from "../../../../a_action/shop-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      Tdata: [], //推广客户所有信息
      searchUserName: "",
      searchConditions: null,
      addnewModalShow: false, // 添加省级经理信息 或 修改省级经理信息 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      upLoading: false, // 是否正在修改用户中
      roleTreeShow: false, // 角色树是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      userId: "", // 获取用户id
      eId: "",
      addOrUp: "add", // 当前操作是新增还是修改
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
      searchAddress: [] // 搜索 - 地址
    };
  }

  componentDidMount() {
    if (!this.props.citys.length) {
      // 获取所有省，全局缓存
      this.getAllCity0();
    } else {
      this.setState({
        citys: this.props.citys.map((item, index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  componentWillReceiveProps(nextP) {
    if (nextP.citys !== this.props.citys) {
      this.setState({
        citys: nextP.citys.map((item, index) => ({
          id: item.id,
          value: item.areaName,
          label: item.areaName,
          isLeaf: false
        }))
      });
    }
  }

  //工具
  getCity(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}/${c}/${q}`;
  }

  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewName: record.name,
      addnewTypeId: `${record.typeId}`,
      addnewTypeCode: String(record.typeCode),
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      upModalShow: true,
      code: record.typeId,
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewName",
        "addnewTypeId",
        "addnewTypeCode",
      ],
      (err, values) => {
        if (err) {
          return;
        }
        me.setState({
          upLoading: true
        });
        const params = {
          id: me.state.nowData.id,
          name: values.addnewName,
          typeId: values.addnewTypeId,
          typeCode: values.addnewTypeCode,
        };

        this.props.actions
          .updateProduct(params)
          .then(res => {
            if (res.returnCode === "0") {
              message.success("修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onUpClose();
            } else {
              message.error(res.returnMessaage || "修改失败，请重试");
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
      }
    );
  }

  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }
  

  //工具 - 省市区的拼接
  getCity(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}`;
  }



  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userType: this.state.searchType,
      mobile: this.state.searchMobile ? this.state.searchMobile : "",
      realName: this.state.searchName ? this.state.searchName : "", // 搜索 - 用户姓名
      userId: this.state.searchEId ? this.state.searchEId : "",
    };

    // this.props.actions.findUserInfo(tools.clearNull(params)).then(res => {
    //   if (res.status === 200) {
    //     this.setState({
    //       data: res.data.result || [],
    //       pageNum,
    //       pageSize,
    //       total: res.data.total
    //     });
    //   } else {
    //     message.error(res.returnMessaage || "获取数据失败，请重试");
    //   }
    // });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 添加新活动模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTitle",
      "addnewUrl",
      "addnewProduct",
      "addnewDeletFlag"
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
      addnewModalShow: false
    });
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      userType: record.userType,
      queryModalShow: true
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  //搜索 - 用户类型
  onSearchType(v) {
    this.setState({
      searchType: v
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
        title: "省份",
      },
      {
        title: "省级经理姓氏",
      },
      {
        title: "省级经理联系电话",
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          let controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <a href="#/usermanage/userinfoRecord">
                <Tooltip placement="top" title="查看">
                  <Icon type="eye" />
                </Tooltip>
              </a>
            </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
              </Tooltip>
            </span>
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
        adminIp: item.adminIp,
        password: item.password,
        eId: item.id,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        age: item.age,
        conditions: item.conditions,
        creator: item.creator,
        createTime: item.createTime,
        bindTime: item.bindTime,
        description: item.description,
        email: item.email,
        orgCode: item.orgType,
        mobile: item.mobile,
        headImg: item.headImg,
        updateTime: item.updateTime,
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

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>
                省份
              </span>
              <Input
                style={{ width: "172px" }}
              />
            </li>
            <li style={{ marginLeft: "5px" }}>
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
                  添加
                </Button>
              </li>
            </ul>
          </ul>
        </div>
        <div className="system-table" style={{ marginTop: "2px" }}>
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
          title={this.state.addOrUp === "add" ? "省级经理信息录入" : "省级经理信息编辑"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="服务站地区" {...formItemLayout}>
              <span style={{ color: "#888" }}>
                {this.state.nowData &&
                this.state.addOrUp === "up" &&
                this.state.nowData.province ? `${this.state.nowData.province}` : ''}
              </span>
              {getFieldDecorator("addnewCitys", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择区域" }]
              })(
                <Cascader
                  placeholder="请选择服务区域"
                  options={this.state.citys}
                />
              )}
            </FormItem>
            <FormItem label="省级经理姓氏" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入省级经理姓氏" }]
              })(<Input placeholder="请输入省级经理姓氏" />)}
            </FormItem>
            <FormItem label="省级经理联系电话" {...formItemLayout}>
              {getFieldDecorator("addnewPhone", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入省级经理联系电话" }]
              })(<Input placeholder="请输入省级经理联系电话" />)}
            </FormItem>
          </Form>
        </Modal>
        {/* 查看用户详情模态框 */}
        <Modal
          title="省级经理信息详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
          wrapClassName={"list"}
        >
          <Form>
            <FormItem label="省份" {...formItemLayout}>
              {/*{!!this.state.nowData ? this.state.nowData.eId : ""}*/}
            </FormItem>
            <FormItem label="省级经理姓氏" {...formItemLayout}>
              {/*{!!this.state.nowData ? this.state.nowData.nickName : ""}*/}
            </FormItem>
            <FormItem label="省级经理联系电话" {...formItemLayout}>
              {/*{!!this.state.nowData ? this.state.nowData.realName : ""}*/}
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

Manager.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  allRoles: P.any,
  allOrganizer: P.any,
  citys: P.array
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
  state => ({
    allRoles: state.sys.allRoles,
    allOrganizer: state.sys.allOrganizer,
    citys: state.sys.citys
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findAllProvince,
        findCityOrCounty,
        findStationByArea,
        findUserInfo,
        myCustomers,
        onOk,
        userinfoRecord
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
