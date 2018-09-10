/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import { bindActionCreators } from "redux";
import P from "prop-types";
import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  Modal,
  Tooltip,
  Alert,
  Row,
  Select,
  Divider,
  Cascader,
  DatePicker,
  Radio
} from "antd";
import "./index.scss";
import Config from "../../../../config/config";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  findAllProvince,
  findCityOrCounty,
  findOrderByWhere,
  OrderListDetail,
  findProductTypeByWhere,
  findProductModelByWhere,
  updateType,
  updateOrderModel,
  updateGoods,
  onChange,
  onOk
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      data2:[],//编辑按钮发起的请求的数据
      productTypes: [], //所有的产品类型
      productModels: [], // 所有的产品型号
      searchProductName: "", // 搜索 - 产品名称
      searchModelId: "", // 搜索 - 产品型号
      searchproductType: "", //搜索 - 产品类型
      searchMinPrice: undefined, // 搜索 - 最小价格
      searchMaxPrice: undefined, // 搜索- 最大价格
      searchBeginTime: "", // 搜索 - 开始时间
      searchEndTime: "", // 搜索- 结束时间
      searchPayBeginTime:"",//搜索 - 支付开始时间
      searchPayEndTime:"",//搜索 - 支付结束时间
      searchAddress: [], // 搜索 - 地址
      searchDealerAddress:[],//搜索 - 经销商省市区
      searchorderFrom: "", //搜索 - 订单来源
      searchName: "", // 搜索 - 状态
      searchPayType: "", //搜索 - 支付类型
      searchConditions: "", //搜索 - 订单状态
      searchorderNo: "", //搜索 - 子订单号
      searchMainOrderId:"", //搜索 - 主订单号
      searchPersonName:'',//搜索 - 收货姓名
      searchPersonMobile:'',//搜索 - 收货手机号
      searchuserSaleFlag:"",//搜索 - 分销商是否享有收益
      searchUserType: "", //搜索 - 用户类型
      searchUserName: "", //搜索 - 经销商账户
      searchRefer: "", // 搜索 -云平台工单号查询
      searchAmbassadorId: "", //搜索 - 经销商id
      searchDistributorId: "", // 搜索 - 分销商id
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改订单型号信息模态框是否显示
      upGoodsModalShow: false, // 修改收货信息模态框是否显示
      upLoading: false, // 是否正在修改用户中
      ListLoading:false,//订单列表数据多加载
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      citys: [],// 符合Cascader组件的城市数据
      chargeNames:[],//计费方式数组
      chargeTypes: [], //所有的计费方式
      code: undefined, //产品类型所对应的code值
      value: 1,
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
    this.getAllProductModel();// 获取所有的产品型号
    this.getAllProductType(); // 获取所有的产品类型
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

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      isPay: this.state.searchName,
      payType: this.state.searchPayType,
      activityType: this.state.searchActivity,
      conditions: this.state.searchConditions,
      distributorId: this.state.searchAmbassadorId.trim(),
      partId: this.state.searchDistributorId.trim(),
      userType: this.state.searchUserType,
      userSaleFlag:this.state.searchuserSaleFlag,
      userName: this.state.searchUserName.trim(),
      productName: this.state.searchProductName,
      modelId: this.state.searchModelId,
      refer: this.state.searchRefer.trim(),
      typeCode: this.state.searchproductType,
      orderFrom: this.state.searchorderFrom,
      mainOrderNo:this.state.searchMainOrderId.trim(),//主订单号查询
      orderConsignee:this.state.searchPersonName,//收货姓名
      orderPhone:this.state.searchPersonMobile.trim(),//收货手机号
      orderNo: this.state.searchorderNo.trim(),
      province: this.state.searchAddress[0],//用户收货地区查询
      city: this.state.searchAddress[1],//用户收货地区查询
      region: this.state.searchAddress[2],//用户收货地区查询
      distributorProvince: this.state.searchDealerAddress[0],//经销商省市区
      distributorCity: this.state.searchDealerAddress[1],//经销商省市区
      distributorRegion: this.state.searchDealerAddress[2],//经销商省市区
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : "",
      payBeginTime: this.state.searchPayBeginTime
        ? `${tools.dateToStr(this.state.searchPayBeginTime.utc()._d)}`
        : "",
      payEndTime: this.state.searchPayEndTime
        ? `${tools.dateToStr(this.state.searchPayEndTime.utc()._d)}`
        : ""
    };
    this.props.actions.findOrderByWhere(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total,
          ListLoading:true,
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
      this.setState({
        ListLoading: false
      });
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

  // 工具 - 根据产品类型名称查产品类型ID
  findProductNameById(name) {
    const t = this.state.productTypes.find(
      item => String(item.name) === String(name)
    );
    return t ? t.id : '';
  }
  
  // 工具 - 根据产品型号名称查产品名称型号ID
  findProductModelById(name) {
    const t = this.state.productModels.find(
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
  
  // 工具 - 根据ID获取用户来源名字
  getListByModelId(id) {
    switch (String(id)) {
      case "1":
        return "终端App";
      case "2":
        return "微信公众号";
      case "3":
        return "经销商App";
      default:
        return "";
    }
  }

  // 工具 - 根据ID获取支付方式
  getBypayType(id) {
    switch (String(id)) {
      case "1":
        return "微信支付";
      case "2":
        return "支付宝支付";
      case "3":
        return "银联支付";
      default:
        return "";
    }
  }

  //工具 - 根据活动类型id获取活动名称
  getActivity(id) {
    switch (String(id)) {
      case "1":
        return "普通产品";
      case "2":
        return "活动产品";
      default:
        return "";
    }
  }

  //产品类型所对应的公司
  Productcompany(id) {
    switch (String(id)) {
      case "1":
        return "翼猫科技发展（上海）有限公司";
      case "2":
        return "上海养未来健康食品有限公司";
      case "3":
        return "上海翼猫生物科技有限公司";
      case "5":
        return "上海翼猫智能科技有限公司";
    }
  }

  //工具
  getCity(s, c, q) {
    if (!s) {
      return "";
    }
    return `${s}/${c}/${q}`;
  }

  //工具 - 用户具体收货地体
  getAddress(s, c, q, x) {
    if (!s) {
      return "";
    }
    return `${s}${c}${q}${x}`;
  }

  //搜索 - 支付状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  //搜索 - 支付方式输入框值改变时触发
  searchPayTypeChange(e) {
    this.setState({
      searchPayType: e
    });
  }

  //搜索 - 订单状态改变时触发
  searchConditionsChange(e) {
    this.setState({
      searchConditions: e
    });
  }

  //搜索 - 子订单号
  searchOrderNoChange(e) {
    this.setState({
      searchorderNo: e.target.value
    });
    console.log("e是什么；", e.target.value);
  }
  
  //搜索 - 主订单号
  searchMainOrderChange(e){
    this.setState({
      searchMainOrderId:e.target.value
    })
  }

  //搜索 - 云平台工单号
  searchReferChange(e) {
    this.setState({
      searchRefer: e.target.value
    });
  }

  //搜索 - 用户账号
  searchUserNameChange(e) {
    this.setState({
      searchUserName: e.target.value
    });
  }

  //搜索 - 经销商id
  searchAmbassadorId(e) {
    this.setState({
      searchAmbassadorId: e.target.value
    });
  }

  //搜索 - 分销商id
  searchDistributorId(e) {
    this.setState({
      searchDistributorId: e.target.value
    });
  }

  //搜索 - 活动类型
  searchActivityType(v) {
    this.setState({
      searchActivity: v
    });
  }

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchorderNo: ""
    });
  }

  emitEmpty1() {
    this.setState({
      searchRefer: ""
    });
  }

  emitEmpty2() {
    this.setState({
      searchUserName: ""
    });
  }

  emitEmpty3() {
    this.setState({
      searchAmbassadorId: ""
    });
  }

  emitEmpty4() {
    this.setState({
      searchDistributorId: ""
    });
  }

  emitEmpty5() {
    this.setState({
      searchMinPrice: ""
    });
  }

  emitEmpty6() {
    this.setState({
      searchMaxPrice: ""
    });
  }
  
  emitEmpty7() {
    this.setState({
      searchMainOrderId: ""
    });
  }
  
  emitEmpty8() {
    this.setState({
      searchPersonName: ""
    });
  }
  
  emitEmpty9() {
    this.setState({
      searchPersonMobile: ""
    });
  }

  // 点击查看地区模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields(["addnewCitys"]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
      addnewModalShow: true
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

  // 搜索 - 产品类型输入框值改变时触发
  searchProductTypesChange(e) {
    this.setState({
      searchproductType: e
    });
  }

  // 搜索 - 用户收货地区输入框值改变时触发
  onSearchAddress(c) {
    this.setState({
      searchAddress: c
    });
  }
  
  // 搜索 - 经销商省市区输入框值改变时触发
  onSearchDealerAddress(c) {
    this.setState({
      searchDealerAddress: c
    });
  }

  // 搜索 - 订单来源输入框值改变时触发
  onSearchorderFrom(v) {
    this.setState({
      searchorderFrom: v
    });
  }

  //搜索 - 用户类型
  searchUserType(v) {
    this.setState({
      searchUserType: v
    });
  }

  // 搜索 - 最小价格变化
  searchMinPriceChange(v) {
    this.setState({
      searchMinPrice: v.target.value
    });
  }

  // 搜索 - 最大价格变化
  searchMaxPriceChange(e) {
    this.setState({
      searchMaxPrice: e.target.value
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
  
  // 搜索 - 支付开始时间变化
  searchPayBeginTimeChange(v) {
    console.log("是什么：", v);
    this.setState({
      searchPayBeginTime: _.cloneDeep(v)
    });
  }

  // 搜索 - 支付结束时间变化
  searchPayEndTimeChange(v) {
    this.setState({
      searchPayEndTime: _.cloneDeep(v)
    });
  }
  
  //收货人姓名
  searchPersonNameChange(v){
    this.setState({
      searchPersonName: v.target.value
    });
  }
  
  //收货人手机号码
  searchPersonMobileChange(v){
    this.setState({
      searchPersonMobile: v.target.value
    });
  }
  
  //分销商是否享受收益
  searchuserSaleFlagChange(e){
    this.setState({
      searchuserSaleFlag:e
    })
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
  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  //导出
  onExport() {
    this.onExportData(this.state.pageNum, this.state.pageSize);
  }

  //导出的数据字段
  onExportData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      isPay: this.state.searchName,
      payType: this.state.searchPayType,
      activityType: this.state.searchActivity,
      conditions: this.state.searchConditions,
      distributorId: this.state.searchAmbassadorId,
      partId: this.state.searchDistributorId,
      userType: this.state.searchUserType,
      userSaleFlag:this.state.searchuserSaleFlag,
      userName: this.state.searchUserName,
      productName: this.state.searchProductName,
      modelId: this.state.searchModelId,
      orderConsignee:this.state.searchPersonName,//收货姓名
      orderPhone:this.state.searchPersonMobile.trim(),//收货手机号
      refer: this.state.searchRefer.trim(),
      typeCode: this.state.searchproductType,
      orderFrom: this.state.searchorderFrom,
      orderNo: this.state.searchorderNo.trim(),
      province: this.state.searchAddress[0],
      city: this.state.searchAddress[1],
      region: this.state.searchAddress[2],
      distributorProvince: this.state.searchDealerAddress[0],//经销商省市区
      distributorCity: this.state.searchDealerAddress[1],//经销商省市区
      distributorRegion: this.state.searchDealerAddress[2],//经销商省市区
      minPrice: this.state.searchMinPrice,
      maxPrice: this.state.searchMaxPrice,
      beginTime: this.state.searchBeginTime
        ? `${tools.dateToStr(this.state.searchBeginTime.utc()._d)}`
        : "",
      endTime: this.state.searchEndTime
        ? `${tools.dateToStr(this.state.searchEndTime.utc()._d)}`
        : "",
      payBeginTime: this.state.searchPayBeginTime
        ? `${tools.dateToStr(this.state.searchPayBeginTime.utc()._d)}`
        : "",
      payEndTime: this.state.searchPayEndTime
        ? `${tools.dateToStr(this.state.searchPayEndTime.utc()._d)}`
        : ""
    };
    tools.download(tools.clearNull(params),`${Config.baseURL}/manager/export/order/list`,'post', '订单列表.xls');
  }
  
  //修改订单产品型号 - 模态框出现
  onUpdateClick(record){
    const params = {
      typeCode:this.findProductNameById(record.productType),
      productPrice:record.productPrice,
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
    console.log("fuzhi:", record.productModel, this.findProductModelById(record.productModel));
    form.setFieldsValue({
      formTypeId:String(this.findProductNameById(record.productType)),
      formName:record.productName,
      formTypeCode:Number.isInteger(record.productModel) ? String(record.productModel) : String(this.findProductModelById(record.productModel)),//型号id
      chargesTypes:record.feeType,
      upDateAddress:record.orderAddressLast,//收获地址
      upDateMobile:record.orderPhone,
      upDateName:record.orderConsignee,
      upDateSex:record.sex,//收货性别
    });
    me.setState({
      nowData:record,
      upModalShow:true,
      productType: record.productType,
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
        // modelId:Number.isInteger(values.formTypeCode) ? values.formTypeCode : this.findProductModelById(values.formTypeCode),//产品型号id
        // productId: Number.isInteger(values.formTypeId) ? String(values.productModel) : String(this.findProductModelById(values.productModel)),//产品类型id
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
 
  // 关闭修改某一条数据
  onUpNewClose() {
    this.setState({
      upModalShow: false,
      upGoodsModalShow:false
    });
  }
  
  //修改收货信息 - 模态框出现
  onUpdateGoodsClick(record){
    const me = this;
    const {form} = me.props;
    form.setFieldsValue({
      upDateAddress:record.orderAddressLast,//收获地址
      upDateMobile:record.orderPhone,
      upDateName:record.orderConsignee,
      upDateSex:record.sex,//收货性别
    });
    me.setState({
      nowData:record,
      upGoodsModalShow:true,
      productType: record.productType,
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
  
  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
    const d = _.cloneDeep(record);
    this.setState({
      nowData: d,
      productType: d.productType,
      queryModalShow: true
    });
    this.props.actions.OrderListDetail(d);
    this.props.history.push("../NewOrder/OrderListDetail");
    console.log("订单净水服务详情有哪些参数：", d);
  }
  
  //取消订单按钮操作
  onCloseClick(){
    this.setState({
      queryCloseShow:true,
    })
  }
  
  onQueryClose(){
    this.setState({
      queryCloseShow: false
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
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
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 80
      },
      {
        title:'主订单号',
        dataIndex:'mainOrder',
        key:'mainOrder'
      },
      {
        title: "子订单号",
        dataIndex: "orderId",
        key: "orderId"
      },
      {
        title: "云平台工单号",
        dataIndex: "refer",
        key: "refer"
      },
      {
        title: "订单来源",
        dataIndex: "orderFrom",
        key: "orderFrom",
      },
      {
        title: "订单状态",
        dataIndex: "orderStatus",
        key: "orderStatus",
      },
      {
        title: "用户类型",
        dataIndex: "userIdentity",
        key: "userIdentity",
      },
      {
        title: "用户id",
        dataIndex: "userName",
        key: "userName"
      },
      {
        title: "用户收货地区",
        dataIndex: "orderRegional",
        key: "orderRegional",
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
      },
      {
        title: "产品类型",
        dataIndex: "productType",
        key: "productType",
      },
      {
        title: "产品公司",
        dataIndex: "productCompany",
        key: "productCompany",
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        key: "productName"
      },
      {
        title: "产品型号",
        dataIndex: "productModel",
        key: "productModel",
      },
      {
        title: "数量",
        dataIndex: "count",
        key: "count"
      },
      {
        title: "订单总金额",
        dataIndex: "orderFee",
        key: "orderFee"
      },
      {
        title: "下单时间",
        dataIndex: "orderTime",
        key: "orderTime"
      },
      {
        title: "支付状态",
        dataIndex: "payStatus",
        key: "payStatus",
      },
      {
        title:'支付时间',
        dataIndex:'payTime',
        key:'payTime'
      },
      {
        title: "支付方式",
        dataIndex: "payType",
        key: "payType",
      },
      {
        title:'订单完成时间',
        dataIndex:'completeTime',
        key:'completeTime'
      },
      {
        title:'收货人姓名',
        dataIndex:'orderConsignee',
        key:'orderConsignee'
      },
      {
        title:'收货人手机号码',
        dataIndex:'orderPhone',
        key:'orderPhone'
      },
      {
        title:'经销商身份',
        dataIndex:'distributorIdentity',
        key:'distributorIdentity',
      },
      {
        title:'经销商省市区',
        dataIndex:'distributorcitys',
        key:'distributorcitys',
      },
      {
        title: "经销商id",
        dataIndex: "distributorId",
        key: "distributorId"
      },
      {
        title: "分销商id",
        dataIndex: "userSaleId",
        key: "userSaleId"
      },
      {
        title: "分销商是否享有收益",
        dataIndex: "userSaleIsIncome",
        key: "userSaleIsIncome",
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 130,
        render: (text, record) => {
          const controls = [];
          record.productType != '健康评估'
          && controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
              <Tooltip placement="top" title="修改商品信息">
                <Icon type="edit" />
              </Tooltip>
            </span>
          );
          record.productType != '健康评估'
          && controls.push(
              <span
                key="1"
                className="control-btn blue"
                onClick={() => this.onUpdateGoodsClick(record)}
              >
              <Tooltip placement="top" title="修改收货信息">
                <Icon type="setting" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <a href="#/order/OrderListDetail">
                <Tooltip placement="top" title="详情">
                  <Icon type="eye" />
                </Tooltip>
              </a>
            </span>
          );
          // controls.push(
          //   <span
          //     key="3"
          //     className="control-btn green"
          //     onClick={() => this.onCloseClick(record)}
          //   >
          //     <Tooltip placement="top" title="取消">
          //       <Icon type="close-circle-o" />
          //     </Tooltip>
          //   </span>
          // );
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
  
  onRadioChange(e) {
    this.setState({
      value:e.target.value
    })
    console.log('点的是第几个啊', e.target.value);
  }

  // 构建table所需数据
  makeData(data) {
    console.log('订单内容有啥：',data)
    return data.map((item, index) => {
      return {
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        citys:
          item.province && item.city && item.region
            ? `${item.province}/${item.city}/${item.region}`
            : "",
        province:(item.orderRegional).substring(0,3),
        count: item.count,
        payTime: item.payTime,//支付时间
        mainOrder: item.mainOrder, //主订单号
        orderId: item.orderId, //子订单号
        orderRegional:item.orderRegional,//用户收货地区
        orderAddress:item.orderAddress ? `${item.orderRegional}/${item.orderAddress}` : '',//用户收货地址
        orderAddressLast: item.orderAddress,//用户收货地址
        productType:item.productType,//产品类型
        productId:item.productId,//产品id
        productName:item.productName,///产品名称
        productModel:item.productModel,//产品型号
        productModelId:item.productModelId,//产品型号id
        productCompany:item.productCompany,//产品公司
        orderFee: item.orderFee,//订单总金额
        orderTime: item.orderTime,//下单时间
        payStatus:item.payStatus,//支付状态
        payType:item.payType,//支付方式
        paymentNo:item.paymentNo,//流水号
        distributorId:item.distributorId,//经销商id
        distributorProvince: item.distributorProvince,//经销商省
        distributorCity: item.distributorCity,//经销商市
        distributorRegion: item.distributorRegion,//经销商区
        distributorcitys:
          item.distributorProvince && item.distributorCity && item.distributorRegion
            ? `${item.distributorProvince}/${item.distributorCity}/${item.distributorRegion}`
            : "",//经销商省市区
        userSaleId:item.userSaleId,//分销商id
        userSaleIsIncome:item.userSaleIsIncome,//分销商是否享有收益
        orderStatus: item.orderStatus,//订单状态
        orderPhone: item.orderPhone, //用户收货手机号
        orderConsignee:item.orderConsignee,//收货姓名
        refer: item.refer,//云平台工单号
        userIdentity : item.userIdentity, // 用户类型
        distributorIdentity: item.distributorIdentity, //经销商身份
        activityType: item.activityType,//活动方式
        userName: item.userId, //用户id
        customerName: item.customerName, //安装工姓名
        customerPhone: item.customerPhone,//安装工电话
        customerAddress:item.customerAddress,//安装工服务站地区
        orderFrom: item.orderFrom,//订单来源
        completeTime:item.completeTime,//订单完成时间
        feeType:item.feeType,//计费方式
        sex:item.sex,//收货人性别
        productPrice:item.productPrice,//产品价格
        discount:0,//活动优惠
        freight:0,//运费
        total:item.orderFee
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
        sm: { span: 9 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 }
      }
    };

    const { searchorderNo } = this.state;
    const { searchRefer } = this.state;
    const { searchUserName } = this.state;
    const { searchAmbassadorId } = this.state;
    const { searchDistributorId } = this.state;
    const { searchMinPrice } = this.state;
    const { searchMaxPrice } = this.state;
    const { searchMainOrderId } = this.state;
    const { searchPersonName } = this.state;
    const { searchPersonMobile } = this.state;
    const suffix = searchorderNo ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    const suffix2 = searchRefer ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty1()} />
    ) : null;
    const suffix3 = searchUserName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty2()} />
    ) : null; //用户id
    const suffix4 = searchMainOrderId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty7()} />
    ) : null; //主订单号
    const suffix5 = searchAmbassadorId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty3()} />
    ) : null;//经销商id
    const suffix6 = searchDistributorId ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty4()} />
    ) : null;//分销商id
    const suffix8 = searchMinPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty5()} />
    ) : null;
    const suffix9 = searchMaxPrice ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty6()} />
    ) : null;
    const suffix7 = searchPersonName ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty8()} />
    ) : null;
    const suffix10 = searchPersonMobile ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty9()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>主订单号查询</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix4}
                value={searchMainOrderId}
                onChange={e => this.searchMainOrderChange(e)}
              />
            </li>
            <li>
              <span>子订单号查询</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix}
                value={searchorderNo}
                onChange={e => this.searchOrderNoChange(e)}
              />
            </li>
            <li>
              <span>云平台工单号</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix2}
                value={searchRefer}
                onChange={e => this.searchReferChange(e)}
              />
            </li>
            <li>
              <span>订单来源</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.onSearchorderFrom(e)}
              >
                <Option value={1}>终端app</Option>
                <Option value={2}>微信公众号</Option>
                <Option value={3}>经销商app</Option>
              </Select>
            </li>
            <li>
              <span>订单状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchConditionsChange(e)}
              >
                <Option value={0}>待付款</Option>
                <Option value={1}>待审核</Option>
                <Option value={2}>待发货</Option>
                <Option value={3}>待收货</Option>
                <Option value={4}>已完成</Option>
                <Option value={-3}>已取消</Option>
                <Option value={-4}>已关闭</Option>
              </Select>
            </li>
            <li>
              <span>用户类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.searchUserType(e)}
              >
                <Option value={0}>经销商（体验版）</Option>
                <Option value={1}>经销商（微创版）</Option>
                <Option value={2}>经销商（个人版）</Option>
                <Option value={3}>分享用户</Option>
                <Option value={4}>普通用户</Option>
                <Option value={5}>企业版经销商</Option>
                <Option value={6}>企业版子账号</Option>
                <Option value={7}>分销商</Option>
              </Select>
            </li>
            <li>
              <span>用户id</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix3}
                value={searchUserName}
                onChange={e => this.searchUserNameChange(e)}
              />
            </li>
            <li>
              <span>用户收货地区</span>
              <Cascader
                style={{ width: " 172px " }}
                placeholder="请选择收货地区"
                onChange={v => this.onSearchAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
                changeOnSelect
              />
            </li>
            <li>
              <span>活动方式</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchActivityType(e)}
              >
                <Option value={1}>普通商品</Option>
                <Option value={2}>活动商品</Option>
              </Select>
            </li>
            <li>
              <span>产品类型</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "172px" }}
                onChange={e => this.searchProductTypesChange(e)}
              >
                {this.state.productTypes.map((item, index) => {
                  return (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <span>订单总金额</span>
              <Input
                style={{ width: "80px" }}
                min={0}
                max={999999}
                placeholder="最小价格"
                onChange={v => this.searchMinPriceChange(v)}
                value={searchMinPrice}
                suffix={suffix8}
              />
              --
              <Input
                style={{ width: "80px" }}
                min={0}
                max={999999}
                placeholder="最大价格"
                onChange={e => this.searchMaxPriceChange(e)}
                value={searchMaxPrice}
                suffix={suffix9}
              />
            </li>
            <li>
              <span>支付状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchNameChange(e)}
              >
                <Option value={1}>已支付</Option>
                <Option value={0}>未支付</Option>
              </Select>
            </li>
            <li>
              <span>支付方式</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchPayTypeChange(e)}
              >
                <Option value={1}>微信</Option>
                <Option value={2}>支付宝</Option>
              </Select>
            </li>
            <li>
              <span>分销商id</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix6}
                value={searchDistributorId}
                onChange={e => this.searchDistributorId(e)}
              />
            </li>
            <li>
              <span>经销商id</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix5}
                value={searchAmbassadorId}
                onChange={e => this.searchAmbassadorId(e)}
              />
            </li>
            <li>
              <span>经销商省市区</span>
              <Cascader
                style={{ width: " 172px " }}
                placeholder="请选择经销商省市区"
                onChange={v => this.onSearchDealerAddress(v)}
                options={this.state.citys}
                loadData={e => this.getAllCitySon(e)}
                changeOnSelect
              />
            </li>
            <li>
              <span>收货人姓名</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix7}
                value={searchPersonName}
                onChange={e => this.searchPersonNameChange(e)}
              />
            </li>
            <li>
              <span>收货人手机号码</span>
              <Input
                style={{ width: "172px" }}
                suffix={suffix10}
                value={searchPersonMobile}
                onChange={e => this.searchPersonMobileChange(e)}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>下单时间</span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchBeginTime(e)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchEndTime(e)}
                onOk={onOk}
              />
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>支付时间</span>
              <DatePicker
                showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                onChange={e => this.searchPayBeginTimeChange(e)}
                onOk={onOk}
              />
              --
              <DatePicker
                showTime={{ defaultValue: moment("23:59:59", "HH:mm:ss") }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                onChange={e => this.searchPayEndTimeChange(e)}
                onOk={onOk}
              />
            </li>
            <li>
              <span>分销商是否享有收益</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchuserSaleFlagChange(e)}
              >
                <Option value={1}>是</Option>
                <Option value={0}>否</Option>
              </Select>
            </li>
            <li style={{ marginLeft: "40px" }}>
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
          </ul>
        </div>
        {/*等有了取消订单操作再把下面注释的取消掉*/}
        {/*<Alert*/}
          {/*showIcon={true}*/}
          {/*message="操作提示"*/}
          {/*banner*/}
        {/*/>*/}
        {/*<Alert*/}
          {/*showIcon={false}*/}
          {/*message="取消订单 : 仅待发货状态可以取消订单"*/}
          {/*banner*/}
          {/*style={{paddingLeft:'36px'}}*/}
        {/*/>*/}
        <div className="system-table" style={{ marginTop: "2px" }}>
          <Table
            columns={this.makeColumns()}
            dataSource={this.makeData(this.state.data)}
            scroll={{ x: 3700 }}
            loading={this.state.ListLoading}
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
                  this.state.productType == "健康食品" || this.state.productType == "生物科技" || this.state.productType == "健康评估"  ? "hide" : ""
                }
              >
                {getFieldDecorator("chargesTypes", {
                  initialValue: undefined,
                  rules: [{ required: (()=>{
                  const type = form.getFieldValue("formTypeId");
                  return Number(type) === 1;
                  })(), message: "请选择计费方式"}]
                })(
                  <RadioGroup onChange={(e) => this.onRadioChange(e)}>
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
        {/* 查看详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
          wrapClassName={"list"}
        >
          <Form>
            <FormItem
              label="收货人姓名"
              {...formItemLayout} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={this.state.productType == "健康评估" ? "hide" : ""}
            >
              {!!this.state.nowData ? this.state.nowData.orderConsignee :''}
            </FormItem>
            <FormItem
              label="用户收货地址"
              {...formItemLayout} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={this.state.productType == "健康评估" ? "hide" : ""}
            >
              {!!this.state.nowData ? this.state.nowData.orderAddress : ""}
            </FormItem>
            <FormItem
              label="服务站地区（安装工）"
              {...formItemLayout} labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} style={{marginLeft:'15px'}}
              className={
                this.state.productType == "健康食品" ||
                this.state.productType == "生物科技" ||
                this.state.productType == "健康评估" ? "hide" : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.customerAddress : ""}
            </FormItem>
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
        findOrderByWhere,
        findProductModelByWhere,
        findProductTypeByWhere,
        OrderListDetail,
        updateType,
        updateOrderModel,
        updateGoods,
        onChange,
        onOk
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
