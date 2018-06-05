/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import moment from "moment";
import _ from "lodash";

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
import { findUserInfo, detailRecord ,CardList} from "../../../../a_action/info-action";
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
      // total: 0, // 数据库总共多少条数据
      userId: "", // 获取用户id
      eId: "",
      addOrUp: "add", // 当前操作是新增还是修改
      citys: [], // 所有的省
      stations: [], // 当前服务站地区所对应的服务站
      searchBeginTime: "", //搜索 - 领取开始时间
      searchEndTime: "", //搜搜 - 领取结束时间
      searchCashId: "", //搜索 - 领取人id
      ticketCount:'' ,  //总共持有多少张优惠卡
      total:'',   //赠送出去多少张优惠卡
    };
  }

  componentDidMount() {
    // 现在组织结构写死的，暂时不用，但接口保留
    // if((!this.props.allOrganizer) || (!this.props.allOrganizer.length)) {
    //     this.getAllOrganizer();
    // }
      console.log("这是看优惠卡带的参数：", this.props.cardlist);
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


  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      userId:this.props.cardlist.mid2,
      userName: this.state.searchUserName,
      conditions: this.state.searchConditions,
      cashId: this.state.searchCashId,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59 `
        : "",
    };

    this.props.actions.CardList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.htlcBasePage.result || [],
          pageNum,
          pageSize,
          ticketCount:res.data.ticketCount || 0,   //累计持有的优惠卡数
          total: res.data.htlcBasePage.total || 0  //赠送总数
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
        SearchcashId: ""
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }
  
  // 搜索 - 开始时间
  searchBeginChange(v) {
    console.log("是什么：", v);
    this.setState({
      searchBeginTime: _.cloneDeep(v)
    });
  }
  
  // 搜索 - 结束时间
  searchEndChange(v) {
    this.setState({
      searchEndTime: _.cloneDeep(v)
    });
  }

  //搜索 - 开始绑定时间
  searchBindingBeginTimeChange(v) {
    this.setState({
      searchBindingBeginTime: v
    });
    console.log("这是什么：", v);
  }

  //搜索 - 结束绑定时间
  searchBindingEndTimeChange(v) {
    this.setState({
      searchBindingEndTime: v
    });
  }

  //搜索 - 领取人id
  onSearchCashId(e) {
    this.setState({
      searchCashId: e.target.value
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
        title: "优惠卡卡号",
        dataIndex:'ticketNo',
        key:'ticketNo'
      },
      {
        title: "领取人id",
        dataIndex:'id',
        key:'id'
      },
      {
        title: "领取人姓名",
        dataIndex:'realName',
        key:'realName'
      },
      {
        title: "领取人昵称",
        dataIndex:'nickName',
        key:'nickName'
      },
      {
        title: "领取人手机号",
        dataIndex:'mobile',
        key:'mobile'
      },
      {
        title: "领取时间",
        dataIndex:'receiveTime',
        key:'receiveTime'
      },
    ];
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    console.log("什么是DATA:", data);
    if (!data) {
      return [];
    }
    return data.map((item, index) => {
      return {
        key: index,
        adminIp: item.adminIp,
        password: item.password,
        ticketNo: item.ticketNo,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        receiveTime: item.receiveTime,
        id: (item.giveUserInfo) ? item.giveUserInfo.id : '',
        nickName: (item.giveUserInfo) ? item.giveUserInfo.nickName : '',
        mobile: (item.giveUserInfo) ? item.giveUserInfo.mobile : '',
        realName: (item.giveUserInfo) ? item.giveUserInfo.realName : '',
      };
    });
  }

  render(data) {
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

    const { searchCashId } = this.state;
    const suffix = searchCashId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;

      return (
      <div>
        <div className="detailsome" style={{height:'850px'}}>
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
          <span style={{fontSize:'20px',color:'#798ae0'}}>优惠卡统计</span>
        </div>
        <div className="system-search" style={{marginTop:'10px'}}>
          <ul className="search-ul" style={{ marginBottom: "10px" }}>
            <li>
              <span style={{ marginRight: "4px", marginLeft: "13px" }}>
                领取人id
              </span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix}
                value={searchCashId}
                onChange={e => this.onSearchCashId(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px", marginLeft: "7px" }}>
                领取时间
              </span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchBeginChange(e)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchEndChange(e)}
                onOk={onOk}
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
          </ul>
        </div>
        <div style={{fontSize:'15px',marginLeft:'15px',color:'black'}}>
          <span>累计持有<span style={{color:'firebrick',padding: '0px 5px'}}>{this.state.ticketCount}</span>张优惠卡</span>，<span>赠出<span style={{color:'firebrick',padding: '0px 5px'}}>{this.state.total}</span>张优惠卡</span>
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
  cardlist:P.array,
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
    cardlist:state.sys.cardlist,
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
        onOk,
        detailRecord,
        CardList
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
