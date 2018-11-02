/* List 体检管理/体检列表 */

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
  Table,
  message,
  Modal,
  Radio,
  Tooltip,
  Select,
  DatePicker,
  Divider
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
import moment from "moment";
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
  onChange,
  onOk,
  hraExchange,
  hraExchangeSave,
  PortFromSave,
  ChannelFromSave,
  exchangeSave,
  upExchangeSave
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
      ports: [], // 所有的端
      channels: [], // 所有的渠道
      times:[],//设置里的内容
      citys: [], // 所有的省
      searchCode: '',//搜索 - 兑换码
      searchdicCode:'',//搜索 - 端
      searchChannel:"",//搜索 - 渠道
      searchBatch:"",//搜索 - 兑换码批次号
      searchStatus:'',//搜索 - 兑换状态
      searchDiscount:'',//搜索 - 关联优惠卡
      searchDiscountStatus:'',//搜索 - 优惠卡状态
      addnewPersonShow: false, // 添加兑换码模态框是否显示
      addnewSetShow: false, // 设置模态框是否显示
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0,// 数据库总共多少条数据
      radioCode:1,//生成兑换码模态框 -- 默认选中第1个
      radioLimit:2,//设置模态框 -- 默认选中第2个
    }
  }
  
  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
    this.getPortFrom();//获取所有的端
    this.getChannelFrom();//获取所有的渠道
    this.getCycleFrom();//获取设置的天、周、月、年
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
  
  //获取端有哪些
  getPortFrom(){
    this.props.actions.PortFromSave({pageNum:0,pageSize: 10}).then(res=>{
      if(res.status === "0"){
        this.setState({
          ports:res.data.result || []
        })
      }
    })
  }
  
  // 工具 - 根据端ID查端名称
  findPortById(dicCode) {
    const t = this.state.ports.find(
        item => String(item.dicCode) === String(dicCode)
    );
    return t ? t.dicValue : "";
  }
  
  //获取渠道有哪些
  getChannelFrom(){
    this.props.actions.ChannelFromSave({pageNum:0,pageSize: 10}).then(res=>{
      if(res.status === "0"){
        this.setState({
          channels:res.data.result || []
        })
      }
    })
  }
  
  //获取设置的天、周、月、年
  getCycleFrom(){
    this.props.actions.exchangeSave({pageNum:0,pageSize: 10}).then(res => {
      console.log('兑换限制有什么：',res.data.result)
      console.log('有什么：',res.data.result.map((item)=>{return (item.dicCode)}))
      if (res.status === "0") {
        console.log(res.data.result[0].dicValue)
        this.setState({
          times: res.data.result || [],
          radioLimit:res.data.result[0].dicValue==0 ? 1 : 2
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 工具 - 根据渠道ID查渠道名称
  findChannelById(dicCode) {
    const t = this.state.channels.find(
        item => String(item.dicCode) === String(dicCode)
    );
    return t ? t.dicValue : "";
  }
  
  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      exchangeCode:this.state.searchCode.trim(),//兑换码
      side:this.state.searchdicCode,//端
      channel:this.state.searchChannel,//渠道
      batchNumber:this.state.searchBatch.trim(),//兑换码批次号
      exchangeStatus:this.state.searchStatus,//兑换状态
      ticketNo:this.state.searchDiscount.trim(),//关联优惠卡
      ticketStatus:this.state.searchDiscountStatus,//优惠卡状态
    };
    this.props.actions.hraExchange(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 表单页码改变
  onTablePageChange(page, pageSize) {
    this.onGetData(page, pageSize);
  }
  
  //清空Input标签内容
  emitEmpty(){
    this.setState({
      searchCode: ""
    });
  }
  
  emitEmpty1(){
    this.setState({
      searchBatch: ""
    });
  }
  
  emitEmpty2(){
    this.setState({
      searchDiscount: ""
    });
  }
  
  // 工具 - 根据ID获取用户来源名字
  getNameByModelId(id) {
    switch (String(id)) {
      case "1":
        return "终端用户App";
      case "2":
        return "微信公众号";
      case "3":
        return "体检系统";
      case "4":
        return "经销商APP";
      case "5":
        return "后台管理系统";
      default:
        return "";
    }
  }
  
  // 工具 - 根据type获取状态名称
  getExchangeStatus(type) {
    switch (String(type)) {
      case "1":
        return "未兑换";
      case "2":
        return "兑换成功";
      case "3":
        return "兑换失败";
      case "4":
        return "活动过期";
      case "5":
        return "兑换禁止";
      default:
        return "";
    }
  }
  
  //工具 - 设置模态框
  getDicTypeExchange(type){
    switch(String(type)){
        // case "0": return "未限制";
      case "1": return "天";
      case "2": return "周";
      case "3": return "月";
      case "4": return "年";
      default: return "天";
    }
  }
  
  //工具 - 设置模态框
  getDicTypeIddExchange(type){
    switch(String(type)){
      case "0": return "0";
      case "1": return "1";
      case "2": return "2";
      case "3": return "3";
      case "4": return "4";
      default: return "";
    }
  }
  
  //工具 - 设置模态框
  getDicTypeIdExchange(type){
    switch(String(type)){
      case "天": return "1";
      case "周": return "2";
      case "月": return "3";
      case "年": return "4";
      default: return "";
    }
  }
  
  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  //导出
  onExport(){
    this.onExportData(1,this.state.pageSize)
  }
  
  //导出 - 构建字段
  onExportData(pageSize,pageNum){
    const params = {
      pageNum,
      pageSize,
      exchangeCode:this.state.searchCode.trim(),//兑换码
      side:this.state.searchdicCode,//端
      channel:this.state.searchChannel,//渠道
      batchNumber:this.state.searchBatch.trim(),//兑换码批次号
      exchangeStatus:this.state.searchStatus,//兑换状态
      ticketNo:this.state.searchDiscount.trim(),//关联优惠卡
      ticketStatus:this.state.searchDiscountStatus,//优惠卡状态
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/exchange/list`,'post', '兑换码列表.xls');
  }
  
  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true
    });
    console.log('啥数据：',record)
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
  
  //搜索  - 兑换码批次号
  searchCodeChange(v){
    this.setState({
      searchCode:v.target.value
    })
  }
  
  //搜索  - 兑换码
  searchBatchChange(v){
    this.setState({
      searchBatch:v.target.value
    })
  }
  
  //搜索  - 兑换状态
  searchStatusChange(v){
    this.setState({
      searchStatus:v
    })
  }
  
  //搜索  - 优惠卡状态
  searchDiscounStatusChange(v){
    this.setState({
      searchDiscountStatus:v
    })
  }
  
  //搜索  - 关联优惠卡
  searchDiscountChange(v){
    this.setState({
      searchDiscount:v.target.value
    })
  }
  
  //搜索 - 端
  onSearchDicCode(c){
    this.setState({
      searchdicCode:c
    })
  }
  
  //搜索 - 渠道
  onSearchChannel(c){
    this.setState({
      searchChannel:c
    })
  }
  
  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }
  
  // 添加生成兑换码模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewNum",
      "addnewBeginTime",
      "addnewEndTime",
      "formEnd",
      "formChannel",
    ]);
    this.setState({
      addOrUp: "add",
      addnewPersonShow: true,
      nowData: null
    });
  }
  
  // 生成兑换码模态框的确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
        [
          "addnewNum",
          "addnewBeginTime",
          "addnewEndTime",
          "formEnd",
          "formChannel",
        ],
        (err, values) => {
          if (err) {
            return false;
          }
          if(!values.addnewNum){
            message.error('兑换数量不能为空！');
            return
          }
          if(values.addnewNum<=0){
            message.error('兑换数量不能小于0！')
            return
          }
          if(this.state.radioCode==2){
            if(!values.addnewBeginTime&&!values.addnewEndTime){
              message.error('请选择日期！');
              return
            }
            if(!values.addnewBeginTime){
              message.error('请选择开始日期！');
              return
            }
            if(!values.addnewEndTime){
              message.error('请选择结束日期！');
              return
            }
          }
          const params = {
            side:values.formEnd ? String(values.formEnd) : undefined,
            channel:values.formChannel ? String(values.formChannel) : undefined,
            channelName:this.findChannelById(values.formChannel),
            count: values.addnewNum,
            beginTime: this.state.radioCode == 2 && values.addnewBeginTime ? `${tools.dateToStr(values.addnewBeginTime._d)}` : '',
            endTime: this.state.radioCode == 2 && values.addnewEndTime ? `${tools.dateToStr(values.addnewEndTime._d)}` : '',
            // batchNumber:`${'JD'}-${Math.random().toString(36).substr(2)}`, //批次号（可能以后又要传过来了）
          };
          me.props.actions.hraExchangeSave(tools.clearNull(params)).then(res => {
            if(res.status === "0"){
              message.success(res.message || '操作成功')
              this.onGetData(1, this.state.pageSize);
              this.onAddNewClose();
            }else{
              message.error(res.message || '操作失败')
            }
          })
        }
    );
  }
  
  // 设置的模态框出现
  onSetUpShow() {
    const me = this;
    const { form } = me.props;
    form.setFieldsValue({
      addnewPerson: Number(this.state.times.map((item)=>{return Number(item.dicCode)})),
      addnewTime:String(this.state.times.map((item)=>{return String(this.getDicTypeExchange(item.dicValue))})),
    });
    this.setState({
      addOrUp: "up",
      addnewSetShow: true,
    });
  }
  
  // 设置模态框的确定
  onAddNewLimitOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
        [
          "addnewPerson",
          "addnewTime",
        ],
        (err, values) => {
          if (err) {
            return false;
          }
          if(values.addnewPerson<=0){
            message.error('兑换次数应大于零！')
            return
          }
          const params = {
            id:Number(this.state.times.map((item)=>{return Number(item.id)})),
            dicType:String(this.state.times.map((item)=>{return String(item.dicType)})),
            dicCode:values.addnewPerson,
            dicValue:this.state.radioLimit == 1 ? '0' :(this.getDicTypeIdExchange(values.addnewTime) || this.getDicTypeIddExchange(values.addnewTime)),
          };
          me.props.actions.upExchangeSave(tools.clearNull(params)).then(res => {
            if(res.status === "0"){
              message.success(res.message || '操作成功')
              this.getCycleFrom();
              this.onAddNewClose();
            }else{
              message.error(res.message || '操作失败')
            }
          })
        }
    );
  }
  
  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewPersonShow: false,
      addnewSetShow:false,
      
    });
    
  }
  
  // 生成兑换码时间选择 - radio改变时触发
  onRadioChange(e) {
    this.setState({
      radioCode: e.target.value,
    });
  }
  
  // 设置框中次数的radio选择 - radio改变时触发
  onRadioLimitChange(e) {
    this.setState({
      radioLimit: e.target.value,
    });
  }
  
  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        width: 90
      },
      {
        title:'端',
        dataIndex:'side',
        key:'side',
        render: text => this.findPortById(text)
      },
      {
        title:'渠道',
        dataIndex:'channel',
        key:'channel',
        render: text => this.findChannelById(text)
      },
      {
        title:'兑换码',
        dataIndex:'exchangeCode',
        key:'exchangeCode'
      },
      {
        title:'兑换码批次号',
        dataIndex:'batchNumber',
        key:'batchNumber'
      },
      {
        title:'兑换码生成时间',
        dataIndex:'createTime',
        key:'createTime'
      },
      {
        title:'兑换状态',
        dataIndex:'exchangeStatus',
        key:'exchangeStatus',
        render:text => this.getExchangeStatus(text)
      },
      {
        title:'e家号',
        dataIndex:'userId',
        key:'userId'
      },
      {
        title:'关联优惠卡',
        dataIndex:'ticketNo',
        key:'ticketNo'
      },
      {
        title:'优惠卡使用状态',
        dataIndex:'ticketStatus',
        key:'ticketStatus'
      },
      {
        title: "操作",
        key: "control",
        width: 50,
        fixed: "right",
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
  
  // 构建table所需数据
  makeData(data) {
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        side:item.side,//端
        channel:item.channel,//渠道
        batchNumber: item.batchNumber,//批次号
        creator: item.creator,//生成人
        beginTime:item.beginTime,//兑换活动开始时间
        endTime: item.endTime,//兑换活动截止时间
        createTime: item.createTime,//兑换码生成时间
        period:item.beginTime && item.endTime ? `${item.beginTime}--${item.endTime}` : '不限制有效期',//时间区间
        exchangeCode: item.exchangeCode, //兑换码
        exchangeFrom: item.exchangeFrom,//兑换来源 1-京东  2-其他
        exchangeStatus: item.exchangeStatus,//兑换状态 1-未兑换 2-兑换成功  3-兑换失败 4-活动过期 5-兑换禁止
        exchangeTime:item.exchangeTime,//兑换时间
        num: item.num,//兑换数量
        userId:item.userId,//e家号
        ticketNo:item.ticketNo,//关联优惠卡
        ticketStatus:item.ticketStatus,//优惠卡使用状态
      };
    });
  }
  startDa(data,_this){
    let startT,endT;
    const me = _this;
    const { form } = me.props;
    form.validateFields(
        [
          "addnewBeginTime",
          "addnewEndTime"
        ],
        (err, values) => {
          console.log(values)
          startT=values.addnewBeginTime;
          endT=values.addnewEndTime;
        }
    );
    if(!endT){
      return false
    }
    return  data > endT
  }
  endDa(data,_this){
    let startT,endT;
    const me = _this;
    const { form } = me.props;
    form.validateFields(
        [
          "addnewBeginTime",
          "addnewEndTime"
        ],
        (err, values) => {
          startT=values.addnewBeginTime;
          endT=values.addnewEndTime;
        }
    );
    if(!startT){
      return false
    }
    return  data < startT
  }
  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator } = form;console.log(form)
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 }
      }
    };
    const formItemLayout1 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      }
    };
    const { searchCode } = this.state;
    const { searchBatch } = this.state;
    const { searchDiscount } = this.state;
    const suffix = searchCode ? (
        <Icon type="close-circle" onClick={() => this.emitEmpty()}/>
    ) : null;
    const suffix1 = searchBatch ? (
        <Icon type="close-circle" onClick={() => this.emitEmpty1()}/>
    ) : null;
    const suffix2 = searchDiscount ? (
        <Icon type="close-circle" onClick={() => this.emitEmpty2()}/>
    ) : null;
    return (
        <div>
            <div className="system-search">
                <ul className="search-ul more-ul">
                    <li>
                        <span style={{marginLeft:'-50px'}}>端</span>
                        <Select
                            placeholder="全部"
                            allowClear
                            style={{ width: "172px" }}
                            onChange={c => this.onSearchDicCode(c)}
                        >
                          {this.state.ports.map((item) => {
                            return (
                                <Option key={String(item.dicCode)}>{item.dicValue}</Option>
                            );
                          })
                          }
                        </Select>
                    </li>
                    <li>
                        <span>渠道</span>
                        <Select
                            placeholder="全部"
                            allowClear
                            style={{ width: "172px" }}
                            onChange={c => this.onSearchChannel(c)}
                        >
                          {this.state.channels.map((item) => {
                            return (
                                <Option key={String(item.dicCode)}>{item.dicValue}</Option>
                            );
                          })
                          }
                        </Select>
                    </li>
                    <li>
                        <span style={{marginLeft:'19px'}}>兑换码</span>
                        <Input
                            suffix={suffix}
                            value={searchCode}
                            style={{ width: "172px", marginRight: "10px" }}
                            onChange={e => this.searchCodeChange(e)}
                        />
                    </li>
                    <li>
                        <span style={{marginLeft:'19px'}}>兑换码批次号</span>
                        <Input
                            suffix={suffix1}
                            value={searchBatch}
                            style={{ width: "172px", marginRight: "10px" }}
                            onChange={e => this.searchBatchChange(e)}
                        />
                    </li>
                    <li>
                        <span>兑换状态</span>
                        <Select
                            placeholder="全部"
                            allowClear
                            style={{ width: "172px" }}
                            onChange={e => this.searchStatusChange(e)}
                        >
                            <Option value={1}>未兑换</Option>
                            <Option value={2}>已兑换</Option>
                          {/*<Option value={3}>兑换失败</Option>*/}
                            <Option value={4}>兑换过期</Option>
                            <Option value={5}>兑换禁止</Option>
                        </Select>
                    </li>
                    <li>
                        <span style={{marginLeft:'-20px'}}>关联优惠卡</span>
                        <Input
                            suffix={suffix2}
                            value={searchDiscount}
                            style={{ width: "172px" }}
                            onChange={e => this.searchDiscountChange(e)}
                        />
                    </li>
                    <li>
                        <span>优惠卡状态</span>
                        <Select
                            placeholder="全部"
                            allowClear
                            style={{ width: "172px" }}
                            onChange={e => this.searchDiscounStatusChange(e)}
                        >
                            <Option value={1}>待使用</Option>
                            <Option value={2}>已使用</Option>
                            <Option value={3}>待支付</Option>
                            <Option value={4}>已过期</Option>
                        </Select>
                    </li>
                    <li>
                        <Button
                            icon="search"
                            type="primary"
                            onClick={() => this.onSearch()}
                            style={{ marginRight: "20px"}}
                        >
                            查询
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => this.onSetUpShow()}
                            icon="setting"
                            style={{ marginRight: "20px"}}
                        >
                            设置
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => this.onAddNewShow()}
                            icon="plus-circle-o"
                            style={{ marginRight: "20px"}}
                        >
                            生成兑换码
                        </Button>
                        <Button
                            type="primary"
                            onClick={(e)=> this.onExport(e)}
                            icon="download"
                        >
                            导出
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
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                          this.onTablePageChange(page, pageSize)
                    }}
                />
            </div>
          {/* 添加模态框 */}
            <Modal
                title="请录入兑换码"
                visible={this.state.addnewPersonShow}
                onOk={() => this.onAddNewOk()}
                onCancel={() => this.onAddNewClose()}
            >
                <Form>
                    <FormItem label="端" {...formItemLayout1}>
                      {getFieldDecorator("formEnd", {
                        initialValue: undefined,
                        rules: [
                          { required: true, message: "请选择所要配置的端" }
                        ]
                      })(
                          <Select placeholder='请选择所要配置的端' style={{width:'298px'}}>
                              <Option value={1}>公众号</Option>
                              <Option value={2}>小程序</Option>
                          </Select>
                      )}
                    </FormItem>
                    <FormItem label="渠道" {...formItemLayout1}>
                      {getFieldDecorator("formChannel", {
                        initialValue: undefined,
                        rules: [
                          { required: true, message: "请选择所要配置的渠道" }
                        ]
                      })(
                          <Select placeholder='请选择所要配置的渠道' style={{width:'298px'}}>
                            {this.state.channels.map((item) => {
                              return (
                                  <Option key={String(item.dicCode)}>{item.dicValue}</Option>
                              );
                            })}
                          </Select>
                      )}
                    </FormItem>
                    <FormItem label="兑换数量" {...formItemLayout1}>
                      {getFieldDecorator("addnewNum", {
                        initialValue: undefined,
                        rules: [
                          {
                            whitespace: true,
                            message: "请输入兑换数量"
                          }
                        ]
                      })(<Input placeholder="请输入兑换数量" style={{width:'80%'}} type="number"/>)}
                    </FormItem>
                    <FormItem label="兑换时间" {...formItemLayout1}>
                        <RadioGroup onChange={(e) => this.onRadioChange(e)} value={this.state.radioCode}>
                            <Radio value={1}>不限有效期</Radio>
                            <Radio value={2}>
                              {getFieldDecorator("addnewBeginTime", {
                                initialValue: undefined,
                                // rules: [{ required: true, message: "请选择兑换开始时间" }]
                              })(
                                  <DatePicker
                                      disabledDate={(data)=>this.startDa(data,this)}
                                      disabled={this.state.radioCode !== 2}
                                      style={{ width: "48%" }}
                                      showTime
                                      format="YYYY-MM-DD HH:mm:ss"
                                      placeholder="请选择兑换开始时间"
                                      onChange={this.onChange}
                                      onOk={onOk}
                                  />
                              )}--
                              {getFieldDecorator("addnewEndTime", {
                                initialValue: undefined,
                                // rules: [{ required: true, message: "请选择兑换结束时间" }]
                              })(
                                  <DatePicker
                                      disabledDate={(data)=>this.endDa(data,this)}
                                      disabled={this.state.radioCode !== 2}
                                      style={{ width: "48%" }}
                                      showTime
                                      format="YYYY-MM-DD HH:mm:ss"
                                      placeholder="请选择兑换结束时间"
                                      onChange={this.onChange}
                                      onOk={onOk}
                                  />
                              )}
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </Modal>
          {/* 设置的模态框 */}
            <Modal
                title="兑换限制"
                visible={this.state.addnewSetShow}
                onOk={() => this.onAddNewLimitOk()}
                onCancel={() => this.onAddNewClose()}
            >
                <Form>
                    <FormItem label="兑换次数" {...formItemLayout1}>
                        <RadioGroup onChange={(e) => this.onRadioLimitChange(e)} value={this.state.radioLimit}>
                            <Radio value={1} style={{marginRight:'100px'}}>不限次数</Radio>
                            <Radio value={2}>
                                每
                              {getFieldDecorator("addnewTime", {
                                initialValue: undefined,
                              })(
                                  <Select placeholder="天" style={{ width: "110px" ,marginRight:'5px',marginLeft:'5px'}} disabled={this.state.radioLimit !== 2}>
                                      <Option value={1}>天</Option>
                                      <Option value={2}>周</Option>
                                      <Option value={3}>月</Option>
                                  </Select>
                              )}兑换
                              {getFieldDecorator("addnewPerson", {
                                initialValue: undefined,
                              })(<Input placeholder="请输入次数" type="number" style={{ width: "110px" ,marginRight:'5px',marginLeft:'5px'}} disabled={this.state.radioLimit !== 2}/>)}次/人
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </Modal>
          {/* 查看详情模态框 */}
            <Modal
                title="查看详情"
                visible={this.state.queryModalShow}
                onOk={() => this.onQueryModalClose()}
                onCancel={() => this.onQueryModalClose()}
            >
                <Form>
                    <FormItem
                        label="端"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.findPortById(this.state.nowData.side) : ""}
                    </FormItem>
                    <FormItem
                        label="渠道"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.findChannelById(this.state.nowData.channel) : ""}
                    </FormItem>
                    <FormItem
                        label="兑换码"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.state.nowData.exchangeCode : ""}
                    </FormItem>
                    <FormItem
                        label="兑换码批次号"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.state.nowData.batchNumber : ""}
                    </FormItem>
                    <FormItem
                        label="兑换码生成时间"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.state.nowData.createTime : ""}
                    </FormItem>
                    <FormItem
                        label="兑换码有效期"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.state.nowData.period : ""}
                    </FormItem>
                    <FormItem
                        label="兑换状态"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.getExchangeStatus(this.state.nowData.exchangeStatus) : ""}
                    </FormItem>
                    <FormItem
                        label="兑换时间"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {this.state.nowData ? this.state.nowData.exchangeTime : ''}
                    </FormItem>
                    <FormItem
                        label="关联优惠卡"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.state.nowData.ticketNo : ""}
                    </FormItem>
                    <FormItem
                        label="优惠卡使用状态"
                        {...formItemLayout}
                        style={{ marginLeft: "20px" }}
                    >
                      {!!this.state.nowData ? this.state.nowData.ticketStatus : ""}
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
  citys: P.array
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
            hraExchange,
            hraExchangeSave,
            onChange,
            onOk ,
            findAllProvince,
            findCityOrCounty,
            PortFromSave,
            ChannelFromSave,
            exchangeSave,
            upExchangeSave
          },
          dispatch
      )
    })
)(WrappedHorizontalRole);
