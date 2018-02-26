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

import { findProductTypeByWhere,onChange,onOk,statementList} from '../../../../a_action/shop-action';

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
            productTypes:[], //所有的产品类型
            productModels: [],  // 所有的产品型号
            searchProductName: '', // 搜索 - 产品名称
            searchProductType: '', // 搜索 - 产品类型
            searchMinPrice: undefined,  // 搜索 - 最小价格
            searchMaxPrice: undefined,  // 搜索- 最大价格
            searchBeginTime: '',  // 搜索 - 开始时间
            searchEndTime: '',  // 搜索- 结束时间
            searchTime:'' ,// 搜索 - 对账时间
            searchorderFrom:'',  //搜索 - 订单来源
            searchName: '', // 搜索 - 状态
            searchPayType:'', //搜索 - 支付类型
            searchmchOrderIdChange:'',// 流水号查询
            searchConditions:'', //搜索 - 订单状态
            searchorderNo:'',    //搜索 - 订单号
            searchUserName:'',   //搜索 - 用户id
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
        this.getAllProductType();   // 获取所有的产品类型
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
            conditions:this.state.searchConditions,
            id:this.state.searchId,
            userId:this.state.searchUserName,
            ambassadorName:this.state.searchambassadorName,
            productType: this.state.searchProductType,
            orderFrom:this.state.searchorderFrom,
            orderNo: this.state.searchorderNo,
            minPrice: this.state.searchMinPrice,
            maxPrice: this.state.searchMaxPrice,
            mchOrderId:this.state.searchmchOrderIdChange,
            payBeginTime: this.state.searchBeginTime ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00` : '',
            payEndTime: this.state.searchEndTime ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`: '',
            beginTime: this.state.searchTime ? `${tools.dateToStrT(this.state.searchTime._d)} 00:00:00` : '',
            endTime: this.state.searchTime ?`${tools.dateToStrT(this.state.searchTime._d)} 23:59:59` :'',
        };
        this.props.actions.statementList(tools.clearNull(params)).then((res) => {
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
            case 0: return '已关闭';
            case 1: return '未完成';
            case 4: return '已完成';
            default: return '';
        }
    }

    // 工具 - 支付方式
    AllpayType(id){
        switch(id){
            case 1: return '微信支付';
            case 2: return '支付宝支付';
            case 3: return '银联支付';
            default: return '';
        }
    }


    // 获取所有的产品类型，当前页要用
    getAllProductType() {
        this.props.actions.findProductTypeByWhere({ pageNum: 0, pageSize: 9999 }).then((res) => {
            if(res.returnCode === '0') {
                this.setState({
                    productTypes: res.messsageBody.result  || [],
                });
            }
        });
    }

    // 工具 - 根据产品类型ID查产品类型名称
    findProductNameById(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    // 工具 - 根据ID获取用户来源名字
    getListByModelId(id) {
        switch(String(id)) {
            case '2': return '待发货';
            case '3': return '待收货';
            case '4': return '已完成';
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

    //工具
    getCity(s,c,q,j){
        if (!s){
            return ' ';
        }
        return `${s}/${c}/${q}/${j}`;
    }

    //搜索 - 对账时间的变化
    searchTime(v){
        this.setState({
            searchTime : v,
        });
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

    //搜索 - 用户账号
    searchUserNameChange(e) {
        this.setState({
            searchUserName:e.target.value,
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


    // 搜索 - 产品名称输入框值改变时触发
    mchOrderIdChange(e) {
            this.setState({
                searchmchOrderIdChange: e.target.value,
            });
    }


    // 搜索 - 订单来源输入框值改变时触发
    searchProductType(v) {
        this.setState({
            searchProductType: v,
        });
    }

    // 搜索 - 最小价格变化
    searchMinPriceChange(v) {
        this.setState({
            searchMinPrice: v,
        });
    }

    // 搜索 - 最大价格变化
    searchMaxPriceChange(v) {
        this.setState({
            searchMaxPrice: v,
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


    // 搜索
    onSearch() {
        this.onGetData(1, this.state.pageSize);
    }
    //导出
    onExport(){
        this.onExportData(this.state.pageNum, this.state.pageSize);
    }

    // 导出订单对账列表数据
    onExportData(pageNum, pageSize) {
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
        form.action = `${Config.baseURL}/manager/order/statementExport`;
        form.method = 'post';
        console.log('FORM:', form);
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
        console.log('typeId的数值是：',record.typeId)
    }

    // //根据typeId值不同显示的字段不同
    // codeType(record){
    //     this.setState({
    //         typeId:record.typeId
    //     })
    //     console.log('typeId的数值是：',typeId)
    // }

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
                title: '订单状态',
                dataIndex: 'conditions',
                key: 'conditions',
                render: (text) => this.getListByModelId(text),
            },
            {
                title: '用户id',
                dataIndex: 'userId',
                key: 'userId',
            },
            {
                title: '产品类型',
                dataIndex: 'typeId',
                key: 'typeId',
                render: (text) => this.findProductNameById(text),
            },
            {
                title: '产品型号',
                dataIndex: 'modelType',
                key: 'modelType',
            },
            {
                title: '数量',
                dataIndex: 'count',
                key: 'count',
            },
            {
                title: '订单金额',
                dataIndex: 'fee',
                key: 'fee',
            },
            {
                title: '流水号',
                dataIndex: 'mchOrderId',
                key: 'mchOrderId',
            },
            {
                title: '支付时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '支付方式',
                dataIndex: 'payType',
                key: 'payType',
                render: (text) => this.AllpayType(text),
            },
            {
                title: '操作',
                key: 'control',
                fixed:'right',
                width: 50,
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
                fee: item.fee,
                openAccountFee: item.openAccountFee,
                payType: (item.payRecord) ? item.payRecord.payType :'',
                orderNo: item.id,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                createTime: item.createTime,
                name: (item.product) ? item.product.name : '',
                modelId:(item.product)?item.product.typeCode : '',
                typeId:(item.product)?item.product.typeId :'',
                conditions: item.conditions,
                userName: item.userId,
                orderFrom:item.orderFrom,
                realName:(item.distributor) ? item.distributor.realName : '',
                ambassadorName:(item.distributor) ? item.distributor.mobile : '',
                userId:item.userInfo.id,
                modelType:item.modelType,
                mchOrderId: item.payRecord.mchOrderId,
                mobile:(item.shopAddress) ? item.shopAddress.mobile : '',
                province: (item.shopAddress) ? item.shopAddress.province :'' ,
                city: (item.shopAddress) ? item.shopAddress.city : '',
                region: (item.shopAddress) ? item.shopAddress.region : '',
                street: (item.shopAddress) ? item.shopAddress.street :'',
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
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return (
            <div>
              <div className="system-search">
                  <ul className="search-ul more-ul">
                      <li>
                          <span>订单号查询</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchOrderNoChange(e)}/>
                      </li>
                      <li>
                          <span>订单状态</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px'}} onChange={(e) => this.searchConditionsChange(e)}>
                              <Option value={2}>待发货</Option>
                              <Option value={3}>待收货</Option>
                              <Option value={4}>已完成</Option>
                          </Select>
                      </li>
                      <li>
                          <span>用户id</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchUserNameChange(e)}/>
                      </li>
                      <li>
                          <span>产品类型</span>
                          <Select allowClear placeholder="全部" style={{ width: '172px' }} onChange={(e) => this.searchProductType(e)}>
                              {this.state.productTypes.map((item, index) => {
                                  return <Option key={index} value={item.id}>{ item.name }</Option>
                              })}
                          </Select>
                      </li>
                      <li>
                          <span>流水号查询</span>
                          <Input style={{ width: '172px' }}  onChange={(e) => this.mchOrderIdChange(e)}/>
                      </li>
                      <li>
                          <span>支付方式</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchPayTypeChange(e)}>
                              <Option value={1}>微信支付</Option>
                              <Option value={2}>支付宝支付</Option>
                          </Select>
                      </li>
                      <li>
                          <span>订单总金额</span>
                          <InputNumber style={{ width: '130px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.searchMinPriceChange(e)} value={this.state.searchMinPrice}/>--
                          <InputNumber style={{ width: '130px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.searchMaxPriceChange(e)} value={this.state.searchMaxPrice}/>
                      </li>
                      <li>
                          <span style={{marginRight:'10px'}}>支付时间</span>
                          <DatePicker
                              showTime
                              format="YYYY-MM-DD HH:mm:ss"
                              placeholder="开始时间"
                              onChange={(e) =>this.searchBeginTime(e)}
                              onOk={onOk}
                          />
                          --
                          <DatePicker
                              showTime
                              format="YYYY-MM-DD HH:mm:ss"
                              placeholder="结束时间"
                              onChange={(e) =>this.searchEndTime(e)}
                              onOk={onOk}
                          />
                      </li>
                      <li>
                          <span style={{width:'50px'}}>对账日期</span>
                          <DatePicker
                              onChange={(e) =>this.searchTime(e)}
                          />
                      </li>
                      <li style={{marginLeft:'40px'}}>
                          <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                      </li>
                      <li>
                          <Button icon="download" type="primary" onClick={() => this.onExport()}>导出</Button>
                      </li>
                   </ul>
              </div>
              <div className="system-table">
                <Table
                    columns={this.makeColumns()}
                    dataSource={this.makeData(this.state.data)}
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
                  onChange={() => this.onQueryClick()}
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
                        label="订单状态"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getListByModelId(this.state.nowData.conditions) : ''}
                    </FormItem>
                    <FormItem
                        label="产品类型"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.findProductNameById(this.state.nowData.typeId) : ''}
                    </FormItem>
                    <FormItem
                        label="产品型号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.modelType : ''}
                    </FormItem>
                    <FormItem
                        label="产品名称"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.name : ''}
                    </FormItem>
                    <FormItem
                        label="支付方式"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.AllpayType(this.state.nowData.payType) : ''}
                    </FormItem>
                    <FormItem
                        label="用户账号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.userId : ''}
                    </FormItem>
                    <FormItem
                        label="订单金额"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? `￥${this.state.nowData.fee}` : ''}
                    </FormItem>
                    <FormItem
                        label="流水号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.mchOrderId : ''}
                    </FormItem>
                    <FormItem
                        label="支付时间"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.createTime : ''}
                    </FormItem>
                    <FormItem
                        label="用户收货地址"
                        {...formItemLayout}
                        className={(this.state.typeId == 4 || this.state.typeId== 5) ? 'hide' : ''}
                    >
                        {!!(this.state.nowData) ? this.getCity(this.state.nowData.province,this.state.nowData.city,this.state.nowData.region,this.state.nowData.street ): ''}
                    </FormItem>
                    <FormItem
                        label="用户收货手机号"
                        {...formItemLayout}
                        className={(this.state.typeId == 4 || this.state.typeId== 5) ? 'hide' : ''}
                    >
                        {!!this.state.nowData ? this.state.nowData.mobile : ''}
                    </FormItem>
                    <FormItem
                        label="安装工姓名"
                        {...formItemLayout}
                        className={(this.state.typeId == 2 || this.state.typeId == 3 || this.state.typeId == 4 || this.state.typeId == 5) ? 'hide' : ''}
                    >
                        {/*{!!this.state.nowData ? this.state.nowData.mobile : ''}*/}
                    </FormItem>
                    <FormItem
                        label="安装工电话"
                        {...formItemLayout}
                        className={(this.state.typeId == 2 || this.state.typeId == 3 || this.state.typeId == 4 || this.state.typeId == 5 ) ? 'hide' : ''}
                    >
                        {/*{!!this.state.nowData ? this.state.nowData.mobile : ''}*/}
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
        actions: bindActionCreators({ findProductTypeByWhere,onChange,onOk,statementList }, dispatch),
    })
)(WrappedHorizontalRole);
