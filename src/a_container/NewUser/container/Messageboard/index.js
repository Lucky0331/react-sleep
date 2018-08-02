/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import moment from "moment";
import "./index.scss";
import _ from "lodash";
import Config from "../../../../config/config";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  Popconfirm,
  Modal,
  Radio,
  InputNumber,
  Select,
  Tooltip,
  Divider,
  Cascader,
  Popover,
  DatePicker,
  Alert
} from "antd";
import RoleTree from "../../../../a_component/roleTree"; // 角色树 用于选角色

// ==================
// 本页面所需action
// ==================

import {
  findAllProvince,
  findCityOrCounty,
  findStationByArea,
} from "../../../../a_action/sys-action";
import {
  findUserInfo,
  myCustomers,
  userinfoRecord ,
  AreaManagerList,
  AddAreaManagerList,
  UpAreaManagerList,
  customerMessage,
  listByDicType
} from "../../../../a_action/info-action";
import { onOk } from "../../../../a_action/shop-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      dicValues:[],//所有加盟类型
      searchUserName: "",
      searchConditions: null,
      addnewModalShow: false, // 添加省级经理信息 或 修改省级经理信息 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      upLoading: false, // 是否正在修改用户中
      searchName:"", //搜索省市
      searchBeginTime:'',//搜索 -开始时间
      searchEndTime:'',//搜索 -结束时间
      roleTreeShow: false, // 角色树是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
      searchAddress: [], // 搜索 - 地址
      searchMobil:'',//搜索 -手机号
      searchType:"",//搜索 - 加盟类型
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
    this.getAllCity0();
    this.getAllProductModel();//加盟类型
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
  
  // 获取所有加盟类型，当前页要用
  getAllProductModel() {
    this.props.actions
      .listByDicType({ pageNum: 0, pageSize: 9999,dicType:'joinType' })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            dicValues: res.data.result || []
          });
        }
      });
  }
  
  // 工具 - 根据加盟类型ID获取加盟类型名称
  getNameByModelId(dicCode) {
    const t = this.state.dicValues.find(
      item => String(item.dicCode) === String(dicCode)
    );
    return t ? t.dicValue : "";
  }
  
  getAllCity0() {
    this.props.actions.findAllProvince();
  }
  
  // 获取某省下面的市
  getAllCitySon(selectedOptions) {
    console.log("SSS",selectedOptions);
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    this.props.actions
      .findCityOrCounty({
        parentId: selectedOptions[selectedOptions.length - 1].id
      })
      .then(res => {
        if (res.status === "0") {
          targetOption.children = res.data.map((item,index) => {
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
  
  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      customerName: this.state.searchName,
      mobile:this.state.searchMobil,
      joinType:this.state.searchType,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : ""
    };
    this.props.actions.customerMessage(tools.clearNull(params)).then(res => {
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

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  // 导出
  onExport() {
    this.onExportData(this.state.pageNum,this.state.pageSize);
  }
  
  //导出的数据字段
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      customerName: this.state.searchName,
      mobile:this.state.searchMobil,
      joinType:this.state.searchType,
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : ""
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/customerMessage/listExport`;
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
    if (params.province) {
      newElement3.setAttribute("name", "province");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.province);
      form.appendChild(newElement3);
    }
  
    const newElement4 = document.createElement("input");
    if (params.city) {
      newElement4.setAttribute("name", "city");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.city);
      form.appendChild(newElement4);
    }
  
    const newElement5 = document.createElement("input");
    if (params.region) {
      newElement5.setAttribute("name", "region");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.region);
      form.appendChild(newElement5);
    }
  
    const newElement6 = document.createElement("input");
    if (params.beginTime) {
      newElement6.setAttribute("name", "beginTime");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.beginTime);
      form.appendChild(newElement6);
    }
  
    const newElement7 = document.createElement("input");
    if (params.endTime) {
      newElement7.setAttribute("name", "endTime");
      newElement7.setAttribute("type", "hidden");
      newElement7.setAttribute("value", params.endTime);
      form.appendChild(newElement7);
    }
  
    const newElement8 = document.createElement("input");
    if (params.customerName) {
      newElement8.setAttribute("name", "customerName");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.customerName);
      form.appendChild(newElement8);
    }
  
    const newElement9 = document.createElement("input");
    if (params.mobile) {
      newElement9.setAttribute("name", "mobile");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.mobile);
      form.appendChild(newElement9);
    }
  
    const newElement10 = document.createElement("input");
    if (params.joinType) {
      newElement10.setAttribute("name", "joinType");
      newElement10.setAttribute("type", "hidden");
      newElement10.setAttribute("value", params.joinType);
      form.appendChild(newElement10);
    }
    form.submit();
  }
  
  // 添加新活动模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewProvince",
      "addnewTechnicalName",
      "addnewMobile",
    ]);
    this.setState({
      addOrUp: "add",
      addnewModalShow: true,
      nowData: null
    });
  }
  
  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      queryModalShow: true
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }
  
  //搜索 - 姓名输入框改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e.target.value,
    });
  }
  
  //搜索 - 手机号时触发
  searchMobileChange(e){
    this.setState({
      searchMobil: e.target.value,
    });
  }
  
  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 搜索 - 加盟类型
  onSearchType(e){
    this.setState({
      searchType: e
    });
  }
  
  // 搜索 - 开始时间变化
  searchBeginTime(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    });
  }
  
  // 搜索 - 结束时间变化
  searchEndTime(v) {
    this.setState({
      searchEndTime: _.cloneDeep(v)
    });
  }
  
  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchName: ""
    });
  }
  
  emitEmpty2() {
    this.setState({
      searchMobil: ""
    });
  }
  
  
  
  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial"
      },
      {
        title: "姓名",
        dataIndex:'customerName',
        key:'customerName'
      },
      {
        title: "手机号",
        dataIndex:'mobile',
        key:'mobile'
      },
      {
        title: "加盟区域",
        dataIndex:'citys',
        key:'citys'
      },
      {
        title:'加盟类型',
        dataIndex:'joinType',
        key:'joinType',
        render: text => this.getNameByModelId(text)
      },
      {
        title:'留言',
        dataIndex:'content',
        key:'content'
      },
      {
        title:'留言时间',
        dataIndex:'createTime',
        key:'createTime'
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 100,
        render: (text, record) => {
          let controls = [];
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
    console.log("DATA:", data);
    if (!data) {
      return [];
    }
    return data.map((item, index) => {
      return {
        key: index,
        citys: [item.province, item.city, item.region].filter((v)=> v).join('/'),  //因为有的时候省市后面没有区 所以要这样写。
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        id:item.id,
        mobile:item.mobile,
        province:item.province,
        city:item.city,
        region:item.region,
        content:item.content,
        customerName:item.customerName,
        createTime:item.createTime,
        joinType:item.joinType,
      };
    });
  }

  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator, getFieldValue } = form;
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
  
    const { searchName } = this.state;
    const { searchMobil } = this.state;
    const suffix = searchName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix2 = searchMobil ? (
        <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>
                姓名
              </span>
              <Input
                suffix={suffix}
                value={searchName}
                style={{ width: "180px" }}
                onChange={e => this.searchNameChange(e)}
              />
            </li>
            <li>
              <span>
                手机号
              </span>
              <Input
                suffix={suffix2}
                value={searchMobil}
                style={{ width: "180px" }}
                onChange={e => this.searchMobileChange(e)}
              />
            </li>
            <li>
              <span>加盟区域</span>
              <Cascader
                style={{ width: "190px" }}
                placeholder="请选择服务区域"
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
                changeOnSelect
              />
            </li>
            <li>
              <span>
                加盟类型
              </span>
              <Select
                allowClear
                onChange={v => this.onSearchType(v)}
                style={{ width: '180px' }}
                placeholder="全部"
              >
                {
                  this.state.dicValues.map((item) => {
                    return (
                      <Option key={String(item.dicCode)}>{item.dicValue}</Option>
                    );
                  })
                }
              </Select>
            </li>
            <li>
              <span>
                留言时间
              </span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchBeginTime(e)}
                onOk={onOk}
                style={{ width: "180px" }}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchEndTime(e)}
                onOk={onOk}
                style={{ width: "180px" }}
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
            <li style={{ marginLeft: "5px" }}>
              <Button
                icon="download"
                type="primary"
                onClick={() => this.onExport()}
              >
                导出
              </Button>
            </li>
          </ul>
        </div>
        <div className="system-table" style={{ marginTop: "2px" }}>
          <Table
            columns={this.makeColumns()}
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
        {/* 查看用户详情模态框 */}
        <Modal
          title="客户留言详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
          wrapClassName={"list"}
        >
          <Form>
            <FormItem label="姓名" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.customerName : ""}
            </FormItem>
            <FormItem label="手机号" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.mobile : ""}
            </FormItem>
            <FormItem label="加盟区域" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.citys : ""}
            </FormItem>
            <FormItem label="加盟类型" {...formItemLayout}>
              {!!this.state.nowData ? this.getNameByModelId(this.state.nowData.joinType) : ""}
            </FormItem>
            <FormItem label="留言" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.content : ""}
            </FormItem>
            <FormItem label="留言时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
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

Manager.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  allRoles: P.any,
  allOrganizer: P.any,
  citys: P.array
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
  state => ({
    allRoles: state.sys.allRoles,
    allOrganizer: state.sys.allOrganizer,
    citys: state.sys.citys
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        findAllProvince,
        findCityOrCounty,
        findStationByArea,
        findUserInfo,
        myCustomers,
        onOk,
        userinfoRecord,
        AreaManagerList,
        AddAreaManagerList,
        UpAreaManagerList,
        customerMessage,
        listByDicType
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
