/* List 体检管理/体检统计 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Echarts from "echarts";
import {
  Form,
  Button,
  Icon,
  Input,
  Cascader,
  Table,
  message,
  DatePicker,
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
      searchMobile: "", // 搜索 - 手机号
      searchCode: "", // 搜索 - 体检卡号
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
    this.echartsDom = null; // Echarts实例
  }

  componentDidMount() {
    const me = this;
    // setTimeout是因为初次加载时，CSS可能还没加载完毕，导致图表样式有问题
    setTimeout(() => {
      const dom = Echarts.init(document.getElementById("echarts-1"));
      dom.setOption(me.makeOption(), true);
      window.onresize = dom.resize;
    }, 16);
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
      if (res.returnCode === "0") {
        this.setState({
          data: res.messsageBody.result || [],
          pageNum,
          pageSize
        });
      } else {
        message.error(res.returnMessaage || "获取数据失败，请重试");
      }
    });
  }

  // 处理图表数据
  makeOption(data = null) {
    const option = {
      title: {
        text: "体检用户",
        left: "center"
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}"
      },
      legend: {
        left: "left",
        data: ["2的指数", "3的指数"]
      },
      xAxis: {
        type: "category",
        name: "x",
        splitLine: { show: false },
        data: ["一", "二", "三", "四", "五", "六", "七", "八", "九"]
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      yAxis: {
        type: "log",
        name: "y"
      },
      series: [
        {
          name: "1111",
          type: "line",
          data: [41, 23, 59, 27, 81, 247, 43, 234, 69]
        },
        {
          name: "2222",
          type: "line",
          data: [17, 25, 42, 48, 156, 32, 64, 128, 126]
        },
        {
          name: "3333",
          type: "line",
          data: [12, 345, 43, 23, 5, 4, 65, 34, 54]
        }
      ]
    };
    return option;
  }

  // 搜索
  onSearch() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
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
        title: "操作时间",
        dataIndex: "updateTime",
        key: "updateTime",
        width: 200
      },
      {
        title: "操作",
        key: "control",
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
          <ul className="search-ul">
            <li>
              <span style={{ marginRight: "10px" }}>服务站地区</span>
              <Cascader
                placeholder="请选择服务区域"
                style={{ width: "172px" }}
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>服务站关键字</span>
              <Input
                placeholder="服务站关键字搜索"
                style={{ width: "172px" }}
                onChange={e => this.searchCodeChange(e)}
                value={this.state.searchCode}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>选择时间</span>
              <DatePicker
                style={{ width: "172px" }}
                dateRender={current => {
                  const style = {};
                  if (current.date() === 1) {
                    style.border = "1px solid #1890ff";
                    style.borderRadius = "45%";
                  }
                  return (
                    <div className="ant-calendar-date" style={style}>
                      {current.date()}
                    </div>
                  );
                }}
                format="YYYY-MM-DD"
                placeholder="开始时间"
                onChange={e => this.searchBeginTime(e)}
              />
              --
              <DatePicker
                style={{ width: "172px" }}
                dateRender={current => {
                  const style = {};
                  if (current.date() === 1) {
                    style.border = "1px solid #1890ff";
                    style.borderRadius = "45%";
                  }
                  return (
                    <div className="ant-calendar-date" style={style}>
                      {current.date()}
                    </div>
                  );
                }}
                format="YYYY-MM-DD"
                placeholder="结束时间"
                onChange={e => this.searchEndTime(e)}
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
        <div className="charts-box">
          <div id="echarts-1" className="echarts" />
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
