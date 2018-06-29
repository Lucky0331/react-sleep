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
      searchrefundBeginTime:moment(
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 6);
          return d;
        })()
      ),//搜索 - 开始时间
      searchrefundEndTime:moment(
        (() => {
          const d = new Date();
          d.setMonth(d.getMonth());
          return d;
        })()
      ),//搜索 - 结束时间
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
      const dom1 = Echarts.init(document.getElementById("echarts-1"));
      const dom2 = Echarts.init(document.getElementById("echarts-2"));
      const dom3 = Echarts.init(document.getElementById("echarts-3"));
      this.echartsDom1 = dom1;
      this.echartsDom2 = dom2;
      this.echartsDom3 = dom3;
      dom1.setOption(me.makeOption1(this.state.data), true);
      dom2.setOption(me.makeOption2(this.state.data2), true);
      dom3.setOption(me.makeOption3(this.state.data3), true);
      window.onresize = () => {
        dom1.resize();
        dom2.resize();
        dom3.resize();
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
    if(nextS.data3 !== this.state.data3) {
      this.echartsDom3.setOption(this.makeOption3(nextS.data3), true);
    }
    
  }
  
  // 表单页码改变  - 净水服务
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
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
  
  //运营数据 tab操作
  onSearchJump(e){
    if(e==1){
      this.onGetData(1, this.state.pageSize);
    }else if(e==2){
      this.onGetData2(1, this.state.pageSize);
    }else if(e==3){
      this.onGetData3(1, this.state.pageSize);
    }
    setTimeout(()=>{
      this.echartsDom1 && this.echartsDom1.resize();
      this.echartsDom2 && this.echartsDom2.resize();
      this.echartsDom3 && this.echartsDom3.resize();
    });
    this.setState({
      tabKey:e
    })
  }

  // 查询当前页面所需列表数据 - 净水服务
  onGetData(pageNum, pageSize) {
    // 处理查询条件
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    this.props.actions.dataCountList(tools.clearNull(params)).then(res => {
      console.log("请求到东西了么:", res.data);
      if (res.status === "0") {
        this.setState({
          data: [res.data] || "",
          dataNum: [res.data] || "",
          pageNum,
          pageSize,
          total:res.data.size,
        });
      } else if(res.status != "0" ){
        message.error(res.message || "获取数据失败，请重试");
      }
    });
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
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
          total:res.data.size,
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
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    this.props.actions.dataCountList(tools.clearNull(params)).then(res => {
      console.log("请求到东西了么:", res.data3);
      if (res.status === "0") {
        this.setState({
          data3: res.data.detail || [],
          dataNum3: [res.data] || "",
          pageNum,
          pageSize,
          total:res.data.size,
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
      searchBeginTime: e,
    });
  }
  
  //时间筛选 - 结束时间
  searchBindingEndTimeChange(e) {
    this.setState({
      searchEndTime: e,
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
        data:['净水终端数','水机用户数','已绑定健康e家数','有效分销订单数','有效分销商数']
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
        data: data.map((item)=> item.date)
      },
      yAxis: {
        type: "value",
        name: "y"
      },
      series:[
        {
          name: "净水终端数",
          type: "line",
          data: data.map((item)=> item.usedCount),
          },
        {
          name: "水机用户数",
          type: "line",
          data: data.map((item)=> item.reverseCount)
        },
        {
          name: "已绑定健康e家数",
          type: "line",
          data: data.map((item)=> item.usedCount),
          },
        {
          name: "有效分销订单数",
          type: "line",
          data: data.map((item)=> item.reverseCount)
        },
        {
          name: "有效分销商数",
          type: "line",
          data: data.map((item)=> item.reverseCount)
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
        data:['体检用户','公众号预约用户']
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
        data: data3.map((item)=> item.date)
      },
      yAxis: {
        type: "value",
        name: "y"
      },
      series:[
        // {
        //   name: "体检用户",
        //   type: "line",
        //   data: data.map((item)=> item.usedCount),
        //   },
        // {
        //   name: "公众号预约用户",
        //   type: "line",
        //   data: data.map((item)=> item.reverseCount)
        // }
      ]
    };
    return option;
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  //导出
  onExport() {
    if(this.state.tabKey == 1){
      this.onExportData(this.state.pageNum, this.state.pageSize);
    }else if(this.state.tabKey == 2){
      this.onExportHRAData(this.state.pageNum, this.state.pageSize)
    }else{
     this.onExportSendData(this.state.pageNum, this.state.pageSize)
    }
  }
  
  //按服务站导出
  onExportStation() {
    if(this.state.tabKey == 1){
     this.onExportStationData(this.state.pageNum, this.state.pageSize)
    }else if(this.state.tabKey == 2){
      this.onExportStationHRAData(this.state.pageNum, this.state.pageSize);
    }else{
      this.onExportStationSendData(this.state.pageNum, this.state.pageSize);
    }
  }
  
  //导出的数据字段 - 净水服务
  onExportData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/dataCount/export/operation`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
  
    const newElement3 = document.createElement("input");
    newElement3.setAttribute("name", "type");
    newElement3.setAttribute("type", "hidden");
    newElement3.setAttribute("value", "1");
    form.appendChild(newElement3);
  
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
  
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
  
    const newElement8 = document.createElement("input");
    newElement8.setAttribute("name", "minTime");
    newElement8.setAttribute("type", "hidden");
    newElement8.setAttribute("value", params.minTime);
    form.appendChild(newElement8);
  
    const newElement9 = document.createElement("input");
    newElement9.setAttribute("name", "maxTime");
    newElement9.setAttribute("type", "hidden");
    newElement9.setAttribute("value", params.maxTime);
    form.appendChild(newElement9);
    
    form.submit();
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
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/dataCount/export/operation`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
    
    const newElement3 = document.createElement("input");
    newElement3.setAttribute("name", "type");
    newElement3.setAttribute("type", "hidden");
    newElement3.setAttribute("value", "2");
    form.appendChild(newElement3);
    
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
    
    const newElement8 = document.createElement("input");
    newElement8.setAttribute("name", "minTime");
    newElement8.setAttribute("type", "hidden");
    newElement8.setAttribute("value", params.minTime);
    form.appendChild(newElement8);
    
    const newElement9 = document.createElement("input");
    newElement9.setAttribute("name", "maxTime");
    newElement9.setAttribute("type", "hidden");
    newElement9.setAttribute("value", params.maxTime);
    form.appendChild(newElement9);
    
    form.submit();
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
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/dataCount/export/operation`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
    
    const newElement3 = document.createElement("input");
    newElement3.setAttribute("name", "type");
    newElement3.setAttribute("type", "hidden");
    newElement3.setAttribute("value", "3");
    form.appendChild(newElement3);
    
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
    
    const newElement8 = document.createElement("input");
    newElement8.setAttribute("name", "minTime");
    newElement8.setAttribute("type", "hidden");
    newElement8.setAttribute("value", params.minTime);
    form.appendChild(newElement8);
    
    const newElement9 = document.createElement("input");
    newElement9.setAttribute("name", "maxTime");
    newElement9.setAttribute("type", "hidden");
    newElement9.setAttribute("value", params.maxTime);
    form.appendChild(newElement9);
    
    form.submit();
  }
  
  //按服务站导出 - 净水服务
  onExportStationData(pageNum, pageSize) {
    let minTime = null;
    let maxTime = null;
    const now = new Date();
    const r = this.state.searchRadio;
    if(r !== 0) {
      minTime = tools.dateToStr(now);
    }
    if(r === 1) { // 7天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/dataCount/export/station/operation`;
    form.method = "post";
    console.log("FORM:", params);
    
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
    
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
    
    const newElement3 = document.createElement("input");
    newElement3.setAttribute("name", "type");
    newElement3.setAttribute("type", "hidden");
    newElement3.setAttribute("value", "1");
    form.appendChild(newElement3);
    
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
    
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
    
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
    
    const newElement7 = document.createElement("input");
    if (params.stationKeyWord) {
      newElement7.setAttribute("name", "stationKeyWord");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.stationKeyWord);
      form.appendChild(newElement7);
    }
    
    const newElement8 = document.createElement("input");
    if (params.minTime) {
      newElement8.setAttribute("name", "minTime");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.minTime);
      form.appendChild(newElement8);
    }
    
    const newElement9 = document.createElement("input");
    if (params.maxTime) {
      newElement9.setAttribute("name", "maxTime");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.maxTime);
      form.appendChild(newElement9);
    }
    form.submit();
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
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/dataCount/export/station/operation`;
    form.method = "post";
    console.log("FORM:", params);
  
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
  
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
  
    const newElement3 = document.createElement("input");
    newElement3.setAttribute("name", "type");
    newElement3.setAttribute("type", "hidden");
    newElement3.setAttribute("value", "2");
    form.appendChild(newElement3);
  
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
  
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
  
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
  
    const newElement7 = document.createElement("input");
    if (params.stationKeyWord) {
      newElement7.setAttribute("name", "stationKeyWord");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.stationKeyWord);
      form.appendChild(newElement7);
    }
  
    const newElement8 = document.createElement("input");
    if (params.minTime) {
      newElement8.setAttribute("name", "minTime");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.minTime);
      form.appendChild(newElement8);
    }
  
    const newElement9 = document.createElement("input");
    if (params.maxTime) {
      newElement9.setAttribute("name", "maxTime");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.maxTime);
      form.appendChild(newElement9);
    }
    
    form.submit();
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
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 7 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 2) { // 30天内
      minTime = `${tools.dateToStrD(new Date(new Date().setDate(now.getDate() - 30 )))} 00:00:00`;
      maxTime = tools.dateToStr(new Date(new Date().setDate(now.getDate()  )));
    } else if (r === 3) { // 自定义的时间
      minTime = this.state.searchrefundBeginTime ? tools.dateToStr(this.state.searchrefundBeginTime._d) : null;
      maxTime = this.state.searchrefundEndTime ? tools.dateToStr(this.state.searchrefundEndTime._d) : null;
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
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/dataCount/export/station/operation`;
    form.method = "post";
    console.log("FORM:", params);
  
    const newElement = document.createElement("input");
    newElement.setAttribute("name", "pageNum");
    newElement.setAttribute("type", "hidden");
    newElement.setAttribute("value", pageNum);
    form.appendChild(newElement);
  
    const newElement2 = document.createElement("input");
    newElement2.setAttribute("name", "pageSize");
    newElement2.setAttribute("type", "hidden");
    newElement2.setAttribute("value", pageSize);
    form.appendChild(newElement2);
  
    const newElement3 = document.createElement("input");
    newElement3.setAttribute("name", "type");
    newElement3.setAttribute("type", "hidden");
    newElement3.setAttribute("value", "3");
    form.appendChild(newElement3);
  
    const newElement4 = document.createElement("input");
    if (params.province) {
      newElement4.setAttribute("name", "province");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.province);
      form.appendChild(newElement4);
    }
  
    const newElement5 = document.createElement("input");
    if (params.city) {
      newElement5.setAttribute("name", "city");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.city);
      form.appendChild(newElement5);
    }
  
    const newElement6 = document.createElement("input");
    if (params.region) {
      newElement6.setAttribute("name", "region");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.region);
      form.appendChild(newElement6);
    }
  
    const newElement7 = document.createElement("input");
    if (params.stationKeyWord) {
      newElement7.setAttribute("name", "stationKeyWord");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.stationKeyWord);
      form.appendChild(newElement7);
    }
  
    const newElement8 = document.createElement("input");
    if (params.minTime) {
      newElement8.setAttribute("name", "minTime");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.minTime);
      form.appendChild(newElement8);
    }
  
    const newElement9 = document.createElement("input");
    if (params.maxTime) {
      newElement9.setAttribute("name", "maxTime");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.maxTime);
      form.appendChild(newElement9);
    }
    
    form.submit();
  }

  // 构建字段 - 净水服务
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
        dataIndex: "date",
        key: "date",
      },
      {
        title: "净水终端数",
      },
      {
        title: "水机用户数",
      },
      {
        title: "已绑定健康e家用户数",
      },
      {
        title:'有效分销订单数'
      },
      {
        title:'有效分销商数'
      },
    ];
    return columns;
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
        dataIndex: "date",
        key: "date",
      },
      {
        title: "体检服务次数",
      },
      {
        title: "体检次数（M卡）",
      },
      {
        title: "体检次数（Y卡）",
      },
      {
        title:'体检次数（F卡）'
      },
    ];
    return columns;
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
  
  // 构建总体字段 - 净水服务
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
        title: "净水终端数",
      },
      {
        title:'水机用户数',
      },
      {
        title:'已绑定健康e家数',
      },
      {
        title:'有效分销订单数'
      },
      {
        title:'有效分销商数'
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
  makeData(data) {
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        date: item.date,
        usedCount: item.usedCount,
        reverseCount: item.reverseCount,
        totalCount:item.totalCount, //体检服务总次数
        fcount:item.fcount,//体检次数(F卡) - Hra体检服务
        mcount:item.mcount,//体检次数(M卡) - Hra体检服务
        ycount:item.ycount,//体检次数(Y卡) - Hra体检服务
        day:item.day,//日期 - Hra体检服务
        handselTime:item.handselTime,//日期 - 优惠卡赠送
        personCount:item.personCount,//领取人数 - - 优惠卡赠送
        receiveCount:item.receiveCount,//领取次数 - - 优惠卡赠送
        sendCount:item.sendCount,//赠送次数 - - 优惠卡赠送
        ratio:item.ratio,//比率 - - 优惠卡赠送
        // ratio:(item.usedCount && item.reverseCount) ? (item.reverseCount)/(item.usedCount) : '',
        reverseRatio:`${((item.reverseRatio)*100).toFixed(3)}%`,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : ""
      };
    });
  }
  
  // 构建体检统计总数的一个显示所需数据
  makeDataNum(dataNum) {
    console.log("dataNum是个啥：", dataNum);
    return dataNum.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        total: item.total, //体验服务总次数
        Y:item.Y, //体检Y卡
        M: item.M,//体检M卡
        F:item.F,//体检F卡
        receivePersonCount:item.receivePersonCount,//领取人数
        sendCardCountNotAllowRepeat:item.sendCardCountNotAllowRepeat,//赠送卡数
        sendCardCoutAllowRepeat:item.sendCardCoutAllowRepeat,//赠送卡次数
        receiveCardCoutNotAllowRepreat:item.receiveCardCoutNotAllowRepreat,//领取卡数
        receiveCardListAllowRepeat:item.receiveCardListAllowRepeat,//领取卡次数
        receiveRatio:item.receiveRatio,//领取率
        alltime:this.state.searchrefundBeginTime && this.state.searchrefundEndTime? `${tools.dateToStrD(this.state.searchrefundBeginTime._d)} -- ${tools.dateToStrD(this.state.searchrefundEndTime._d)}` : '全部', //时间区间
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
                  format="YYYY-MM-DD"
                  placeholder="开始日期"
                  value={this.state.searchBeginTime}
                  onChange={e => this.searchBindingBeginTimeChange(e)}
                />
                --
                <DatePicker
                  disabled={this.state.searchRadio !== 3}
                  format="YYYY-MM-DD"
                  placeholder="结束日期"
                  value={this.state.searchEndTime}
                  onChange={e => this.searchBindingEndTimeChange(e)}
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
          <TabPane tab="净水服务" key="1" forceRender>
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
                total: this.state.total,
                current: this.state.pageNum,
                pageSize: this.state.pageSize,
                showQuickJumper: true,
                defaultCurrent: 3,
                pageSizeOptions: ["10", "30", "50"],
                showTotal: (total, range) => `共 ${total} 条数据`,
                onChange: (page, pageSize) =>
                  this.onTablePageChange(page, pageSize)
              }}
            />
          </div>
        </TabPane>
          <TabPane tab="HRA体检服务" key="2" forceRender>
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
                  defaultCurrent: 3,
                  pageSizeOptions: ["10", "30", "50"],
                  showTotal: (total, range) => `共 ${total} 条数据`,
                  onChange: (page, pageSize) =>
                    this.onTablePageChange2(page, pageSize)
                }}
              />
            </div>
          </TabPane>
          <TabPane tab="经销商优惠卡赠送" key="3" forceRender>
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
                  defaultCurrent: 3,
                  pageSizeOptions: ["10", "30", "50"],
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
