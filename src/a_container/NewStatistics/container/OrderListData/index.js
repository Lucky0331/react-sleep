/* List 体检管理/体检统计 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Config from "../../../../config/config";
import Echarts from "echarts";
import $ from 'jquery';

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
  Tabs,
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
  addProduct,
  upReserveList,
  deleteProduct,
  deleteImage,
  findProductModelByWhere,
  onOk,
} from "../../../../a_action/shop-action";
import {
  orderCountList,
} from "../../../../a_action/info-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
import moment from "moment";
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据 - e家用户
      data2: [], // 当前页面全部数据 - 未绑定
      dataNum:[],//头部一栏总内容 - e家
      dataNum2:[],//头部一栏总内容 - 未绑定
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      searchAddress: [], // 搜索 - 地址
      searchBindingBeginTime:'',//搜索 - 开始时间
      searchBindingEndTime:'',//搜索 - 结束时间
      maxTime:'',//最大时间
      minTime:'',//最小时间
      citys: [], // 符合Cascader组件的城市数据
      usedTotalNum:"",//体检预约总数
      reverseTotalNum:"",//公众号预约总数
      searchRadio: 1 ,//时间区间 - 默认选择
      searchRadioFour: 4 ,//区域选择 - 默认选择
      tabKey:1,//tabKey值
    };
    this.echartsDom = null; // Echarts实例
  }
  
  componentWillUnmount() {
    this.echartsDom1 = null; // Echarts实例
    this.echartsDom2 = null; // Echarts实例
    window.onresize = null;
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
    const me = this;
    // setTimeout是因为初次加载时，CSS可能还没加载完毕，导致图表样式有问题
    setTimeout(() => {
      const dom1 = Echarts.init(document.getElementById("echarts-1"));
      const dom2 = Echarts.init(document.getElementById("echarts-2"));
      this.echartsDom1 = dom1;
      this.echartsDom2 = dom2;
      dom1.setOption(me.makeOption1(this.state.data), true);
      dom2.setOption(me.makeOption2(this.state.data2), true);
      window.onresize = () => {
        dom1.resize();
        dom2.resize();
      };
      this.onGetData(this.state.pageNum,this.state.pageSize)
    }, 16);

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

  componentWillUpdate(nextP, nextS) {
    console.log(nextS, nextP);
    if(nextS.data !== this.state.data) {
      this.echartsDom1.setOption(this.makeOption1(nextS.data), true);
    }
    if(nextS.data2 !== this.state.data2) {
      this.echartsDom2.setOption(this.makeOption2(nextS.data2), true);
    }
  }
  
  // 表单页码改变  - e家用户
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }
  
  // 表单页码改变 - 未绑定用户
  onTablePageChange2(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData2(page, pageSize);
  }
  
  
  //运营数据 tab操作
  onSearchJump(e){
    if(e==1){ //e家用户
      this.onGetData(1, this.state.pageSize);
    }else if(e==2){ //未绑定用户
      this.onGetData2(1, this.state.pageSize);
    }
    setTimeout(()=>{
      this.echartsDom1 && this.echartsDom1.resize();
      this.echartsDom2 && this.echartsDom2.resize();
    });
    //把key值存起来 然后导出的时候拿到对应的tab值
    this.setState({
      tabKey:e
    })
  }

  // 查询当前页面所需列表数据 - 订单概况
  onGetData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 6 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchBindingBeginTime ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}` : null;
      maxTime = this.state.searchBindingEndTime ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}` : null;
    }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:1,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    this.props.actions.orderCountList(tools.clearNull(params)).then(res => {
      console.log("请求到东西了么:", res.data.detail);
      if (res.status === "0") {
        this.setState({
          data: res.data.detail || [],
          dataNum: [res.data] || "",
          pageNum,
          pageSize,
          total:res.data.total,
          minTime:(res.data.minTime).substring(0,10),//最小时间
          maxTime:(res.data.maxTime).substring(0,10),//最大时间
        });
      } else if(res.status != "0" ){
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 分销订单概况
  onGetData2(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 6 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchBindingBeginTime ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}` : null;
      maxTime = this.state.searchBindingEndTime ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}` : null;
    }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:2,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    this.props.actions.orderCountList(tools.clearNull(params)).then(res => {
      console.log("请求到东西了么:", res.data.detail);
      if (res.status === "0") {
        this.setState({
          data2: res.data.detail || [],
          dataNum2: [res.data] || "",
          pageNum,
          pageSize,
          total:res.data.total,
          minTime:(res.data.minTime).substring(0,10),//最小时间
          maxTime:(res.data.maxTime).substring(0,10),//最大时间
        });
      } else if(res.status != "0" ){
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
  
  //时间区间 - radio改变时触发
  onRadioChange(e) {
    this.setState({
      searchRadio: e.target.value,
    });
  }
  
  // 区域选择 -  radio改变时触发
  onRadioChangeFour(e) {
    this.setState({
      searchRadioFour: e.target.value,
    });
  }
  
  // 搜索 - 时间区间 - 开始时间变化
  searchBindingBeginTimeChange(v) {
    console.log("是什么：", v);
    this.setState({
      searchBindingBeginTime: _.cloneDeep(v)
    });
  }
  
  // 搜索 - 时间区间 - 结束时间变化
  searchBindingEndTimeChange(v) {
    this.setState({
      searchBindingEndTime: _.cloneDeep(v)
    });
  }

  // 处理第一个图表数据
  makeOption1(data) {
      const option = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}"
      },
      legend: {
        data:['净水服务','健康食品','生物科技','健康评估']
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        name: "x",
        splitLine: { show: true },  //是否显示X轴线条
        data: data.map((item)=> item.time)
      },
      yAxis: {
        type: "value",
        name: "y"
      },
      series:[
        {
          name: "净水服务",
          type: "line",
          data: data.map((item)=> item.waterCount),
        },
        {
          name: "健康食品",
          type: "line",
          data: data.map((item)=> item.foodCount)
        },
        {
          name: "生物科技",
          type: "line",
          data: data.map((item)=> item.biologicalCount),
        },
        {
          name: "健康评估",
          type: "line",
          data: data.map((item)=> item.ticketCount)
        }
      ]
    };
    return option;
  }
  
  // 处理第二个图表数据
  makeOption2(data2) {
    const option = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}"
      },
      legend: {
        data:['净水服务','健康食品','生物科技','健康评估']
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        name: "x",
        splitLine: { show: true },  //是否显示X轴线条
        data: data2.map((item)=> item.time)
      },
      yAxis: {
        type: "value",
        name: "y"
      },
      series:[
        {
          name: "净水服务",
          type: "line",
          data: data2.map((item)=> item.waterCount),
        },
        {
          name: "健康食品",
          type: "line",
          data: data2.map((item)=> item.foodCount)
        },
        {
          name: "生物科技",
          type: "line",
          data: data2.map((item)=> item.biologicalCount),
        },
        {
          name: "健康评估",
          type: "line",
          data: data2.map((item)=> item.ticketCount)
        }
      ]
    };
    return option;
  }
  
  // 搜索
  onSearch() {
    if(this.state.tabKey == 1){
      this.onGetData(1, this.state.pageSize);
    }else if(this.state.tabKey == 2){
      this.onGetData2(1, this.state.pageSize);
    }
  }
  
  //导出
  onExport() {
    console.log('有告诉我tab值么：',this.state.tabKey)
    if(this.state.tabKey == 1){
      this.onExportData(this.state.pageNum, this.state.pageSize); //导出订单概况
    }else{
      this.onExportDistributionData(this.state.pageNum, this.state.pageSize); //导出分销订单概况
    }
  }
  
  //按服务站导出
  onExportStation() {
    if(this.state.tabKey == 1){
      this.onExportStationData(this.state.pageNum, this.state.pageSize);//导出订单概况
    }else{
      this.onExportDistributionStationData(this.state.pageNum, this.state.pageSize);//导出分销订单概况
    }
  }
  
  //订单概况 - 导出的数据字段
  onExportData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 6 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchBindingBeginTime ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}` : null;
      maxTime = this.state.searchBindingEndTime ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}` : null;
    }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:1,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/order`,"post",'订单概况.xls')
  }
  
  //分销订单概况 - 导出的数据字段
  onExportDistributionData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 6 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchBindingBeginTime ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}` : null;
      maxTime = this.state.searchBindingEndTime ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}` : null;
    }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:2,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/order`,"post",'分销订单概况.xls')
  }
  
  //按服务站导出 - 订单概况
  onExportStationData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 6 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchBindingBeginTime ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}` : null;
      maxTime = this.state.searchBindingEndTime ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}` : null;
    }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:1,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/station/order`,"post",'订单概况-服务站.xls')
  }
  
  //分销订单概况 - 按服务站导出的数据字段
  onExportDistributionStationData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 6 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchBindingBeginTime ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}` : null;
      maxTime = this.state.searchBindingEndTime ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}` : null;
    }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:2,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/station/order`,"post",'分销订单概况-服务站.xls')
  }

  // 构建字段 - 订单概况
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
        title: "日期",
        dataIndex: "time",
        key: "time",
      },
      {
        title: "订单总数",
        dataIndex:'totalCount',
        key:'totalCount'
      },
      {
        title: "净水服务",
        dataIndex:'waterCount',
        key:'waterCount'
      },
      {
        title: "健康食品",
        dataIndex:'foodCount',
        key:'foodCount'
      },
      {
        title:'生物科技',
        dataIndex:'biologicalCount',
        key:'biologicalCount'
      },
      {
        title:'健康评估',
        dataIndex:'ticketCount',
        key:'ticketCount'
      },
    ];
    return columns;
  }
  
  // 构建字段 - 分销订单概况
  makeColumnsUnbound() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        fixed: "left",
        width: 80
      },
      {
        title: "日期",
        dataIndex: "time",
        key: "time",
      },
      {
        title: "分销订单总数",
        dataIndex:'totalCount',
        key:'totalCount'
      },
      {
        title: "净水服务",
        dataIndex:'waterCount',
        key:'waterCount'
      },
      {
        title: "健康食品",
        dataIndex:'foodCount',
        key:'foodCount'
      },
      {
        title:'生物科技',
        dataIndex:'biologicalCount',
        key:'biologicalCount'
      },
      {
        title:'健康评估',
        dataIndex:'ticketCount',
        key:'ticketCount'
      },
    ];
    return columns;
  }
  
  
  // 构建总体字段 - 订单概况
  makeColumnsAll() {
    const columns = [
      {
        title: "服务站地区",
        dataIndex: "stationArea",
        key: "stationArea",
        width:300,
      },
      {
        title: "日期",
        dataIndex: "alltime",
        key: "alltime",
        width:300,
      },
      {
        title: "订单总数",
        dataIndex:'total',
        key:'total'
      },
      {
        title: "净水服务",
        dataIndex:'water',
        key:'water'
      },
      {
        title: "健康食品",
        dataIndex:'food',
        key:'food'
      },
      {
        title:'生物科技',
        dataIndex:'biology',
        key:'biology'
      },
      {
        title:'健康评估',
        dataIndex:'healthy',
        key:'healthy'
      },
    ];
    return columns;
  }
  
  // 构建总体字段 - 分销订单概况
  makeColumnsAllUnbound() {
    const columns = [
      {
        title: "服务站地区",
        dataIndex: "stationArea",
        key: "stationArea",
        width:300,
      },
      {
        title: "日期",
        dataIndex: "alltime",
        key: "alltime",
        width:300,
      },
      {
        title: "分销订单总数",
        dataIndex:'total',
        key:'total'
      },
      {
        title: "净水服务",
        dataIndex:'water',
        key:'water'
      },
      {
        title: "健康食品",
        dataIndex:'food',
        key:'food'
      },
      {
        title:'生物科技',
        dataIndex:'biology',
        key:'biology'
      },
      {
        title:'健康评估',
        dataIndex:'healthy',
        key:'healthy'
      },
    ];
    return columns;
  }
  
  //构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 ,//如果后台没有做分页 那就直接index+1返回页码
        time: item.time, //日期
        totalCount: item.totalCount, //总订单量
        waterCount: item.waterCount, //净水服务
        foodCount:item.foodCount,//健康食品
        biologicalCount:item.biologicalCount,//生物科技
        ticketCount:item.ticketCount,//健康评估
        // ratio:(item.usedCount && item.reverseCount) ? (item.reverseCount)/(item.usedCount) : '',
        reverseRatio:`${((item.reverseRatio)*100).toFixed(3)}%`,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
      };
    });
  }
  
  // 构建用户统计显示所需数据
  makeDataNum(dataNum) {
    console.log("dataNum是个啥：", dataNum);
    return dataNum.map((item, index) => {
      console.log('item是：',item, item["1"])
      return {
        key: index,
        id: item.id,
        total: item.total ? item.total : 0, //总订单量
        water:item["1"] ? item["1"] : 0, //净水服务
        food:item["2"] ? item["2"] : 0, //健康食品
        biology:item["3"] ? item["3"] : 0, //生物科技
        healthy:item["5"] ? item["5"] : 0, //健康体检
        personCount: item.personCount,//个人版经销商
        mainCount:item.mainCount,//企业版经销商
        miniCount:item.miniCount,//微创版经销商
        commonCount:item.commonCount,//普通用户
        shareCount:item.shareCount,//分享用户
        effectiveUserSaleCount:item.effectiveUserSaleCount,//有效分销商数
        alltime:this.state.minTime && this.state.maxTime ? `${this.state.minTime}--${this.state.maxTime}` : '', //时间区间
        stationArea: this.state.searchAddress[0] && this.state.searchAddress[1] && this.state.searchAddress[2] ? `${this.state.searchAddress[0]}/${this.state.searchAddress[1]}/${this.state.searchAddress[2]}` : "全部",
        ratio:(item.usedTotalNum && item.reverseTotalNum) ? `${((item.reverseTotalNum)/(this.state.usedTotalNum)*100).toFixed(3)}%` : '',
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
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
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <RadioGroup onChange={(e) => this.onRadioChange(e)} value={this.state.searchRadio}>
            <ul className="search-ul more-ul">
              <li style={{fontWeight:'bold'}}><span>时间区间</span></li>
              <li>
                <Radio value={0}>历史全部</Radio>
              </li>
              <li>
                <Radio value={1}>7日内</Radio>
              </li>
              <li>
                <Radio value={2}>30日内</Radio>
              </li>
              <li style={{marginTop:'-7px'}}>
                <Radio value={3}>时间筛选</Radio>
                <DatePicker
                  disabled={this.state.searchRadio !== 3}
                  showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="开始时间"
                  onChange={e => this.searchBindingBeginTimeChange(e)}
                  onOk={onOk}
                />
                --
                <DatePicker
                  disabled={this.state.searchRadio !== 3}
                  showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="结束时间"
                  onChange={e => this.searchBindingEndTimeChange(e)}
                  onOk={onOk}
                />
              </li>
            </ul>
          </RadioGroup>
          <RadioGroup onChange={(e) => this.onRadioChangeFour(e)} value={this.state.searchRadioFour}>
            <ul className="search-ul more-ul">
              <li style={{fontWeight:'bold',marginTop:'7px'}}><span>区域选择</span></li>
              <li style={{marginTop:'7px'}}>
                <Radio value={4}>默认全部</Radio>
              </li>
              <li>
                <Radio value={5}>区域筛选</Radio>
                <Cascader
                  disabled={this.state.searchRadioFour !== 5}
                  placeholder="请选择服务区域"
                  onChange={v => this.onSearchAddress(v)}
                  options={this.state.citys}
                  style={{ width: "190px" }}
                  loadData={e => this.getAllCitySon(e)}
                  changeOnSelect
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
              <li>
                <Button icon="download" type="primary" onClick={()=>this.onExport()}>
                  导出
                </Button>
              </li>
              <li>
                <Button icon="download" type="primary" onClick={()=>this.onExportStation()}>
                  按服务站导出
                </Button>
              </li>
            </ul>
          </RadioGroup>
        </div>
        <Tabs type="card" style={{marginTop:'10px'}} onChange={(e) => this.onSearchJump(e)}>
          <TabPane tab="订单概况" key="1" forceRender>
          <div className="system-table">
            <Table
              columns={this.makeColumnsAll()}
              className="my-table"
              dataSource={this.makeDataNum(this.state.dataNum)}
              pagination={{
                hideOnSinglePage:true
              }}
            />
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
                current: this.state.pageNum,
                pageSize: this.state.pageSize,
                showQuickJumper: true,
                hideOnSinglePage:true,//只有一页展示的时候隐藏页码
                showTotal: (total, range) => `共 ${total} 条数据`,
                onChange: (page, pageSize) =>
                  this.onTablePageChange(page, pageSize)
              }}
            />
          </div>
        </TabPane>
          <TabPane tab="分销订单概况" key="2" forceRender>
            <div className="system-table">
              <Table
                columns={this.makeColumnsAllUnbound()}
                className="my-table"
                dataSource={this.makeDataNum(this.state.dataNum2)}
                pagination={{
                  hideOnSinglePage:true
                }}
              />
            </div>
            <div className="charts-box">
              <div id="echarts-2" className="echarts" />
            </div>
            <div className="system-table">
              <Table
                columns={this.makeColumnsUnbound()}
                className="my-table"
                dataSource={this.makeData(this.state.data2)}
                pagination={{
                  current: this.state.pageNum,
                  pageSize: this.state.pageSize,
                  showQuickJumper: true,
                  hideOnSinglePage:true,//只有一页展示的时候隐藏页码
                  showTotal: (total, range) => `共 ${total} 条数据`,
                  onChange: (page, pageSize) =>
                    this.onTablePageChange2(page, pageSize)
                }}
              />
            </div>
          </TabPane>
      </Tabs>
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
        addProduct,
        upReserveList,
        deleteProduct,
        deleteImage,
        findProductModelByWhere,
        onOk,
        orderCountList
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
