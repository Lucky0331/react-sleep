/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import moment from 'moment';
import { Form, Button, Icon, Input, Table, message, Modal, Tooltip, InputNumber, Select, Divider ,DatePicker } from 'antd';
import './index.scss';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
// ==================
// 所需的所有组件
// ==================


// ==================
// 本页面所需action
// ==================

import { findProductModelByWhere,onChange,onOk,cashRecord,onChange4,warning} from '../../../../a_action/shop-action';

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
            productModels: [],  // 所有的产品型号
            searchProductName: '', // 搜索 - 产品名称
            searchMinPrice: undefined,  // 搜索 - 最小价格
            searchMaxPrice: undefined,  // 搜索- 最大价格
            searchBeginTime: '',  // 搜索 - 到账开始时间
            searchEndTime: '',  // 搜索- 到账结束时间
            searchTime:'' ,// 搜索 - 对账时间
            searchUserType:'', //搜索 - 用户类型
            searchWithdrawType :'', //搜索 - 提现方式
            searchtradeNo:'',    //搜索 - 流水号
            searchUserName:'',   //搜索 - 用户昵称
            searchRealName:'', // 搜索 - 用户真实姓名
            searchUserMallId:'' , // 搜索 - 用户翼猫id
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
            userType: this.state.searchUserType,
            withdrawType :this.state.searchWithdrawType,
            id:this.state.searchId,
            userName:this.state.searchUserName,
            realName:this.state.searchRealName,
            ambassadorName:this.state.searchambassadorName,
            tradeNo: this.state.searchtradeNo,
            minPrice: this.state.searchMinPrice,
            maxPrice: this.state.searchMaxPrice,
            userMallId:this.state.searchUserMallId,
            crediBeginTime: this.state.searchBeginTime ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00` : '',
            crediEndTime: this.state.searchEndTime ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`: '',
            beginTime: this.state.searchTime ? `${tools.dateToStrQ(this.state.searchTime._d)} 00:00:00` : '',
            endTime: this.state.searchTime ?`${tools.dateToStrQ(this.state.searchTime._d)} 23:59:59` :'',
        };
        this.props.actions.cashRecord(tools.clearNull(params)).then((res) => {
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

    // 工具 - 根据ID获取用户来源名字
    getListByModelId(id) {
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


    //搜索 - 用户类型输入框值改变时触发
    searchUserTypeChange(e) {
        this.setState({
            searchUserType:e,
        });
    }

    //搜索 - 提现方式改变时触发
    searchCashTypeChange(e) {
        this.setState({
            searchWithdrawType :e,
        });
    }

    //搜索 - 流水号
    searchTradeNoChange(e) {
        this.setState({
            searchtradeNo:e.target.value,
        });
    }

    //搜索 - 用户昵称查询
    searchUserNameChange(e) {
        this.setState({
            searchUserName:e.target.value,
        });
    }

    //搜索 - 用户昵称查询
    searchRealNameChange(e) {
        this.setState({
            searchRealName:e.target.value,
        });
    }

    //搜索 - 用户id
    searchUserMallIdChange(e) {
        this.setState({
            searchUserMallId:e.target.value,
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
            searchTime:undefined,
        });
    }

    // 搜索 - 结束时间变化
    searchEndTime(v) {
        console.log('触发：', v);
        let date = v;
        const now = new Date();
        if (v._d.getFullYear() === now.getFullYear() && v._d.getMonth() === now.getMonth() && v._d.getDate() === now.getDate()) {
            date = moment();
        }
        this.setState({
            searchEndTime: date,
            searchTime:undefined,
        });
    }


    //搜索 - 对账时间的变化
    searchTime(v){
        this.setState({
            searchTime : v,
            searchEndTime: undefined,
            searchBeginTime: undefined,
        });
    }


    // 搜索
    onSearch() {
        this.onGetData(1, this.state.pageSize);
    }
    //导出
    onExport(){
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    // 查询某一条数据的详情
    onQueryClick(record) {
        console.log('是什么：', record);
        this.setState({
            nowData: record,
            queryModalShow: true,
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
                title: '流水号',
                dataIndex: 'partnerTradeNo',
                key: 'partnerTradeNo',
            },
            {
                title: '到账时间',
                dataIndex:'crediBeginTime',
                key:'crediBeginTime'
            },
            {
                title: '提现方式',
                dataIndex: 'destCash',
                key: 'destCash',
                // render: (text) => String(text) === '1' ? <span>微信零钱</span> : <span>支付宝钱包</span>
            },
            {
                title: '用户类型',
                dataIndex: 'userType',
                key: 'userType',
                render: (text) => this.getListByModelId(text),
            },
            {
                title: '用户id',
                dataIndex: 'userId',
                key: 'userId',
            },
            {
                title: '用户昵称',
                dataIndex:'nickName',
                key:'nickName'
            },
            {
                title: '用户姓名',
                dataIndex:'realName',
                key:'realName'

            },
            {
                title: '提现金额',
                dataIndex: 'amount',
                key: 'amount',
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
                count: item.count,
                ecId: item.ecId,
                fee: item.fee,
                feeType: item.feeType,
                openAccountFee: item.openAccountFee,
                orderType: item.orderType,
                payTime: item.payTime,
                payType: (item.payRecord) ? item.payRecord.payType :'',
                partnerTradeNo: item.partnerTradeNo,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                createTime: item.createTime,
                pay: item.pay,
                name: (item.product) ? item.product.name : '',
                modelId:(item.product)?item.product.typeCode : '',
                typeId:(item.product)?item.product.typeId :'',
                conditions: item.conditions,
                userName: item.userId,
                orderFrom:item.orderFrom,
                ambassadorName:(item.distributor) ? item.distributor.mobile : '',
                name2:(item.station)? item.station.name : '',
                mchOrderId:(item.payRecord)? item.payRecord.mchOrderId :'',
                destCash:item.destCash,
                userId:item.userId,
                crediBeginTime:item.crediBeginTime,
                crediEndTime:item.crediEndTime,
                totalAmount:item.totalAmount,
                amount: item.amount,
                nickName:(item.userInfo) ? item.userInfo.nickName : '',
                realName:(item.userInfo) ? item.userInfo.realName : '',
                userType:(item.userInfo) ? item.userInfo.userType : '',
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
                          <span>流水号查询</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchTradeNoChange(e)}/>
                      </li>
                      <li>
                          <span style={{marginRight:'10px'}}>到账时间</span>
                          <DatePicker
                              showTime={{defaultValue:moment('00:00:00','HH:mm:ss')}}
                              format="YYYY-MM-DD HH:mm:ss"
                              placeholder="开始时间"
                              value={this.state.searchBeginTime}
                              onChange={(e) =>this.searchBeginTime(e)}
                              onOk={onOk}
                          />
                          --
                          <DatePicker
                              showTime={{defaultValue:moment('23:59:59','HH:mm:ss')}}
                              format="YYYY-MM-DD HH:mm:ss"
                              placeholder="结束时间"
                              value={this.state.searchEndTime}
                              onChange={(e) =>this.searchEndTime(e)}
                              onOk={onOk}
                          />
                      </li>
                      <li>
                          <span>用户类型</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchUserTypeChange(e)}>
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
                          <span>提现金额</span>
                          <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.searchMinPriceChange(e)} value={this.state.searchMinPrice}/>--
                          <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.searchMaxPriceChange(e)} value={this.state.searchMaxPrice}/>
                      </li>
                      <li>
                          <span>提现方式</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchCashTypeChange(e)}>
                              <Option value={1}>微信零钱</Option>
                              <Option value={2}>支付宝钱包</Option>
                          </Select>
                      </li>
                      <li>
                          <span>用户昵称</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchUserNameChange(e)}/>
                      </li>
                      <li>
                          <span>用户id</span>
                          <Input style={{ width: '172px' ,marginRight:'40px'}} onChange = {(e) => this.searchUserMallIdChange(e)}/>
                      </li>

                      <li>
                          <span>用户姓名查询</span>
                          <Input style={{ width: '172px' }}  onChange = {(e) => this.searchRealNameChange(e)}/>
                      </li>
                      <li>
                          <span style={{width:'50px'}}>对账日期</span>
                          <DatePicker
                              value={this.state.searchTime}
                              onChange={(e) =>this.searchTime(e)}
                          />
                      </li>
                      <li style={{marginLeft:'40px'}}>
                          <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                      </li>
                      <li>
                          <Button icon="download" style={{color: '#fff',backgroundColor:'#108ee9',borderColor: '#108ee9'}} onClick={warning}>导出</Button>
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
                {/* 查看详情模态框 */}
              <Modal
                  title="查看详情"
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
              >
                <Form>
                    <FormItem
                        label="流水号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.partnerTradeNo : ''}
                    </FormItem>
                    <FormItem
                        label="用户类型"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getListByModelId(this.state.nowData.userType) : ''}
                    </FormItem>
                    <FormItem
                        label="用户账号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.userId : ''}
                    </FormItem>
                    <FormItem
                        label="用户昵称"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.nickName : ''}
                    </FormItem>
                    <FormItem
                        label="用户姓名"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.userName : ''}
                    </FormItem>
                    <FormItem
                        label="提现金额"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.amount : ''}
                    </FormItem>
                    <FormItem
                        label="提现方式"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.destCash : ''}
                        {/*{!!this.state.nowData ? (String(this.state.nowData.destCash) === '1' ? <span>微信零钱</span> : <span>支付宝钱包</span>) : ''}*/}
                    </FormItem>
                    <FormItem
                        label="到账时间"
                        {...formItemLayout}
                    >
                        {/*{!!this.state.nowData ? this.state.nowData.count : ''}*/}
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
        actions: bindActionCreators({ findProductModelByWhere,onChange,onOk ,cashRecord,onChange4,warning}, dispatch),
    })
)(WrappedHorizontalRole);
