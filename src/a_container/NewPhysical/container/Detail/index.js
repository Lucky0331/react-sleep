/* List 体检管理/体检列表 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import P from 'prop-types';
import Config from '../../../../config/config';
import { Form, Button, Icon, Input, InputNumber, Table, message, Popconfirm, Popover, Modal, Radio, Tooltip, Select, DatePicker, Divider,Cascader } from 'antd';
import './index.scss';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
import _ from 'lodash';
// ==================
// 所需的所有组件
// ==================


// ==================
// 本页面所需action
// ==================

import { findReserveList, addProduct, upReserveList, deleteProduct, deleteImage, findticketModelByWhere,addticket} from '../../../../a_action/shop-action';
import { findAllProvince,findStationByArea, findCityOrCounty, findProductTypeByWhere,queryStationList, addStationList, upStationList, delStationList } from '../../../../a_action/sys-action';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { RangePicker } = DatePicker;
class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // 当前页面全部数据
            productTypes: [],   // 所有的产品类型
            productModels: [],  // 所有的产品型号
            productModelIds: [],   // 所有的体检卡型号
            searchTicketNo: '', // 搜索 - 体检卡号
            searchAddress: [], // 搜索 - 地址
            searchTicketModel: undefined, // 搜索 - 体检卡型号
            searchStationName: '',  //搜索 - 关键字搜索
            searchBeginTime: '',  // 搜索 - 开始时间
            searchEndTime: '',  // 搜索- 结束时间
            addOrUp: 'add',     // 当前操作是新增还是修改
            addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
            addnewLoading: false, // 是否正在添加新用户中
            nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
            queryModalShow: false, // 查看详情模态框是否显示
            pageNum: 1, // 当前第几页
            pageSize: 10, // 每页多少条
            total: 0, // 数据库总共多少条数据
            fileList: [],   // 产品图片已上传的列表
            fileListDetail: [], // 详细图片已上传的列表
            fileLoading: false, // 产品图片正在上传
            fileDetailLoading: false,   // 详细图片正在上传
            citys: [],  // 符合Cascader组件的城市数据
            stations: [], // 当前省市区下面的服务站
            searchState: '', // 搜索 - 是否禁用
            searchExpire: '', // 搜索 - 是否到期
            searchSurplus:'', //搜索剩余可用次数
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
        this.getAllticketModel();  // 获取所有的体检卡型号
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
            state: this.state.searchState,
            isExpire: this.state.searchExpire,
            surplus: this.state.searchSurplus,
            province: this.state.searchAddress[0],
            city: this.state.searchAddress[1],
            region: this.state.searchAddress[2],
            mobile: this.state.searchMobile,
            code: this.state.searchCode,
            stationName: this.state.searchStationName,
            ticketNo:this.state.searchTicketNo,
            ticketModel: this.state.searchTicketModel,
            beginTime: this.state.searchBeginTime ? tools.dateToStrD(this.state.searchBeginTime._d) : '',
            endTime: this.state.searchEndTime ? tools.dateToStrD(this.state.searchEndTime._d) : '',
        };
        this.props.actions.findReserveList(tools.clearNull(params)).then((res) => {
            if(res.returnCode === "0") {
                this.setState({
                    data: res.messsageBody.ticketPage,
                    pageNum,
                    pageSize,
                    total: res.messsageBody.total,
                });
            } else {
                message.error(res.returnMessaage || '获取数据失败，请重试');
            }
        });
    }

    //获取所有的体检卡型号
    getAllticketModel() {
        this.props.actions.findticketModelByWhere({ pageNum: 0, pageSize: 9999,typeId: 5 }).then((res) => {
            if(res.returnCode === '0') {
                this.setState({
                    productModelIds: res.messsageBody,
                });
            }
        });
    }

    // 工具 - 根据有效期type和num组合成有效期
    getNameForInDate(time, type) {
        switch(String(type)){
            case '0': return '长期有效';
            case '1': return `${time}日`;
            case '2': return `${time}月`;
            case '3': return `${time}年`;
            default: return '';
        }
    }

    //工具 - 根据服务站地区返回服务站名称id
    getStationId(id) {
        const t = this.state.data.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    //搜索 - 是否禁用输入框值改变时触发
    searchStateChange(e) {
        this.setState({
            searchState: e,
        });
    }

    //搜索 - 体检卡号搜索
    searchTicketNo(e){
        this.setState({
            searchTicketNo: e.target.value,
        });
    }

    // 搜索 - 开始时间变化
    searchBeginTime(v) {
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

    // 搜索 - 是否到期
    searchExpireChange(e){
        this.setState({
            searchExpire: e,
        });
    }

    //搜索 - 剩余可用次数
    searchSurplusChange(e){
        this.setState({
            searchSurplus: e.target.value,
        })
    }

    // 获取所有的省
    getAllCity0() {
        this.props.actions.findAllProvince();
    }

    // 搜索
    onSearch() {
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    // 搜索 - 体检卡型号输入框值改变时触发
    searchTicketModelChange(v) {
        this.setState({
            searchTicketModel: v,
        });
    }

    // 查询某一条数据的详情
    onQueryClick(record) {
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

    // 关闭模态框
    onAddNewClose() {
        this.setState({
            addnewModalShow: false,
        });
    }

    // 构建字段
    makeColumns(){
        const columns = [
            {
                title: '序号',
                dataIndex: 'serial',
                key: 'serial',
            },
            {
                title: '服务站名称',
                dataIndex: 'station.name',
                key: 'station.name',
            },
            {
                title:'体检卡号',
                dataIndex: 'ticketNo',
                key: 'ticketNo',
            },
            {
                title:'体检卡型号',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title:'有效期',
                dataIndex: 'timeLimitNum',
                key: 'timeLimitNum',
                render: (text, record) => this.getNameForInDate(text, record.timeLimitType),
            },
            {
                title: '到期时间',
                dataIndex: 'validEndTime',
                key: 'validEndTime',
            },
            {
                title:'是否到期',
                dataIndex: 'isExpire',
                key: 'isExpire',
                render: (text) => String(text) === '0' ? <span style={{color: 'red'}}>已到期</span> : <span style={{color: 'green'}}>未到期</span>
            },
            {
                title:'总可用次数',
                dataIndex: 'hraCard.ticketNum',
                key: 'hraCard.ticketNum',
            },
            {
                title:'剩余可用次数',
                dataIndex: 'hraCard.productModel.useCount',
                key: 'hraCard.productModel.useCount',
            },
            {
                title:'是否禁用',
                dataIndex: 'state',
                key: 'state',
                render: (text) => String(text) === '1' ? <span style={{color: 'green'}}>未禁用</span> : <span style={{color: 'red'}}>已禁用</span>
            },
            {
                title:'分配时间',
                dataIndex: 'createTime',
                key:'createTime'
            },
            {
                title: '操作',
                key: 'control',
                fixed: 'right',
                width: 120,
                render: (text, record) => {
                    const controls = [];

                    controls.push(
                        <span key="0" className="control-btn green" onClick={() => this.onQueryClick(record)}>
                            <Tooltip placement="top" title="查看">
                                <Icon type="eye" />
                            </Tooltip>
                        </span>
                    );
                    const result = [];
                    controls.forEach((item, index) => {
                        if (index) {
                            result.push(<Divider type="vertical" />);
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
        console.log('data是个啥：', data);
        return data.map((item, index) => {
            return {
                key: index,
                id: item.id,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                arriveTime: item.arriveTime,
                code: item.code,
                conditions: item.conditions,
                createTime: item.createTime,
                creator: item.creator,
                height: item.height,
                idCard: item.idCard,
                mobile: item.mobile,
                name: item.hraCard.productModel.name,
                reserveTime: item.reserveTime,
                sex: item.sex,
                ticketNo: item.ticketNo,
                ticketNum: item.ticketNum,
                stationId:this.getStationId,
                stationName:this.getStationId(item.stationId),
                updateTime: item.updateTime,
                updater: item.updater,
                userSource: item.userSource,
                weight: item.weight,
                isExpire: item.isExpire,
                validEndTime: item.validEndTime,
                createTime: item.createTime,
                timeLimitNum:item.hraCard.productModel.timeLimitNum,
                timeLimitType: item.hraCard.productModel.timeLimitType,
                state:item.state,
                ticketModel:item.ticketModel,
                disabled:item.disabled,
                selfStation:item.selfStation,
                station:item.station,
                productModelId:item.productModelId,
                cardCount:item.cardCount,
                hraCard:item.hraCard,
                citys: (item.province && item.city && item.region) ? `${item.province}/${item.city}/${item.region}` : '',
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
                sm: { span: 10 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        console.log('是啥：', this.state.citys);
        return (
            <div style={{ width: '100%' }}>
                <div className="system-search">
                    <ul className="search-ul">
                        <li>
                            <span style={{marginRight:'10px'}}>体检卡型号</span>
                            <Select allowClear placeholder="全部" value={this.state.searchTicketModel} style={{width:'150px'}} onChange={(e) => this.searchTicketModelChange(e)}>
                                {this.state.productModelIds.map((item, index) => {
                                    return <Option key={index} value={item.id}>{ item.name }</Option>
                                })}
                            </Select>
                        </li>
                        <li style={{width:'180px'}}>体检卡号  <Input style={{width:'50%',marginRight:'10px'}} onChange={(e) => this.searchTicketNo(e)}/></li>
                        <li>
                            <span style={{marginRight:'10px'}}>是否到期</span>
                            <Select placeholder="全部" allowClear style={{  width: '120px',marginRight:'15px' }} onChange={(e) => this.searchExpireChange(e)}>
                                <Option value={0}>已到期</Option>
                                <Option value={1}>未到期</Option>
                            </Select>
                        </li>
                        <li>剩余可用次数：  <Input style={{marginRight:'10px',width:'150px'}}  onChange={(e) => this.searchSurplusChange(e)}/></li>
                        <li>
                            <span>是否禁用</span>
                            <Select placeholder="全部" allowClear style={{  width: '120px',marginRight:'15px' }} onChange={(e) => this.searchStateChange(e)}>
                                <Option value={0}>未禁用</Option>
                                <Option value={1}>已禁用</Option>
                            </Select>
                        </li>
                        <li>分配时间
                            <DatePicker
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
                                placeholder="起始时间"
                                onChange={(e) => this.searchBeginTime(e)}
                            />
                            --
                            <DatePicker
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
                        <li><Button type="primary" onClick={() => this.onSearch()}>查询</Button></li>
                    </ul>
                </div>
                <div className="system-table" >
                    <Table
                        columns={this.makeColumns()}
                        className="my-table"
                        scroll={{ x: 1600 }}
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
                            label="服务站名称"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.station.name : ''}
                        </FormItem>
                        <FormItem
                            label="体检卡号"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.ticketNo : ''}
                        </FormItem>
                        <FormItem
                            label="分配日期"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.createTime : ''}
                        </FormItem>
                        <FormItem
                            label="到期日期"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.validEndTime : ''}
                        </FormItem>
                        <FormItem
                            label="有效期"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.getNameForInDate(this.state.nowData.timeLimitNum, this.state.nowData.timeLimitType) : ''}
                        </FormItem>
                        <FormItem
                            label="是否到期"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? (String(this.state.nowData.isExpire) === "0" ? <span style={{ color: 'red' }}>已到期</span> : <span style={{ color: 'green' }}>未到期</span>) : ''}
                        </FormItem>
                        <FormItem
                            label="是否禁用"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? (String(this.state.nowData.state) === "1" ? <span style={{ color: 'green' }}>未禁用</span> : <span style={{ color: 'red' }}>已禁用</span>) : ''}
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
        actions: bindActionCreators({ findReserveList,addticket, addProduct, upReserveList, deleteProduct, deleteImage, findticketModelByWhere ,findAllProvince,findStationByArea, findCityOrCounty, findProductTypeByWhere,queryStationList, addStationList, upStationList, delStationList}, dispatch),
    })
)(WrappedHorizontalRole);
