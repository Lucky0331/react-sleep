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
  InputNumber,
  Table,
  message,
  Cascader,
  Popconfirm,
  Popover,
  Modal,
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
  findStationByArea,
} from "../../../../a_action/sys-action";
import {
  ticketList,
  ticketSave,
  ticketUpdate,
  listReserve
} from "../../../../a_action/phy-action";
import { onChange, onOk } from "../../../../a_action/shop-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
      searchMobile: "", // 搜索 - 手机号
      searchTicketNo: "", // 搜索 - 体检卡号
      searchDate: undefined, // 搜索 - 预约体检日期
      searchUserId:'',//搜索 - 用户ID
      // searchBeginTime: "", // 搜索 - 开始时间
      // searchEndTime: "", // 搜索- 结束时间
      searchBeginTime: moment(
        (() => {
          const d = new Date();
          d.setMonth(d.getMonth());
          return d;
        })()
      ), // 搜索 - 开始时间
      searchEndTime: moment(
        (() => {
          const d = new Date();
          d.setMonth(d.getMonth());
          return d;
        })()
      ), // 搜索- 结束时间
      searchUserSource: "", //搜索 - 用户来源
      searchState: "", //搜索 - 体检卡状态
      searchticketType:'',//搜索- 体检卡型号
      searchStation:'',//搜索 - 服务站名称
      searchticketState:"",//搜索 - 预约状态
      searchuserSource:"",//搜索- 预约来源
      addnewPersonShow: false, // 添加体检人模态框是否显示
      addnewLoading: false, // 是否正在添加体检人
      upModalShow: false, // 修改体检人模态框是否显示
      upLoading: false, // 是否正在体检人
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 ,// 数据库总共多少条数据
      searchAddress: [] // 搜索 - 服务站地区地址
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
    this.onGetData(this.state.pageNum, this.state.pageSize);
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

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      mobile: this.state.searchMobile.trim(),
      ticketNo: this.state.searchTicketNo.trim(),
      state: this.state.searchState,
      userSource: this.state.searchuserSource,
      userId:this.state.searchUserId.trim(),//用户id
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      reserveStatus:this.state.searchticketState,
      stationName:this.state.searchStation,//服务站名称
      ticketType:this.state.searchticketType,//体检卡型号
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`
        : ""
    };
    this.props.actions.listReserve(tools.clearNull(params)).then(res => {
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
  
  // 获取所有的省
  getAllCity0() {
    this.props.actions.findAllProvince();
  }
  
  // 根据上级区域找下级区域  获取省下面所有的市
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

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    this.onGetData(page, pageSize);
  }

  // 工具 - 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
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
  getNameByType(type) {
    switch (String(type)) {
      case "1":
        return "未使用";
      case "2":
        return "已使用";
      case "3":
        return "已禁用";
      case "4":
        return "已过期";
      default:
        return "";
    }
  }

  // 搜索 - 手机号输入框值改变时触发
  searchMobileChange(e) {
    this.setState({
      searchMobile: e.target.value
    });
  }
  
  //搜索  - 用户id
  searchUserIdChange(v){
    this.setState({
      searchUserId:v.target.value
    })
  }

  // 搜索 - 体检卡输入框值改变时触发
  searchTicketNoChange(e) {
    this.setState({
      searchTicketNo: e.target.value
    });
  }
  
  //服务站名称搜索
  searchStationChange(e){
    this.setState({
      searchStation:e.target.value
    })
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

  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true
    });
    console.log('详情有什么：',record)
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
  
  //体检卡型号
  searchCardChange(e){
    this.setState({
      searchticketType:e
    })
  }
  
  //预约状态
  searchticketStateChange(e){
    this.setState({
      searchticketState:e
    })
  }
  
  //清空Input标签内容
  emitEmpty(){
    this.setState({
      searchStation: ""
    });
  }
  
  emitEmpty1(){
    this.setState({
      searchTicketNo: ""
    });
  }
  
  emitEmpty2(){
    this.setState({
      searchMobile: ""
    });
  }
  
  emitEmpty3(){
    this.setState({
      searchUserId: ""
    });
  }
  
  //预约来源
  searchuserSourceChange(e){
    this.setState({
      searchuserSource:e
    })
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  // 添加体检人模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewCode",
      "addnewName",
      "addnewIdCard",
      "addnewMobile",
      "addnewSex",
      "addnewHeight",
      "addnewWeight",
      "addnewReserveTime",
      "addnewReserveFrom",
      "addnewBirthDate"
    ]);
    this.setState({
      nowData: null,
      addnewPersonShow: true
    });
  }

  // 添加的确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;

    form.validateFields(
      [
        "addnewCode",
        "addnewName",
        "addnewIdCard",
        "addnewMobile",
        "addnewSex",
        "addnewHeight",
        "addnewWeight",
        "addnewReserveTime",
        "addnewReserveFrom",
        "addnewBirthDate"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });
        console.log("获取到的值：", values);
        const params = {
          ticketNo: values.addnewCode,
          userName: values.addnewName,
          idCard: values.addnewIdCard,
          phone: values.addnewMobile,
          sex: values.addnewSex,
          height: values.addnewHeight,
          weight: values.addnewWeight,
          reserveTime: values.addnewReserveTime
            ? tools.dateToStr2(values.addnewReserveTime._d)
            : null,
          birthDate: values.addnewBirthDate
            ? tools.dateforNull(values.addnewBirthDate._d)
            : null,
          reserveFrom: 5
        };
        me.props.actions.ticketSave(params)
          .then(res => {
            // 新增
            me.setState({
              addnewLoading: false
            });
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onAddNewClose();
          })
          .catch(() => {
            me.setState({
              addnewLoading: false
            });
          });
      }
    );
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewPersonShow: false
    });
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("Record:", record);
    form.setFieldsValue({
      upTicketNo: record.ticketNo,
      upUserName: record.username,
      upIdCard: record.idCard,
      upMobile: record.phone,
      upSex:record.sex,
      upHeight: record.height,
      upWeight: record.weight,
      upReserveForm: record.reserveFrom,
      upReserveTime: record.reserveTime
        ? new moment(record.reserveTime)
        : undefined,
      upBirthDate: record.birthdate ? moment(record.birthdate) : undefined
    });
    me.setState({
      nowData: record,
      upModalShow: true
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "upTicketNo",
        "upUserName",
        "upIdCard",
        "upMobile",
        "upSex",
        "upHeight",
        "upWeight",
        "upReserveForm",
        "upReserveTime",
        "upBirthDate"
      ],
      (err, values) => {
        if (err) {
          return;
        }
        const params = {
          custId: me.state.nowData.customerId,
          ticketNo: me.state.nowData.ticketNo,
          idCard: values.upIdCard,
          userName: values.upUserName,
          phone: values.upMobile,
          sex: String(values.upSex),
          height: values.upHeight,
          weight: values.upWeight,
          reserveFrom: me.state.nowData.reserveFrom,
          birthDate: values.upBirthDate
            ? `${tools.dateforNull(values.upBirthDate._d)}`
            : "",
          reserveTime: values.upReserveTime
            ? `${tools.dateToStr(values.upReserveTime._d)}`
            : ""
        };
        me.props.actions
          .ticketUpdate(params) // 修改
          .then(res => {
            me.setState({
              addnewLoading: false
            });
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onUpClose();
            message.success(res.message || '修改成功')
          })
          .catch(() => {
            me.setState({
              addnewLoading: false
            });
            message.error(res.message || '修改失败，请重试')
          });
      }
    );
  }
  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
      },
      {
        title:'用户ID',
        dataIndex:'userId',
        key:'userId'
      },
      {
        title:'服务站地区',
        dataIndex:'citys',
        key:'citys'
      },
      {
        title: "服务站名称",
        dataIndex: "name",
        key: "name",
        width: 220
      },
      {
        title: "体检卡号",
        dataIndex: "ticketNo",
        key: "ticketNo",
        width: 200
      },
      {
        title: "体检人",
        dataIndex: "username",
        key: "username",
        width: 120
      },
      {
        title: "身份证号",
        dataIndex: "idCard",
        key: "idCard",
        width: 200
      },
      {
        title: "手机号",
        dataIndex: "phone",
        key: "phone",
        width: 150
      },
      {
        title: "性别",
        dataIndex: "sex",
        key: "sex",
        width: 100,
      },
      {
        title: "预约时间",
        dataIndex: "reserveTime",
        key: "reserveTime",
        width: 200
      },
      {
        title: "预约状态",
        dataIndex:'ticketStatus',
        key:'ticketStatus',
      },
      {
        title: "预约来源",
        dataIndex: "userSource",
        key: "userSource",
        width: 130,
        render: text => this.getNameByModelId(text)
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 120,
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
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
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
      // console.log("第一个时间是个啥：", new moment(item.reserveTime.substring(0,10) + " 23:59:59"));
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        citys:
          item.station.province && item.station.city && item.station.region
            ? `${item.station.province}/${item.station.city}/${item.station.region}`
            : "",
        province:item.station ? item.station.province : '',
        city:item.station ? item.station.city : '',
        region:item.station ? item.station.region : '',
        arriveTime: item.useTime,
        ticketNo: item.ticketNo,
        createTime: item.createTime,
        creator: item.creator,
        customerId:item.customerId,
        idCard: item.hraCustomer ? item.hraCustomer.idcard : null,
        phone: item.hraCustomer ? item.hraCustomer.phone : null,
        username: item.hraCustomer ? item.hraCustomer.username : null,
        birthdate: item.hraCustomer ? item.hraCustomer.birthdate : null,
        sex: item.hraCustomer ? item.hraCustomer.sex : '',
        height: item.hraCustomer ? item.hraCustomer.height : "XXX",
        weight: item.hraCustomer ? item.hraCustomer.weight: "XX",
        reserveFrom: item.reserveFrom,
        stationId: item.stationId,
        name: item.station ? item.station.name : null,
        updateTime: item.updateTime,
        updater: item.updater,
        userId:item.userId,//用户ID
        userSource: item.reserveFrom,
        reserveTime: (item.reserveTime).substring(0,10),
        ticketStatus:new moment(item.reserveTime.substring(0,10) + " 23:59:59") >= new moment(new Date()) ? '已预约' : '已过期',
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
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      }
    };
  
    const { searchStation } = this.state;
    const { searchTicketNo } = this.state;
    const { searchMobile } = this.state;
    const { searchUserId } = this.state;
    const suffix = searchStation ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix1 = searchTicketNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix2 = searchMobile ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;
    const suffix3 = searchUserId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    console.log("是啥：", form.getFieldValue("addnewTypeId"));
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-ul">
            <li>
              <span style={{marginLeft:'19px'}}>用户ID：</span>
              <Input
                suffix={suffix3}
                value={searchUserId}
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchUserIdChange(e)}
              />
            </li>
            <li>
              <span style={{marginRight:'10px'}}>服务站地区</span>
              <Cascader
                style={{ width: "172px" }}
                placeholder="请选择服务区域"
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
                changeOnSelect
              />
            </li>
            <li>
              <span>服务站名称：</span>
              <Input
                suffix={suffix}
                value={searchStation}
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchStationChange(e)}
              />
            </li>
            <li>
              <span>体检卡型号：</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchCardChange(e)}
              >
                <Option value="Y">Y</Option>
                <Option value="F">F</Option>
                <Option value="M">M</Option>
              </Select>
            </li>
            <li>
              <span>体检卡号：</span>
              <Input
                suffix={suffix1}
                value={searchTicketNo}
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchTicketNoChange(e)}
              />
            </li>
            <li>
              <span>手机号：</span>
              <Input
                suffix={suffix2}
                value={searchMobile}
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchMobileChange(e)}
              />
            </li>
            <li style={{ marginRight: "20px" }}>
              <span style={{ marginRight: "10px" }}>预约时间: </span>
              <DatePicker
                style={{ width: "180px" }}
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
                value={this.state.searchBeginTime}
                onChange={e => this.searchBeginTime(e)}
              />
              --
              <DatePicker
                style={{ width: "180px" }}
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
                value={this.state.searchEndTime}
                onChange={e => this.searchEndTime(e)}
              />
            </li>
            <li>
              <span>预约状态：</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchticketStateChange(e)}
              >
                <Option value={1}>已预约</Option>
                <Option value={2}>已过期</Option>
              </Select>
            </li>
            <li>
              <span>预约来源：</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px", marginRight: "10px" }}
                onChange={e => this.searchuserSourceChange(e)}
              >
                <Option value={1}>终端用户app</Option>
                <Option value={2}>微信公众号</Option>
                <Option value={3}>体检系统</Option>
                <Option value={4}>经销商APP</Option>
                <Option value={5}>后台管理系统</Option>
              </Select>
            </li>
            <li>
              <Button
                icon="search"
                type="primary"
                onClick={() => this.onSearch()}
                style={{ marginRight: "20px", marginTop: "10px" }}
              >
                查询
              </Button>
            </li>
            <ul className="search-func">
              <li>
                <Button type="primary" onClick={() => this.onAddNewShow()}>
                  <Icon type="plus-circle-o" />新增预约
                </Button>
              </li>
            </ul>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
            scroll={{ x: 2000 }}
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
          title="新增预约信息"
          visible={this.state.addnewPersonShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="体检卡号" {...formItemLayout}>
              {getFieldDecorator("addnewCode", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入体检卡号"
                  }
                ]
              })(<Input placeholder="请输入体检卡号" />)}
            </FormItem>
            <FormItem label="体检人" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入体检人姓名"
                  },
                  { max: 12, message: "最多输入12位字符" }
                ]
              })(<Input placeholder="请输入体检人姓名" />)}
            </FormItem>
            <FormItem label="身份证号" {...formItemLayout}>
              {getFieldDecorator("addnewIdCard", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    min: 18,
                    max: 18,
                    message: "请输入18位有效身份证"
                  }
                ]
              })(<Input placeholder="请输入身份证号" />)}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {getFieldDecorator("addnewMobile", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    min: 11,
                    max: 11,
                    message: "请输入正确的手机号"
                  }
                ]
              })(<Input placeholder="请输入手机号" />)}
            </FormItem>
            <FormItem label="出生日期" {...formItemLayout}>
              {getFieldDecorator("addnewBirthDate", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择出生日期" }]
              })(<DatePicker />)}
            </FormItem>
            <FormItem label="性别" {...formItemLayout}>
              {getFieldDecorator("addnewSex", {
                initialValue: true,
                rules: [{ required: true, message: "请选择性别" }]
              })(
                <Select>
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="身高" {...formItemLayout}>
              {getFieldDecorator("addnewHeight", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入身高" }]
              })(
                <InputNumber
                  min={0}
                  max={250}
                  placeholder="请输入身高(cm)"
                  style={{ width: "100%" }}
                />
              )}
            </FormItem>
            <FormItem label="体重" {...formItemLayout}>
              {getFieldDecorator("addnewWeight", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入体重" }]
              })(
                <InputNumber
                  min={0}
                  max={300}
                  placeholder="请输入体重(kg)"
                  style={{ width: "100%" }}
                />
              )}
            </FormItem>
            <FormItem label="预约日期" {...formItemLayout}>
              {getFieldDecorator("addnewReserveTime", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择预约体检日期" }]
              })(
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择预约体检日期"
                  onChange={onChange}
                  onOk={onOk}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 查看详情模态框 */}
        <Modal
          title="查看预约详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem
              label="体检卡号"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.ticketNo : ""}
            </FormItem>
            <FormItem
              label="体检人"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.username : ""}
            </FormItem>
            <FormItem
              label="用户ID"
              {...formItemLayout}
              style={{marginLeft: "20px"}}
            >
              {!!this.state.nowData ? this.state.nowData.userId : ''}
            </FormItem>
            <FormItem
              label="身份证号"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.idCard : ""}
            </FormItem>
            <FormItem
              label="手机号"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.phone : ""}
            </FormItem>
            <FormItem
              label="出生日期"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.birthdate : ""}
            </FormItem>
            <FormItem
              label="性别"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.sex : ""}
            </FormItem>
            <FormItem
              label="身高"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? `${this.state.nowData.height}cm` : ""}
            </FormItem>
            <FormItem
              label="体重"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? `${(this.state.nowData.weight)}kg` : ''}
            </FormItem>
            <FormItem
              label="预约来源"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData
                ? this.getNameByModelId(this.state.nowData.userSource)
                : ""}
            </FormItem>
            <FormItem
              label="预约体检日期"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.reserveTime : ""}
            </FormItem>
            <FormItem
              label="操作时间"
              {...formItemLayout}
              style={{ marginLeft: "20px" }}
            >
              {!!this.state.nowData ? this.state.nowData.reserveTime : ""}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改用户模态框 */}
        <Modal
          title="编辑预约信息"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          // confirmLoading={this.state.upLoading}
        >
          <Form>
            <FormItem
              label="体检卡号"
              {...formItemLayout}
            >
              {!!this.state.nowData ? this.state.nowData.ticketNo : ""}
            </FormItem>
            <FormItem label="体检人" {...formItemLayout}>
              {getFieldDecorator("upUserName", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入体检人姓名"
                  },
                  { max: 12, message: "最多输入12位字符" }
                ]
              })(<Input placeholder="请输入体检人姓名" />)}
            </FormItem>
            <FormItem label="身份证号" {...formItemLayout}>
              {getFieldDecorator("upIdCard", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    min: 18,
                    max: 18,
                    message: "请输入18位有效身份证"
                  }
                ]
              })(<Input placeholder="请输入身份证号" />)}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {getFieldDecorator("upMobile", {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    min: 11,
                    max: 11,
                    message: "请输入正确的手机号"
                  }
                ]
              })(<Input placeholder="请输入手机号" />)}
            </FormItem>
            <FormItem label="出生日期" {...formItemLayout}>
              {getFieldDecorator("upBirthDate", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择出生日期" }]
              })(<DatePicker />)}
            </FormItem>
            <FormItem label="性别" {...formItemLayout}>
              {getFieldDecorator("upSex", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择性别" }]
              })(
                <Select>
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="身高" {...formItemLayout}>
              {getFieldDecorator("upHeight", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入身高" }]
              })(
                <InputNumber
                  min={0}
                  max={300}
                  precision={0}
                  placeholder="请输入身高(cm)"
                  style={{ width: "100%" }}
                />
              )}
            </FormItem>
            <FormItem label="体重" {...formItemLayout}>
              {getFieldDecorator("upWeight", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入体重" }]
              })(
                <InputNumber
                  min={0}
                  max={300}
                  placeholder="请输入体重(kg)"
                  style={{ width: "100%" }}
                />
              )}
            </FormItem>
            <FormItem label="预约日期" {...formItemLayout}>
              {getFieldDecorator("upReserveTime", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择预约体检日期" }]
              })(
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择预约体检日期"
                  onChange={onChange}
                  onOk={onOk}
                />
              )}
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
      { ticketList, ticketSave, ticketUpdate, onChange, onOk ,findAllProvince,findCityOrCounty,findStationByArea,listReserve},
      dispatch
    )
  })
)(WrappedHorizontalRole);
