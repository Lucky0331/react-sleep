/* List 资金管理/结算查询 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import Config from '../../../../config/config';
import { Form, Button, Icon, Input, Table, message, InputNumber, Cascader, Modal, Radio, Tooltip, Select, DatePicker,Tabs, Divider ,Popover} from 'antd';
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

import { findProductByWhere, findProductTypeByWhere,findAllProvince,findCityOrCounty,onChange,addProduct,saleMoneyList, updateProduct, updateProductType,deleteProduct,removeProduct, deleteImage, findProductModelByWhere ,upProductModel } from '../../../../a_action/shop-action';
import { findStationByArea } from '../../../../a_action/sys-action';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'top',
            data: [], // 当前页面全部数据
            stations: [], // 当前省市区下面的服务站
            productTypes: [],   // 所有的结算类型
            productModels: [],  // 所有的产品型号
            productprice:'',  //产品的价格
            searchTypeId: undefined, // 搜索 - 类型名
            searchName: '', // 搜索 - 名称
            addOrUp: 'add',     // 当前操作是新增还是修改
            addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
            addnewLoading: false, // 是否正在添加新用户中
            nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
            queryModalShow: false, // 查看详情模态框是否显示
            pageNum: 1, // 当前第几页
            pageSize: 10, // 每页多少条
            total: 0, // 数据库总共多少条数据
            fileLoading: false, // 产品图片正在上传
            fileDetailLoading: false,   // 详细图片正在上传
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
        this.getAllProductType();   // 获取所有的结算类型
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
            onShelf: this.state.searchName,
            productType: this.state.searchTypeId,
        };
        this.props.actions.saleMoneyList(tools.clearNull(params)).then((res) => {
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
                    productModels: res.messsageBody.result,
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

    // 工具 - 根据产品类型ID返回产品类型名称
    getNameByTypeId(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
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

    // 选择省市区后查询对应的服务站
    onCascaderChange(v) {
        console.log("是什么：", v);
        const params = {
            province: v[0],
            city: v[1],
            region: v[2],
            pageNum: 0,
            pageSize: 9999,
        };
        this.props.actions.findStationByArea(params).then((res) => {
            if (res.returnCode === '0') {
                this.setState({
                    stations: res.messsageBody.result || [],
                });
            }
        });
    }

    // 修改某一条数据 模态框出现
    onUpdateClick(record) {
        const me = this;
        const { form } = me.props;
        console.log('是什么：', record);
        form.setFieldsValue({
            addnewName: record.name,
            addnewTypeId: `${record.typeId}`,
            addnewTypeCode: String(record.typeCode),
            addnewProductCode:`${record.productCode}`,
            addnewUserSaleRatio:Number(record.userSaleRatio),
            addnewSupplierRatio:Number(record.supplierRatio),
            addnewStationRatio:Number(record.stationRatio),
            addnewDistributorRatio:Number(record.distributorRatio),
        });
        console.log('是什么：', record);
        me.setState({
            nowData: record,
            addOrUp: 'up',
            addnewModalShow: true,
             });
    }


    // 搜索
    onSearch() {
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    // 搜索 - 服务站地区输入框值改变时触发
    onSearchAddress(c) {
        this.setState({
            searchAddress: c,
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

    // 添加新用户模态框出现
    onAddNewShow() {
        const me = this;
        const { form } = me.props;
        form.resetFields([
            'addnewName',
            'addnewTypeId',
            'addnewTypeCode',
            'addnewProductCode',
            'addnewSaleMode',
            'addnewAmount',
            'addnewUserSaleRatio',
            'addnewSupplierRatio',
            'addnewStationRatio',
            'addnewDistributorRatio'
        ]);
        this.setState({
            addOrUp: 'add',
            addnewModalShow: true,
            nowData:null
        });
    }


    // 关闭模态框
    onAddNewClose() {
        this.setState({
            addnewModalShow: false,
        });
    }

    // 表单页码改变
    onTablePageChange(page, pageSize) {
        this.onGetData(page, pageSize);
    }


    // 产品类型改变时，重置产品型号的值位undefined
    onTypeIdChange() {
        const {form} = this.props;
        form.resetFields(['addnewTypeCode']);
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
                title: '收益金额',
            },
            {
                title: '收益类型',
            },
            {
                title:
                    <Popover title="提示" content={<div>
                    </div>} trigger="hover" placement="bottomLeft">
                        <span>分配类型</span><Icon type="question-circle" style={{fontSize:'20px',marginLeft:'5px',marginTop:'3px'}}/>
                    </Popover> ,
                dataIndex: 'distributionType',
                key: 'distributionType',
            },
            {
                title: '订单号',
            },
            {
                title: '产品类型',

            },
            {
                title: '订单总金额',
            },
            {
                title: '结算月份',

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

    // 构建字段
    makeColumns2(){
        const columns = [
            {
                title: '序号',
                dataIndex: 'serial',
                key: 'serial',
            },
            {
                title: '结算类型',
            },
            {
                title: '收益类型',
            },
            {
                title: '服务站',
            },
            {
                title: '操作',
                key: 'control',
                width: 170,
                render: (text, record) => {
                    const controls = [];
                    controls.push(
                        <span key="0" className="control-btn blue" onClick={() => this.onUpdateClick(record)}>
                            <Tooltip placement="top" title="编辑">
                                <Icon type="edit" />
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

    // 构建上面字段
    makeColumnsTop(){
        const columns = [
            {
                title: '结算主体',
            },
            {
                title: '结算月份',
            },
            {
                title: '总订单金额',
            },
            {
                title: '总收益',
            },
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
                name: item.name,
                typeCode: item.typeCode,
                amount: item.amount,
                buyCount: item.buyCount,
                createTime: item.createTime,
                creator: item.creator,
                station:item.station,
                itemNum: item.itemNum,
                newProduct: item.newProduct,
                offShelfTime: item.offShelfTime,
                onShelf: item.onShelf,
                onShelfTime: item.onShelfTime,
                productImg: item.productImg,
                saleMode: item.saleMode,
                typeId: item.typeId,
                updateTime: item.updateTime,
                updater: item.updater,
                control: item.id,
                supplierRatio:item.supplierRatio,
                userSaleRatio:item.userSaleRatio,
                stationRatio:item.stationRatio,
                distributorRatio:item.distributorRatio
            }
        });
    }


    render() {
        const me = this;
        const { mode } = this.state;
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

        const modelId = form.getFieldValue('addnewTypeCode');

        return (
            <div style={{ width: '100%' }}>
                <div className="system-search">
                    <ul className="search-func">
                        <li>
                            <div>
                                <Tabs type="card">
                                    <TabPane tab="总部收益" key="1" style={{width:'1630px'}}>
                                        <div className="system-table" style={{width:'1000px'}}>
                                            <ul className="search-func" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                <span style={{margin:'10px'}}>结算月份：</span>
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
                                                    placeholder="选择月份"
                                                    // onChange={(e) => this.searchBeginTime(e)}
                                                />
                                            </ul>
                                            <Table
                                                columns={this.makeColumnsTop()}
                                                // className="my-table"
                                                style={{width:'1000px'}}
                                                // dataSource={this.makeData(this.state.data)}
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
                                        <div className="system-table" >
                                            <ul className="search-ul more-ul" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                <li style={{marginLeft:'-14px'}}>
                                                    <span>分配类型：</span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                                                        <Option value={1}>1</Option>
                                                        <Option value={2}>2</Option>
                                                    </Select>
                                                </li>
                                                <li>
                                                    <span>收益金额：</span>
                                                    <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.searchMinPriceChange(e)} value={this.state.searchMinPrice}/>--
                                                    <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.searchMaxPriceChange(e)} value={this.state.searchMaxPrice}/>
                                                </li>
                                                <li>
                                                    <span>收益类型：</span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                                                        <Option value={1}>1</Option>
                                                        <Option value={2}>2</Option>
                                                    </Select>
                                                </li>
                                                <li>
                                                    <span>订单号</span>
                                                    <Input style={{ width: '150px' }} onChange={(e) => this.searchOrderNoChange(e)}/>
                                                </li>
                                                <li>
                                                    <span>产品类型: </span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                                                    </Select>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="download" type="primary" onClick={() => this.onExport()}>导出</Button>
                                                </li>
                                            </ul>
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
                                    </TabPane>
                                    <TabPane tab="服务站收益" key="2">
                                        <div className="system-table" style={{width:'400px'}}>
                                            <ul className="more-ul" style={{margin:'10px'}}>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{margin:'10px'}}>结算月份：</span>
                                                    <DatePicker
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
                                                        format="YYYY-MM-DD"
                                                        placeholder="选择月份"
                                                        // onChange={(e) => this.searchBeginTime(e)}
                                                    />
                                                </li>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{marginRight:'8px'}}>服务站地区：</span>
                                                    <Cascader
                                                        style={{width:'170px'}}
                                                        placeholder="请选择服务区域"
                                                        options={this.state.citys}
                                                        loadData={(e) => this.getAllCitySon(e)}
                                                        onChange={(v) => this.onCascaderChange(v)}
                                                    />
                                                </li>
                                                <li style={{marginBottom:'10px'}}>
                                                    <span style={{marginRight:'8px'}}>服务站名称：</span>
                                                    <Select
                                                        placeholder="请选择服务站名称"
                                                        style={{width:'170px'}}
                                                    >
                                                        { this.state.stations.map((item, index) => <Option key={index} value={`${item.id}`}>{item.name}</Option>) }
                                                    </Select>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="system-table" >
                                            <ul className="search-ul more-ul" style={{marginTop:'10px',marginBottom:'10px'}}>
                                                <li style={{marginLeft:'-14px'}}>
                                                    <span>分配类型：</span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                                                        <Option value={1}>1</Option>
                                                        <Option value={2}>2</Option>
                                                    </Select>
                                                </li>
                                                <li>
                                                    <span>收益金额：</span>
                                                    <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.searchMinPriceChange(e)} value={this.state.searchMinPrice}/>--
                                                    <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.searchMaxPriceChange(e)} value={this.state.searchMaxPrice}/>
                                                </li>
                                                <li>
                                                    <span>收益类型：</span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                                                        <Option value={1}>1</Option>
                                                        <Option value={2}>2</Option>
                                                    </Select>
                                                </li>
                                                <li>
                                                    <span>订单号</span>
                                                    <Input style={{ width: '150px' }} onChange={(e) => this.searchOrderNoChange(e)}/>
                                                </li>
                                                <li>
                                                    <span>产品类型: </span>
                                                    <Select placeholder="全部" allowClear style={{ width: '150px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                                                    </Select>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                                                </li>
                                                <li style={{marginLeft:'10px'}}>
                                                    <Button icon="download" type="primary" onClick={() => this.onExport()}>导出</Button>
                                                </li>
                                            </ul>
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
                                    </TabPane>
                                </Tabs>
                            </div>
                        </li>
                    </ul>
                </div>
                {/* 添加模态框 */}
                <Modal
                    title={this.state.addOrUp === 'add' ? '添加产品' : '修改产品'}
                    visible={this.state.addnewModalShow}
                    onOk={() => this.onAddNewOk()}
                    onCancel={() => this.onAddNewClose()}
                    confirmLoading={this.state.addnewLoading}
                >
                    <Form>
                        <FormItem
                            label="结算类型"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewTypeId', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, whitespace: true, message: '请选择结算类型'},
                                ],
                            })(
                                <Select
                                    placeholder="请选择结算类型"
                                    onChange={() => this.onTypeIdChange()}
                                    style={{width:'60%'}}
                                >
                                    { this.state.productTypes.map((item, index) => <Option key={index} value={`${item.id}`}>{item.name}</Option>) }
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            label="分销商"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewUserSaleRatio', {
                                initialValue: 0,
                                rules: [
                                    {required: true, message: '请输入分销商收益百分比'},
                                ],
                            })(
                                <InputNumber
                                style={{width:'60%'}}
                                min={0}
                                max={100}
                                formatter={value => `${value}%`}
                                parser={value => value.replace('%', '')}
                                onChange={onChange}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            label="经销商"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewDistributorRatio', {
                                initialValue: 0,
                                rules: [
                                    {required: true, message: '请输入经销商收益百分比'},
                                ],
                            })(
                                <InputNumber
                                    style={{width:'60%'}}
                                    min={0}
                                    max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                    onChange={onChange}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            label="服务站"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewStationRatio', {
                                initialValue: 0,
                                rules: [
                                    {required: true, message: '请输入服务站收益百分比'},
                                ],
                            })(
                                <InputNumber
                                    style={{width:'60%'}}
                                    min={0}
                                    max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                    onChange={onChange}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            label="总部"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewSupplierRatio', {
                                initialValue: 0,
                                rules: [
                                    {required: true, message: '请输入总部收益百分比'},
                                ],
                            })(
                                <InputNumber
                                    style={{width:'60%'}}
                                    min={0}
                                    max={100}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                    onChange={onChange}
                                />
                            )}
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
        actions: bindActionCreators({ findProductByWhere,saleMoneyList,findProductTypeByWhere,findAllProvince,findStationByArea,findCityOrCounty,onChange,addProduct,updateProductType, deleteProduct,removeProduct, deleteImage,findProductModelByWhere,upProductModel,updateProduct }, dispatch),
    })
)(WrappedHorizontalRole);
