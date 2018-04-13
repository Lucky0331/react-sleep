/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Modal, Tooltip, InputNumber, Select, Divider ,Cascader,DatePicker } from 'antd';
import './index.scss';
import Config from '../../../../config/config';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
// ==================
// 所需的所有组件
// ==================


// ==================
// 本页面所需action
// ==================

import { findAllProvince, findCityOrCounty,findOrderByWhere,addStationList, updateOrder, findProductTypeByWhere,findProductModelByWhere, addProductType, warning,updateProductType, deleteProductType ,onChange,onOk} from '../../../../a_action/shop-action';

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // 当前页面全部数据
            productModels: [],  // 所有的产品型号
            productTypes:[], //所有的产品类型
            searchProductName: '', // 搜索 - 产品名称
            searchModelId: '', // 搜索 - 产品型号
            searchproductType:'',//搜索 - 产品类型
            searchMinPrice: undefined,  // 搜索 - 最小价格
            searchMaxPrice: undefined,  // 搜索- 最大价格
            searchBeginTime: '',  // 搜索 - 开始时间
            searchEndTime: '',  // 搜索- 结束时间
            searchAddress: [], // 搜索 - 地址
            searchorderFrom:'',  //搜索 - 订单来源
            searchName: '', // 搜索 - 状态
            searchPayType:'', //搜索 - 支付类型
            searchConditions:'', //搜索 - 订单状态
            searchorderNo:'',    //搜索 - 订单号
            searchUserType:'', //搜索 - 用户类型
            searchUserName:'',   //搜索 - 经销商账户
            searchRefer:'', // 搜索 -云平台工单号查询
            searchAmbassadorId:'', //搜索 - 经销商id
            searchDistributorId:'' , // 搜索 - 分销商id
            nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
            addnewModalShow: false, // 查看地区模态框是否显示
            upModalShow: false, // 修改模态框是否显示
            upLoading: false, // 是否正在修改用户中
            pageNum: 1, // 当前第几页
            pageSize: 10, // 每页多少条
            total: 0, // 数据库总共多少条数据
            citys: [],  // 符合Cascader组件的城市数据
        };
    }



    componentDidMount() {
        if (!this.props.citys.length) { // 获取所有省，全局缓存
            this.getAllCity0();
        } else {
            this.setState({
                citys: this.props.citys.map((item, index) => ({ id: item.id, value: item.areaName, label: item.areaName, isLeaf: false})),
            });
        }
        this.getAllProductType();   // 获取所有的产品类型
        this.getAllProductModel();  // 获取所有的产品型号
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    componentWillReceiveProps(nextP) {
        if(nextP.citys !== this.props.citys) {
            this.setState({
                citys: nextP.citys.map((item, index) => ({ id: item.id, value: item.areaName, label: item.areaName, isLeaf: false})),
            });
        }
    }


    // 查询当前页面所需列表数据
    onGetData(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
            isPay: this.state.searchName,
            payType: this.state.searchPayType,
            activityType: this.state.searchActivity,
            conditions:this.state.searchConditions,
            distributorId :this.state.searchAmbassadorId,
            partId: this.state.searchDistributorId,
            userType:this.state.searchUserType,
            userName:this.state.searchUserName,
            ambassadorName:this.state.searchambassadorName,
            productName:this.state.searchProductName,
            modelId: this.state.searchModelId,
            refer: this.state.searchRefer,
            typeCode:this.state.searchproductType,
            orderFrom:this.state.searchorderFrom,
            orderNo: this.state.searchorderNo,
            province: this.state.searchAddress[0],
            city: this.state.searchAddress[1],
            region: this.state.searchAddress[2],
            minPrice: this.state.searchMinPrice,
            maxPrice: this.state.searchMaxPrice,
            beginTime: this.state.searchBeginTime ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00` : '',
            endTime: this.state.searchEndTime ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`: '',
        };
        this.props.actions.findOrderByWhere(tools.clearNull(params)).then((res) => {
            console.log('返回的什么：', res.messsageBody);
            if(res.returnCode === "0") {
                this.setState({
                    data: res.messsageBody.result || [],
                    pageNum,
                    pageSize,
                    total: res.messsageBody.total,
                });
            } else {
                message.error(res.returnMessaage || '获取数据失败，请重试');
            }
        });
    }

    // 工具 - 根据受理状态码查询对应的名字
    getConditionNameById(id) {
        switch(id) {
            case 0: return '待付款';
            case 1: return '待审核';
            case 2: return '待发货';
            case 3: return '待收货';
            case 4: return '已完成';
            case -3: return '已取消';
            case -4: return '已关闭';
            default: return '';
        }
    }


    // 获取所有的产品类型，当前页要用
    getAllProductType() {
        this.props.actions.findProductTypeByWhere({ pageNum: 0, pageSize: 9999 }).then((res) => {
            if(res.returnCode === '0') {
                this.setState({
                    productTypes: res.messsageBody.result,
                });
            }
        });
    }
    // 获取所有产品型号，当前页要用
    getAllProductModel() {
        this.props.actions.findProductModelByWhere({ pageNum:0, pageSize: 9999 }).then((res) => {
            if(res.returnCode === '0') {
                this.setState({
                    productModels: res.messsageBody.modelList.result || [],
                });
            }
        });
    }

    // 工具 - 根据产品类型ID查产品类型名称
    findProductNameById(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    // 工具 - 根据产品型号ID获取产品型号名称
    getNameByModelId(id) {
        const t = this.state.productModels.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    // 工具 - 根据ID获取用户类型
    getUserType(id) {
        switch(String(id)) {
            case '0': return '经销商（体验版）';
            case '1': return '经销商（微创版）';
            case '2': return '经销商（个人版）';
            case '3': return '分享用户';
            case '4': return '普通用户';
            case '5': return '企业版经销商';
            case '6': return '企业版子账号';
            case '7': return '分销商';
            default: return '';
        }
    }

    // 工具 - 根据ID获取用户来源名字
    getListByModelId(id) {
        switch(String(id)) {
            case '1': return '终端App';
            case '2': return '微信公众号';
            case '3': return '经销商App';
            default: return '';
        }
    }

    // 工具 - 根据ID获取支付方式
    getBypayType(id) {
        switch(String(id)) {
            case '1': return '微信支付';
            case '2': return '支付宝支付';
            case '3': return '银联支付';
            default: return '';
        }
    }

    //工具 - 根据活动类型id获取活动名称
    getActivity(id){
        switch(String(id)){
            case '1' : return '普通产品';
            case '2' : return '活动产品';
            default: return '';
        }
    }

    //产品类型所对应的公司
    Productcompany(id){
        switch (String(id)){
            case '1' : return '翼猫科技发展（上海）有限公司';
            case '2' : return '上海养未来健康食品有限公司';
            case '3' : return '上海翼猫生物科技有限公司';
            case '5' : return '上海翼猫智能科技有限公司';
        }
    }

    //工具
    getCity(s,c,q){
        if (!s){
            return '';
        }
        return `${s}/${c}/${q}`;
    }

    //工具 - 用户具体收货地体
    getAddress(s,c,q,x){
        if (!s){
            return '';
        }
        return `${s}${c}${q}${x}`;
    }

    //搜索 - 支付状态输入框值改变时触发
    searchNameChange(e) {
        this.setState({
            searchName: e,
        });
    }

    //搜索 - 支付方式输入框值改变时触发
    searchPayTypeChange(e) {
        this.setState({
            searchPayType:e,
        });
    }

    //搜索 - 订单状态改变时触发
    searchConditionsChange(e) {
        this.setState({
            searchConditions:e,
        });
    }

    //搜索 - 订单号
    searchOrderNoChange(e) {
        this.setState({
            searchorderNo:e.target.value,
        });
        console.log('e是什么；',e.target.value)
    }

    //搜索 - 云平台工单号
    searchReferChange(e){
        this.setState({
            searchRefer:e.target.value,
        })
    }

    //搜索 - 用户账号
    searchUserNameChange(e) {
        this.setState({
            searchUserName:e.target.value,
        });
    }

    //搜索 - 经销商id
    searchAmbassadorId(e) {
        this.setState({
            searchAmbassadorId:e.target.value,
        });
    }

    //搜索 - 分销商id
    searchDistributorId(e){
        this.setState({
            searchDistributorId:e.target.value,
        })
    }

    //搜索 - 活动类型
    searchActivityType(v){
        this.setState({
            searchActivity:v
        })
    }

    //Input中的删除按钮所删除的条件
    emitEmpty(){
        this.setState({
            searchorderNo: '',
        });
    }

    emitEmpty1(){
        this.setState({
            searchRefer: '',
        });
    }

    emitEmpty2(){
        this.setState({
            searchUserName: '',
        });
    }

    emitEmpty3(){
        this.setState({
            searchAmbassadorId: '',
        });
    }

    emitEmpty4(){
        this.setState({
            searchDistributorId:'',
        });
    }

    emitEmpty5(){
        this.setState({
            searchMinPrice:'',
        });
    }

    emitEmpty6(){
        this.setState({
            searchMaxPrice:'',
        });
    }

    // 点击查看地区模态框出现
   onAddNewShow() {
        const me = this;
        const { form } = me.props;
        form.resetFields([
            'addnewCitys',
        ]);
        this.setState({
            addOrUp: 'add',
            fileList: [],
            fileListDetail: [],
            addnewModalShow: true,
        });
    }


    // 关闭模态框
    onAddNewClose() {
        this.setState({
            addnewModalShow: false,
        });
    }

    // 获取所有的省
    getAllCity0() {
        this.props.actions.findAllProvince();
    }

    // 获取某省下面的市
    getAllCitySon(selectedOptions) {
        console.log('SSS',selectedOptions);
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        this.props.actions.findCityOrCounty({ parentId: selectedOptions[selectedOptions.length - 1].id }).then((res) => {
            if (res.returnCode === '0') {
                targetOption.children = res.messsageBody.map((item, index) => {
                    return { id: item.id, value: item.areaName, label: item.areaName, isLeaf: item.level === 2, key: index };
                });
            }
            targetOption.loading = false;
            this.setState({
                citys: [...this.state.citys]
            });
        });
    }


    // 搜索 - 产品类型输入框值改变时触发
    searchProductTypesChange(e){
        this.setState({
            searchproductType: e,
        });
    }

    // 搜索 - 服务站地区输入框值改变时触发
    onSearchAddress(c) {
        this.setState({
            searchAddress: c,
        });
    }

    // 搜索 - 订单来源输入框值改变时触发
    onSearchorderFrom(v) {
        this.setState({
            searchorderFrom: v,
        });
    }

    //搜索 - 用户类型
    searchUserType(v){
        this.setState({
            searchUserType:v
        })
    }

    // 搜索 - 最小价格变化
    searchMinPriceChange(v) {
        this.setState({
            searchMinPrice: v.target.value,
        });
    }

    // 搜索 - 最大价格变化
    searchMaxPriceChange(e) {
        this.setState({
            searchMaxPrice: e.target.value,
        });
    }

    // 搜索 - 开始时间变化
    searchBeginTime(v) {
        console.log('是什么：', v);
        this.setState({
            searchBeginTime: v,
        });
    }

    // 搜索 - 结束时间变化
    searchEndTime(v) {
        this.setState({
            searchEndTime: v,
        });
    }

    // 确定修改某一条数据
    onUpOk() {
        const me = this;
        const { form } = me.props;
        form.validateFields([
            'upOrderStatus',
        ], (err, values) => {
            if(err) { return; }

            me.setState({
                upLoading: true,
            });
            const params = {
                orderId: me.state.nowData.id,
                orderStatus: values.upOrderStatus,
            };

            this.props.actions.updateProductType(params).then((res) => {
                if (res.returnCode === "0") {
                    message.success("修改成功");
                    this.onGetData(this.state.pageNum, this.state.pageSize);
                    this.onUpClose();
                } else {
                    message.error(res.returnMessaage || '修改失败，请重试');
                }
                me.setState({
                    upLoading: false,
                });
            }).catch(() => {
                me.setState({
                    upLoading: false,
                });
            });
        });
    }
    // 关闭修改某一条数据
    onUpClose() {
        this.setState({
            upModalShow: false,
        });
    }

    // 搜索
    onSearch() {
        this.onGetData(1, this.state.pageSize);
    }
    //导出
    onExport(){
        this.onExportData(this.state.pageNum, this.state.pageSize);
    }

    //导出的数据字段
    onExportData(pageNum, pageSize){
        const params = {
            pageNum,
            pageSize,
        };
        let form = document.getElementById('download-form');
        if (!form) {
            form = document.createElement('form');
            document.body.appendChild(form);
        };
        form.id = 'download-form';
        form.action = `${Config.baseURL}/manager/order/listExport`;
        form.method = 'post';
        console.log('FORM:',params );

        const newElement = document.createElement("input");
        newElement.setAttribute("name","pageNum");
        newElement.setAttribute("type","hidden");
        newElement.setAttribute("value",pageNum);
        form.appendChild(newElement);

        const newElement2 = document.createElement("input");
        newElement2.setAttribute("name","pageSize");
        newElement2.setAttribute("type","hidden");
        newElement2.setAttribute("value",pageSize);
        form.appendChild(newElement2);

        form.submit();
    }

    // 查询某一条数据的详情
    onQueryClick(record) {
        console.log('是什么：', record);
        this.setState({
            nowData: record,
            queryModalShow: true,
            typeId:record.typeId
        });
    }

    // 查看详情模态框关闭
    onQueryModalClose() {
        this.setState({
            queryModalShow: false,
        });
    }

    // 表单页码改变
    onTablePageChange(page, pageSize) {
        console.log('页码改变：', page, pageSize);
        this.onGetData(page, pageSize);
    }

    // 构建字段
    makeColumns(){
        const columns = [
            {
                title: '序号',
                fixed:'left',
                dataIndex: 'serial',
                key: 'serial',
                width: 50,
            },
            {
                title: '订单号',
                dataIndex: 'orderNo',
                key: 'orderNo',
            },
            {
                title:'云平台工单号',
                dataIndex:'refer',
                key:'refer'
            },
            {
                title: '订单来源',
                dataIndex: 'orderFrom',
                key: 'orderFrom',
                render: (text) => this.getListByModelId(text),
            },
            {
                title: '订单状态',
                dataIndex: 'conditions',
                key: 'conditions',
                render: (text) => this.getConditionNameById(text)
            },
            {
                title:'用户类型',
                dataIndex:'userType',
                key:'userType',
                render: (text)=>this.getUserType(text),
            },
            {
                title: '用户id',
                dataIndex: 'userName',
                key: 'userName',
            },
            {
                title:'用户收货地区',
                dataIndex: 'station',
                key: 'station',
                render: (text, record) => {return `${record.province}/${record.city}/${record.region}`}
            },
            {
                title:'活动方式',
                dataIndex:'activityType',
                key:'activityType',
                render : (text) => this.getActivity(text)
            },
            {
                title: '产品类型',
                dataIndex: 'typeId',
                key: 'typeId',
                render: (text) => this.findProductNameById(text),
            },
            {
                title:'产品公司',
                dataIndex: 'company',
                key: 'company',
                render: (text) => this.Productcompany(text),
            },
            {
                title: '产品名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '产品型号',
                dataIndex: 'modelId',
                key: 'modelId',
                render: (text) => this.getNameByModelId(text),
            },
            {
                title: '数量',
                dataIndex: 'count',
                key: 'count',
            },
            {
                title: '订单总金额',
                dataIndex: 'fee',
                key: 'fee',
            },
            {
                title: '下单时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '支付状态',
                dataIndex: 'pay',
                key: 'pay',
                render: (text) => String(text) === 'true' ? <span style={{color: 'green'}}>已支付</span> : <span style={{color: 'red'}}>未支付</span>
            },
            {
                title: '支付方式',
                dataIndex: 'payType',
                key: 'payType',
                render: (text) => this.getBypayType(text),
            },
            {
                title:'分销商是否有收益',
                dataIndex:'userSaleFlag',
                key:'userSaleFlag',
                render:(text) => Boolean(text) === true ? <span>有</span> : <span>无</span>
            },
            {
                title: '分销商id',
                dataIndex:'distributorId',
                key:'distributorId'
            },
            {
                title: '经销商id',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: '操作',
                key: 'control',
                fixed:'right',
                width: 40,
                render: (text, record) => {
                    const controls = [];
                    controls.push(
                        <span key="0" className="control-btn green" onClick={() => this.onQueryClick(record)}>
                            <Tooltip placement="top" title="详情">
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
                },
            }
        ];
        return columns;
    }

    // 构建table所需数据
    makeData(data) {
        return data.map((item, index) => {
            return {
                key: index,
                addrId: item.addrId,
                citys: (item.province && item.city && item.region) ? `${item.province}/${item.city}/${item.region}` : '',
                count: item.count,
                ecId: item.ecId,
                fee: item.fee,
                feeType: item.feeType,
                openAccountFee: item.openAccountFee,
                orderType: item.orderType,
                payTime: item.payTime,
                payType: (item.payRecord) ? item.payRecord.payType :'',
                orderNo: item.id,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                createTime: item.createTime,
                pay: item.pay,
                companyName:(item.station) ? item.station.companyName : '',
                name: (item.product) ? item.product.name : '',
                modelId:(item.product)?item.product.typeCode : '',
                conditions: item.conditions,
                remark: item.remark,
                mobile:(item.shopAddress) ? item.shopAddress.mobile :'',
                refer:item.refer,
                userType: (item.userInfo) ? item.userInfo.userType : '',
                shipCode: item.shipCode,
                activityType: item.activityType,
                shipPrice: item.shipPrice,
                transport: item.transport,
                userName: item.userId,
                customerName : (item.customer) ? item.customer.realName : '',
                customerPhone : (item.customer) ? item.customer.phone :'',
                orderFrom:item.orderFrom,
                realName:(item.distributor) ? item.distributor.realName : '',
                ambassadorName:(item.distributor) ? item.distributor.mobile : '',
                name2:(item.station)? item.station.name : '',
                province:(item.shopAddress) ? item.shopAddress.province : '',
                city:(item.shopAddress) ? item.shopAddress.city : '',
                region:(item.shopAddress) ? item.shopAddress.region : '',
                street:(item.shopAddress) ? item.shopAddress.street : '',
                mchOrderId:(item.payRecord)? item.payRecord.mchOrderId :'',
                id:(item.distributor) ? item.distributor.id : '',
                station: item.station,
                typeId:(item.product)?item.product.typeId :'',
                company:(item.product)?item.product.typeId :'',
                distributorId:(item.ambassador) ? item.ambassador.id : '',
                userSaleFlag: item.userSaleFlag,
            }
        });
    }

    render() {
        const me = this;
        const { form } = me.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 9 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 15 },
            },
        };

        const { searchorderNo } = this.state;
        const { searchRefer } = this.state;
        const { searchUserName } = this.state;
        const { searchAmbassadorId } = this.state;
        const { searchDistributorId } =this.state;
        const { searchMinPrice } = this.state;
        const { searchMaxPrice } = this.state;
        const suffix = searchorderNo ? <Icon type="close-circle" onClick={()=>this.emitEmpty()} /> : null;
        const suffix2 = searchRefer ? <Icon type="close-circle" onClick={()=>this.emitEmpty1()} /> : null;
        const suffix3 = searchUserName ? <Icon type="close-circle" onClick={()=>this.emitEmpty2()}/> : null;
        const suffix5 = searchAmbassadorId ? <Icon type="close-circle" onClick={()=>this.emitEmpty3()}/> : null;
        const suffix6 = searchDistributorId ? <Icon type="close-circle" onClick={() => this.emitEmpty4()}/> : null;
        const suffix8 = searchMinPrice ? <Icon type="close-circle" onClick={() => this.emitEmpty5()}/> : null;
        const suffix9 = searchMaxPrice ? <Icon type="close-circle" onClick={() => this.emitEmpty6()}/> : null;

        return (
            <div>
              <div className="system-search">
                  <ul className="search-ul more-ul">
                      <li>
                          <span>订单号查询</span>
                          <Input
                              style={{ width: '172px' }}
                              suffix={ suffix }
                              value={ searchorderNo }
                              onChange={(e) => this.searchOrderNoChange(e)}
                          />
                      </li>
                      <li>
                          <span>云平台工单号</span>
                          <Input
                              style={{ width: '172px' }}
                              suffix={ suffix2 }
                              value={ searchRefer }
                              onChange={(e) => this.searchReferChange(e)}
                          />
                      </li>
                      <li>
                          <span>订单来源</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                              <Option value={1}>终端app</Option>
                              <Option value={2}>微信公众号</Option>
                              <Option value={3}>经销商app</Option>
                          </Select>
                      </li>
                      <li>
                          <span>订单状态</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchConditionsChange(e)}>
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
                          <Select allowClear placeholder="全部" style={{  width: '172px'}} onChange={(e)=>this.searchUserType(e)}>
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
                              style={{ width: '172px' }}
                              suffix={ suffix3 }
                              value={ searchUserName }
                              onChange={(e) => this.searchUserNameChange(e)}/>
                      </li>
                      <li>
                          <span>用户收货地区</span>
                          <Cascader
                              style={{width :' 172px '}}
                              placeholder="请选择收货地区"
                              onChange={(v) => this.onSearchAddress(v)}
                              options={this.state.citys}
                              loadData={(e) => this.getAllCitySon(e)}
                          />
                      </li>
                      <li>
                          <span>活动方式</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e)=>this.searchActivityType(e)}>
                              <Option value={1}>普通商品</Option>
                              <Option value={2}>活动商品</Option>
                          </Select>
                      </li>
                      <li>
                          <span>产品类型</span>
                          <Select allowClear placeholder="全部" style={{ width: '172px' }} onChange={(e) => this.searchProductTypesChange(e)}>
                              {this.state.productTypes.map((item, index) => {
                                  return <Option key={index} value={item.id}>{ item.name }</Option>
                              })}
                          </Select>
                      </li>
                      <li>
                          <span>订单总金额</span>
                          <Input
                              style={{ width: '80px' }}
                              min={0} max={999999} placeholder="最小价格"
                              onChange={(v) => this.searchMinPriceChange(v)}
                              value={searchMinPrice}
                              suffix={ suffix8 }
                          />
                          --
                          <Input
                              style={{ width: '80px' }}
                              min={0} max={999999} placeholder="最大价格"
                              onChange={(e) => this.searchMaxPriceChange(e)}
                              value={searchMaxPrice}
                              suffix={ suffix9 }
                          />
                      </li>
                      <li>
                          <span>支付状态</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchNameChange(e)}>
                              <Option value={0}>未支付</Option>
                              <Option value={1}>已支付</Option>
                          </Select>
                      </li>
                      <li>
                          <span>支付方式</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchPayTypeChange(e)}>
                              <Option value={1}>微信</Option>
                              <Option value={2}>支付宝</Option>
                          </Select>
                      </li>
                      <li>
                          <span>分销商id</span>
                          <Input
                              style={{ width: '172px' }}
                              suffix={ suffix6 }
                              value={ searchDistributorId }
                              onChange={(e)=> this.searchDistributorId(e)}
                          />
                      </li>
                      <li>
                          <span>经销商id</span>
                          <Input
                              style={{ width: '172px' }}
                              suffix={ suffix5 }
                              value={ searchAmbassadorId }
                              onChange={(e)=> this.searchAmbassadorId(e)}
                          />
                      </li>
                      <li>
                          <span style={{marginRight:'10px'}}>下单时间</span>
                          <DatePicker
                              style={{ width: '130px' }}
                              dateRender={(current) => {
                                  const style = {};
                                  if (current.date() === 1) {
                                      style.border = '1px solid #1890ff';
                                      style.borderRadius = '45%';
                                  }
                                  return (
                                      <div className="ant-calendar-date" style={style}>
                                          {current.date()}
                                      </div>
                                  );
                              }}
                              format="YYYY-MM-DD"
                              placeholder="开始时间"
                              onChange={(e) => this.searchBeginTime(e)}
                          />
                          --
                          <DatePicker
                              style={{ width: '130px' }}
                              dateRender={(current) => {
                                  const style = {};
                                  if (current.date() === 1) {
                                      style.border = '1px solid #1890ff';
                                      style.borderRadius = '45%';
                                  }
                                  return (
                                      <div className="ant-calendar-date" style={style}>
                                          {current.date()}
                                      </div>
                                  );
                              }}
                              format="YYYY-MM-DD"
                              placeholder="结束时间"
                              onChange={(e) => this.searchEndTime(e)}
                          />
                      </li>
                      <li style={{marginLeft:'40px'}}>
                          <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                      </li>
                      <li>
                          <Button icon="download" onClick={() => this.onExport()} style={{color: '#fff',backgroundColor:'#108ee9',borderColor: '#108ee9'}}>导出</Button>
                      </li>
                   </ul>
              </div>
              <div className="system-table">
                <Table
                    columns={this.makeColumns()}
                    dataSource={this.makeData(this.state.data)}
                    scroll={{ x: 3000 }}
                    pagination={{
                        total: this.state.total,
                        current: this.state.pageNum,
                        pageSize: this.state.pageSize,
                        showQuickJumper: true,
                        showTotal: (total, range) => `共 ${total} 条数据`,
                        onChange: (page, pageSize) => this.onTablePageChange(page, pageSize)
                    }}
                />
              </div>
                <Modal
                    title='查看地区'
                    visible={this.state.addnewModalShow}
                    onOk={() => this.onAddNewOk()}
                    onCancel={() => this.onAddNewClose()}
                    confirmLoading={this.state.addnewLoading}
                >
                    <Form>
                        <FormItem
                            label="服务站地区"
                            {...formItemLayout}
                        >
                        <span style={{ color: '#888' }}>
                            {(this.state.nowData && this.state.addOrUp === 'up' && this.state.nowData.province && this.state.nowData.city && this.state.nowData.region) ? `${this.state.nowData.province}/${this.state.nowData.city}/${this.state.nowData.region}` : null}
                        </span>
                            {getFieldDecorator('addnewCitys', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, message: '请选择区域'},
                                ],
                            })(
                                <Cascader
                                    placeholder="请选择服务区域"
                                    options={this.state.citys}
                                    loadData={(e) => this.getAllCitySon(e)}
                                />
                            )}
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
                        label="订单号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.orderNo : ''}
                    </FormItem>
                    <FormItem
                        label="云平台工单号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.refer : ''}
                    </FormItem>
                    <FormItem
                        label="订单来源"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getListByModelId(this.state.nowData.orderFrom) : ''}
                    </FormItem>
                    <FormItem
                        label="订单状态"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getConditionNameById(this.state.nowData.conditions) : ''}
                    </FormItem>
                    <FormItem
                        label="用户类型"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getUserType(this.state.nowData.userType) :''}
                    </FormItem>
                    <FormItem
                        label="用户id"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.userName : ''}
                    </FormItem>
                    <FormItem
                        label="用户收货手机号"
                        {...formItemLayout}
                        className={( this.state.typeId== 5) ? 'hide' : ''}
                    >
                        {!!this.state.nowData ? this.state.nowData.mobile : ''}
                    </FormItem>
                    <FormItem
                        label="用户收货地区"
                        {...formItemLayout}
                        className={( this.state.typeId== 5) ? 'hide' : ''}
                    >
                        {!!(this.state.nowData) ? this.getCity(this.state.nowData.province,this.state.nowData.city,this.state.nowData.region ): ''}
                    </FormItem>
                    <FormItem
                        label="用户收货地址"
                        {...formItemLayout}
                        className={( this.state.typeId== 5) ? 'hide' : ''}
                    >
                        {!!(this.state.nowData) ? this.getAddress(this.state.nowData.province,this.state.nowData.city,this.state.nowData.region,this.state.nowData.street ): ''}
                    </FormItem>
                    <FormItem
                        label="活动方式"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getActivity(this.state.nowData.activityType) : ''}
                    </FormItem>
                    <FormItem
                        label="产品类型"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.findProductNameById(this.state.nowData.typeId) : ''}
                    </FormItem>
                    <FormItem
                        label="产品公司"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.Productcompany(this.state.nowData.company) : ''}
                    </FormItem>
                    <FormItem
                        label="产品名称"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.name : ''}
                    </FormItem>
                    <FormItem
                        label="产品型号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getNameByModelId(this.state.nowData.modelId) : ''}
                    </FormItem>
                    <FormItem
                        label="数量"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.count : ''}
                    </FormItem>
                    <FormItem
                        label="订单总金额"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.fee : ''}
                    </FormItem>
                    <FormItem
                        label="下单时间"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.createTime : ''}
                    </FormItem>
                  <FormItem
                      label="支付方式"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.getBypayType(this.state.nowData.payType) : ''}
                  </FormItem>
                    <FormItem
                        label="支付状态"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? (String(this.state.nowData.pay) === "true" ? <span style={{ color: 'green' }}>已支付</span> : <span style={{ color: 'red' }}>未支付</span>) : ''}
                    </FormItem>
                    <FormItem
                        label="支付时间"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.payTime : ''}
                    </FormItem>
                    <FormItem
                        label="流水号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.mchOrderId : ''}
                    </FormItem>
                    <FormItem
                        label="分销商是否有收益"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? (Boolean(this.state.nowData.userSaleFlag) === true ? <span>有</span> : <span>无</span>) : ''}
                    </FormItem>
                    <FormItem
                        label="分销商id"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.distributorId : ''}
                    </FormItem>
                    <FormItem
                        label="经销商id"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.id : ''}
                    </FormItem>
                    <FormItem
                        label="安装工姓名"
                        {...formItemLayout}
                        className={(this.state.typeId == 2 || this.state.typeId == 3 || this.state.typeId == 4 || this.state.typeId == 5) ? 'hide' : ''}
                    >
                        {!!this.state.nowData ? this.state.nowData.customerName : ''}
                    </FormItem>
                    <FormItem
                        label="安装工电话"
                        {...formItemLayout}
                        className={(this.state.typeId == 2 || this.state.typeId == 3 || this.state.typeId == 4 || this.state.typeId == 5 ) ? 'hide' : ''}
                    >
                        {!!this.state.nowData ? this.state.nowData.customerPhone : ''}
                    </FormItem>
                    <FormItem
                        label="服务站地区（安装工）"
                        {...formItemLayout}
                        className={(this.state.typeId == 2 || this.state.typeId == 3 || this.state.typeId == 4 || this.state.typeId == 5 ) ? 'hide' : ''}
                    >
                        {!!(this.state.nowData) ? this.getCity(this.state.nowData.province,this.state.nowData.city,this.state.nowData.region ): ''}
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
    citys: P.array, // 动态加载的省
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
    (state) => ({
        citys: state.sys.citys,
    }),
    (dispatch) => ({
        actions: bindActionCreators({findAllProvince, findCityOrCounty, addStationList,findOrderByWhere, updateOrder, findProductModelByWhere,findProductTypeByWhere, warning,addProductType, updateProductType, deleteProductType,onChange,onOk }, dispatch),
    })
)(WrappedHorizontalRole);
