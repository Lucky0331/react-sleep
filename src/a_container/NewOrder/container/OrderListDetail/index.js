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
  Layout,
  Menu,
  Icon,
  Input,
  Table,
  message,
  Radio,
  Select,
  Tooltip,
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
import { onOk,findOrderByWhere } from "../../../../a_action/shop-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
const { Header, Sider, Content } = Layout;
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      nowData: null, // 当前选中用户的信息，用于查看详情
      total: 1, // 数据库总共多少条数据
      userId: "", // 获取用户id
      pageSize:1,
      pageNum:1,
      citys: [], // 所有的省
      collapsed: false,
    };
  }

  componentDidMount() {
    console.log("这是我跳转详情带过来的参数：", this.props.orderdetail);
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
      this.props.orderdetail.payStatus, //支付状态
      this.props.orderdetail.payType, //支付方式
      this.props.orderdetail.payTime, //支付时间
      this.props.orderdetail.orderTime, //下单时间
      this.props.orderdetail.orderFrom, //订单来源
      this.props.orderdetail.mainOrder, //主订单号
      this.props.orderdetail.orderId, //子订单号
      this.props.orderdetail.refer, //云平台工单号
      this.props.orderdetail.userName, //用户id
      this.props.orderdetail.userIdentity, //用户身份
      this.props.orderdetail.completeTime, //订单完成时间
      this.props.orderdetail.activityType, //活动方式
      this.props.orderdetail.paymentNo, //流水号
      this.props.orderdetail.orderConsignee, //收货姓名
      this.props.orderdetail.orderPhone, //收货手机号
      this.props.orderdetail.orderAddress, //收货地址
      this.props.orderdetail.customerName, //安装工
      this.props.orderdetail.customerPhone, //安装工手机号
      this.props.orderdetail.customerAddress, //安装工服务站地区
      this.props.orderdetail.productName, //产品名称
      this.props.orderdetail.productType, //产品类型
      this.props.orderdetail.productModel, //产品型号
      this.props.orderdetail.count, //数量
      this.props.orderdetail.productPrice, //产品价格
      this.props.orderdetail.distributorId, //经销商id
      this.props.orderdetail.distributorIdentity, //经销商身份
      this.props.orderdetail.distributorcitys, //经销商身份
      this.props.orderdetail.userSaleIsIncome, //分销商是否有收益
      this.props.orderdetail.userSaleId, //分销商id
      this.props.orderdetail.orderStatus, //订单状态
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

  // 查询当前页面所需列表数据
  onGetData() {
    const params = {
      category: 2,
    };

    this.props.actions.findOrderByWhere(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
        });
      } else {
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
    payStatus: this.props.orderdetail.payStatus,//支付状态
    payType: this.props.orderdetail.payType,//支付方式
    payTime: this.props.orderdetail.payTime,//支付时间
    orderTime: this.props.orderdetail.orderTime,//下单时间
    orderFrom: this.props.orderdetail.orderFrom,//订单来源
    mainOrder: this.props.orderdetail.mainOrder,//主订单号
    orderId: this.props.orderdetail.orderId,//子订单号
    refer: this.props.orderdetail.refer,//云平台工单号
    userName: this.props.orderdetail.userName,//用户id
    userIdentity: this.props.orderdetail.userIdentity,//用户身份
    completeTime: this.props.orderdetail.completeTime,//订单完成时间
    activityType: this.props.orderdetail.activityType,//活动方式
    paymentNo: this.props.orderdetail.paymentNo,//流水号
    orderConsignee: this.props.orderdetail.orderConsignee,//收货姓名
    orderPhone: this.props.orderdetail.orderPhone,//收货手机号
    orderAddress:this.props.orderdetail.orderAddress,//收货地址
    customerName: this.props.orderdetail.customerName,//安装工姓名
    customerPhone: this.props.orderdetail.customerPhone,//安装工手机号
    customerAddress:this.props.orderdetail.customerAddress,//安装工服务站地区
    productName: this.props.orderdetail.productName,//产品名称
    productType:this.props.orderdetail.productType,//产品类型
    productModel: this.props.orderdetail.productModel,//产品型号
    count: this.props.orderdetail.count,//数量
    productPrice:this.props.orderdetail.productPrice,//产品价格
    subtotal:this.props.orderdetail.count && this.props.orderdetail.productPrice ? `${(this.props.orderdetail.count)*(this.props.orderdetail.productPrice)}` : '',//小计
    distributorId:this.props.orderdetail.distributorId,//经销商id
    distributorIdentity:this.props.orderdetail.distributorIdentity,//经销商身份
    distributorcitys:this.props.orderdetail.distributorcitys,//经销商省市区
    userSaleIsIncome:this.props.orderdetail.userSaleIsIncome,//分销商是否有收益
    userSaleId:this.props.orderdetail.userSaleId,//分销商id
    orderStatus:this.props.orderdetail.orderStatus,//订单状态
    };
  });
}
  
  // 构建字段 - 商品信息
  makeColumns() {
    const columns = [
      {
        title: "产品名称",
        dataIndex: "productName",
        key: "productName",
        width:400,
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
      },
      {
        title: "产品型号",
        dataIndex: "productModel",
        key: "productModel",
      },
      {
        title: "数量",
        dataIndex: "count",
        key: "count",
      },
      {
        title:'单价',
        dataIndex:'productPrice',
        key:'productPrice'
      },
      {
        title:'小计',
        dataIndex:'subtotal',
        key:'subtotal'
      },
    ];
    return columns;
  }
  
  // 构建字段 - 费用信息
  makeColumnsFree() {
    const columns = [
      {
        title: "商品合计",
      },
      {
        title: "运费",
      },
      {
        title: "活动优惠",
      },
      {
        title: "订单总金额",
      },
      {
        title:'实付款金额',
      },
    ];
    return columns;
  }
  
  // 构建字段 - 收益归属
  makeColumnsAscription() {
    const columns = [
      {
        title: "经销商id",
        dataIndex:'distributorId',
        key:'distributorId'
      },
      {
        title: "经销商身份",
        dataIndex:'distributorIdentity',
        key:'distributorIdentity'
      },
      {
        title: "服务站地区",
        dataIndex:'distributorcitys',
        key:'distributorcitys'
      },
      {
        title: "服务站名称",
      },
      {
        title:"分销商是否有收益",
        dataIndex:'userSaleIsIncome',
        key:'userSaleIsIncome'
      },
      {
        title:"分销商id",
        dataIndex:'userSaleId',
        key:'userSaleId'
      },
    ];
    return columns;
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
    
    return (
      <div style={{width:'100%',}}>
        <div className="detailsome">
        <div className="top">
          <Tooltip>
            <Icon
              type="left"
              style={{
                color: "black",
                marginTop: "5px",
                marginLeft: "10px",
                fontSize: "17px",
                marginRight: "-15px"
              }}
            />
          </Tooltip>
          <a href="#/order/orderlist" className="title" >订单详情</a>
        </div>
        <Alert
            showIcon={true}
            message="当前订单状态 :"
            banner
        />
        <div className="infomation">订单信息</div>
        <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px',}}>
          <Form style={{float:'left',width:'370px'}} className={"FormList"}>
            <FormItem label="主订单号" {...formItemLayout} style={{paddingLeft:'29px'}}>
              <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.mainOrder} </span>
            </FormItem>
            <FormItem label="子订单号" {...formItemLayout} style={{paddingLeft:'29px'}}>
              <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.orderId}</span>
            </FormItem>
            <FormItem label="云平台工单号" {...formItemLayout} style={{paddingLeft:'2px'}}>
              <span style={{marginLeft:'4px'}}>{ this.props.orderdetail.refer}</span>
            </FormItem>
            <FormItem label="下单时间" {...formItemLayout} style={{paddingLeft:'29px'}}>
              <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.orderTime}</span>
            </FormItem>
            <FormItem label="订单来源" {...formItemLayout} style={{paddingLeft:'29px'}}>
              <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.orderFrom }</span>
            </FormItem>
          </Form>
          <Form style={{float:'left',width:'370px'}} className={"FormList"}>
            <FormItem label="下单用户" {...formItemLayout} style={{paddingLeft:'42px'}}>
              <span style={{marginLeft:'-18px'}}>{ this.props.orderdetail.userName} </span>
            </FormItem>
            <FormItem label="下单用户身份" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span>{ this.props.orderdetail.userIdentity}</span>
            </FormItem>
            <FormItem label="订单完成时间" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span>{ this.props.orderdetail.completeTime }</span>
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout} style={{paddingLeft:'42px'}}>
              <span style={{marginLeft:'-16px'}}>{ this.props.orderdetail.activityType }</span>
            </FormItem>
          </Form>
          <Form style={{float:'right',width:'370px'}} className={"FormList"}>
            <FormItem label="支付方式" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-18px'}}>{ this.props.orderdetail.payType } </span>
            </FormItem>
            <FormItem label="支付状态" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-18px'}}>{ this.props.orderdetail.payStatus }</span>
            </FormItem>
            <FormItem label="支付时间" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-18px'}}>{ this.props.orderdetail.payTime } </span>
            </FormItem>
            <FormItem label="流水号" {...formItemLayout} style={{paddingLeft:'27px'}}>
              <span style={{marginLeft:'-27px'}}>{ this.props.orderdetail.paymentNo } </span>
            </FormItem>
          </Form>
        </div>
        <div className={this.props.orderdetail.productType == '健康评估' ? 'hide' :'show'}>
          <div>
          <div className="infomation">收货信息</div>
          <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px',}}>
            <Form style={{float:'left',width:'370px'}} className={"FormList"}>
              <FormItem label="收货人" {...formItemLayout} style={{paddingLeft:'42px'}}>
                <span style={{marginLeft:'-21px'}}>{ this.props.orderdetail.orderConsignee}</span>
              </FormItem>
              <FormItem label="联系方式" {...formItemLayout} style={{paddingLeft:'29px'}}>
                <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.orderPhone}</span>
              </FormItem>
              <FormItem label="收货地址" {...formItemLayout} style={{paddingLeft:'29px'}}>
                <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.orderAddress}</span>
              </FormItem>
            </Form>
          </div>
          </div>
          <div className={this.props.orderdetail.productType == '净水服务' ? 'block' :'none'} style={{marginLeft:'200px'}}>
          <div className="infomation">配送信息</div>
          <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px',}}>
            <Form style={{float:'left',width:'370px'}} className={"FormList"}>
              <FormItem label="安装工" {...formItemLayout} style={{paddingLeft:'42px'}}>
                <span style={{marginLeft:'-30px'}}>{ this.props.orderdetail.customerName} </span>
              </FormItem>
              <FormItem label="联系方式" {...formItemLayout} style={{paddingLeft:'29px'}}>
                <span style={{marginLeft:'-22px'}}>{ this.props.orderdetail.customerPhone}</span>
              </FormItem>
              <FormItem label="服务站地区" {...formItemLayout} style={{paddingLeft:'16px'}}>
                <span style={{marginLeft:'-13px'}}>{ this.props.orderdetail.customerAddress}</span>
              </FormItem>
            </Form>
          </div>
          </div>
          <div className={this.props.orderdetail.productType == '生物科技' || this.props.orderdetail.productType == '健康食品'? 'block' :'none'} style={{marginLeft:'200px'}}>
            <div className="infomation">配送信息</div>
            <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px',}}>
              <Form style={{float:'left',width:'370px'}} className={"FormList"}>
                <FormItem label="物流公司" {...formItemLayout} style={{paddingLeft:'42px'}}>
                  {/*<span style={{marginLeft:'-30px'}}>{ this.props.orderdetail.customerName} </span>*/}
                </FormItem>
                <FormItem label="配送单号" {...formItemLayout} style={{paddingLeft:'42px'}}>
                  {/*<span style={{marginLeft:'-22px'}}>{ this.props.orderdetail.customerPhone}</span>*/}
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
        <div className="infomation">商品信息</div>
          <Table
            columns={this.makeColumns()}
            dataSource={this.makeData(this.state.data)}
            pagination={{
              pageSize: this.state.pageSize,
              total:this.state.total,
              hideOnSinglePage:true,//只有一页展示的时候隐藏页码
            }}
            style={{marginTop:'20px'}}
          />
          <div className="infomation">费用信息</div>
          <Table
            columns={this.makeColumnsFree()}
            dataSource={this.makeData(this.state.data)}
            pagination={{
              pageSize: this.state.pageSize,
              total:this.state.total,
              hideOnSinglePage:true,//只有一页展示的时候隐藏页码
            }}
            style={{marginTop:'20px'}}
          />
          <div className="infomation">收益归属</div>
          <Table
            columns={this.makeColumnsAscription()}
            dataSource={this.makeData(this.state.data)}
            pagination={{
              pageSize: this.state.pageSize,
              total:this.state.total,
              hideOnSinglePage:true,//只有一页展示的时候隐藏页码
            }}
            style={{marginTop:'20px'}}
          />
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
  orderdetail: P.any
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
    orderdetail: state.sys.orderdetail
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
        findOrderByWhere
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
