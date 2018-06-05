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
  findAllProvince,
  findCityOrCounty,
} from "../../../../a_action/sys-action";
import {
  StatisticalList,
  onOk,
} from "../../../../a_action/statistical-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
import moment from "moment";
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      searchMobile: "", // 搜索 - 手机号
      searchCode: "", // 搜索 - 体检卡号
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      searchAddress: [], // 搜索 - 地址
      searchType:'',//搜索 - 产品类型
      searchrefundBeginTime:"", //搜索 - 选择开始时间
      searchrefundEndTime:"", //搜索 - 选择结束时间
      citys: [] ,// 符合Cascader组件的城市数据
      statisticCount:'' ,//总数
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
      this.onGetData(this.state.pageNum, this.state.pageSize);
    }
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

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    this.onGetData(page, pageSize);
  }

  // 页码每页显示多少条展示
  onShowSizeChange(current, pageSize) {
    console.log("显示多少条:", current, pageSize);
    this.onGetData(current, pageSize);
  }

  // 搜索 - 申请退款开始时间
  searchApplyBeginTime(v, v1) {
    console.log("是什么：", v, v1);
    this.setState({
      searchrefundBeginTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 申请退款结束时间
  searchApplyEndTime(v) {
    console.log("触发：", v);
    this.setState({
      searchrefundEndTime: _.cloneDeep(v)
    });
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      mobile: this.state.searchMobile,
      code: this.state.searchCode,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      modelType:this.state.searchType,
      beginTime: this.state.searchrefundBeginTime
        ? `${tools.dateToStr(this.state.searchrefundBeginTime.utc()._d)} `
        : "",
      endTime: this.state.searchrefundEndTime
        ? `${tools.dateToStr(this.state.searchrefundEndTime.utc()._d)} `
        : ""
    };
    this.props.actions.StatisticalList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.statistic.result || [],
          pageNum,
          pageSize,
          total:res.data.statistic.total,
          statisticCount:res.data.statisticCount || [],  //总数
        });
      } else if(res.status === "1") {
        message.error(res.message || "获取数据失败，请重试");
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

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }

  //搜索 - 产品型号
  onSearchType(c){
    this.setState({
      searchType:c
    })
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
        title: "省",
        dataIndex: "stationProvince",
        key: "stationProvince",
      },
      {
        title: "市",
        dataIndex: "stationCity",
        key: "stationCity",
      },
      {
        title: "区",
        dataIndex: "stationRegion",
        key: "stationRegion",
      },
      {
        title: "服务站名称",
        dataIndex: "stationName",
        key: "stationName",
      },
      {
        title:'体检用户',
        dataIndex:'ticketCount',
        key:'ticketCount'
      },
      {
        title: "百分比",
        dataIndex: "ratio",
        key: "ratio",
      },
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
        date: item.date,
        stationProvince:item.stationProvince,
        stationCity:item.stationCity,
        stationRegion:item.stationRegion,
        stationName:item.stationName,
        ticketCount: item.ticketCount,
        statisticCount:item.statisticCount,
        ratio:(item.ticketCount && this.state.statisticCount) ? `${((item.ticketCount)/(this.state.statisticCount)*100).toFixed(2)}%` : '',
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
                style={{ width: "175px" }}
                placeholder="请选择服务区域"
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>产品型号</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.onSearchType(e)}
              >
                <Option value={"Y"}>Y</Option>
                <Option value={"M"}>M</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>选择时间</span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={(e, s) => this.searchApplyBeginTime(e, s)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchApplyEndTime(e)}
                onOk={onOk}
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
            dataSource={this.makeData(this.state.data)}
            pagination={{
              total: this.state.total,
              current: this.state.pageNum,
              pageSize: this.state.pageSize,
              showQuickJumper: true,
              showSizeChanger: true,
              defaultCurrent: 3,
              pageSizeOptions: ["10", "30", "50"],
              onShowSizeChange: (current, pageSize) =>
                this.onShowSizeChange(current, pageSize),
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
        findAllProvince,
        findCityOrCounty,
        StatisticalList
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
