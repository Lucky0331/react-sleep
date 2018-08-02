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
import { findUserInfo, myCustomers } from "../../../../a_action/info-action";
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
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      userId: "", // 获取用户id
      eId: "",
      addOrUp: "add", // 当前操作是新增还是修改
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
    };
  }

  componentDidMount() {
    // 现在组织结构写死的，暂时不用，但接口保留
    // if((!this.props.allOrganizer) || (!this.props.allOrganizer.length)) {
    //     this.getAllOrganizer();
    // }
    console.log("这是我要查看详情所带的参数：", this.props.detail);
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
    this.onGetData(
     this.state.pageNum,
     this.state.pageSize,
     this.props.detail.mid2,
     this.props.detail.realName2,
     this.props.detail.userName2,
     this.props.detail.province,
     this.props.detail.region,
     this.props.detail.bindTime,
     this.props.detail.bindPhoneTime,
     this.props.detail.mid,
     this.props.detail.realName,
     this.props.detail.mobile,
     this.props.detail.city2,
     this.props.detail.mobile2,
     this.props.detail.nickName2,
     this.props.detail.userType2
    );
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
      category: 1,
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

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchEId: ""
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
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

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
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
        province:this.props.detail.province,
        city: this.props.detail.city,
        region: this.props.detail.region,
        nickName2: this.props.detail.nickName2,
        realName2: this.props.detail.realName2,
        mobile2: this.props.detail.mobile2,
        userType2: this.props.detail.userType2,
        userName2: this.props.detail.userName,
        mid2: this.props.detail.mid2,
        bindTime: this.props.detail.bindTime,
        bindPhoneTime: this.props.detail.bindPhoneTime,
        province2: this.props.detail.province2,
        city2: this.props.detail.city2,
        region2: this.props.detail.region2,
        mid: this.props.detail.mid,
        nickName: this.props.detail.nickName,
        realName: this.props.detail.realName,
        mobile: this.props.detail.mobile,
        userName: this.props.detail.userName,
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
        sm: { span: 9 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 }
      }
    };


    return (
      <div style={{width:'100%'}}>
        <div className="detailsome">
        <div className="top">
          <a href="#/usermanage/dealerinfo" className="title" >经销商信息管理</a>
          <Tooltip>
          <Icon
            type="right"
            style={{
              color: "black",
              marginTop: "5px",
              marginLeft: "3px",
              fontSize: "17px"
            }}
          />
          </Tooltip>
          <span style={{fontSize:'20px',color:'#798ae0'}}>详情</span>
        </div>
        <div className="system-table" style={{ display: 'inline-flex',border:'none',padding:'10px 0px 10px 70px'}}>
          <Form style={{float:'left',width:'320px'}}>
            <FormItem label="经销商id" {...formItemLayout} style={{paddingLeft:'29px'}}>
              <span style={{marginLeft:'-13px'}}>{ this.props.detail.mid2} </span>
            </FormItem>
            <FormItem label="经销商姓名" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span>{ this.props.detail.realName2}</span>
            </FormItem>
            <FormItem label="经销商账户" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span>{ this.props.detail.userName2}</span>
            </FormItem>
            <FormItem label="经销商所在省" {...formItemLayout}>
              <span style={{marginLeft:'7px'}}>{ this.props.detail.province }</span>
            </FormItem>
            <FormItem label="经销商所在区" {...formItemLayout}>
              <span style={{marginLeft:'7px'}}>{ this.props.detail.region }</span>
            </FormItem>
            <FormItem label="绑定手机号时间" {...formItemLayout} style={{marginLeft:'-13px'}}>
              <span style={{marginLeft:'13px'}}>{ this.props.detail.bindPhoneTime }</span>
            </FormItem>
            <FormItem label="健康大使id" {...formItemLayout} style={{paddingLeft:'17px'}}>
              <span>{ this.props.detail.mid} </span>
            </FormItem>
            <FormItem label="健康大使姓名" {...formItemLayout}>
              <span style={{marginLeft:'4px'}}>{ this.props.detail.realName} </span>
            </FormItem>
            <FormItem label="健康大使手机号" {...formItemLayout} style={{marginLeft:'-13px'}}>
              <span style={{marginLeft:'13px'}}>{ this.props.detail.mobile} </span>
            </FormItem>
            <FormItem label="推荐人所在市" {...formItemLayout} >
              <span style={{marginLeft:'6px'}}>{ this.props.detail.city2} </span>
            </FormItem>
            <FormItem label="推荐人所在区" {...formItemLayout}>
              <span style={{marginLeft:'6px'}}>{ this.props.detail.region2 }</span>
            </FormItem>
          </Form>
          <Form style={{float:'right',width:'320px',marginLeft:'10px'}}>
            <FormItem label="经销商昵称" {...formItemLayout} style={{paddingLeft:'12px'}}>
              <span style={{marginLeft:'-7px'}}>{ this.props.detail.nickName2 } </span>
            </FormItem>
            <FormItem label="经销商手机号" {...formItemLayout}>
              <span>{ this.props.detail.mobile2 } </span>
            </FormItem>
            <FormItem label="经销商身份" {...formItemLayout} style={{paddingLeft:'12px'}}>
              <span style={{marginLeft:'-7px'}}>{this.getListByModelId(this.props.detail.userType2)}</span>
            </FormItem>
            <FormItem label="经销商所在市" {...formItemLayout}>
              <span>{ this.props.detail.city }</span>
            </FormItem>
            <FormItem label="创建时间" {...formItemLayout} style={{paddingLeft:'28px'}}>
              <span style={{marginLeft:'-19px'}}>{ this.props.detail.createTime }</span>
            </FormItem>
            <FormItem label="绑定上级关系时间" {...formItemLayout} style={{marginLeft:'-26px'}}>
              <span style={{marginLeft:'15px'}}>{ this.props.detail.bindTime }</span>
            </FormItem>
            <FormItem label="绑定经销商账号时间" {...formItemLayout} style={{marginLeft:'-42px'}}>
              <span style={{marginLeft:'25px'}}>{ this.props.detail.bindTime }</span>
            </FormItem>
            <FormItem label="健康大使昵称" {...formItemLayout}>
              <span>{ this.props.detail.nickName }</span>
            </FormItem>
            <FormItem label="推荐人账户" {...formItemLayout} style={{paddingLeft:'12px'}}>
              <span style={{marginLeft:'-7px'}}>{ this.props.detail.userName }</span>
            </FormItem>
            <FormItem label="推荐人所在省" {...formItemLayout}>
              <span>{ this.props.detail.province2 }</span>
            </FormItem>
          </Form>
        </div>
       </div>
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
  citys: P.array,
  detail: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
  state => ({
    allRoles: state.sys.allRoles,
    allOrganizer: state.sys.allOrganizer,
    citys: state.sys.citys,
    detail: state.sys.detail
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
        onOk
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
