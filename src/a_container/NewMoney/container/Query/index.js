/* List 资金管理/结算查询 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import _ from "lodash";
import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  InputNumber,
  Cascader,
  Modal,
  Radio,
  Tooltip,
  Select,
  DatePicker,
  Tabs,
  Divider,
  Popover,
  Checkbox,
  Row,
  Col
} from "antd";
import "./index.scss";
import Config from "../../../../config/config";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";

// ==================
// 所需的所有组件
// ==================

import moment from "moment";

// ==================
// 本页面所需action
// ==================

import {
  findProductTypeByWhere,
  findSaleRuleByWhere,
  findAllProvince,
  findCityOrCounty,
  warning
} from "../../../../a_action/shop-action";
import { findStationByArea } from "../../../../a_action/sys-action";
import {
  getSupplierIncomeMain,
  getStationIncomeMain,
  onChange,
  saveTest
} from "../../../../a_action/curr-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const children = [];
for (let i = 2012; i < 2032; i++) {
  children.push(<Option key={i + "年"}>{i + "年"}</Option>);
}

const children2 = [];
for (let i = 1; i < 13; i++) {
  children2.push(<Option key={i + "月"}>{i + "月"}</Option>);
}

function MonthChange(value) {
  console.log(`selected ${value}`);
}
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
const { MonthPicker } = DatePicker;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHQ: [], // 总部收益查询列表数据
      pageNumHQ: 1, // 总部 - 主列表 - 当前第几页
      pageSizeHQ: 14, // 总部 - 主列表 - 每页多少条
      totalHQ: 0, // 总部 - 主列表 - 共多少条数据
      HQSearchDate: moment(), // 总部 - 搜索 - 年月

      dataSE: [], // 服务站收益查询列表数据
      pageNumSE: 1, // 服务 - 主列表 - 当前第几页
      pageSizeSE: 10, // 服务 - 主列表 - 每页多少条
      totalSE: 0, // 服务 - 主里诶报 - 共多少条数据

      dataSEMain: null, // 服务 - 上方列表 - 数据

      SESearchDate: moment(), // 服务 - 上方 - 结算月份
      SESearchArea: undefined, // 服务 - 上方 - 地区
      SESearchName: undefined, // 服务 - 上方 - 服务站名称

      typesAllot: [], // 所有的分配类型数据
      typesProfit: [], // 所有的收益类型数据
      typesProduct: [], // 所有的产品类型数据

      nowData: null, // 当前选中的数据 两个表格共用，因为字段相同
      queryModalShow: false, // 查看详情模态框是否显示 两个表格共用，因为字段相同

      citys: [], // 符合Cascader组件的城市数据
      searchAddress: [], // 搜索 - 地址
      stations: [], // 当前省市区下面的服务站

      years: [], //年份的数组
      searchyear: "" //搜索 - 结算年份
    };
  }

  // 查看record中有哪些数据
  onQueryClick2(text, record) {
    const d = _.cloneDeep(record);
    d.company = text.split("_")[1];
    this.setState({
      nowData: d
    });
    this.props.actions.saveTest(d);
    // this.props.history.push("../NewMoney/Querydetail");
    console.log("跳转页面的record带了哪些参数：", d);
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
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

    /** 查所有的产品类型 **/
    this.getAllProductTypes();
    /** 进入页面获取一次总部收入列表 **/
    this.onGetDataHQ(this.state.pageNumHQ, this.state.pageSizeHQ);
    /** 进入页面获取一次服务站收入列表 **/
    this.onGetDataSE(this.state.pageNumSE, this.state.pageSizeSE);
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

  /** 总部收益查询-主列表所需数据 **/
  onGetDataHQ(pageNum, pageSize) {
    console.log("AAAA:", pageNum, pageSize);
    const params = {
      pageNum,
      pageSize,
      years: this.state.searchyear
    };
    this.props.actions
      .getSupplierIncomeMain(tools.clearNull(params))
      .then(res => {
        if (res.status === "0") {
          console.log("到底是什么：", res.data);
          this.setState({
            dataHQ: res.data || [],
            pageNumHQ: pageNum,
            pageSizeHQ: pageSize,
            totalHQ: res.data.total
          });
        } else {
          message.error(res.message || "获取数据失败，请重试");
        }
      });
  }

  /** 总部 - 主列表 - 点击搜索按钮 **/
  onHQSearch() {
    this.onGetDataHQ(this.state.pageNumHQ, this.state.pageSizeHQ);
  }

  /** 总部 - 搜索结算收益 **/
  onSearchYear(e) {
    //搜索 - 结算年份
    this.setState({
      searchyear: this.state.years.map(item => item.e).join(",")
    });
  }

  /**table总部收益表格数据显示**/
  makeColumns() {
    const columns = [
      {
        title: "产品公司",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "净水服务公司",
        dataIndex: "company1",
        key: "company1",
        render: (text, record) => {
          return {
            children: (() => {
              if (record.name == "月份/年份") {
                return <span>{text.split("_")[0]}</span>;
              } else {
                return (
                  <span onClick={() => this.onQueryClick2(text, record)}>
                    <a href="#/money/querydetail">{text.split("_")[0]}</a>
                  </span>
                );
              }
            })(),
            props: {
              colSpan: 1
            }
          };
        }
      },
      {
        title: "健康食品公司",
        dataIndex: "company2",
        key: "company2",
        render: (text, record) => {
          return {
            children: (() => {
              if (record.name == "月份/年份") {
                return <span>{text.split("_")[0]}</span>;
              } else {
                return (
                  <span onClick={() => this.onQueryClick2(text, record)}>
                    <a href="#/money/querydetail">{text.split("_")[0]}</a>
                  </span>
                );
              }
            })(),
            props: {
              colSpan: 1
            }
          };
        }
      },
      {
        title: "生物科技公司",
        // colSpan: 0,
        dataIndex: "company3",
        key: "company3",
        render: (text, record) => {
          return {
            children: (() => {
              if (record.name == "月份/年份") {
                return <span>{text.split("_")[0]}</span>;
              } else {
                return (
                  <span onClick={() => this.onQueryClick2(text, record)}>
                    <a href="#/money/querydetail">{text.split("_")[0]}</a>
                  </span>
                );
              }
            })(),
            props: {
              colSpan: 1
            }
          };
        }
      },
      {
        title: "健康评估公司",
        dataIndex: "company5",
        key: "company5",
        render: (text, record) => {
          return {
            children: (() => {
              if (record.name == "月份/年份") {
                return <span>{text.split("_")[0]}</span>;
              } else {
                return (
                  <span onClick={() => this.onQueryClick2(text, record)}>
                    <a href="#/money/querydetail">{text.split("_")[0]}</a>
                  </span>
                );
              }
            })(),
            props: {
              colSpan: 1
            }
          };
        }
      },
      {
        title: "总计",
        dataIndex: "sum",
        render: (text, record) => {
          return {
            children: <span>{text}</span>,
            props: {
              colSpan: 1
            }
          };
        }
      }
    ];
    return columns;
  }

  //服务站收益列表
  DataStation() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "服务站地区",
        dataIndex: "stationArea",
        key: "stationArea"
      },
      {
        title: "服务站公司名称",
        dataIndex: "stationCompanyName",
        key: "stationCompanyName"
      },
      {
        title: "2017"
      },
      {
        title: "2018",
        dataIndex: "stationTotalIncome",
        key: "stationTotalIncome",
        render: (text, record) => {
          return {
            children: (
              <span onClick={() => this.onQueryClick2(text, record)}>
                <a href="#/money/querydetail">{text}</a>
              </span>
            ),
            props: {
              colSpan: 1
            }
          };
        }
      },
      {
        title: "总计",
        dataIndex: "sum",
        render: text => {
          return {
            children: <span>{text}</span>,
            props: {
              colSpan: 1
            }
          };
        }
      }
    ];

    return columns;
  }


  /** 总部收益表 构建table所需数据 **/
  makeData(d) {
    console.log("data是个啥：", d);
    const res = [];
    for (let i = 0; i <= 13; i++) {
      const obj = {
        company1: "0",
        company2: "0",
        company3: "0",
        company5: "0"
      };
      switch (i) {
        case 0:
          obj.name = "月份/年份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.year || ""}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.year || ""}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.year || ""}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.year || ""}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum = null;
          break;
        case 1:
          obj.name = "1月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.janurary || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.janurary || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.janurary || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.janurary || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);
          break;
        case 2:
          obj.name = "2月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.february || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.february || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.february || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.february || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 3:
          obj.name = "3月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.march || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.march || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.march || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.march || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 4:
          obj.name = "4月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.april || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.april || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.april || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.april || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 5:
          obj.name = "5月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.may || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.may || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.may || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.may || 0}_${item.company}`;
            }
            obj.year = item.year;
            obj.company = item.company;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 6:
          obj.name = "6月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.june || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.june || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.june || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.june || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 7:
          obj.name = "7月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.july || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.july || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.july || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.july || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 8:
          obj.name = "8月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.august || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.august || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.august || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.august || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 9:
          obj.name = "9月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.september || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.september || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.september || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.september || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 10:
          obj.name = "10月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.october || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.october || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.october || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.october || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 11:
          obj.name = "11月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.november || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.november || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.november || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.november || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);

          break;
        case 12:
          obj.name = "12月份";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.december || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.december || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.december || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.december || 0}_${item.company}`;
            }
            obj.year = item.year;
          });
          obj.sum =
            Number(obj.company1.split("_")[0]) +
            Number(obj.company2.split("_")[0]) +
            Number(obj.company3.split("_")[0]) +
            Number(obj.company5.split("_")[0]);
          break;
        case 13:
          obj.name = "总计";
          d.forEach((item, index) => {
            if (item.company === "1") {
              obj.company1 = `${item.totalIncome || 0}_${item.company}`;
            } else if (item.company === "2") {
              obj.company2 = `${item.totalIncome || 0}_${item.company}`;
            } else if (item.company === "3") {
              obj.company3 = `${item.totalIncome || 0}_${item.company}`;
            } else if (item.company === "5") {
              obj.company5 = `${item.totalIncome || 0}_${item.company}`;
            }
            obj.year = item.year;
          });

          obj.sum = d.reduce((v1, v2) => {
            return v1 + (v2.totalIncome || 0);
          }, 0);
      }
      obj.key = i;

      if (obj.sum == 0) {
      } else {
        res.push(obj);
      }
    }

    console.log("res:", res);
    return res;
  }

  /** 服务站收益表 构建table所需数据 **/
  makeDataStation(data) {
    return data.map((item, index) => {
      return {
        stationArea: item.stationArea,
        serial: index + 1,
        stationTotalIncome: item.stationTotalIncome,
        sum: item.stationTotalIncome
      };
    });
  }

  /** 查看详情模态框出现 **/
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true
    });
  }
  /** 查看详情模态框消失 **/
  onQueryModalClose() {
    this.setState({
      nowData: null,
      queryModalShow: false
    });
  }

  /** 服务站收益 - 获取省级数据（上方查询服务站地区用）  获取所有的省 **/
  getAllCity0() {
    this.props.actions
      .findAllProvince({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            citys: res.data || []
          });
        }
      });
  }

  /** 服务站收益 - 获取某省下面的市（上方查询服务站地区用） **/
  getAllCitySon(selectedOptions) {
    console.log("这是哪里：", selectedOptions);
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    this.props.actions
      .findCityOrCounty({
        parentId: selectedOptions[selectedOptions.length - 1].id
      })
      .then(res => {
        if (res.status === "0") {
          targetOption.children = res.data.map((item, index) => {
            return {
              id: item.id,
              value: item.areaName,
              label: item.areaName,
              isLeaf: item.level === 2,
              key: index
            };
          });
        }
        targetOption.loading = false;
        this.setState({
          citys: [...this.state.citys]
        });
      });
  }

  /** 服务站收益列表查询 **/
  onGetDataSE(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      // province: this.state.SESearchArea && this.state.SESearchArea[0],
      // city: this.state.SESearchArea && this.state.SESearchArea[1],
      // region: this.state.SESearchArea && this.state.SESearchArea[2],
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    this.props.actions
      .getStationIncomeMain(tools.clearNull(params))
      .then(res => {
        if (res.status === "0") {
          console.log("到底是什么：", res.data.result);
          this.setState({
            dataSE: res.data || [],
            pageNumSE: pageNum,
            pageSizeSE: pageSize,
            totalSE: res.data.total
          });
        } else {
          message.error(res.message || "获取数据失败，请重试");
        }
      });
  }

  /** 服务站 - 主列表 - 点击搜索按钮 **/
  onSESearch() {
    this.onGetDataSE(this.state.pageNumSE, this.state.pageSizeSE);
  }

  /** 查所有的产品类型 **/
  getAllProductTypes() {
    this.props.actions
      .findProductTypeByWhere({ pageNum: 1, pageSize: 999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            typesProduct: res.data.result
          });
        }
      });
  }

  /** 导出 **/
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/capital/earnedIncome/export`;
    form.method = "post";
    console.log("FORM:", form);
    form.submit();
  }

  /** 总部 - 导出按钮被点击 **/
  onHQDownload() {
    this.onExportData(1, 99999);
  }
  /** 服务站 - 导出按钮被点击 **/
  onSEDownload() {
    this.onExportData(1, 99999);
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
    console.log("怎么会：", this.state.dataSEMain);
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-func">
            <li>
              <div>
                <Tabs type="card">
                  <TabPane tab="总部收益" key="1">
                    <div className="system-table">
                      <div className="system-table">
                        <ul
                          className="search-ul more-ul"
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          <li>
                            <span>结算年份：</span>
                            <Select
                              mode="tags"
                              style={{ width: "275px" }}
                              placeholder="请选择年份"
                              onChange={e => this.onSearchYear(e)}
                            >
                              {children}
                            </Select>
                          </li>
                          <li>
                            <span>结算月份：</span>
                            <Select
                              mode="tags"
                              style={{ width: "735px" }}
                              placeholder="请选择结算月份"
                              onChange={MonthChange}
                            >
                              {children2}
                            </Select>
                          </li>
                        </ul>
                        <ul
                          style={{ marginTop: "10px" }}
                          className="search-ul more-ul"
                        >
                          <li style={{ display: "flex", marginTop: "5px" }}>
                            <span>产品公司：</span>
                            <Checkbox.Group onChange={onChange}>
                              <Row>
                                <Col style={{ width: "128px", float: "left" }}>
                                  <Checkbox value="1">净水服务公司</Checkbox>
                                </Col>
                                <Col style={{ width: "128px", float: "left" }}>
                                  <Checkbox value="2">健康食品公司</Checkbox>
                                </Col>
                                <Col style={{ width: "128px", float: "left" }}>
                                  <Checkbox value="3">生物科技公司</Checkbox>
                                </Col>
                                <Col style={{ width: "128px", float: "left" }}>
                                  <Checkbox value="5">健康评估公司</Checkbox>
                                </Col>
                              </Row>
                            </Checkbox.Group>
                          </li>
                          <li style={{ marginLeft: "30px" }}>
                            <Button
                              icon="search"
                              type="primary"
                              onClick={() => this.onHQSearch()}
                            >
                              搜索
                            </Button>
                          </li>
                          <li style={{ marginLeft: "10px" }}>
                            <Button
                              icon="download"
                              style={{
                                color: "#fff",
                                backgroundColor: "#108ee9",
                                borderColor: "#108ee9"
                              }}
                              onClick={warning}
                            >
                              导出
                            </Button>
                            {/*<Button icon="download" type="primary" onClick={() => this.onHQDownload()}>导出</Button>*/}
                          </li>
                        </ul>
                        {/** 总部收益主表 **/}
                        <Table
                          columns={this.makeColumns()}
                          style={{ width: "1400px" }}
                          className="my-table"
                          dataSource={this.makeData(this.state.dataHQ)}
                          bordered={true}
                          pagination={false}
                        />
                      </div>
                    </div>
                  </TabPane>
                  <TabPane tab="服务站收益" key="2">
                    <div className="system-table" style={{ width: "400px" }}>
                      <ul className="more-ul" style={{ margin: "10px" }}>
                        <li>
                          <span style={{ marginRight: "21px" }}>
                            结算年份：
                          </span>
                          <Select
                            mode="tags"
                            style={{ width: "185px", marginBottom: "10px" }}
                            placeholder="请选择年份"
                            // onChange={handleChange}
                          >
                            {children}
                          </Select>
                        </li>
                        <li style={{ marginBottom: "10px" }}>
                          <span style={{ marginRight: "8px" }}>
                            服务站地区：
                          </span>
                          <Cascader
                            style={{ width: " 185px " }}
                            placeholder="请选择服务区域"
                            onChange={v => this.onSearchAddress(v)}
                            options={this.state.citys}
                            loadData={e => this.getAllCitySon(e)}
                            changeOnSelect
                          />
                        </li>
                        <li style={{ marginLeft: "10px" }}>
                          <Button
                            icon="search"
                            type="primary"
                            onClick={() => this.onSESearch()}
                            style={{ marginRight: "20px" }}
                          >
                            搜索
                          </Button>
                          <Button
                            icon="download"
                            style={{
                              color: "#fff",
                              backgroundColor: "#108ee9",
                              borderColor: "#108ee9"
                            }}
                            onClick={warning}
                          >
                            导出
                          </Button>
                          {/*<Button icon="download" type="primary" onClick={() => this.onSEDownload()}>导出</Button>*/}
                        </li>
                      </ul>
                    </div>
                    <div className="system-table">
                      {/** 服务站主表 **/}
                      <Table
                        columns={this.DataStation()}
                        style={{ width: "1400px" }}
                        className="my-table"
                        dataSource={this.makeDataStation(this.state.dataSE)}
                        bordered={true}
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
                  </TabPane>
                </Tabs>
              </div>
            </li>
          </ul>
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
  form: P.any,
  citys: P.array // 动态加载的省
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({
    citys: state.sys.citys
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        getSupplierIncomeMain,
        findSaleRuleByWhere,
        getStationIncomeMain,
        findProductTypeByWhere,
        findAllProvince,
        findStationByArea,
        findCityOrCounty,
        onChange,
        warning,
        saveTest
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
