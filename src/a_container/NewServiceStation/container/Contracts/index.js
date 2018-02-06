/* List 服务站/服务站管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import Config from '../../../../config/config';
import { Form, Button, Icon, Popconfirm, Table, message, Modal, Radio, Tooltip, Select, Divider, Cascader,Input } from 'antd';
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

import { findAllProvince,findStationByArea, findCityOrCounty} from '../../../../a_action/sys-action';
import { findProductLine ,addProductLine,updateProductLine,updateContract,ContractList} from '../../../../a_action/shop-action';
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
            stations: [], // 当前省市区下面的服务站
            productModels: [],  // 所有的产品型号
            searchTypeId: undefined, // 搜索 - 产品类型
            searchContract: '', // 搜索 - 状态
            searchAddress: [], // 搜索 - 地址
            searchStationName: [], // 搜索 - 服务站名称
            searchCompanyName: [], // 搜索 - 公司名称
            addOrUp: 'add',     // 当前操作是新增还是修改
            upModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
            addnewLoading: false, // 是否正在添加新用户中
            nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
            queryModalShow: false, // 查看详情模态框是否显示
            pageNum: 1, // 当前第几页
            pageSize: 20, // 每页多少条
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
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    componentWillReceiveProps(nextP) {
        if(nextP.citys !== this.props.citys) {
            this.setState({
                citys: nextP.citys.map((item, index) => ({ id: item.id, value: item.areaName, label: item.areaName, isLeaf: false})),
            });
        }
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

    //工具
    getCity(s,c,q){
        if (!s){
            return ' ';
        }
        return `${s}/${c}/${q}`;
    }


    // 搜索 - 服务站地区输入框值改变时触发
    onSearchAddress(c) {
        this.setState({
            searchAddress: c,
        });
    }

    // 搜索 - 服务站名称关键字
    onSearchStationName(e) {
        this.setState({
            searchStationName: e.target.value,
        });
    }

    // 搜索 - 公司名称关键字
    onSearchCompanyName(e) {
        this.setState({
            searchCompanyName: e.target.value,
        });
    }

    //搜索 - 承包上下线状态输入框值改变时触发
    searchNameChange(e) {
        this.setState({
            searchContract: e,
        });
    }

    // 表单页码改变
    onTablePageChange(page, pageSize) {
        console.log('页码改变：', page, pageSize);
        this.onGetData(page, pageSize);
    }


    // 查询当前页面所需列表数据
    onGetData(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
            contract: this.state.searchContract,
            province: this.state.searchAddress[0],
            city: this.state.searchAddress[1],
            region: this.state.searchAddress[2],
            stationName:this.state.searchStationName,
            companyName:this.state.searchCompanyName,
        };
        this.props.actions.ContractList(tools.clearNull(params)).then((res) => {
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


    // 承包或者不承包
    onUpdateClick2(record) {
        console.log('LO:', record.contract);
        const params = {
            stationId:Number(record.id),
            contract:record.contract? 1 : 0,
        };
        this.props.actions.updateContract(params).then((res) => {
            if (res.returnCode === "0") {
                message.success("修改成功");
                this.onGetData(this.state.pageNum, this.state.pageSize);
            } else {
                message.error(res.returnMessaage || '修改失败，请重试');
            }
        }).catch(() => {
            message.error('修改失败');
        });
    }

    // 搜索
    onSearch() {
        this.onGetData(1, this.state.pageSize);
    }
    // 导出
    onExport() {
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
            upModalShow: false,
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
                title: '服务站地区',
                dataIndex: 'station.city',
                key: 'station.city',
                render: (text, record) => {return `${record.province}/${record.city}/${record.region}`}

            },
            {
                title: '服务站名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '公司名称',
                dataIndex: 'companyName',
                key: 'companyName'
            },
            {
                title: '联系人',
                dataIndex: 'person',
                key: 'person'
            },
            {
                title: '联系方式',
                dataIndex: 'phone',
                key: 'phone',
            },
            {
                title: '上线时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '状态',
                dataIndex: 'contract',
                key: 'contract',
                render: (text) => String(text) === 'true' ? <span style={{color: 'green'}}>已承包</span> :
                    <span style={{color: 'red'}}>未承包</span>
            },
            {
                title: '操作',
                key: 'control',
                render: (text, record) => {
                    const controls = [];

                    controls.push(
                        <span key="0" className="control-btn green" onClick={() => this.onQueryClick(record)}>
                            <Tooltip placement="top" title="查看">
                                <Icon type="eye" />
                            </Tooltip>
                        </span>
                    );
                    (record.contract === false) && controls.push(
                        <Popconfirm key="1" title="确定上线吗?" onConfirm={() => this.onUpdateClick2(record)} okText="确定" cancelText="取消">
                            <span className="control-btn blue">
                                <Tooltip placement="top" title="承包上线">
                                    <Icon type="caret-up"/>
                                </Tooltip>
                            </span>
                       </Popconfirm>
                    );
                    (record.contract === true) && controls.push(
                        <Popconfirm key="2" title="确定下线吗?" onConfirm={() => this.onUpdateClick2(record)} okText="确定" cancelText="取消">
                            <span className="control-btn red">
                            <Tooltip placement="top" title="承包下线">
                                <Icon type="caret-down" />
                            </Tooltip>
                        </span>
                        </Popconfirm>
                    );

                    const result = [];
                    controls.forEach((item, index) => {
                        if (index) {
                            result.push(<Divider type="vertical" key={`line${index}`}/>);
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
                address: item.address,
                citys: (item.province && item.city && item.region) ? `${item.province}/${item.city}/${item.region}` : '',
                province: item.province,
                typeId: item.typeId,
                station:item.station,
                name: item.name,
                person: item.person,
                phone:item.phone,
                companyName: item.companyName,
                stationTel:item.stationTel,
                city: item.city,
                region: item.region,
                contactPhone: item.contactPhone,
                dayCount: item.dayCount,
                state: item.state,
                contract:item.contract,
                deviceStatus:item.deviceStatus,
                createTime:item.createTime,
                productType:item.productType,
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
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        console.log('是啥：', this.state.pageNum);
        return (
            <div style={{ width: '100%' }}>
                <div className="system-search">
                    <ul className="search-ul">
                        <li style={{marginRight:'20px'}}>
                            <span style={{marginRight:'10px'}}>服务站地区</span>
                            <Cascader
                                placeholder="请选择服务区域"
                                onChange={(v) => this.onSearchAddress(v)}
                                options={this.state.citys}
                                loadData={(e) => this.getAllCitySon(e)}
                            />
                        </li>
                        <li>
                            <span>服务站名称</span>
                            <Input placeholder="关键字" style={{ width: '160px',marginRight:'20px',marginLeft:'10px'}} onChange={(e) => this.onSearchStationName(e)}/>
                        </li>
                        <li>
                            <span>公司名称</span>
                            <Input placeholder="关键字" style={{ width: '160px',marginRight:'20px',marginLeft:'10px'}} onChange ={(e) => this.onSearchCompanyName(e)}/>
                        </li>
                        <li>
                            <span style={{marginRight:'10px'}}>状态</span>
                            <Select placeholder="全部" allowClear style={{ width: '120px',marginRight:'25px' }}  onChange={(e) => this.searchNameChange(e)}>
                                <Option value={0}>未承包</Option>
                                <Option value={1}>已承包</Option>
                            </Select>
                        </li>
                        <li style={{width: '80px',marginRight:'15px'}}><Button  type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
                        <li style={{width: '80px',marginRight:'35px'}}><Button  type="primary" onClick={() => this.onExport()}>导出</Button></li>
                    </ul>
                </div>
                <div className="system-table" >
                    <Table
                        columns={this.makeColumns()}
                        className="my-table"
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
                            label="服务站地区"
                            {...formItemLayout}
                        >
                            {!!(this.state.nowData) ? this.getCity(this.state.nowData.province,this.state.nowData.city,this.state.nowData.region ): ''}
                        </FormItem>
                        <FormItem
                            label="服务站名称"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.name : ''}
                        </FormItem>
                        <FormItem
                            label="公司名称"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.companyName : ''}
                        </FormItem>
                        <FormItem
                            label="站长名称"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.person : ''}
                        </FormItem>
                        <FormItem
                            label="联系方式"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.phone : ''}
                        </FormItem>
                        <FormItem
                            label="上线时间"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.createTime : '' }
                        </FormItem>
                        <FormItem
                            label="状态"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? (String(this.state.nowData.contract) === "true" ? <span style={{ color: 'green' }}>已承包</span> : <span style={{ color: 'red' }}>未承包</span>) : ''}
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
        actions: bindActionCreators({ findAllProvince, findCityOrCounty,findStationByArea,updateProductLine, updateContract,ContractList,findProductLine,addProductLine}, dispatch),
    })
)(WrappedHorizontalRole);
