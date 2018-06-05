/* List 资金管理/结算查询 */

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
  getSupplierIncomeList,
  getSupplierIncomeMain,
  searchCompanyIncome,
  onChange
} from "../../../../a_action/curr-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
const { MonthPicker } = DatePicker;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHQ: [], // 总部 - 主列表 - 数据
      pageNumHQ: 1, // 总部 - 主列表 - 当前第几页
      pageSizeHQ: 14, // 总部 - 主列表 - 每页多少条
      totalHQ: 0, // 总部 - 主列表 - 共多少条数据
      productTypes: [], //所有的产品类型
      nowData: null, // 当前选中的数据 两个表格共用，因为字段相同
      queryModalShow: false, // 查看详情模态框是否显示 两个表格共用，因为字段相同
      citys: [], // 符合Cascader组件的城市数据
      stations: [] // 当前省市区下面的服务站
    };
  }

  componentDidMount() {
    console.log("这个是我要传功来的参数：", this.props.test);
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

    /** 查所有的分配类型 **/
    this.getAllAllotTypes();
    /** 查询所有的收益类型 **/
    this.getProfitTypes();
    /** 查所有的产品类型 **/
    this.getAllProductTypes();
    /** 进入页面获取一次总部收益详情列表 **/
    this.onGetDataHQ(
      this.props.test.year,
      this.props.test.company,
      this.props.test.name
    );

    this.getAllProductType(); // 获取所有的产品类型
  }

  // 工具 - 根据ID获取该公司名称
  getCompanyId(id) {
    switch (String(id)) {
      case "1":
        return "净水服务公司";
      case "2":
        return "健康食品公司";
      case "3":
        return "生物科技公司";
      case "5":
        return "健康评估公司";
      default:
        return "";
    }
  }

  // 工具 - 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
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

  /** 总部收益详情列表数据详情 **/
  onGetDataHQ(year, company, month) {
    const params = {
      year,
      month,
      company
    };
    this.props.actions
      .getSupplierIncomeList(tools.clearNull(params))
      .then(res => {
        if (res.status === "0") {
          console.log("到底是什么：", res.data);
          this.setState({
            year,
            month,
            company,
            dataHQ: res.data || []
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

  /** 总部&服务站 共用（因为字段一样 - 构建字段 **/
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
        render: text => this.findProductNameById(text)
      },
      {
        title: "收益金额",
        dataIndex: "income",
        key: "income"
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "订单总金额",
        dataIndex: "orderFee",
        key: "orderFee"
      },
      {
        title: "订单完成时间",
        dataIndex: "completeTime",
        key: "completeTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "操作",
        key: "control",
        width: 170,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="详情">
                <Icon type="eye" />
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

  /** 总部 构建table所需数据 **/
  makeData(data) {
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNumHQ - 1) * this.state.pageSizeHQ,
        year: this.props.test.year,
        company: this.props.test.company,
        month: this.props.test.month,
        balanceMonth: item.balanceMonth,
        orderFee: item.orderFee,
        refer: item.refer,
        completeTime: item.completeTime,
        income: item.income,
        orderId: item.orderId,
        productType: item.productType
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

  /** 服务站收益 - 获取省级数据（上方查询服务站地区用） **/
  getAllCity0() {
    this.props.actions.findAllProvince();
  }

  /** 服务站收益 - 获取某省下面的市（上方查询服务站地区用） **/
  getAllCitySon(selectedOptions) {
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

  /** 总部 - 主表单页码改变 **/
  onHQTablePageChange(page, pageSize) {
    this.onGetDataHQ(page, pageSize);
  }

  /** 总部 - 构建上面表格字段 **/
  makeColumnsTop() {
    const columns = [
      {
        title: "结算主体",
        dataIndex: "stationName",
        key: "stationName"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "总订单金额",
        dataIndex: "orderIncome",
        key: "orderIncome"
      },
      {
        title: "总收益",
        dataIndex: "income",
        key: "income"
      }
    ];
    return columns;
  }

  /** 服务站 - 主表 - 页码改变时触发 **/
  onSETablePageChange(page, pageSize) {
    this.onGetDataSE(page, pageSize);
  }

  /** 服务站 - 上方部分 - 获取数据 **/
  onSESearchMain() {
    if (!this.state.SESearchDate) {
      message.error("请选择结算月份", 1);
      return;
    } else if (!this.state.SESearchArea) {
      message.error("请选择服务站地区", 1);
      return;
    }
    const params = {
      balanceMonth: this.state.SESearchDate
        ? tools.dateToStr(this.state.SESearchDate._d)
        : null,
      province: this.state.SESearchArea ? this.state.SESearchArea[0] : null,
      city: this.state.SESearchArea ? this.state.SESearchArea[1] : null,
      region: this.state.SESearchArea ? this.state.SESearchArea[2] : null
    };
    this.props.actions
      .searchCompanyIncome(tools.clearNull(params))
      .then(res => {
        if (res.status === "0") {
          this.setState({
            dataSEMain: res.data || []
          });
        }
      });
    this.onSESearch();
  }

  /** 查所有的分配类型 **/
  getAllAllotTypes() {
    this.props.actions
      .findSaleRuleByWhere({ pageNum: 1, pageSize: 999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            typesAllot: res.data.result
          });
        }
      });
  }

  /** 查所有的收益类型 目前写死的 **/
  getProfitTypes() {
    this.setState({
      typesProfit: [
        { label: "经营收益", value: "经营收益" },
        { label: "服务收益", value: "服务收益" }
      ]
    });
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
                <div className="system-table">
                  <div className="system-table">
                    <ul
                      className="search-ul more-ul"
                      style={{ marginTop: "10px", marginBottom: "10px" }}
                    >
                      <Tooltip placement="top" title="返回">
                        <a href="#/money/query">
                          <Icon
                            type="arrow-left"
                            style={{
                              color: "black",
                              marginTop: "5px",
                              marginLeft: "10px",
                              fontSize: "30px"
                            }}
                          />
                        </a>
                      </Tooltip>
                      <li style={{ margin: "6px" }}>
                        <span>结算年份：</span>
                        <span>{this.props.test.year}</span>
                      </li>
                      <li style={{ margin: "6px" }}>
                        <span>结算月份：</span>
                        <span>{this.props.test.name}</span>
                      </li>
                      <li style={{ display: "flex", margin: "6px" }}>
                        <span>产品公司：</span>
                        <span>
                          {this.getCompanyId(this.props.test.company)}
                        </span>
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
                    {/** 总部主表 **/}
                    <Table
                      columns={this.makeColumns()}
                      style={{ width: "1400px" }}
                      className="my-table"
                      dataSource={this.makeData(this.state.dataHQ)}
                      pagination={false}
                    />
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        {/** 查看详情Modal **/}
        <Modal
          title={"查看详情"}
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.findProductNameById(this.state.nowData.productType)
                : ""}
            </FormItem>
            <FormItem label="收益金额" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.income : ""}
            </FormItem>
            <FormItem label="订单号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.orderId : ""}
            </FormItem>
            <FormItem label="云平台工单号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.refer : ""}
            </FormItem>
            <FormItem label="订单总金额" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.orderFee : ""}
            </FormItem>
            <FormItem label="订单完成时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.completeTime : ""}
            </FormItem>
            <FormItem label="结算月份" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.balanceMonth : ""}
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
  form: P.any,
  citys: P.array, // 动态加载的省
  test: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({
    citys: state.sys.citys,
    test: state.sys.test
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        getSupplierIncomeList,
        findSaleRuleByWhere,
        getSupplierIncomeMain,
        searchCompanyIncome,
        findProductTypeByWhere,
        findAllProvince,
        findStationByArea,
        findCityOrCounty,
        onChange,
        warning
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
