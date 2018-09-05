/* List 产品管理/产品列表 */

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
  DatePicker,
  Table,
  message,
  InputNumber,
  Modal,
  Radio,
  Tooltip,
  Select,
  Cascader,
  Tabs,
  Divider,
  Popover
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
  findAllProvince,
  findCityOrCounty,
  ServiceFlow,
  findSaleRuleByWhere,
  findProductTypeByWhere,
  findProductModelByWhere
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "top",
      data: [], // 当前页面全部数据
      data2: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      distributionTypes: [], //所有的分配类型
      productModels: [], // 所有的产品型号
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchDistributionType: undefined, // 搜索 - 分配类型
      searchName: "", // 搜索 - 名称
      searchOrderId: "", // 搜索 - 订单号
      searchUserId: "", // 搜索 - 用户账号
      searchHraCardId: "", //搜索 - 体检卡号
      searchSerialNumber: "", // 搜索 - 流水号
      searchDistributorAccount: "", // 搜索 - 经销商账户
      searchMinPayTime: "", //搜索 - 最小支付时间
      searchMaxPayTime: "", //搜索 - 最大支付时间
      searchPayMonth: "", //搜索 - 结算月份
      searchMinOrderFee: "", //搜索 - 最小金额
      searchMaxOrderFee: "", //搜索 - 最大金额
      searchAddress: [], // 搜索 - 地址
      addOrUp: "add", // 当前操作是新增还是修改
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData2: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow2: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [] // 符合Cascader组件的城市数据
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
    this.getAllProductType(); // 获取所有的产品类型
    this.getAllDistributionType(); //获取所有的分配类型
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData2(this.state.pageNum, this.state.pageSize);
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

  // 查询当前页面所需服务收益列表数据
  onGetData2(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      typeId: this.state.searchTypeId,
      orderId: this.state.searchOrderId,
      userId: this.state.searchUserId,
      hraCardId: this.state.searchHraCardId,
      serialNumber: this.state.searchSerialNumber.trim(),
      distributionType: this.state.searchDistributionType,
      minPayTime: this.state.searchMinPayTime
        ? `${tools.dateToStrD(this.state.searchMinPayTime._d)} 00:00:00`
        : "",
      maxPayTime: this.state.searchMaxPayTime
        ? `${tools.dateToStrD(this.state.searchMaxPayTime._d)} 23:59:59`
        : "",
      payMonth: this.state.searchPayMonth
        ? `${tools.dateToStrD(this.state.searchPayMonth._d)}`
        : "",
      minOrderFee: this.state.searchMinOrderFee,
      maxOrderFee: this.state.searchMaxOrderFee,
      distributorAccount: this.state.searchDistributorAccount,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2]
    };
    this.props.actions.ServiceFlow(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }

  // 导出服务收益所需列表数据
  onExportData2(pageNum, pageSize) {
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
    form.action = `${Config.baseURL}/manager/capital/serveIncome/export`;
    form.method = "post";
    console.log("FORM:", form);
    form.submit();
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }

  // 搜索 - 产品类型输入框值改变时触发
  onSearchTypeId(typeId) {
    this.setState({
      searchTypeId: typeId
    });
  }

  // 搜索 - 订单号查询
  searchOrderIdChange(v) {
    this.setState({
      searchOrderId: v.target.value
    });
  }

  //搜索 - 体检号查询
  searchHraCardIdChange(v) {
    this.setState({
      searchHraCardId: v.target.value
    });
  }

  //搜索 - 流水号查询
  searchSerialNumberChange(v) {
    this.setState({
      searchSerialNumber: v.target.value
    });
  }

  // 搜索 - 分配类型输入框值改变时触发
  searchDistributionTypeChange(id) {
    this.setState({
      searchDistributionType: id
    });
  }

  // 搜索 - 最小支付时间
  searchMinPayTime(v) {
    this.setState({
      searchMinPayTime: v
    });
  }

  // 搜索 - 最大支付时间
  searchMinPayTime(v) {
    this.setState({
      searchMaxPayTime: v
    });
  }

  // 搜索 - 最小金额
  searchMinOrderFeeChange(id) {
    this.setState({
      searchMinOrderFee: id
    });
  }

  // 搜索 - 最大金额
  searchMaxOrderFeeChange(id) {
    this.setState({
      searchMaxOrderFee: id
    });
  }

  // 搜索 - 结算月份
  searchPayMonthChange(v) {
    this.setState({
      searchPayMonth: v
    });
  }

  // 搜索 - 经销商账户
  searchDistributorAccountChange(v) {
    this.setState({
      searchDistributorAccount: v.target.value
    });
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }

  // 搜索
  onSearch2() {
    this.onGetData2(this.state.pageNum, this.state.pageSize);
  }

  //导出
  onExport2() {
    this.onExportData2(this.state.pageNum, this.state.pageSize);
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

  // 获取所有的分配类型
  getAllDistributionType() {
    this.props.actions
      .findSaleRuleByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            distributionTypes: res.data.result
          });
        }
      });
  }

  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductModelByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productModels: res.data.result
          });
        }
      });
  }

  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }

  // 获取某省下面的市
  getAllCitySon(selectedOptions) {
    console.log("SSS", selectedOptions);
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

  // 工具 - 根据产品类型ID返回产品类型名称
  getNameByTypeId(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据有效期type获取有效期名称
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0":
        return "长期有效";
      case "1":
        return `${time}天`;
      case "2":
        return `${time}月`;
      case "3":
        return `${time}年`;
      default:
        return "";
    }
  }

  // 查询经营收益数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true,
      queryModalShow2: false
    });
  }

  // 查询服务收益数据的详情
  onQueryClick2(record) {
    this.setState({
      nowData2: record,
      queryModalShow2: true,
      queryModalShow: false
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false,
      queryModalShow2: false
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    this.onGetData2(page, pageSize);
  }

  // 产品类型改变时，重置产品型号的值位undefined
  onTypeIdChange() {
    const { form } = this.props;
    form.resetFields(["addnewTypeCode"]);
  }

  // 构建服务收益字段
  makeColumns2() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "体检卡号",
        dataIndex: "hraCardId",
        key: "hraCardId"
      },
      {
        title: "订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType"
      },
      {
        title: "用户账号",
        dataIndex: "userId",
        key: "userId"
      },
      {
        title: (
          <Popover
            title="提示"
            content={
              <div>
                <Table
                  columns={this.makeColumnsHint()}
                  className="my-table"
                  scroll={{ x: 900 }}
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
            }
            trigger="hover"
            placement="bottomLeft"
          >
            <span>分配类型</span>
            <Icon
              type="question-circle"
              style={{ fontSize: "20px", marginLeft: "5px", marginTop: "3px" }}
            />
          </Popover>
        ),
        dataIndex: "distributionType",
        key: "distributionType"
      },
      {
        title: "订单总金额",
        dataIndex: "fee",
        key: "fee"
      },
      {
        title: "分配金额",
        dataIndex: "distributionFee",
        key: "distributionFee"
      },
      {
        title: "流水号",
        dataIndex: "serialNumber",
        key: "serialNumber"
      },
      {
        title: "支付时间",
        dataIndex: "useTime",
        key: "useTime"
      },
      {
        title: "结算月份",
        dataIndex: "balanceMonth",
        key: "balanceMonth"
      },
      {
        title: "服务站地区",
        dataIndex: "useArea",
        key: "useArea"
      },
      {
        title: "服务站名称",
        dataIndex: "usedStationName",
        key: "usedStationName"
      },
      {
        title: "服务收益设备所在服务站",
        dataIndex: "stationIncome",
        key: "stationIncome"
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 60,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClick2(record)}
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

  //构建提示Hint字段
  makeColumnsHint() {
    const columns = [
      {
        title: "分配类型id"
      },
      {
        title: "产品类型"
      },
      {
        title: "用户是否是经销商"
      },
      {
        title: "经销商所在服务站是否承包体检设备"
      },
      {
        title: "经销商"
      },
      {
        title: "服务商"
      },
      {
        title: "总部"
      },
      {
        title: "提供体检服务服务站"
      }
    ];
    return columns;
  }

  // 构建table所需数据
  makeData2(data2) {
    console.log("data2是个啥：", data2);
    return data2.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        typeCode: item.typeCode,
        payTime: item.payTime,
        count: item.count,
        productType: item.productType,
        distributionType: item.distributionType,
        orderId: item.orderId,
        hraCardId: item.hraCardId,
        serialNumber: item.serialNumber,
        stationIncome: item.stationIncome,
        distributorIncome: item.distributorIncome,
        balanceMonth: item.balanceMonth,
        distributorAccount: item.distributorAccount,
        distributorName: item.distributorName,
        distributionFee: item.distributionFee,
        stationArea: item.stationArea,
        stationName: item.stationName,
        useTime: item.useTime,
        fee: item.fee,
        useArea: item.useArea,
        usedStationName: item.usedStationName,
        userId: item.userId,
        saleMode: item.saleMode,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
      };
    });
  }

  render() {
    const me = this;
    const { mode } = this.state;
    const { form } = me.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    };

    // console.log('是啥：', this.state.productModels.filter((item) => String(item.typeId) === String(form.getFieldValue('addnewTypeId'))));
    const modelId = form.getFieldValue("addnewTypeCode");

    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-func">
            <li>
              <div>
                <Tabs type="card">
                  <TabPane tab="服务收益" key="1" style={{ width: "1630px" }}>
                    <div
                      style={{
                        borderBottom: "solid 1px #CCC",
                        marginBottom: "10px",
                        paddingBottom: "10px"
                      }}
                    >
                      <ul className="search-ul more-ul">
                        <li>
                          <span>订单号查询</span>
                          <Input
                            style={{ width: "165px" }}
                            onChange={e => this.searchOrderIdChange(e)}
                          />
                        </li>
                        <li>
                          <span>体检号查询</span>
                          <Input
                            style={{ width: "200px", marginRight: "57px" }}
                            onChange={e => this.searchHraCardIdChange(e)}
                          />
                        </li>
                        <li>
                          <span>产品类型</span>
                          <Select
                            allowClear
                            whitespace="true"
                            placeholder="全部"
                            value={this.state.searchTypeId}
                            style={{ width: "170px", marginLeft: "15px" }}
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
                          <span style={{ marginRight: "10px" }}>分配类型</span>
                          <Select
                            allowClear
                            whitespace="true"
                            placeholder="全部"
                            value={this.state.searchDistributionType}
                            onChange={e => this.searchDistributionTypeChange(e)}
                            style={{ width: "172px", marginLeft: "8px" }}
                          >
                            {this.state.distributionTypes.map((item, index) => {
                              return (
                                <Option key={index} value={item.id}>
                                  {item.ruleCode}
                                </Option>
                              );
                            })}
                          </Select>
                        </li>
                        <li>
                          <span>流水号查询</span>
                          <Input style={{ width: "172px" }} />
                        </li>
                        <li>
                          <span style={{ marginRight: "10px" }}>结算月份</span>
                          <MonthPicker
                            onChange={e => this.searchPayMonthChange(e)}
                            placeholder="选择月份"
                          />
                        </li>
                        <li>
                          <span style={{ marginRight: "10px" }}>支付时间</span>
                          <DatePicker
                            style={{ width: "130px" }}
                            dateRender={current => {
                              const style = {};
                              if (current.date() === 1) {
                                style.border = "1px solid #1890ff";
                                style.borderRadius = "45%";
                              }
                              return (
                                <div
                                  className="ant-calendar-date"
                                  style={style}
                                >
                                  {current.date()}
                                </div>
                              );
                            }}
                            format="YYYY-MM-DD"
                            placeholder="开始时间"
                            onChange={e => this.searchMinPayTime(e)}
                          />
                          --
                          <DatePicker
                            style={{ width: "130px" }}
                            dateRender={current => {
                              const style = {};
                              if (current.date() === 1) {
                                style.border = "1px solid #1890ff";
                                style.borderRadius = "45%";
                              }
                              return (
                                <div
                                  className="ant-calendar-date"
                                  style={style}
                                >
                                  {current.date()}
                                </div>
                              );
                            }}
                            format="YYYY-MM-DD"
                            placeholder="结束时间"
                            onChange={e => this.searchMaxPayTime(e)}
                          />
                        </li>
                        <li>
                          <span>订单总金额</span>
                          <InputNumber
                            style={{ width: "80px" }}
                            min={0}
                            max={999999}
                            placeholder="最小价格"
                            onChange={e => this.searchMinOrderFeeChange(e)}
                            value={this.state.searchMinOrderFee}
                          />--
                          <InputNumber
                            style={{ width: "80px" }}
                            min={0}
                            max={999999}
                            placeholder="最大价格"
                            onChange={e => this.searchMaxOrderFeeChange(e)}
                            value={this.state.searchMaxOrderFee}
                          />
                        </li>
                        <li>
                          <span>经销商账户查询</span>
                          <Input style={{ width: "172px" }} />
                        </li>
                        <li style={{ marginRight: "50px" }}>
                          <span>服务站地区</span>
                          <Cascader
                            placeholder="请选择服务区域"
                            style={{ width: "172px" }}
                            onChange={v => this.onSearchAddress(v)}
                            options={this.state.citys}
                            loadData={e => this.getAllCitySon(e)}
                          />
                        </li>
                        <li style={{ marginLeft: "30px" }}>
                          <Button
                            icon="search"
                            type="primary"
                            onClick={() => this.onSearch2()}
                          >
                            搜索
                          </Button>
                        </li>
                        <li style={{ marginLeft: "10px" }}>
                          <Button
                            icon="download"
                            type="primary"
                            onClick={() => this.onExport2()}
                          >
                            导出
                          </Button>
                        </li>
                      </ul>
                    </div>
                    <div className="system-table">
                      <Table
                        columns={this.makeColumns2()}
                        className="my-table"
                        scroll={{ x: 2400 }}
                        dataSource={this.makeData2(this.state.data2)}
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
        {/* 查看服务收益详情模态框 */}
        <Modal
          title="查看服务收益详情"
          visible={this.state.queryModalShow2}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="体检卡号" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.hraCardId : ""}
            </FormItem>
            <FormItem label="订单号" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.orderId : ""}
            </FormItem>
            <FormItem label="订单来源" {...formItemLayout}>
              {/*{!!this.state.nowData2 ? this.state.nowData2.orderId : ''}*/}
            </FormItem>
            <FormItem label="产品名称" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.productType : ""}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {!!this.state.nowData2
                ? this.getNameByModelId(this.state.nowData2.typeCode)
                : ""}
            </FormItem>
            <FormItem label="用户账户" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.userId : ""}
            </FormItem>
            <FormItem label="分配类型" {...formItemLayout}>
              {!!this.state.nowData2
                ? this.state.nowData2.distributionType
                : ""}
            </FormItem>
            <FormItem label="数量" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.count : ""}
            </FormItem>
            <FormItem label="订单总金额" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.fee : ""}
            </FormItem>
            <FormItem label="待分配金额" {...formItemLayout}>
              {!!this.state.nowData2
                ? this.state.nowData2.undistributedFee
                : ""}
            </FormItem>
            <FormItem label="流水号" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.serialNumber : ""}
            </FormItem>
            <FormItem label="支付时间" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.payTime : ""}
            </FormItem>
            <FormItem label="支付方式" {...formItemLayout}>
              {/*{!!this.state.nowData2 ? this.state.nowData2.serialNumber : ''}*/}
            </FormItem>
            <FormItem label="使用时间" {...formItemLayout}>
              {/*{!!this.state.nowData2 ? this.state.nowData2.balanceMonth : ''}*/}
            </FormItem>
            <FormItem label="结算月份" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.balanceMonth : ""}
            </FormItem>
            <FormItem label="经销商姓名" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.distributorName : ""}
            </FormItem>
            <FormItem label="使用体检卡服务站地区" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.useArea : ""}
            </FormItem>
            <FormItem label="使用体检卡服务站名称" {...formItemLayout}>
              {!!this.state.nowData2 ? this.state.nowData2.usedStationName : ""}
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
        findCityOrCounty,
        findSaleRuleByWhere,
        ServiceFlow,
        findAllProvince,
        findProductTypeByWhere,
        findProductModelByWhere
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
