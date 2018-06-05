/* Manager 系统管理/管理员信息管理 */

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
  Modal,
  Radio,
  Select,
  Tooltip,
  DatePicker
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

import UrlBread from "../../../../a_component/urlBread";

// ==================
// 本页面所需action
// ==================

import { findLoginLogBykeys } from "../../../../a_action/log-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { RangePicker } = DatePicker;
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      searchloginCreator: "", // 搜索 - 登录账号
      searchConditions: null, // 搜索 - 登录状态
      searchStartTime: null, // 搜索 - 开始时间
      searchEndTime: null, // 搜索 - 结束时间
      nowData: null, // 当前选中用户的信息，用于查看详情
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
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
      loginCreator: this.state.searchloginCreator,
      conditions: this.state.searchConditions,
      beginTime: this.state.searchStartTime,
      endTime: this.state.searchEndTime
    };

    Power.test(power.log.signin.query.code) &&
      this.props.actions
        .findLoginLogBykeys(tools.clearNull(params))
        .then(res => {
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
  searchloginCreatorChange(e) {
    if (e.target.value.length < 20) {
      this.setState({
        searchloginCreator: e.target.value
      });
    }
  }

  // 搜索 - 状态选择框值变化时调用
  searchConditions(e) {
    console.log("选择了什么：", e);
    this.setState({
      searchConditions: e || null
    });
  }

  onRangePickerOk(e) {
    this.setState({
      searchStartTime: e[0] && tools.dateToStr(e[0]._d),
      searchEndTime: e[1] && tools.dateToStr(e[1]._d)
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
        title: "登录账号",
        dataIndex: "creator",
        key: "creator"
      },
      {
        title: "登录IP",
        dataIndex: "loginIp",
        key: "loginIp"
      },
      {
        title: "登录时间",
        dataIndex: "createTime",
        key: "createTime",
        render: text => {
          return text ? tools.dateToStr(new Date(text)) : "";
        }
      },
      {
        title: "登录状态",
        dataIndex: "conditions",
        key: "conditions",
        render: text => {
          return text === "0" ? "成功" : "失败";
        }
      },
      {
        title: "操作",
        key: "control",
        width: 200,
        render: (text, record) => {
          let controls = [];

          Power.test(power.log.signin.query.code) &&
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
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        conditions: item.conditions,
        createTime: item.createTime,
        creator: item.creator,
        loginIp: item.loginIp,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id
      };
    });
  }

  render() {
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
        <UrlBread location={this.props.location} />
        <div className="system-search">
          {Power.test(power.system.manager.query.code) && (
            <ul className="search-ul">
              <li>
                <Input
                  placeholder="登录账号"
                  onChange={e => this.searchloginCreatorChange(e)}
                  value={this.state.searchloginCreator}
                  onPressEnter={() => this.onSearch()}
                />
              </li>
              <li>
                <Select
                  style={{ width: "150px" }}
                  placeholder="登录状态"
                  allowClear
                  onChange={e => this.searchConditions(e)}
                >
                  <Option value="0">成功</Option>
                  <Option value="-1">失败</Option>
                </Select>
              </li>
              <li>
                <RangePicker
                  showTime={{ format: "HH:mm:ss" }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder={["开始时间", "结束时间"]}
                  onChange={e => this.onRangePickerOk(e)}
                  onOk={e => this.onRangePickerOk(e)}
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
        {/* 查看用户详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="登录账号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.creator : ""}
            </FormItem>
            <FormItem label="登录IP" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.loginIp : ""}
            </FormItem>
            <FormItem label="登录时间" {...formItemLayout}>
              {!!this.state.nowData
                ? tools.dateToStr(new Date(this.state.nowData.createTime))
                : ""}
            </FormItem>
            <FormItem label="登录状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                this.state.nowData.conditions === "0" ? (
                  <span style={{ color: "green" }}>成功</span>
                ) : (
                  <span style={{ color: "red" }}>失败</span>
                )
              ) : (
                ""
              )}
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
  allRoles: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
  state => ({
    allRoles: state.sys.allRoles
  }),
  dispatch => ({
    actions: bindActionCreators({ findLoginLogBykeys }, dispatch)
  })
)(WrappedHorizontalManager);
