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
  findAdminUserByKeys,
  addAdminUserInfo,
  deleteAdminUserInfo,
  updateAdminUserInfo,
  findAllRole,
  findAllRoleByUserId,
  assigningRole,
  findAllOrganizer,
  findAllProvince,
  findCityOrCounty,
  findStationByArea
} from "../../../../a_action/sys-action";
import { findUserInfo, myCustomers,userinfoRecord ,ExportList} from "../../../../a_action/info-action";
import { onOk } from "../../../../a_action/shop-action";
import { cashRecord } from "../../../../a_action/shop-action";
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
      Tdata: [], //推广客户所有信息
      searchUserName: "",
      searchConditions: null,
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情
      orgCodeValue: null, // 新增、修改 - 选择的组织部门对象
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      extensionShow: false, //推广客户详情是否显示
      upLoading: false, // 是否正在修改用户中
      roleTreeShow: false, // 角色树是否显示
      UpdateModalShow: false,//修改的模态框出现
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      userId: "", // 获取用户id
      eId: "",
      addOrUp: "add", // 当前操作是新增还是修改
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
      searchType: "", //搜索 - 用户类型
      searchAmbassadorUserType: "", //搜索 - 健康大使身份类型
      searchMobile: "", // 搜索 - 用户手机号
      searchName: "", //搜索 - 用户姓名
      searchNickName: "", //搜索 - 用户昵称
      searchNickName2: "", //搜索 - 健康大使昵称
      searchEId: "", // 搜索 - 用户id
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      searchCreatebeginTime:'',//搜索 -创建开始时间
      searchCreateendTime:'',//搜索 -创建结束时间
      searchBindingBeginTime: "", //搜索 - 开始绑定上级关系时间
      searchBindingEndTime: "", // 搜索 - 结束绑定上级关系时间
      searchId: "", //搜索- 健康大使id
      searchAmbassadorMobile: "", //搜索 - 健康大使手机号
      searchDistributorId: "", // 搜索 - 经销商id
      searchAmbassadorNickName: "", //搜索 - 健康大使昵称
      searchAmbassadorRealName: "", //搜索 - 健康大使真实姓名
      searchAddress: [] // 搜索 - 地址
    };
  }

  componentDidMount() {
    // 现在组织结构写死的，暂时不用，但接口保留
    // if((!this.props.allOrganizer) || (!this.props.allOrganizer.length)) {
    //     this.getAllOrganizer();
    // }
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

  //工具
  getCity(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}/${c}/${q}`;
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

  // 工具 - 根据ID获取用户类型
  getListByModelId(id) {
    switch (String(id)) {
      case "0":
        return "经销商（体验版）";
      case "1":
        return "经销商（微创版）";
      case "2":
        return "经销商（个人版）";
      case "3":
        return "分享用户";
      case "4":
        return "普通用户";
      case "5":
        return "企业版经销商";
      case "6":
        return "企业版子账号";
      case "7":
        return "分销商";
      default:
        return "";
    }
  }

  //工具 - 省市区的拼接
  getCity(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}`;
  }

    warning2 = () =>{
        message.warning('导出功能尚在开发 敬请期待');
    };


  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      category: 2,
      userType: this.state.searchType,// 搜索 - 用户身份
      mobile: this.state.searchMobile ? this.state.searchMobile : "",// 搜索 - 用户手机号
      realName: this.state.searchName ? this.state.searchName : "", // 搜索 - 用户姓名
      userId: this.state.searchEId ? this.state.searchEId : "",// 搜索 - 用户ID
      ambassadorId:this.state.searchId,     //搜索 - 健康大使id
      distributorId: this.state.searchDistributorId
        ? this.state.searchDistributorId
        : "", //搜索 - 经销商id
      bindBeginTime: this.state.searchBindingBeginTime
        ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}`
        : "",
      bindEndTime: this.state.searchBindingEndTime
        ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}`
        : "",
      beginTime: this.state.searchCreatebeginTime
        ? `${tools.dateToStr(this.state.searchCreatebeginTime.utc()._d)}`
        : "",
      endTime: this.state.searchCreateendTime
        ? `${tools.dateToStr(this.state.searchCreateendTime.utc()._d)}`
        : "",
    };

    this.props.actions.findUserInfo(tools.clearNull(params)).then(res => {
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
  
  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false,
      UpdateModalShow:false
    });
  }
  
  //修改某一条数据模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      upAddCount: record.ticketNo,
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      UpdateModalShow: true,
    });
  }
  
  // 确定修改某一条数据
  onUpdateOk() {
    const me = this;
    const { form } = me.props;
    console.log('是什么是：',me)
    form.validateFields(
      ["UpMobile"],
      (err, values) => {
        if (err) {
          return;
        }
        console.log("values:", values);
        me.setState({
          upLoading: true
        });
        const params = {
          ticketId: me.state.nowData.id,
        };
        this.props.actions
          .alertTicket(params)
          .then(res => {
            if (res.status === "0") {
              me.setState({
                addnewLoading: false
              });
              message.success(res.message || "修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onAddNewClose();
            } else {
              message.error(res.message || "修改失败，请重试");
            }
          })
          .catch(() => {
            me.setState({
              upLoading: false
            });
          });
      }
    );
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }

  // 导出订单对账列表数据
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      category: 2,
      userType: this.state.searchType,// 搜索 - 用户身份
      mobile: this.state.searchMobile ? this.state.searchMobile : "",// 搜索 - 用户手机号
      realName: this.state.searchName ? this.state.searchName : "", // 搜索 - 用户姓名
      userId: this.state.searchEId ? this.state.searchEId : "",// 搜索 - 用户ID
      ambassadorId:this.state.searchId,     //搜索 - 健康大使id
      distributorId: this.state.searchDistributorId
        ? this.state.searchDistributorId
        : "", //搜索 - 经销商id
      bindBeginTime: this.state.searchBindingBeginTime
        ? `${tools.dateToStr(this.state.searchBindingBeginTime.utc()._d)}`
        : "",
      bindEndTime: this.state.searchBindingEndTime
        ? `${tools.dateToStr(this.state.searchBindingEndTime.utc()._d)}`
        : "",
      beginTime: this.state.searchCreatebeginTime
        ? `${tools.dateToStr(this.state.searchCreatebeginTime.utc()._d)}`
        : "",
      endTime: this.state.searchCreateendTime
        ? `${tools.dateToStr(this.state.searchCreateendTime.utc()._d)}`
        : "",
    };
    let form = document.getElementById("download-form");
    if (!form) {
      form = document.createElement("form");
      document.body.appendChild(form);
    }
    else { form.innerHTML="";} form.id = "download-form";
    form.action = `${Config.baseURL}/manager/export/userInfo/list`;
    form.method = "post";
    
    console.log("FORM:", form, params);
    console.log('是message么:',message)

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

    const newElement10 = document.createElement("input");
    newElement10.setAttribute("name", "category");
    newElement10.setAttribute("type", "hidden");
    newElement10.setAttribute("value",'2');
    form.appendChild(newElement10);

    const newElement3 = document.createElement("input");
    if (params.userType) {
      newElement3.setAttribute("name", "userType");
      newElement3.setAttribute("type", "hidden");
      newElement3.setAttribute("value", params.userType);
      form.appendChild(newElement3);
    }

    const newElement4 = document.createElement("input");
    if (params.mobile) {
      newElement4.setAttribute("name", "mobile");
      newElement4.setAttribute("type", "hidden");
      newElement4.setAttribute("value", params.mobile);
      form.appendChild(newElement4);
    }

    const newElement5 = document.createElement("input");
    if (params.realName) {
      newElement5.setAttribute("name", "realName");
      newElement5.setAttribute("type", "hidden");
      newElement5.setAttribute("value", params.realName);
      form.appendChild(newElement5);
    }

    const newElement6 = document.createElement("input");
    if (params.userId) {
      newElement6.setAttribute("name", "userId");
      newElement6.setAttribute("type", "hidden");
      newElement6.setAttribute("value", params.userId);
      form.appendChild(newElement6);
    }

    const newElement8 = document.createElement("input");
    if (params.bindBeginTime) {
      newElement8.setAttribute("name", "bindBeginTime");
      newElement8.setAttribute("type", "hidden");
      newElement8.setAttribute("value", params.bindBeginTime);
      form.appendChild(newElement8);
    }

    const newElement9 = document.createElement("input");
    if (params.bindEndTime) {
      newElement9.setAttribute("name", "bindEndTime");
      newElement9.setAttribute("type", "hidden");
      newElement9.setAttribute("value", params.bindEndTime);
      form.appendChild(newElement9);
    }
  
    const newElement11 = document.createElement("input");
    if (params.distributorId) {
      newElement11.setAttribute("name", "distributorId");
      newElement11.setAttribute("type", "hidden");
      newElement11.setAttribute("value", params.distributorId);
      form.appendChild(newElement11);
    }
  
    const newElement12 = document.createElement("input");
    if (params.beginTime) {
      newElement12.setAttribute("name", "beginTime");
      newElement12.setAttribute("type", "hidden");
      newElement12.setAttribute("value", params.beginTime);
      form.appendChild(newElement12);
    }
  
    const newElement13 = document.createElement("input");
    if (params.endTime) {
      newElement13.setAttribute("name", "endTime");
      newElement13.setAttribute("type", "hidden");
      newElement13.setAttribute("value", params.endTime);
      form.appendChild(newElement13);
    }
  
    this.props.actions.ExportList(tools.clearNull(params)).then(res => {
      console.log('返货的是：', res);
      if (String(res) === "[object XMLDocument]") {
        message.error('没有数据！');
      } else {
        form.submit();
      }
    });
  
    // form.submit();
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchEId: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchNickName: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchName: ""
    });
  }

  emitEmpty3() {
    this.setState({
      searchMobile: ""
    });
  }

  emitEmpty4() {
    this.setState({
      searchId: ""
    });
  }

  emitEmpty5() {
    this.setState({
      searchAmbassadorNickName: ""
    });
  }

  emitEmpty6() {
    this.setState({
      searchAmbassadorRealName: ""
    });
  }

  emitEmpty7() {
    this.setState({
      searchAmbassadorMobile: ""
    });
  }

  emitEmpty8() {
    this.setState({
      searchDistributorId: ""
    });
  }

  // 搜索 - 服务站地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    const d = _.cloneDeep(record);
    this.setState({
      nowData: d,
      userType: d.userType,
      // queryModalShow: true
    });
    this.props.actions.userinfoRecord(d);
    this.props.history.push("../NewUser/userinfoRecord");
    console.log("跳转页面的record带了哪些参数：", d);
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  //搜索 - 用户类型
  onSearchType(v) {
    this.setState({
      searchType: v
    });
  }

  //搜索 - 用户手机号
  onSearchMobile(e) {
    this.setState({
      searchMobile: e.target.value || []
    });
  }

  //搜索 - 用户真实姓名
  onSearchName(c) {
    this.setState({
      searchName: c.target.value
    });
  }

  //搜索 - 用户昵称
  onSearchNickName(e) {
    this.setState({
      searchNickName: e.target.value
    });
  }

  //搜索 - e家号
  onSearchEId(e) {
    this.setState({
      searchEId: e.target.value
    });
  }

  //搜索 - 健康大使Id
  onSearchId(e) {
    this.setState({
      searchId: e.target.value
    });
  }

  //搜索 - 经销商id
  onSearchDistributorId(e) {
    this.setState({
      searchDistributorId: e.target.value
    });
  }

  //搜索 - 健康大使昵称
  onSearchAmbassadorNickName(e) {
    this.setState({
      searchAmbassadorNickName: e.target.value
    });
  }

  //搜索 - 健康大使手机号
  onSearchAmbassadorMobile(e) {
    this.setState({
      searchAmbassadorMobile: e.target.value
    });
  }

  //搜索 - 健康大使真实姓名
  onSearchAmbassadorRealName(e) {
    this.setState({
      searchAmbassadorRealName: e.target.value
    });
  }

  // 搜索 - 开始时间变化
  searchBeginTime(v) {
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

  //搜索 - 开始绑定上级关系时间
  searchBindingBeginTimeChange(v) {
    this.setState({
      searchBindingBeginTime: _.cloneDeep(v)
    });
    console.log("这是什么：", v);
  }

  //搜索 - 结束绑定上级关系时间
  searchBindingEndTimeChange(v) {
    this.setState({
      searchBindingEndTime: _.cloneDeep(v)
    });
  }
  
  //搜索 - 创建开始时间
  searchCreateBeginChange(v) {
    this.setState({
      searchCreatebeginTime: _.cloneDeep(v)
    });
  }
  
  //搜索 - 创建结束时间
  searchCreateEndChange(v) {
    this.setState({
      searchCreateendTime: _.cloneDeep(v)
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
        title: "用户id",
        dataIndex: "eId",
        key: "eId"
      },
      {
        title: "用户昵称",
        dataIndex: "nickName",
        key: "nickName"
      },
      {
        title: "用户姓名",
        dataIndex: "realName",
        key: "realName"
      },
      {
        title: "用户手机号",
        dataIndex: "mobile",
        key: "mobile"
      },
      {
        title: "用户身份",
        dataIndex: "userType",
        key: "userType",
        render: text => this.getListByModelId(text)
      },
      {
        title:'创建时间',
        dataIndex:'createTime',
        key:'createTime'
      },
      {
        title:'绑定手机号时间',
        dataIndex:'bindPhoneTime',
        key:'bindPhoneTime',
      },
      {
        title: "绑定上级关系时间",
        dataIndex: "bindTime",
        key: "bindTime"
      },
      {
        title:'成为分销商时间',
        dataIndex:'incomeTime',
        key:'incomeTime'
      },
      {
        title: "健康大使id",
        dataIndex: "id",
        key: "id"
      },
      {
        title: "健康大使昵称",
        dataIndex: "nickName2",
        key: "nickName2"
      },
      {
        title: "健康大使姓名",
        dataIndex: "realName2",
        key: "realName2"
      },
      {
        title: "健康大使手机号",
        dataIndex: "mobile2",
        key: "mobile2"
      },
      {
        title: "健康大使身份",
        dataIndex: "userType2",
        key: "userType2",
        render: text => this.getListByModelId(text)
      },
      {
        title: "经销商id",
        dataIndex: "id2",
        key: "id2"
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
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
            <Tooltip placement="top" title="修改">
              <Icon type="edit" />
            </Tooltip>
          </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <a href="#/usermanage/userinfoRecord">
                <Tooltip placement="top" title="查看">
                  <Icon type="eye" />
                </Tooltip>
              </a>
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
        adminIp: item.adminIp,
        password: item.password,
        eId: item.id,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        age: item.age,
        conditions: item.conditions,
        creator: item.creator,
        description: item.description,
        incomeTime:item.incomeTime,//成为分销商时间
        email: item.email,
        orgCode: item.orgType,
        mobile: item.mobile,
        headImg: item.headImg,
        updateTime: item.updateTime,
        updater: item.updater,
        userName: item.userName,
        control: item.id,
        userId: item.eId,
        nickName: item.nickName,
        stationId: item.stationId,
        stationName: item.stationName,
        userType: item.userType,
        realName: item.realName,
        station:
          item.distributorAccount &&
          item.distributorAccount &&
          item.distributorAccount
            ? `${item.distributorAccount.province}/${
                item.distributorAccount.city
              }/${item.distributorAccount.region}`
            : "",
        province: item.distributorAccount
          ? item.distributorAccount.province
          : "",
        city: item.distributorAccount ? item.distributorAccount.city : "",
        region: item.distributorAccount ? item.distributorAccount.region : "",
        nickName2: item.ambassadorAccount
          ? item.ambassadorAccount.nickName
          : "",
        realName2: item.ambassadorAccount
          ? item.ambassadorAccount.realName
          : "",
        mobile2: item.ambassadorAccount ? item.ambassadorAccount.mobile : "",
        userType2: item.ambassadorAccount
          ? item.ambassadorAccount.userType
          : "",
        id: item.ambassadorAccount ? item.ambassadorAccount.id : "",
        id2: item.distributorAccount ? item.distributorAccount.id : "",
        nickName3: item.distributorAccount
          ? item.distributorAccount.nickName
          : "",
        realName3: item.distributorAccount
          ? item.distributorAccount.realName
          : "",
        mobile3: item.distributorAccount ? item.distributorAccount.mobile : "",
        userType3: item.distributorAccount
          ? item.distributorAccount.userType
          : "",
        userName3: item.distributorAccount
          ? item.distributorAccount.userName
          : "",
        createTime: item.createTime,//创建时间
        bindTime: item.bindTime,//绑定上级关系时间
        bindPhoneTime: item.bindPhoneTime,//绑定电话时间
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
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };

    const { searchEId } = this.state;
    const { searchNickName } = this.state;
    const { searchName } = this.state;
    const { searchMobile } = this.state;
    const { searchId } = this.state;
    const { searchAmbassadorNickName } = this.state;
    const { searchAmbassadorRealName } = this.state;
    const { searchAmbassadorMobile } = this.state;
    const { searchDistributorId } = this.state;
    const suffix = searchEId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix1 = searchNickName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix2 = searchName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null;
    const suffix3 = searchMobile ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;
    const suffix4 = searchId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty4()} />
    ) : null;
    const suffix5 = searchAmbassadorNickName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty5()} />
    ) : null;
    const suffix6 = searchAmbassadorRealName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty6()} />
    ) : null;
    const suffix7 = searchAmbassadorMobile ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty7()} />
    ) : null;
    const suffix8 = searchDistributorId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty8()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span style={{ marginRight: "4px", marginLeft: "28px" }}>
                用户id
              </span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix}
                value={searchEId}
                onChange={e => this.onSearchEId(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px", marginLeft: "28px" }}>
                用户姓名
              </span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix2}
                value={searchName}
                onChange={e => this.onSearchName(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px", marginLeft: "28px" }}>
                用户手机号
              </span>
              <Input
                onChange={e => this.onSearchMobile(e)}
                suffix={suffix3}
                value={searchMobile}
                style={{ width: "172px" }}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px", marginLeft: "28px" }}>
                用户身份
              </span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.onSearchType(e)}
              >
                <Option value={3}>分享用户</Option>
                <Option value={4}>普通用户</Option>
                <Option value={7}>分销商</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px", marginLeft: "23px" }}>
                创建时间
              </span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchCreateBeginChange(e)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchCreateEndChange(e)}
                onOk={onOk}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px", marginLeft: "23px" }}>
                绑定上级关系时间
              </span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchBindingBeginTimeChange(e)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchBindingEndTimeChange(e)}
                onOk={onOk}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px" }}>
                健康大使id
              </span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix4}
                value={searchId}
                onChange={e => this.onSearchId(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "4px", marginLeft: "29px" }}>
                经销商id
              </span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix8}
                value={searchDistributorId}
                onChange={e => this.onSearchDistributorId(e)}
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
              <Button
                icon="download"
                type="primary"
                style={{
                  color: "#fff",
                  backgroundColor: "#108ee9",
                  borderColor: "#108ee9"
                }}
                onClick={()=>this.onExport()}
              >
                导出
              </Button>
            </li>
          </ul>
        </div>
        <Alert
          showIcon={true}
          message="提示 : 经销商用户的健康大使为该经销商的推荐人（企业版子账户的健康大使为其企业版主账户），分销商/分享用户/普通用户的健康大使为该用户的直接上级"
          banner
        />
        <div className="system-table" style={{ marginTop: "2px" }}>
          <Table
            columns={this.makeColumns()}
            dataSource={this.makeData(this.state.data)}
            scroll={{ x: 2000 }}
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
        {/* 修改模态框 */}
        <Modal
          title="解绑手机号"
          visible={this.state.UpdateModalShow}
          onOk={() => this.onUpdateOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="修改手机号" {...formItemLayout}>
              {!! this.state.nowData ? this.state.nowData.mobile : ''}
              {getFieldDecorator("UpMobile", {
                initialValue: undefined,
                rules: [{ required: true, message: "请修改手机号" }]
              })(
                <Input
                  style={{ width: "100%" }}
                  placeholder="请修改手机号"
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
        findAdminUserByKeys,
        addAdminUserInfo,
        deleteAdminUserInfo,
        updateAdminUserInfo,
        findAllRole,
        findAllRoleByUserId,
        assigningRole,
        findAllOrganizer,
        findAllProvince,
        findCityOrCounty,
        findStationByArea,
        findUserInfo,
        myCustomers,
        onOk,
        userinfoRecord,
        ExportList
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
