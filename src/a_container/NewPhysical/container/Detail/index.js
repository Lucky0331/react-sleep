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
import { Form, Button, Icon, Input, InputNumber, Table, message, Modal, Radio, Tooltip, Select, Divider ,DatePicker } from 'antd';
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

import { findReserveList, addReserveList, addProduct, upReserveList, deleteProduct, deleteImage, findProductModelByWhere ,disabledRangeTime} from '../../../../a_action/shop-action';
import { findAllProvince,findStationByArea, findCityOrCounty, findProductTypeByWhere,queryStationList, addStationList, upStationList, delStationList } from '../../../../a_action/sys-action';


// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // 当前页面全部数据
            productTypes: [],   // 所有的产品类型
            productModels: [],  // 所有的产品型号
            searchMobile: '', // 搜索 - 手机号
            searchCode: '', // 搜索 - 体检卡号
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
        };
    }

    componentDidMount() {
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    // 查询当前页面所需列表数据
    onGetData(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
            mobile: this.state.searchMobile,
            code: this.state.searchCode,
        };
        this.props.actions.findReserveList(tools.clearNull(params)).then((res) => {
            if(res.returnCode === "0") {
                this.setState({
                    data: res.messsageBody.ticketPage,
                    pageNum,
                    pageSize,
                });
            } else {
                message.error(res.returnMessaage || '获取数据失败，请重试');
            }
        });
    }

    // 获取所有的产品类型，当前页要用
    // getAllProductType() {
    //     this.props.actions.findProductTypeByWhere({ pageNum: 0, pageSize: 9999 }).then((res) => {
    //         if(res.returnCode === '0') {
    //             this.setState({
    //                 productTypes: res.messsageBody.ticketPage,
    //             });
    //         }
    //     });
    // }


    // 工具 - 根据产品类型ID查产品类型名称
    findProductNameById(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    // 工具 - 根据ID获取用户来源名字
    getNameByModelId(id) {
        switch(String(id)) {
            case '1': return 'APP 预约';
            case '2': return '公众号预约';
            case '3': return '后台添加';
            default: return '';
        }
    }

    // 工具 - 根据ID获取销售方式的名字
    getNameBySaleModeName(code) {
        switch(Number(code)) {
            case 1: return '租赁';
            case 2: return '买卖';
            case 3: return '服务';
            default: return '';
        }
    }

    // 工具 - 根据type获取状态名称
    getNameByType(type) {
        switch(String(type)) {
            case '0': return '未使用';
            case '1': return '成功';
            case '-1': return '失败';
            case '-2': return '过期';
            default: return '';
        }
    }

    // 搜索 - 手机号输入框值改变时触发
    searchMobileChange(e) {
        if (e.target.value.length < 12) {
            this.setState({
                searchMobile: e.target.value,
            });
        }
    }

    // 搜索 - 体检卡输入框值改变时触发
    searchCodeChange(e) {
        if (e.target.value.length < 20) {
            this.setState({
                searchCode: e.target.value,
            });
        }
    }

    // 修改某一条数据 模态框出现
    onUpdateClick(record) {
        const me = this;
        const { form } = me.props;

        form.setFieldsValue({
            addnewCode: record.code,
            addnewName: record.name,
            addnewIdCard: record.idCard,
            addnewMobile: record.mobile,
            addnewSex: record.sex,
            addnewHeight: record.height,
            addnewWeight: record.weight,
        });
        me.setState({
            nowData: record,
            addOrUp: 'up',
            addnewModalShow: true,
        });
    }

    // 删除某一条数据
    onDeleteClick(id) {
        this.props.actions.deleteProduct({id: id}).then((res) => {
            if(res.returnCode === "0") {
                message.success('删除成功');
                this.onGetData(this.state.pageNum, this.state.pageSize);
            } else {
                message.error(res.returnMessaage || '删除失败，请重试');
            }
        });
    }

    // 搜索
    onSearch() {
        this.onGetData(this.state.pageNum, this.state.pageSize);
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
                // render: (text, record) => this.getNameForInDate(text, record.timeLimitType),
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
                render: (text) => String(text) === 'true' ? <span style={{color: 'red'}}>已到期</span> : <span style={{color: 'green'}}>未到期</span>
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
                render: (text) => String(text) === 'true' ? <span style={{color: 'green'}}>未禁用</span> : <span style={{color: 'red'}}>已禁用</span>
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
                name: item.name,
                reserveTime: item.reserveTime,
                sex: item.sex,
                stationId: item.stationId,
                stationName: item.stationName,
                updateTime: item.updateTime,
                updater: item.updater,
                userSource: item.userSource,
                weight: item.weight,
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
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 19 },
            },
        };
        console.log('是啥：', form.getFieldValue('addnewTypeId'));
        return (
            <div style={{ width: '100%' }}>
                <div className="system-search">
                    {/*<ul className="search-func"><li><Button type="primary" onClick={() => this.onAddNewShow()}><Icon type="plus-circle-o" />新增体检人</Button></li></ul>*/}
                    <ul className="search-ul">
                        <li>
                            <span style={{marginRight:'10px'}}>体检卡型号</span>
                            <Select placeholder="全部" allowClear style={{  width: '120px',marginRight:'15px' }} onChange={(e) => this.searchIdChange(e)}>
                                <Option value={1}>一号</Option>
                                <Option value={0}>二号</Option>
                            </Select>
                        </li>
                        <li style={{width:'220px'}}>体检卡号  <Input style={{width:'50%'}} placeholder="体检卡号" onChange={(e) => this.searchCodeChange(e)} value={this.state.searchCode}/></li>
                        <li>
                            <span style={{marginRight:'10px'}}>是否到期</span>
                            <Select placeholder="全部" allowClear style={{  width: '120px',marginRight:'15px' }}>
                                <Option value={1}>是</Option>
                                <Option value={0}>否</Option>
                            </Select>
                        </li>
                        <li>
                            <span style={{marginRight:'10px'}}>剩余可用次数</span>
                            <Select placeholder="全部" allowClear style={{  width: '120px',marginRight:'15px' }}>
                            </Select>
                        </li>
                        <li>
                            <span style={{marginRight:'10px'}}>是否禁用</span>
                            <Select placeholder="全部" allowClear style={{  width: '120px',marginRight:'15px' }}>
                                <Option value={1}>是</Option>
                                <Option value={0}>否</Option>
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
                        // scroll={{ x: 2400 }}
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
                            {!!this.state.nowData ? this.state.nowData.stationName : ''}
                        </FormItem>
                        <FormItem
                            label="体检卡号"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.code : ''}
                        </FormItem>
                        {/*<FormItem*/}
                            {/*label="体检人"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.name : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="身份证"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.idCard : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="手机号"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.mobile : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="性别"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? (this.state.nowData.sex ? '男' : '女') : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="身高"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? `${this.state.nowData.height}cm` : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="体重"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? `${this.state.nowData.weight}kg` : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="用户来源"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.userSource) : ''}                    </FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="预约日期"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.reserveTime : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="体检日期"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.arriveTime : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="操作人"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.updater : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="操作时间"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.state.nowData.updateTime : ''}*/}
                        {/*</FormItem>*/}
                        {/*<FormItem*/}
                            {/*label="状态"*/}
                            {/*{...formItemLayout}*/}
                        {/*>*/}
                            {/*{!!this.state.nowData ? this.getNameByType(this.state.nowData.conditions) : ''}*/}
                        {/*</FormItem>*/}
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
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
    (state) => ({

    }),
    (dispatch) => ({
        actions: bindActionCreators({ findReserveList, addReserveList, addProduct, upReserveList, deleteProduct, deleteImage,disabledRangeTime, findProductModelByWhere ,findAllProvince,findStationByArea, findCityOrCounty, findProductTypeByWhere,queryStationList, addStationList, upStationList, delStationList}, dispatch),
    })
)(WrappedHorizontalRole);
