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
  dataCountList,
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
      data: [], // 当前页面全部数据 - 净水服务
      data2: [], // 当前页面全部数据 - HRA
      data3: [], // 当前页面全部数据 - 优惠卡
      dataNum:[],//头部一栏总内容 - 净水服务
      dataNum2:[],//头部一栏总内容 - HRA
      dataNum3:[],//头部一栏总内容 - 优惠卡
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      searchAddress: [], // 搜索 - 地址
      searchBindingBeginTime:'',//搜索 - 开始时间
      searchBindingEndTime:'',//搜索 - 结束时间
      minTime:'',//开始时间
      maxTime:'',//结束时间
      citys: [], // 符合Cascader组件的城市数据
      usedTotalNum:"",//体检预约总数
      reverseTotalNum:"",//公众号预约总数
      searchRadio: 1, // 当前radio选择的哪一个
      searchRadioFour: 4, // 区域选择当前radio选择的哪一个
      tabKey:1,//tab页默认值
    };
    this.echartsDom = null; // Echarts实例
  }
  
  componentWillUnmount() {
    this.echartsDom1 = null; // Echarts实例
    this.echartsDom2 = null; // Echarts实例
    this.echartsDom3 = null; // Echarts实例
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
      const dom2 = Echarts.init(document.getElementById("echarts-2"));
      const dom3 = Echarts.init(document.getElementById("echarts-3"));
      this.echartsDom2 = dom2;
      this.echartsDom3 = dom3;
      dom2.setOption(me.makeOption2(this.state.data2), true);
      dom3.setOption(me.makeOption3(this.state.data3), true);
      window.onresize = () => {
        dom2.resize();
        dom3.resize();
      };
      this.onGetData2(this.state.pageNum,this.state.pageSize)
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
    if(nextS.data2 !== this.state.data2) {
      this.echartsDom2.setOption(this.makeOption2(nextS.data2), true);
    }
    if(nextS.data3 !== this.state.data3) {
      this.echartsDom3.setOption(this.makeOption3(nextS.data3), true);
    }
  }
  
  // 表单页码改变 - HRA体检
  onTablePageChange2(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData2(page, pageSize);
  }
  
  // 表单页码改变 - 优惠卡
  onTablePageChange3(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData3(page, pageSize);
  }
  
  //运营数据 tab操作
  onSearchJump(e){
    if(e==1){
      this.onGetData2(1, this.state.pageSize);
    }else if(e==2){
      this.onGetData3(1, this.state.pageSize);
    }
    setTimeout(()=>{
      this.echartsDom2 && this.echartsDom2.resize();
      this.echartsDom3 && this.echartsDom3.resize();
    });
    this.setState({
      tabKey:e
    })
  }
  
  // 查询当前页面所需列表数据 - HRA体检服务
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
    this.props.actions.dataCountList(tools.clearNull(params)).then(res => {
      console.log("请求到东西了么:", res.data2);
      if (res.status === "0") {
        this.setState({
          data2: res.data.detail || [],
          dataNum2: [res.data] || "",
          pageNum,
          pageSize,
          minTime:(res.data.minTime).substring(0,10),//最小时间
          maxTime:(res.data.maxTime).substring(0,10),//最大时间
        });
      } else if(res.status != "0" ){
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 查询当前页面所需列表数据 - 经销商优惠卡赠送
  onGetData3(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    const qy = this.state.searchRadioFour;
    console.log('打印一下，',r,qy)
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
    // else if (qy === 5){
    //   province = this.state.searchAddress[0];
    //   city = this.state.searchAddress[1];
    //   region =this.state.searchAddress[2];
    // }
    const params = {
      pageNum,
      pageSize,
      minTime,
      maxTime,
      type:3,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    this.props.actions.dataCountList(tools.clearNull(params)).then(res => {
      console.log("请求到东西了么:", res.data.detail);
      if (res.status === "0") {
        this.setState({
          data3: res.data.detail || [],
          dataNum3: [res.data] || "",
          pageNum,
          pageSize,
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
  
  // 时间区间 - radio改变时触发
  onRadioChange(e) {
    this.setState({
      searchRadio: e.target.value,
    });
  }
  
  // 区域选择 - radio改变时触发
  onRadioChangeFour(e) {
    this.setState({
      searchRadioFour: e.target.value,
    });
  }
  
  //时间筛选 - 开始时间
  searchBindingBeginTimeChange(e) {
    this.setState({
      searchBindingBeginTime: _.cloneDeep(e),
    });
  }
  
  //时间筛选 - 结束时间
  searchBindingEndTimeChange(e) {
    this.setState({
      searchBindingEndTime: _.cloneDeep(e),
    });
  }
  
  // 处理第二个图表数据
  makeOption2(data2) {
    const option = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}"
      },
      legend: {
        data:['体检服务总次数','体检次数（M卡）','体检次数（Y卡）','体检次数（F卡）']
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
        data: data2.map((item)=> item.day)
      },
      yAxis: {
        type: "value",
        name: "y"
      },
      series:[
        {
          name: "体检服务总次数",
          type: "line",
          data: data2.map((item)=> item.totalCount),
        },
        {
          name: "体检次数（M卡）",
          type: "line",
          data: data2.map((item)=> item.mcount)
        },
        {
          name: "体检次数（Y卡）",
          type: "line",
          data: data2.map((item)=> item.ycount),
        },
        {
          name: "体检次数（F卡）",
          type: "line",
          data: data2.map((item)=> item.fcount)
        }
      ]
    };
    return option;
  }
  
  // 处理第三个图表数据
  makeOption3(data3) {
    const option = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}"
      },
      legend: {
        data:['赠送数量','领取数量','领取人数']
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
        data: data3.map((item)=> item.handselTime)
      },
      yAxis: {
        type: "value",
        name: "y"
      },
      series:[
        {
          name: "赠送数量",
          type: "line",
          data: data3.map((item)=> item.sendCount),
        },
        {
          name: "领取数量",
          type: "line",
          data: data3.map((item)=> item.receiveCount)
        },
        {
          name: "领取人数",
          type: "line",
          data: data3.map((item)=> item.personCount),
        },
      ]
    };
    return option;
  }

  // 搜索
  onSearch() {
    if(this.state.tabKey == 1){
      this.onGetData2(1, this.state.pageSize);
    }else if(this.state.tabKey == 2){
      this.onGetData3(1, this.state.pageSize);
    }
  }
  
  //导出
  onExport() {
    if(this.state.tabKey == 1){
      this.onExportHRAData(this.state.pageNum, this.state.pageSize)
    }else if(this.state.tabKey == 2){
      this.onExportSendData(this.state.pageNum, this.state.pageSize)
    }
  }
  
  //按服务站导出
  onExportStation() {
    if(this.state.tabKey == 1){
      this.onExportStationHRAData(this.state.pageNum, this.state.pageSize);
    }else if(this.state.tabKey == 2){
      this.onExportStationSendData(this.state.pageNum, this.state.pageSize);
    }
  }
  
  //导出的数据字段 - Hra体检服务
  onExportHRAData(pageNum, pageSize) {
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
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/operation`,"post",'Hra体检服务.xls')
  }
  
  //导出的数据字段 - 经销商优惠卡
  onExportSendData(pageNum, pageSize) {
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
      type:3,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/operation`,"post",'经销商优惠卡.xls')
  }
  
  //按服务站导出 - Hra体检服务
  onExportStationHRAData(pageNum, pageSize) {
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
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/station/operation`,"post",'HRA体检服务-服务站.xls')
  }
  
  //按服务站导出 - 经销商优惠卡赠送
  onExportStationSendData(pageNum, pageSize) {
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
      type:3,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/dataCount/export/station/operation`,"post",'经销商优惠卡赠送-服务站.xls')
  }
  
  // 构建字段 - HRA体检服务
  makeColumnsHRA() {
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
        dataIndex: "day",
        key: "day",
      },
      {
        title: "体检服务次数",
        dataIndex:'totalCount',
        key:'totalCount'
      },
      {
        title: "体检次数（M卡）",
        dataIndex:'mcount',
        key:"mcount"
      },
      {
        title: "体检次数（Y卡）",
        dataIndex:'ycount',
        key:'ycount'
      },
      {
        title:'体检次数（F卡）',
        dataIndex:'fcount',
        key:"fcount"
      },
    ];
    return columns;
  }
  
  // 构建字段 - 经销商优惠卡赠送
  makeColumnsCard() {
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
        dataIndex: "handselTime",
        key: "handselTime",
      },
      {
        title: "赠送数量",
        dataIndex:'sendCount',
        key:'sendCount'
      },
      {
        title: "领取数量",
        dataIndex:"receiveCount",
        key:'receiveCount'
      },
      {
        title: "领取人数",
        dataIndex:'personCount',
        key:'personCount'
      },
      {
        title:'领取率',
        dataIndex:'ratio',
        key:'ratio'
      },
    ];
    return columns;
  }
  
  // 构建总体字段 - HRA体检服务
  makeColumnsAllHRA() {
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
        title: "体检服务总次数",
        dataIndex:'total',
        key:'total'
      },
      {
        title:'体检次数（M卡）',
        dataIndex:'M',
        key:'M'
      },
      {
        title:'体检次数（Y卡）',
        dataIndex:'Y',
        key:'Y'
      },
      {
        title:'体检次数（F卡）',
        dataIndex:'F',
        key:'F'
      },
    ];
    return columns;
  }
  
  // 构建总体字段 - 优惠卡赠送
  makeColumnsAllCard() {
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
        title: "赠送次数",
        dataIndex:'sendCardCoutAllowRepeat',
        key:'sendCardCoutAllowRepeat'
      },
      {
        title:'赠送卡数',
        dataIndex:'sendCardCountNotAllowRepeat',
        key:'sendCardCountNotAllowRepeat',
      },
      {
        title:'领取次数',
        dataIndex:'receiveCardListAllowRepeat',
        key:'receiveCardListAllowRepeat'
      },
      {
        title:'领取卡数',
        dataIndex:'receiveCardCoutNotAllowRepreat',
        key:'receiveCardCoutNotAllowRepreat',
      },
      {
        title:'领取人数',
        dataIndex:'receivePersonCount',
        key:'receivePersonCount',
      },
      {
        title:'领取率',
        dataIndex:'receiveRatio',
        key:'receiveRatio'
      },
    ];
    return columns;
  }

  //构建table所需数据
  makeData(data2) {
    return data2.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 ,//如果后台没有做分页 那就直接index+1返回页码
        // serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        date: item.date,
        usedCount: item.usedCount,
        reverseCount: item.reverseCount,
        totalCount:item.totalCount, //体检服务总次数
        fcount:item.fcount,//体检次数(F卡) - Hra体检服务
        mcount:item.mcount,//体检次数(M卡) - Hra体检服务
        ycount:item.ycount,//体检次数(Y卡) - Hra体检服务
        day:item.day,//日期 - Hra体检服务
        sendCount:item.sendCount,//赠送次数
        receiveCount:item.receiveCount,//领取次数
        personCount:item.personCount,//领取人数
        handselTime:item.handselTime,//日期 - 优惠卡赠送
        personCount:item.personCount,//领取人数 - - 优惠卡赠送
        receiveCount:item.receiveCount,//领取次数 - - 优惠卡赠送
        sendCount:item.sendCount,//赠送次数 - - 优惠卡赠送
        ratio:`${((item.ratio)*100).toFixed(2)}%`,//比率 - - 优惠卡赠送
        reverseRatio:`${((item.reverseRatio)*100).toFixed(3)}%`,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
      };
    });
  }
  
  // 构建Hra体检服务的一个显示所需数据
  makeDataNum(dataNum) {
    console.log("dataNum是个啥：", dataNum);
    return dataNum.map((item, index) => {
      return {
        key: index,
        id: item.id,
        total: item.total, //体验服务总次数
        Y:item.Y, //体检Y卡
        M: item.M,//体检M卡
        F:item.F,//体检F卡
        receivePersonCount:item.receivePersonCount,//领取人数
        sendCardCountNotAllowRepeat:item.sendCardCountNotAllowRepeat,//赠送卡数
        sendCardCoutAllowRepeat:item.sendCardCoutAllowRepeat,//赠送卡次数
        receiveCardCoutNotAllowRepreat:item.receiveCardCoutNotAllowRepreat,//领取卡数
        receiveCardListAllowRepeat:item.receiveCardListAllowRepeat,//领取卡次数
        receiveRatio:`${((item.receiveRatio)*100).toFixed(2)}%`,//领取率
        stationArea: this.state.searchAddress[0] && this.state.searchAddress[1] && this.state.searchAddress[2] ? `${this.state.searchAddress[0]}/${this.state.searchAddress[1]}/${this.state.searchAddress[2]}` : "全部",
        ratio:(item.usedTotalNum && item.reverseTotalNum) ? `${((item.reverseTotalNum)/(this.state.usedTotalNum)*100).toFixed(3)}%` : '',
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        alltime:this.state.minTime && this.state.maxTime ? `${this.state.minTime}--${this.state.maxTime}` : '', //时间区间
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
          <TabPane tab="HRA体检服务" key="1" forceRender>
            <div className="system-table">
              <Table
                columns={this.makeColumnsAllHRA()}
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
                columns={this.makeColumnsHRA()}
                className="my-table"
                dataSource={this.makeData(this.state.data2)}
                pagination={{
                  total: this.state.total,
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
          <TabPane tab="经销商优惠卡赠送" key="2" forceRender>
            <div className="system-table">
              <Table
                columns={this.makeColumnsAllCard()}
                className="my-table"
                dataSource={this.makeDataNum(this.state.dataNum3)}
                pagination={{
                  hideOnSinglePage:true
                }}
              />
            </div>
            <div className="charts-box">
              <div id="echarts-3" className="echarts" />
            </div>
            <div className="system-table">
              <Table
                columns={this.makeColumnsCard()}
                className="my-table"
                dataSource={this.makeData(this.state.data3)}
                pagination={{
                  total: this.state.total,
                  current: this.state.pageNum,
                  pageSize: this.state.pageSize,
                  showQuickJumper: true,
                  hideOnSinglePage:true,//只有一页展示的时候隐藏页码
                  showTotal: (total, range) => `共 ${total} 条数据`,
                  onChange: (page, pageSize) =>
                    this.onTablePageChange3(page, pageSize)
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
        dataCountList
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
