/* List 资金管理/结算查询 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, InputNumber, Cascader, Modal, Radio, Tooltip, Select, DatePicker,Tabs, Divider ,Popover} from 'antd';
import './index.scss';
import Config from '../../../../config/config';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';

// ==================
// 所需的所有组件
// ==================

import moment from 'moment';

// ==================
// 本页面所需action
// ==================

import { findProductTypeByWhere, findSaleRuleByWhere, findAllProvince,findCityOrCounty } from '../../../../a_action/shop-action';
import { findStationByArea } from '../../../../a_action/sys-action';
import { getSupplierIncomeList, getSupplierIncomeMain, getStationIncomeList, searchCompanyIncome } from '../../../../a_action/curr-action';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { MonthPicker} = DatePicker;
class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataHQ: [],                 // 总部 - 主列表 - 数据
            pageNumHQ: 1,               // 总部 - 主列表 - 当前第几页
            pageSizeHQ: 10,             // 总部 - 主列表 - 每页多少条
            totalHQ: 0,                 // 总部 - 主列表 - 共多少条数据
            HQSearchAllot: undefined,   // 总部 - 搜索 - 分配类型
            HQSearchMin: undefined,     // 总部 - 搜索 - 最小金额
            HQSearchMax: undefined,     // 总部 - 搜索 - 最大金额
            HQSearchProfit: undefined,  // 总部 - 搜索 - 收益类型
            HQSearchProduct: undefined, // 总部 - 搜索 - 产品类型
            HQSearchOrderNo: undefined, // 总部 - 搜索 - 订单号
            HQSearchDate: moment(),     // 总部 - 搜索 - 年月

            dataHQMain: [], // 总部 - 上方列表 - 数据

            dataSE: [],                 // 服务 - 主列表 - 数据
            pageNumSE: 1,               // 服务 - 主列表 - 当前第几页
            pageSizeSE: 10,             // 服务 - 主列表 - 每页多少条
            totalSE: 0,                 // 服务 - 主里诶报 - 共多少条数据
            SESearchAllot: undefined,   // 服务 - 搜索 - 分配类型
            SESearchMin: undefined,     // 服务 - 搜索 - 最小金额
            SESearchMax: undefined,     // 服务 - 搜索 - 最大金额
            SESearchProfit: undefined,  // 服务 - 搜索 - 收益类型
            SESearchProduct: undefined, // 服务 - 搜索 - 产品类型
            SESearchOrderNo: undefined, // 服务 - 搜索 - 订单号

            dataSEMain: null,             // 服务 - 上方列表 - 数据

            SESearchDate: moment(),    // 服务 - 上方 - 结算月份
            SESearchArea: undefined,    // 服务 - 上方 - 地区
            SESearchName: undefined,    // 服务 - 上方 - 服务站名称

            typesAllot: [],             // 所有的分配类型数据
            typesProfit: [],            // 所有的收益类型数据
            typesProduct: [],           // 所有的产品类型数据

            nowData: null,              // 当前选中的数据 两个表格共用，因为字段相同
            queryModalShow: false,      // 查看详情模态框是否显示 两个表格共用，因为字段相同

            citys: [],                  // 符合Cascader组件的城市数据
            stations: [],               // 当前省市区下面的服务站

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

        /** 查所有的分配类型 **/
        this.getAllAllotTypes();
        /** 查询所有的收益类型 **/
        this.getProfitTypes();
        /** 查所有的产品类型 **/
        this.getAllProductTypes();
        /** 进入页面查询总部上方表格数据 **/
        this.onGetDataHQMain(this.state.HQSearchDate);
        /** 进入页面获取一次总部收入列表 **/
        this.onGetDataHQ(this.state.pageNumHQ, this.state.pageSizeHQ);

        /** 进入页面获取一次服务站收入列表 **/
        this.onGetDataSE(this.state.pageNumSE, this.state.pageSizeSE);


    }

    componentWillReceiveProps(nextP) {
        if(nextP.citys !== this.props.citys) {
            this.setState({
                citys: nextP.citys.map((item, index) => ({ id: item.id, value: item.areaName, label: item.areaName, isLeaf: false})),
            });
        }
    }

    /** 总部 - 主列表 - 查询主表格所需数据 **/
    onGetDataHQ(pageNum, pageSize) {
        console.log('AAAA:', pageNum, pageSize);
        const params = {
            pageNum,
            pageSize,
            distributionType: Number(this.state.HQSearchAllot),   // 总部 - 搜索 - 分配类型
            minIncome: this.state.HQSearchMin,     // 总部 - 搜索 - 最小金额
            maxIncome: this.state.HQSearchMax,     // 总部 - 搜索 - 最大金额
            incomeType: this.state.HQSearchProfit,  // 总部 - 搜索 - 收益类型
            orderId: this.state.HQSearchOrderNo,    // 总部 - 搜搜 - 订单号
            balanceMonth: this.state.HQSearchDate ? tools.dateToStr(this.state.HQSearchDate._d) : null,
        };
        this.props.actions.getSupplierIncomeList(tools.clearNull(params)).then((res) => {
            if(res.status === 200) {
                console.log('到底是什么：', res.data.result);
                this.setState({
                    dataHQ: res.data.result || [],
                    pageNumHQ: pageNum,
                    pageSizeHQ: pageSize,
                    totalHQ: res.data.total,
                });
            } else {
                message.error(res.message || '获取数据失败，请重试');
            }
        });
    }

    /** 总部 - 上面 - 查询总收益 **/
    onGetDataHQMain() {
        const params = {
            pageNum:1,
            pageSize:1,
            balanceMonth: this.state.HQSearchDate ? tools.dateToStr(this.state.HQSearchDate._d) : null,
        };
        this.props.actions.getSupplierIncomeList(tools.clearNull(params)).then((res) => {
            if(res.status === 200) {
                console.log('到底是什么：', res.data.result);
                this.setState({
                    dataHQMain: res.data.result || [],
                });
            } else {
                message.error(res.message || '获取数据失败，请重试');
            }
        });
    }

    /** 总部 - 主列表 - 点击搜索按钮 **/
    onHQSearch() {
        this.onGetDataHQ(this.state.pageNumHQ, this.state.pageSizeHQ);
    }

    /** 总部 - 搜索相关 **/
    onHQSearchAllot(e) {     // 分配类型选择
        this.setState({
            HQSearchAllot: e,
        });
    }
    onHQSearchMin(e) {      // 最小金额
        this.setState({
            HQSearchMin: e,
        });
    }
    onHQSearchMax(e) {      // 最大金额
        this.setState({
            HQSearchMax: e,
        });
    }
    onHQSearchProfit(e) {   // 收益类型
        this.setState({
            HQSearchProfit: e,
        });
    }
    onHQSearchOrderNo(e) {  // 订单号
        this.setState({
            HQSearchOrderNo: e.target.value,
        });
    }
    onHQSearchProduct(e) {  // 产品类型
        this.setState({
            HQSearchProduct: e,
        });
    }
    /** 总部&服务站 共用（因为字段一样 - 构建字段 **/
    makeColumns(){
        const columns = [
            {
                title: '序号',
                dataIndex: 'serial',
                key: 'serial',
            },
            {
                title: '收益金额',
                dataIndex: 'income',
                key: 'income',
            },
            {
                title: '收益类型',
                dataIndex: 'incomeType',
                key: 'incomeType',
            },
            // {
            //     title:
            //         <Popover title="提示" content={<div>
            //         </div>} trigger="hover" placement="bottomLeft">
            //             <span>分配类型</span><Icon type="question-circle" style={{fontSize:'20px',marginLeft:'5px',marginTop:'3px'}}/>
            //         </Popover> ,
            //     dataIndex: 'distributionType',
            //     key: 'distributionType',
            //     render: (text) => this.getNameByDisCode(text),
            // },
            {
                title: '订单号',
                dataIndex: 'orderId',
                key: 'orderId',
            },
            {
                title: '产品类型',
                dataIndex: 'productTypeName',
                key: 'productTypeName',
            },
            {
                title: '订单总金额',
                dataIndex: 'orderTotalFee',
                key: 'orderTotalFee',
            },
            {
                title: '结算月份',
                dataIndex: 'balanceMonth',
                key: 'balanceMonth',
            },
            {
                title: '操作',
                key: 'control',
                width: 170,
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

    /** 总部 构建table所需数据 **/
    makeData(data) {
        console.log('data是个啥：', data);
        return data.map((item, index) => {
            return {
                key: index,
                id: item.id,
                serial:(index + 1) + ((this.state.pageNumHQ - 1) * this.state.pageSizeHQ),
                income: item.income,                    // 金额
                incomeType: item.incomeType,            // 收益类型
                distributionType: item.distributionType,// 分配类型的code
                orderId: item.orderId,                  // 订单号
                productTypeName: item.productTypeName,  // 产品类型
                orderTotalFee: item.orderTotalFee,      // 订单总金额
                balanceMonth: item.balanceMonth,        // 结算月份
                control: item,                          // 操作按钮
            }
        });
    }

    /** 查看详情模态框出现 **/
    onQueryClick(record) {
        this.setState({
            nowData: record,
            queryModalShow: true,
        });
    }
    /** 查看详情模态框消失 **/
    onQueryModalClose() {
        this.setState({
            nowData: null,
            queryModalShow: false,
        });
    }

    /** 总部 - 上方列表 - 日期改变时触发 **/
    onHQMainDateSearch(e) {
        this.setState({
            HQSearchDate: e,
        });
        setTimeout(() => {
            this.onGetDataHQ(this.state.pageNumHQ,this.state.pageSizeHQ);
            this.onGetDataHQMain();
        });
    }
    /** 服务站收益 - 获取省级数据（上方查询服务站地区用） **/
    getAllCity0() {
        this.props.actions.findAllProvince();
    }

    /** 服务站收益 - 获取某省下面的市（上方查询服务站地区用） **/
    getAllCitySon(selectedOptions) {
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

    /** 总部 - 主表单页码改变 **/
    onHQTablePageChange(page, pageSize) {
        this.onGetDataHQ(page, pageSize);
    }

    /** 总部 - 构建上面表格字段 **/
    makeColumnsTop(){
        const columns = [
            {
                title: '结算主体',
                dataIndex: 'incomeType',
                key: 'incomeType',
            },
            {
                title: '结算月份',
                dataIndex: 'balanceMonth',
                key: 'balanceMonth',
            },
            {
                title: '总订单金额',
                dataIndex: 'orderTotalFee',
                key: 'orderTotalFee',
            },
            {
                title: '总收益',
                dataIndex: 'income',
                key: 'income',
            },
        ];
        return columns;
    }
    /** 总部 - 构建上面表格数据 **/
    makeDataTop(data){
        console.log('data是个啥：', data);
        return data.map((item, index) => {
            return {
                key: index,
                id: item.id,
                income: item.income,                    // 金额
                incomeType: item.incomeType,            // 收益类型
                orderId: item.orderId,                  // 订单号
                orderTotalFee: item.orderTotalFee,      // 订单总金额
                productTypeName: item.productTypeName,  // 产品类型
                distributionType: item.distributionType,// 分配类型
                balanceMonth: item.balanceMonth,        // 结算月份
            }
        });
    }

    /** 工具 - 根据分配类型code返回其名称 **/
    getNameByDisCode(code) {

        const t = this.state.typesAllot.find((item) => {
            return item.ruleCode === code;
        });

        return t ? t.ruleName : '';
    }

    /** 服务站 - 主列表 - 获取数据 **/
    onGetDataSE(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
            distributionType: Number(this.state.SESearchAllot),   // 服务站 - 搜索 - 分配类型
            minIncome: this.state.SESearchMin,     // 服务站 - 搜索 - 最小金额
            maxIncome: this.state.SESearchMax,     // 服务站 - 搜索 - 最大金额
            incomeType: this.state.SESearchProfit,  // 服务站 - 搜索 - 收益类型
            orderId: this.state.SESearchOrderNo,    // 服务站 - 搜搜 - 订单号
            balanceMonth: this.state.SESearchDate ? tools.dateToStr(this.state.SESearchDate._d) : null,
            province: this.state.SESearchArea && this.state.SESearchArea[0],
            city: this.state.SESearchArea && this.state.SESearchArea[1],
            region: this.state.SESearchArea && this.state.SESearchArea[2],
        };
        this.props.actions.getStationIncomeList(tools.clearNull(params)).then((res) => {
            if(res.status === 200) {
                console.log('到底是什么：', res.data.result);
                this.setState({
                    dataSE: res.data.result || [],
                    pageNumSE: pageNum,
                    pageSizeSE: pageSize,
                    totalSE: res.data.total,
                });
            } else {
                message.error(res.message || '获取数据失败，请重试');
            }
        });
    }

    /** 服务站 - 主列表 - 点击搜索按钮 **/
    onSESearch() {
        this.onGetDataSE(this.state.pageNumSE, this.state.pageSizeSE);
    }

    /** 服务站 - 搜索相关 **/
    onSESearchAllot(e) {     // 分配类型选择
        this.setState({
            SESearchAllot: e,
        });
    }
    onSESearchMin(e) {      // 最小金额
        this.setState({
            SESearchMin: e,
        });
    }
    onSESearchMax(e) {      // 最大金额
        this.setState({
            SESearchMax: e,
        });
    }
    onSESearchProfit(e) {   // 收益类型
        this.setState({
            SESearchProfit: e,
        });
    }
    onSESearchOrderNo(e) {  // 订单号
        this.setState({
            SESearchOrderNo: e.target.value,
        });
    }
    onSESearchProduct(e) {  // 产品类型
        this.setState({
            SESearchProduct: e,
        });
    }

    /** 服务站 - 上方 - 选择省市区 **/
    onCascaderChange(v) {
        this.setState({
            SESearchArea: v,
        });
    }

    /** 服务站 - 主表 - 页码改变时触发 **/
    onSETablePageChange(page, pageSize) {
        this.onGetDataSE(page, pageSize);
    }

    /** 服务站 - 上方部分 - 获取数据 **/
    onSESearchMain() {
        if (!this.state.SESearchDate) {
            message.error('请选择结算月份', 1);
            return;
        } else if (!this.state.SESearchArea){
            message.error('请选择服务站地区', 1);
            return;
        }
        const params = {
            balanceMonth: this.state.SESearchDate ? tools.dateToStr(this.state.SESearchDate._d) : null,
            province: this.state.SESearchArea ? this.state.SESearchArea[0] : null,
            city: this.state.SESearchArea ? this.state.SESearchArea[1] : null,
            region: this.state.SESearchArea ? this.state.SESearchArea[2] : null,
        };
        this.props.actions.searchCompanyIncome(tools.clearNull(params)).then((res) => {
            if (res.status === 200) {
                this.setState({
                    dataSEMain: res.data,
                });
            }
        });
        this.onSESearch();
    }
    /** 服务站 - 上方查询相关 **/
    onSESearchDate(e) { // 年月改变时触发
        this.setState({
            SESearchDate: e,
        });
    }

    /** 查所有的分配类型 **/
    getAllAllotTypes() {
        this.props.actions.findSaleRuleByWhere({ pageNum: 1, pageSize: 999 }).then((res) => {
            if (res.returnCode === '0') {
                this.setState({
                    typesAllot: res.messsageBody.result,
                });
            }
        })
    }

    /** 查所有的收益类型 目前写死的 **/
    getProfitTypes() {
        this.setState({
            typesProfit: [{ label: '经营收益', value: '经营收益' }, { label: '服务收益', value: '服务收益' }],
        });
    }

    /** 查所有的产品类型 **/
    getAllProductTypes() {
        this.props.actions.findProductTypeByWhere({ pageNum: 1, pageSize: 999 }).then((res) => {
            if (res.returnCode === '0') {
                this.setState({
                    typesProduct: res.messsageBody.result,
                });
            }
        });
    }

    /** 导出 **/
    onExportData(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
        };
        let form = document.getElementById('download-form');
        if (!form) {
            form = document.createElement('form');
            document.body.appendChild(form);
        }
        form.id = 'download-form';
        form.action = `${Config.baseURL}/manager/capital/earnedIncome/export`;
        form.method = 'post';
        console.log('FORM:', form);
        form.submit();
    }

    /** 总部 - 导出按钮被点击 **/
    onHQDownload() {
        this.onExportData(1, 99999);
    }
    /** 服务站 - 导出按钮被点击 **/
    onSEDownload() {
        this.onExportData(1, 99999);
    }

    render() {
        const me = this;
        const { form } = me.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        console.log('怎么会：', this.state.dataSEMain);
        return (
            <div style={{ width: '100%' }}>
                <div className="system-search">
                    <ul className="search-func">
                        <li>
                            <div>
                                <Tabs type="card">
                                    <TabPane tab="总部收益" key="1">
                                        <div className="system-table" >
                                            <ul className="search-func" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                <span style={{margin:'10px'}}>结算月份：</span>
                                                <MonthPicker
                                                    style={{ width: '130px' }}
                                                    value={this.state.HQSearchDate}
                                                    onChange={(e) => this.onHQMainDateSearch(e)}
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
                                                    format="YYYY-MM"
                                                    placeholder="选择月份"
                                                />
                                            </ul>
                                            <Table
                                                columns={this.makeColumnsTop()}
                                                dataSource={this.makeDataTop(this.state.dataHQMain)}
                                                pagination={{
                                                    total: 0,
                                                    defaultPageSize:1,
                                                    pageSizeOptions:1,
                                                    hideOnSinglePage:true,
                                                }}
                                            />
                                        </div>
                                        <div className="system-table" >
                                            <ul className="search-ul more-ul" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                {/*<li style={{marginLeft:'-14px'}}>*/}
                                                    {/*<span>分配类型：</span>*/}
                                                    {/*<Select placeholder="全部" allowClear style={{ width: '200px'}} onChange={(e) => this.onHQSearchAllot(e)} value={this.state.HQSearchAllot}>*/}
                                                        {/*{*/}
                                                            {/*this.state.typesAllot.map((item, index) => {*/}
                                                                {/*return <Option key={index} value={String(item.id)}>{item.ruleName}</Option>*/}
                                                            {/*})*/}
                                                        {/*}*/}
                                                    {/*</Select>*/}
                                                {/*</li>*/}
                                                <li>
                                                    <span>收益金额：</span>
                                                    <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.onHQSearchMin(e)} value={this.state.HQSearchMin}/>--
                                                    <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.onHQSearchMax(e)} value={this.state.HQSearchMax}/>
                                                </li>
                                                <li>
                                                    <span>收益类型：</span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onHQSearchProfit(e)} value={this.state.HQSearchProfit}>
                                                        {
                                                            this.state.typesProfit.map((item, index) => {
                                                                return <Option key={index} value={String(item.value)}>{item.label}</Option>
                                                            })
                                                        }
                                                    </Select>
                                                </li>
                                                <li>
                                                    <span>订单号</span>
                                                    <Input style={{ width: '150px' }} onChange={(e) => this.onHQSearchOrderNo(e)} value={this.state.HQSearchOrderNo}/>
                                                </li>
                                                {/*<li>*/}
                                                {/*<span>产品类型: </span>*/}
                                                {/*<Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onHQSearchProduct(e)} value={this.state.HQSearchProduct}>*/}
                                                {/*{*/}
                                                {/*this.state.typesProduct.map((item, index) => {*/}
                                                {/*return <Option key={index} value={String(item.id)}>{item.name}</Option>*/}
                                                {/*})*/}
                                                {/*}*/}
                                                {/*</Select>*/}
                                                {/*</li>*/}
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="search" type="primary" onClick={() => this.onHQSearch()}>搜索</Button>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="download" type="primary" onClick={() => this.onHQDownload()}>导出</Button>
                                                </li>
                                            </ul>
                                            {/** 总部主表 **/}
                                            <Table
                                                columns={this.makeColumns()}
                                                className="my-table"
                                                dataSource={this.makeData(this.state.dataHQ)}
                                                pagination={{
                                                    total: this.state.totalHQ,
                                                    current: this.state.pageNumHQ,
                                                    pageSize: this.state.pageSizeHQ,
                                                    showQuickJumper: true,
                                                    showTotal: (total, range) => `共 ${total} 条数据`,
                                                    onChange: (page, pageSize) => this.onHQTablePageChange(page, pageSize)
                                                }}
                                            />
                                        </div>
                                    </TabPane>
                                    <TabPane tab="服务站收益" key="2">
                                        <div className="system-table" style={{width:'400px'}}>
                                            <ul className="more-ul" style={{margin:'10px'}}>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{margin:'10px',marginLeft:'13px'}}>结算月份：</span>
                                                    <MonthPicker
                                                        style={{ width: '170px' }}
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
                                                        format="YYYY-MM"
                                                        placeholder="选择月份"
                                                        value={this.state.SESearchDate}
                                                        onChange={(e) => this.onSESearchDate(e)}
                                                    />
                                                </li>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{marginRight:'8px'}}>服务站地区：</span>
                                                    <Cascader
                                                        style={{width:'170px'}}
                                                        placeholder="请选择服务区域"
                                                        options={this.state.citys}
                                                        loadData={(e) => this.getAllCitySon(e)}
                                                        value={this.state.SESearchArea}
                                                        onChange={(v) => this.onCascaderChange(v)}
                                                    />
                                                </li>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{marginRight:'10px'}}>服务站名称：<span style={{marginLeft:'16px'}}>{this.state.dataSEMain && this.state.dataSEMain.stationName}</span></span>
                                                </li>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{marginRight:'8px',marginLeft:'28px'}}>总收入：<span style={{marginLeft:'13px'}}>{this.state.dataSEMain && `￥${this.state.dataSEMain.income}`}</span></span>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="search" type="primary" onClick={() => this.onSESearchMain()}>搜索</Button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="system-table" >
                                            <ul className="search-ul more-ul" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                <ul className="search-ul more-ul" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                    {/*<li style={{marginLeft:'-14px'}}>*/}
                                                        {/*<span>分配类型：</span>*/}
                                                        {/*<Select placeholder="全部" allowClear style={{ width: '200px'}} onChange={(e) => this.onSESearchAllot(e)} value={this.state.SESearchAllot}>*/}
                                                            {/*{*/}
                                                                {/*this.state.typesAllot.map((item, index) => {*/}
                                                                    {/*return <Option key={index} value={String(item.id)}>{item.ruleName}</Option>*/}
                                                                {/*})*/}
                                                            {/*}*/}
                                                        {/*</Select>*/}
                                                    {/*</li>*/}
                                                    <li>
                                                        <span>收益金额：</span>
                                                        <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.onSESearchMin(e)} value={this.state.SESearchMin}/>--
                                                        <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.onSESearchMax(e)} value={this.state.SESearchMax}/>
                                                    </li>
                                                    <li>
                                                        <span>收益类型：</span>
                                                        <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSESearchProfit(e)} value={this.state.SESearchProfit}>
                                                            {
                                                                this.state.typesProfit.map((item, index) => {
                                                                    return <Option key={index} value={String(item.value)}>{item.label}</Option>
                                                                })
                                                            }
                                                        </Select>
                                                    </li>
                                                    <li>
                                                        <span>订单号</span>
                                                        <Input style={{ width: '150px' }} onChange={(e) => this.onSESearchOrderNo(e)} value={this.state.SESearchOrderNo}/>
                                                    </li>
                                                    {/*<li>*/}
                                                    {/*<span>产品类型: </span>*/}
                                                    {/*<Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onHQSearchProduct(e)} value={this.state.HQSearchProduct}>*/}
                                                    {/*{*/}
                                                    {/*this.state.typesProduct.map((item, index) => {*/}
                                                    {/*return <Option key={index} value={String(item.id)}>{item.name}</Option>*/}
                                                    {/*})*/}
                                                    {/*}*/}
                                                    {/*</Select>*/}
                                                    {/*</li>*/}
                                                    <li style={{marginLeft:'10px'}}>
                                                        <Button icon="search" type="primary" onClick={() => this.onSESearch()}>搜索</Button>
                                                    </li>
                                                    <li style={{marginLeft:'10px'}}>
                                                        <Button icon="download" type="primary" onClick={() => this.onSEDownload()}>导出</Button>
                                                    </li>
                                                </ul>
                                            </ul>
                                            {/** 服务站主表 **/}
                                            <Table
                                                columns={this.makeColumns()}
                                                className="my-table"
                                                dataSource={this.makeData(this.state.dataSE)}
                                                pagination={{
                                                    total: this.state.totalSE,
                                                    current: this.state.pageNumSE,
                                                    pageSize: this.state.pageSizeSE,
                                                    showQuickJumper: true,
                                                    showTotal: (total, range) => `共 ${total} 条数据`,
                                                    onChange: (page, pageSize) => this.onSETablePageChange(page, pageSize)
                                                }}
                                            />
                                        </div>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </li>
                    </ul>
                </div>
                {/** 查看详情Modal **/}
                <Modal
                    title={'查看详情'}
                    visible={this.state.queryModalShow}
                    onOk={() => this.onQueryModalClose()}
                    onCancel={() => this.onQueryModalClose()}
                >
                    <Form>
                        <FormItem
                            label="收益金额"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.income : ''}
                        </FormItem>
                        <FormItem
                            label="收益类型"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.incomeType : ''}
                        </FormItem>
                        {/*<FormItem*/}
                            {/*label="分配类型"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.distributionType : ''}*/}
                        {/*</FormItem>*/}
                        <FormItem
                            label="订单号"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.orderId : ''}
                        </FormItem>
                        <FormItem
                            label="产品类型"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.productTypeName : ''}
                        </FormItem>
                        <FormItem
                            label="订单总金额"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.orderTotalFee : ''}
                        </FormItem>
                        <FormItem
                            label="结算月份"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.balanceMonth : ''}
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
        actions: bindActionCreators({ getSupplierIncomeList, findSaleRuleByWhere, getSupplierIncomeMain, getStationIncomeList, searchCompanyIncome,findProductTypeByWhere,findAllProvince,findStationByArea,findCityOrCounty }, dispatch),
    })
)(WrappedHorizontalRole);
