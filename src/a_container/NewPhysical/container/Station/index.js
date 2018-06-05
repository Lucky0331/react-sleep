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
  Table,
  message,
  DatePicker,
  Radio,
  Tooltip,
  Select,
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

import chinaJson from "../../../../assets/china";
// ==================
// 本页面所需action
// ==================

import { findReserveList } from "../../../../a_action/shop-action";

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
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
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
      Echarts.registerMap("china", chinaJson);
      const dom = Echarts.init(document.getElementById("echarts-1"));
      const dom2 = Echarts.init(document.getElementById("echarts-2"));
      const dom3 = Echarts.init(document.getElementById("echarts-3"));
      const dom4 = Echarts.init(document.getElementById("echarts-4"));
      dom.setOption(me.makeOption(), true);
      window.onresize = dom.resize;
      dom2.setOption(me.makeOption2(), true);
      window.onresize = dom2.resize;
      dom3.setOption(me.makeOption3(), true);
      window.onresize = dom3.resize;
      dom4.setOption(me.makeOption4(), true);
      window.onresize = dom4.resize;
    }, 16);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      mobile: this.state.searchMobile,
      code: this.state.searchCode,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`
        : ""
    };
    this.props.actions.findReserveList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: v
    });
  }

  // 搜索 - 结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: v
    });
  }

  // 处理图表1数据
  makeOption(data = null) {
    var builderJson = {
      charts: {
        heatmap: 4262,
        treemap: 6286,
        graph: 10236,
        boxplot: 11256,
        parallel: 15251,
        gauge: 15625,
        funnel: 21052,
        sankey: 23021
      }
    };
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = "50%";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.08;
    ctx.font = "20px Microsoft Yahei";

    const option = {
      title: {
        text: "按服务站统计"
      },
      legend: {
        data: ["最高"]
      },
      grid: [
        {
          top: 50,
          width: "700px",
          left: 10,
          containLabel: true
        }
      ],
      xAxis: [
        {
          type: "value",
          max: builderJson.all,
          splitLine: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: "category",
          data: [
            "其他",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心"
          ]
        }
      ],
      series: [
        {
          name: "最高",
          type: "bar",
          stack: "chart",
          z: 3,
          label: {
            normal: {
              position: "right",
              show: true
            }
          },
          data: Object.keys(builderJson.charts).map(function(key) {
            return builderJson.charts[key];
          })
        }
      ]
    };
    return option;
  }

  // 处理图表2数据
  makeOption2(data = null) {
    var builderJson = {
      charts: {
        sankey: 23021,
        funnel: 21052,
        gauge: 15625,
        parallel: 15251,
        boxplot: 11256,
        graph: 10236,
        heatmap: 4262,
        treemap: 2286
      }
    };
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = "50%";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.08;
    ctx.font = "20px Microsoft Yahei";

    const option = {
      legend: {
        data: ["最低"]
      },
      grid: [
        {
          top: 50,
          width: "700px",
          left: 10,
          containLabel: true
        }
      ],
      xAxis: [
        {
          type: "value",
          max: builderJson.all,
          splitLine: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type: "category",
          data: [
            "其他",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心",
            "合肥体验服务中心"
          ]
        }
      ],
      series: [
        {
          itemStyle: {
            normal: {
              color: function(params) {
                var colorList = ["#27727B"];
                return colorList[params.dataIndex];
              }
            }
          },
          name: "最低",
          type: "bar",
          stack: "chart",
          z: 3,
          label: {
            normal: {
              position: "right",
              show: true
            }
          },
          data: Object.keys(builderJson.charts).map(function(key) {
            return builderJson.charts[key];
          })
        }
      ]
    };
    return option;
  }

  // 处理图表3数据
  makeOption3(data = null) {
    const option = {
      title: {
        text: "按地域统计",
        left: "center"
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}"
      },
      series: [
        {
          name: "中国",
          type: "map",
          aspectScale: 1.2,
          zoom: 1,
          scaleLimit: [{ min: 1 }, { max: 10 }],
          mapType: "china",
          selectedMode: "multiple",
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: [{ name: "上海", selected: true }]
        }
      ]
    };
    return option;
  }

  // 处理图表4数据
  makeOption4(data = null) {
    const option = {
      tooltip: {
        trigger: "item"
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: false },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      calculable: true,
      grid: {
        borderWidth: 0,
        y: 80,
        y2: 60
      },
      xAxis: [
        {
          type: "category",
          show: false,
          data: [
            "Line",
            "Bar",
            "Scatter",
            "K",
            "Pie",
            "Radar",
            "Chord",
            "Force",
            "Map",
            "Gauge",
            "Funnel"
          ]
        }
      ],
      yAxis: [
        {
          type: "value",
          show: false
        }
      ],
      series: [
        {
          type: "bar",
          itemStyle: {
            normal: {
              color: function(params) {
                var colorList = [
                  "#C1232B",
                  "#B5C334",
                  "#FCCE10",
                  "#E87C25",
                  "#27727B",
                  "#FE8463",
                  "#9BCA63",
                  "#FAD860",
                  "#F3A43B",
                  "#60C0DD",
                  "#D7504B",
                  "#C6E579",
                  "#F4E001",
                  "#F0805A",
                  "#26C0C0"
                ];
                return colorList[params.dataIndex];
              },
              label: {
                show: true,
                position: "top",
                formatter: "{b}\n{c}"
              }
            }
          },
          data: [12, 21, 10, 4, 12, 5, 6, 5, 25, 23, 7],
          markPoint: {
            tooltip: {
              trigger: "item",
              backgroundColor: "rgba(0,0,0,0)",
              formatter: function(params) {
                return (
                  '<img src="' +
                  params.data.symbol.replace("image://", "") +
                  '"/>'
                );
              }
            },
            data: [
              {
                xAxis: 0,
                y: 350,
                name: "Line",
                symbolSize: 20,
                symbol: "image://../asset/ico/折线图.png"
              },
              {
                xAxis: 1,
                y: 350,
                name: "Bar",
                symbolSize: 20,
                symbol: "image://../asset/ico/柱状图.png"
              },
              {
                xAxis: 2,
                y: 350,
                name: "Scatter",
                symbolSize: 20,
                symbol: "image://../asset/ico/散点图.png"
              },
              {
                xAxis: 3,
                y: 350,
                name: "K",
                symbolSize: 20,
                symbol: "image://../asset/ico/K线图.png"
              },
              {
                xAxis: 4,
                y: 350,
                name: "Pie",
                symbolSize: 20,
                symbol: "image://../asset/ico/饼状图.png"
              },
              {
                xAxis: 5,
                y: 350,
                name: "Radar",
                symbolSize: 20,
                symbol: "image://../asset/ico/雷达图.png"
              },
              {
                xAxis: 6,
                y: 350,
                name: "Chord",
                symbolSize: 20,
                symbol: "image://../asset/ico/和弦图.png"
              },
              {
                xAxis: 7,
                y: 350,
                name: "Force",
                symbolSize: 20,
                symbol: "image://../asset/ico/力导向图.png"
              },
              {
                xAxis: 8,
                y: 350,
                name: "Map",
                symbolSize: 20,
                symbol: "image://../asset/ico/地图.png"
              },
              {
                xAxis: 9,
                y: 350,
                name: "Gauge",
                symbolSize: 20,
                symbol: "image://../asset/ico/仪表盘.png"
              },
              {
                xAxis: 10,
                y: 350,
                name: "Funnel",
                symbolSize: 20,
                symbol: "image://../asset/ico/漏斗图.png"
              }
            ]
          }
        }
      ]
    };

    return option;
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
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
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    console.log("是啥：", form.getFieldValue("addnewTypeId"));
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-ul">
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
          <div
            id="echarts-3"
            className="echarts"
            style={{ width: "46%", float: "left", height: "320px" }}
          />
          <div
            id="echarts-4"
            className="echarts"
            style={{ width: "46%", float: "right", height: "290px" }}
          />
        </div>
        <div className="charts-box">
          <div
            id="echarts-1"
            className="echarts"
            style={{ width: "46%", float: "left", height: "290px" }}
          />
          <div
            id="echarts-2"
            className="echarts"
            style={{ width: "46%", float: "right", height: "290px" }}
          />
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
    actions: bindActionCreators({ findReserveList }, dispatch)
  })
)(WrappedHorizontalRole);
