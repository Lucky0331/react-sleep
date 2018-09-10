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
  Modal,
  Icon,
  Input,
  Row,
  Table,
  message,
  Radio,
  Select,
  Tooltip,
  Cascader
} from "antd";
import RoleTree from "../../../../a_component/roleTree"; // 角色树 用于选角色

// ==================
// 本页面所需action
// ==================

import {
  findAllProvince,
  findCityOrCounty,
} from "../../../../a_action/sys-action";
import {
  onOk,
  updateType,
  updateGoods,
  CheckupCard,
  updateOrderModel,
  findOrderByWhere,
  findProductTypeByWhere,
  findProductModelByWhere,
} from "../../../../a_action/shop-action";
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
      data2:[],//编辑按钮发起的请求的数据
      data3:[],//查看体检卡发起的请求的数据
      productTypes: [], //所有的产品类型
      productModels: [], // 所有的产品型号
      nowData: null, // 当前选中用户的信息，用于查看详情
      total: 1, // 数据库总共多少条数据
      userId: "", // 获取用户id
      upModalShow: false, // 修改订单型号信息模态框是否显示
      upGoodsModalShow: false, // 修改收货信息模态框是否显示
      queryCardShow:false,//查看体检卡模态框是否显示
      pageSize:1,
      pageNum:1,
      citys: [], // 所有的省
      collapsed: false,
      chargeNames:[],//计费方式数组
      chargeTypes: [], //所有的计费方式
      code: undefined, //产品类型所对应的code值
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
    this.getAllProductModel();// 获取所有的产品型号
    this.getAllProductType(); // 获取所有的产品类型
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
      this.props.orderdetail.orderAddressLast, //用户收货地址
      this.props.orderdetail.orderFee, //订单总金额
      this.props.orderdetail.discount,//活动优惠
      this.props.orderdetail.freight,//运费
      this.props.orderdetail.total,//商品合计
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
  
  // 工具 - 根据产品类型名称查产品类型ID
  findProductNameById(name) {
    const t = this.state.productTypes.find(
      item => String(item.name) === String(name)
    );
    return t ? t.id : '';
  }
  
  // 工具 - 根据产品型号ID查产品名称型号名称
  findProductModelByName(id) {
    const t = this.state.productModels.find(
        item => String(item.id) === String(id)
    );
    return t ? t.name : '';
  }
  
  // 工具 - 根据产品型号ID拿产品ID modelId就是这个
  findProductNames(id) {
    const t = this.state.data2.find((item)=> Number(item.productModel.id) === Number(id));
    return t ? t.id : "";
  }
  
  // 工具 - 根据产品型号名称查产品名称型号ID
  findProductModelById(name) {
    const t = this.state.productModels.find(
      item => String(item.name) === String(name)
    );
    return t ? t.id : '';
  }
  
  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductModelByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        console.log("这个有东西么:", res.data.modelList.result);
        if (res.status === "0") {
          this.setState({
            productModels: res.data.modelList.result,
            chargeTypes: res.data.chargeTypeList,
          });
        }
      });
  }
  
  //修改订单产品型号 - 模态框出现
  onUpdateClick(){
    const params = {
      typeCode:this.findProductNameById(this.props.orderdetail.productType),
      productPrice:this.props.orderdetail.productPrice,
    };
    this.props.actions.updateType(tools.clearNull(params)).then(res => {
      console.log('这里的data是什么',res.data)
      console.log('aaaa',res.data.map(item => (item.id))
      )
      if (res.status === "0") {
        this.setState({
          data2: res.data || [],
          productId:res.data.map(item => (item.id))
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
    const me = this;
    const {form} = me.props;
    form.setFieldsValue({
      formTypeId:String(this.findProductNameById(this.props.orderdetail.productType)),
      formName:this.props.orderdetail.productName,
      formTypeCode:Number.isInteger(this.props.orderdetail.productModel) ? String(this.props.orderdetail.productModel) : String(this.findProductModelById(this.props.orderdetail.productModel)),//型号id
      chargesTypes:this.props.orderdetail.feeType,
      upDateAddress:this.props.orderdetail.orderAddressLast,//收获地址
      upDateMobile:this.props.orderdetail.orderPhone,
      upDateName:this.props.orderdetail.orderConsignee,
      upDateSex:this.props.orderdetail.sex,//收货性别
    });
    me.setState({
      nowData:this.props.orderdetail,
      upModalShow:true,
      productType: this.props.orderdetail.productType,
    });
  }
  
  // 关闭修改某一条数据
  onUpNewClose() {
    this.setState({
      upModalShow: false,
      upGoodsModalShow:false
    });
  }
  
  //确定修改订单信息  一系列
  onUpOk() {
    const me = this;
    const { form } = me.props;
    console.log('这个me是什么',me)
    form.validateFields([
      "formTypeCode",
      "formName",
      "formId",
      "chargesTypes",
    ], (err, values) => {
      console.log('走到了吗',err, values)
      if (err) {
        return false;
      }
      me.setState({
        upLoading: true
      });
      const params = {
        orderId: me.state.nowData.orderId,//订单号
        modelId: values.formTypeCode,//产品型号id
        productId: this.findProductNames(values.formTypeCode),//产品类型id
        modelName: this.findProductModelByName(values.formTypeCode),//产品型号名称
        feeType: values.chargesTypes,//计费方式
      };
      this.props.actions
          .updateOrderModel(params)
          .then(res => {
            if (res.status === "0") {
              message.success("修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onUpNewClose();
            } else {
              message.error("产品已下架/修改产品价格不符");
              // message.error(res.message || "修改失败，请重试");
            }
            me.setState({
              upLoading: false
            });
          })
          .catch(() => {
            me.setState({
              upLoading: false
            });
          });
    });
  }
  
  //修改收货信息 - 模态框出现
  onUpdateGoodsClick(){
    const me = this;
    const {form} = me.props;
    form.setFieldsValue({
      upDateAddress:this.props.orderdetail.orderAddressLast,//收获地址
      upDateMobile:this.props.orderdetail.orderPhone,
      upDateName:this.props.orderdetail.orderConsignee,
      upDateSex:this.props.orderdetail.sex,//收货性别
    });
    me.setState({
      nowData:this.props.orderdetail,
      upGoodsModalShow:true,
      productType: this.props.orderdetail.productType,
    });
  }
  
  //查看体检卡 - 模态框出现
  onWatchClick(){
    const me = this;
    const params = {
      orderId:this.props.orderdetail.orderId,
    };
    this.props.actions.CheckupCard(tools.clearNull(params)).then(res => {
      console.log('data3是什么：',res.data)
      if (res.status === "0") {
        this.setState({
          data3: res.data || [],
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
    me.setState({
      queryCardShow:true,
    });
  }
  
  //确定修改收货信息
  onUpGoodsOk() {
    const me = this;
    const { form } = me.props;
    console.log('这个me是什么',me)
    form.validateFields([
      "upDateCitys",
      "upDateAddress",
      "upDateMobile",
      "upDateName",
      "upDateSex",
    ], (err, values) => {
      console.log('走到了吗',err, values)
      if (err) {
        return false;
      }
      me.setState({
        upLoading: true
      });
      let t = [] ;
      if(values.upDateCitys && values.upDateCitys.length){
        t = values.upDateCitys
      }else if(this.state.nowData.orderRegional){
        t = this.state.nowData.orderRegional.split('/')
      }
      
      const params = {
        id: me.state.nowData.orderId,//订单号
        contact: values.upDateName,//姓名
        mobile:values.upDateMobile,//手机号
        sex:values.upDateSex == '男' ? 1 : 2 ,//性别
        province:t[0],
        city:t[1],
        region:t[2],
        street:values.upDateAddress,
      };
      this.props.actions
          .updateGoods(params)
          .then(res => {
            if (res.status === "0") {
              message.success("修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onUpNewClose();
            } else {
              message.error(res.message || "修改失败，请重试");
            }
            me.setState({
              upLoading: false
            });
          })
          .catch(() => {
            me.setState({
              upLoading: false
            });
          });
    });
  }
  
  //取消订单按钮操作
  onCloseClick(){
    this.setState({
      queryCloseShow:true,
    })
  }
  
  //查看体检卡模态框操作
  onQueryClose(){
    this.setState({
      queryCloseShow: false,
      queryCardShow:false,
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
  
  // 选不同型号时重置计费方式
  Newproduct2(e) {
    const { form } = this.props;
    const t = this.state.data2.find((item)=>String(item.productModel.id) === String(e));
    console.log("这里那有什么:", e,t);
    if(t === undefined){
      message.error("产品已下架/修改产品价格不符",1.5);
    }else{
      form.resetFields(["chargesTypes"]); //计费方式的值
    }
    form.setFieldsValue({
      formName: t && t.name ? t.name : undefined,
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
    orderAddressLast:this.props.orderdetail.orderAddressLast,//用户收货地址
    orderFee:this.props.orderdetail.orderFee,//订单总金额
    discount:this.props.orderdetail.discount,//活动优惠
    freight:this.props.orderdetail.freight,//运费
    total:this.props.orderdetail.total,//商品合计
    };
  });
}

  //查看体检卡数据
  makeDataCard(data3){
    return data3.map((item,index)=>{
      return{
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        cardM:item
      }
    })
  }
  
  //查看体检卡字段
  makeColumnsCard(){
    const columns =[
      {
        title:'序号',
        dataIndex:'serial',
        key:'serial'
      },
      {
        title:'体检卡号',
        dataIndex:'cardM',
        key:'cardM',
      }
    ]
    return columns
  }
  
  // 构建字段 - 商品信息
  makeColumns() {
    const columns = [
      {
        title: "产品名称",
        dataIndex: "productName",
        key: "productName",
        width:320,
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
        width:240,
      },
      {
        title: "产品型号",
        dataIndex: "productModel",
        key: "productModel",
        width:260,
      },
      {
        title: "数量",
        dataIndex: "count",
        key: "count",
        width:260,
      },
      {
        title:'单价',
        dataIndex:'productPrice',
        key:'productPrice',
        width:240,
      },
      {
        title:'小计',
        dataIndex:'subtotal',
        key:'subtotal',
        width:240,
      },
    ];
    return columns;
  }
  
  // 构建字段 - 费用信息
  makeColumnsFree() {
    const columns = [
      {
        title: "商品合计",
        dataIndex:'total',
        key:'total',
        width:320,
      },
      {
        title: "运费",
        dataIndex:'freight',
        key:'freight',
        width:240,
      },
      {
        title: "活动优惠",
        dataIndex:'discount',
        key:'discount',
        width:260,
      },
      {
        title: "订单总金额",
        dataIndex:'orderFee',
        key:'orderFee',
        width:260,
      },
      {
        title:'实付款金额',
        dataIndex:'orderFee',
        key:'orderFee',
        width:240,
      },
      {
        title:' ',
        width:240,
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
        key:'distributorId',
        width:320,
      },
      {
        title: "经销商身份",
        dataIndex:'distributorIdentity',
        key:'distributorIdentity',
        width:240,
      },
      {
        title: "服务站地区",
        dataIndex:'distributorcitys',
        key:'distributorcitys',
        width:260,
      },
      {
        title: "服务站名称",
        width:260,
      },
      {
        title:"分销商是否有收益",
        dataIndex:'userSaleIsIncome',
        key:'userSaleIsIncome',
        width:240,
      },
      {
        title:"分销商id",
        dataIndex:'userSaleId',
        key:'userSaleId',
        width:240,
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
        <div className="nowList">
          <Icon type="exclamation-circle" />
          <span className="fontnow">当前订单状态:</span><span>{this.props.orderdetail.orderStatus}</span>
          <div style={{float:'right'}} className={this.props.orderdetail.productType == '健康评估' ? 'Updatehide' :'Updateshow'}>
            {/*<Button*/}
              {/*icon="close-circle-o"*/}
              {/*type="primary"*/}
              {/*onClick={() => this.onCloseClick()}*/}
              {/*style={{marginRight:'8px'}}*/}
            {/*>*/}
              {/*取消订单*/}
            {/*</Button>*/}
            <Button
              icon="edit"
              type="primary"
              onClick={() => this.onUpdateClick()}
              style={{marginRight:'8px'}}
            >
              修改型号
            </Button>
            <Button
              icon="setting"
              type="primary"
              onClick={() => this.onUpdateGoodsClick()}
              style={{marginRight:'8px'}}
            >
              修改收货信息
            </Button>
          </div>
          <div style={{float:'right'}} className={this.props.orderdetail.productType == '健康评估' ? 'Updateshow' :'Updatehide'}>
            <Button
              icon="eye"
              type="primary"
              onClick={() => this.onWatchClick()}
              style={{marginRight:'8px'}}
            >
              查看体检卡
            </Button>
          </div>
        </div>
        <div className="infomation">订单信息</div>
        <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px',}}>
          <Form style={{float:'left',width:'370px'}} className={"FormList"}>
            <FormItem label="主订单号" {...formItemLayout} style={{paddingLeft:'2px'}}>
              <span style={{marginLeft:'-45px'}}>{ this.props.orderdetail.mainOrder} </span>
            </FormItem>
            <FormItem label="子订单号" {...formItemLayout} style={{paddingLeft:'2px'}}>
              <span style={{marginLeft:'-45px'}}>{ this.props.orderdetail.orderId}</span>
            </FormItem>
            <FormItem label="云平台工单号" {...formItemLayout} style={{paddingLeft:'2px'}}>
              <span style={{marginLeft:'-17px'}}>{ this.props.orderdetail.refer}</span>
            </FormItem>
            <FormItem label="下单时间" {...formItemLayout} style={{paddingLeft:'2px'}}>
              <span style={{marginLeft:'-45px'}}>{ this.props.orderdetail.orderTime}</span>
            </FormItem>
            <FormItem label="订单来源" {...formItemLayout} style={{paddingLeft:'2px'}}>
              <span style={{marginLeft:'-45px'}}>{ this.props.orderdetail.orderFrom }</span>
            </FormItem>
          </Form>
          <Form style={{float:'left',width:'370px'}} className={"FormList"}>
            <FormItem label="下单用户" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-43px'}}>{ this.props.orderdetail.userName} </span>
            </FormItem>
            <FormItem label="下单用户身份" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-15px'}}>{ this.props.orderdetail.userIdentity}</span>
            </FormItem>
            <FormItem label="订单完成时间" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-15px'}}>{ this.props.orderdetail.completeTime }</span>
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-43px'}}>{ this.props.orderdetail.activityType }</span>
            </FormItem>
          </Form>
          <Form style={{float:'right',width:'370px'}} className={"FormList"}>
            <FormItem label="支付方式" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-40px'}}>{ this.props.orderdetail.payType } </span>
            </FormItem>
            <FormItem label="支付状态" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-40px'}}>{ this.props.orderdetail.payStatus }</span>
            </FormItem>
            <FormItem label="支付时间" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-40px'}}>{ this.props.orderdetail.payTime } </span>
            </FormItem>
            <FormItem label="流水号" {...formItemLayout} style={{paddingLeft:'14px'}}>
              <span style={{marginLeft:'-53px'}}>{ this.props.orderdetail.paymentNo } </span>
            </FormItem>
          </Form>
        </div>
        <div className={this.props.orderdetail.productType == '健康评估' ? 'hide' :'show'}>
          <div>
          <div className="infomation">收货信息</div>
          <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px',}}>
            <Form style={{float:'left',width:'370px'}} className={"FormList"}>
              <FormItem label="收货人" {...formItemLayout} style={{paddingLeft:'29px'}}>
                <span style={{marginLeft:'-52px'}}>{ this.props.orderdetail.orderConsignee}</span>
              </FormItem>
              <FormItem label="联系方式" {...formItemLayout} style={{paddingLeft:'29px'}}>
                <span style={{marginLeft:'-38px'}}>{ this.props.orderdetail.orderPhone}</span>
              </FormItem>
              <FormItem label="收货地址" {...formItemLayout} style={{paddingLeft:'29px'}}>
                <span style={{marginLeft:'-40px'}}>{ this.props.orderdetail.orderAddress}</span>
              </FormItem>
            </Form>
          </div>
          </div>
          <div className={this.props.orderdetail.productType == '净水服务' ? 'block' :'none'} style={{marginLeft:'200px'}}>
          <div className="infomation">配送信息</div>
          <div className="system-table" style={{ display: 'inline-flex',border:'none',margin:'10px 0px 0px 52px'}}>
            <Form style={{float:'left',width:'370px'}} className={"FormList"}>
              <FormItem label="安装工" {...formItemLayout} style={{paddingLeft:'16px'}}>
                <span style={{marginLeft:'-55px'}}>{ this.props.orderdetail.customerName} </span>
              </FormItem>
              <FormItem label="联系方式" {...formItemLayout} style={{paddingLeft:'16px'}}>
                <span style={{marginLeft:'-41px'}}>{ this.props.orderdetail.customerPhone}</span>
              </FormItem>
              <FormItem label="服务站地区" {...formItemLayout} style={{paddingLeft:'16px'}}>
                <span style={{marginLeft:'-27px'}}>{ this.props.orderdetail.customerAddress}</span>
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
        {/* 编辑模态框 */}
        <Modal
          title="修改收货信息"
          visible={this.state.upGoodsModalShow}
          onOk={() => this.onUpGoodsOk()}
          onCancel={() => this.onUpNewClose()}
          confirmLoading={this.state.upLoading}
          wrapClassName={"list"}
        >
          <Form>
            <FormItem label="收货人姓名" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("upDateName", {
                initialValue: undefined,
                rules: [
                  { max: 12, message: "最多输入12个字" }
                ]
              })(<Input placeholder="请输入收货人姓名" />)}
            </FormItem>
            <FormItem label="收货人性别" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("upDateSex", {
                initialValue: true,
              })(
                <Select placeholder="请选择收货人性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="收货人手机号" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("upDateMobile", {
                initialValue: undefined,
                rules: [{whitespace: true,min: 11,max: 11}]
              })(<Input placeholder="请输入收货人手机号" />)}
            </FormItem>
            <FormItem label="收货省市区" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span style={{ color: "#888" }}>
                {!!this.state.nowData ? this.state.nowData.orderRegional : ''}
              </span>
              {getFieldDecorator("upDateCitys", {
                initialValue: undefined,
              })(
                <Cascader
                  placeholder="请选择服务区域"
                  options={this.state.citys}
                  loadData={e => this.getAllCitySon(e)}
                />
              )}
            </FormItem>
            <FormItem label="收货地址" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("upDateAddress", {
                initialValue: undefined,
              })(<Input placeholder="请输入收货地址" />)}
            </FormItem>
          </Form>
        </Modal>
        {/* 编辑模态框 */}
        <Modal
          title="修改商品信息"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpNewClose()}
          confirmLoading={this.state.upLoading}
          wrapClassName={"list"}
        >
          <Form>
            <FormItem label="产品名称" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formName", {
                initialValue: undefined,
              })(
                  <Input disabled={true}/>
              )}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formTypeId", {
                initialValue: undefined,
              })(
                <Select
                  disabled={true}
                >
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={String(item.id)}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formTypeCode", {
                initialValue: undefined,
              })(
                <Select placeholder="请选择产品型号" onChange={e => this.Newproduct2(e)}>
                  {(() => {
                    const id = String(form.getFieldValue("formTypeId"));
                    return this.state.productModels.filter(item => String(item.typeId) === id).map((item, index) => (
                      <Option key={index} value={String(item.id)}>
                        {item.name}
                      </Option>
                    ))
                  })()
                  }
                </Select>
              )}
            </FormItem>
            <Row>
              <FormItem
                label="计费方式" {...formItemLayout}  labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}
                className={
                  this.props.orderdetail.productType == "健康食品" || this.props.orderdetail.productType == "生物科技" || this.props.orderdetail.productType == "健康评估"  ? "hide" : ""
                }
              >
                {getFieldDecorator("chargesTypes", {
                  initialValue: undefined,
                  rules: [{ required: (()=>{
                  const type = form.getFieldValue("formTypeId");
                  return Number(type) === 1;
                  })(), message: "请选择计费方式" }]
                })(
                  <RadioGroup>
                    {(()=>{
                      const type = form.getFieldValue("formTypeCode");
                      console.log("===", type,this.state.data2);
                      const t = this.state.data2.find((item)=>String(item.productModel.id) === String(type));
                      console.log("AAAAAAAAA:", t);
                      if(t && t.productModel && t.productModel.chargeTypes){
                        return t.productModel.chargeTypes.map((item, index) => {
                          return (
                            <Radio key={index} value={item.feeType}>
                              {item.chargeName}
                            </Radio>
                          );
                        })
                      }
                      return null;
                    })()}
                  </RadioGroup>
                )}
              </FormItem>
            </Row>
          </Form>
        </Modal>
        {/*取消按钮的点击模态框*/}
        <Modal
          title="取消订单"
          visible={this.state.queryCloseShow}
          onOk={() => this.onQueryClose()}
          onCancel={() => this.onQueryClose()}
          wrapClassName={"list"}
        >
          <Form>
            <FormItem
              label="退款方式"
              {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
            >
              <RadioGroup onChange={this.onChange} style={{marginTop:'4px'}}>
                <Radio style={{display: 'block',height: '30px',lineHeight: '30px'}} value={1}>线下退款</Radio>
                <Radio style={{display: 'block',height: '30px',lineHeight: '30px'}} value={2}>资金原路返还</Radio>
                <Radio style={{display: 'block',height: '30px',lineHeight: '30px'}} value={3}>无需退款</Radio>
              </RadioGroup>
            </FormItem>
          </Form>
        </Modal>
        {/*点击查看体检卡模态框*/}
        <Modal
          title="查看体检卡"
          visible={this.state.queryCardShow}
          onCancel={() => this.onQueryClose()}
          onOk={() => this.onQueryClose()}
        >
          <Table
            columns={this.makeColumnsCard()}
            dataSource={this.makeDataCard(this.state.data3)}
            pagination={{
              hideOnSinglePage:true
            }}
          />
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
        onOk,
        updateType,
        CheckupCard,
        updateGoods,
        findAllProvince,
        findCityOrCounty,
        updateOrderModel,
        findOrderByWhere,
        findProductTypeByWhere,
        findProductModelByWhere,
      },
      dispatch
    )
  })
)(WrappedHorizontalManager);
