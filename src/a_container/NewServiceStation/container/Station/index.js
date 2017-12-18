/* List 服务站/服务站管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import Config from '../../../../config/config';
import { Form, Button, Icon, Input, InputNumber, Table, message, Modal, Radio, Tooltip, Select, Divider, Cascader, Popconfirm } from 'antd';
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

import { findAllProvince, findCityOrCounty, queryStationList, addStationList, upStationList, delStationList } from '../../../../a_action/sys-action';

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
            searchName: '', // 搜索 - 名称
            searchAddress: '', // 搜索 - 地址
            addOrUp: 'add',     // 当前操作是新增还是修改
            addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
            addnewLoading: false, // 是否正在添加新用户中
            nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
            queryModalShow: false, // 查看详情模态框是否显示
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
            name: this.state.searchName,
            address: this.state.searchAddress,
        };
        this.props.actions.queryStationList(tools.clearNull(params)).then((res) => {
            if(res.returnCode === "0") {
                this.setState({
                    data: res.messsageBody.result,
                    pageNum,
                    pageSize,
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

    // 搜索 - 名称输入框值改变时触发
    searchNameChange(e) {
        if (e.target.value.length < 24) {
            this.setState({
                searchName: e.target.value,
            });
        }
    }

    // 搜索 - 名称输入框值改变时触发
    searchAddressChange(e) {
        if (e.target.value.length < 200) {
            this.setState({
                searchAddress: e.target.value,
            });
        }
    }

    // 修改某一条数据 模态框出现
    onUpdateClick(record) {
        const me = this;
        const { form } = me.props;

        form.setFieldsValue({
            addnewCitys: [undefined],
            addnewName: record.name,
            addnewAddress: record.address,
            addnewContactPerson: record.contactPerson,
            addnewContactPhone: record.contactPhone,
            addnewDayCount: record.dayCount,
            addnewState: record.state,
        });
        me.setState({
            nowData: record,
            addOrUp: 'up',
            addnewModalShow: true,
        });
    }

    // 删除某一条数据
    onDeleteClick(id) {
        this.props.actions.delStationList({id: id}).then((res) => {
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

    // 添加新用户模态框出现
    onAddNewShow() {
        const me = this;
        const { form } = me.props;
        form.resetFields([
            'addnewCitys',
            'addnewName',
            'addnewAddress',
            'addnewContactPerson',
            'addnewContactPhone',
            'addnewDayCount',
            'addnewState',
        ]);
        this.setState({
            addOrUp: 'add',
            fileList: [],
            fileListDetail: [],
            addnewModalShow: true,
        });
    }

    // 添加或修改确定
    onAddNewOk() {
        const me = this;
        const { form } = me.props;

        form.validateFields([
            'addnewCitys',
            'addnewName',
            'addnewAddress',
            'addnewContactPerson',
            'addnewContactPhone',
            'addnewDayCount',
            'addnewState',
        ], (err, values) => {
            if (err) { return false; }
            me.setState({
                addnewLoading: true,
            });
            console.log('区域是什么；', values.addnewCitys);

            const params = {
                name: values.addnewName,
                address: values.addnewAddress,
                contactPerson: values.addnewContactPerson,
                contactPhone: values.addnewContactPhone,
                dayCount: values.addnewDayCount,
                state: values.addnewState,
            };
            if(values.addnewCitys[0] && values.addnewCitys[1] && values.addnewCitys[2]) {
                params.province = values.addnewCitys[0];
                params.city = values.addnewCitys[1];
                params.region = values.addnewCitys[2];
            } else if (this.state.addOrUp === 'up') {   // 是修改，但没有修改区域
                params.province = this.state.nowData.province;
                params.city = this.state.nowData.city;
                params.region = this.state.nowData.region;
            }

            if (this.state.addOrUp === 'add') { // 新增
                me.props.actions.addStationList(tools.clearNull(params)).then((res) => {
                    if (res.returnCode === '0') {
                        me.setState({
                            addnewLoading: false,
                        });
                        this.onGetData(this.state.pageNum, this.state.pageSize);
                        this.onAddNewClose();
                    } else {
                        message.error(res.returnMessaage || '操作失败');
                        this.onAddNewClose();
                    }
                }).catch(() => {
                    this.onAddNewClose();
                });
            } else {
                params.id = this.state.nowData.id;
                me.props.actions.upStationList(params).then((res) => {
                    if(res.returnCode === '0') {
                        me.setState({
                            addnewLoading: false,
                        });
                        this.onGetData(this.state.pageNum, this.state.pageSize);
                        this.onAddNewClose();
                    } else {
                        message.error(res.returnMessaage || '操作失败');
                        this.onAddNewClose();
                    }
                }).catch(() => {
                    this.onAddNewClose();
                });
            }
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
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '服务站地区',
                dataIndex: 'citys',
                key: 'citys',
            },
            {
                title: '详细地址',
                dataIndex: 'address',
                key: 'address',
            },
            {
                title: '联系电话',
                dataIndex: 'contactPhone',
                key: 'contactPhone',
            },
            {
                title: '联系人',
                dataIndex: 'contactPerson',
                key: 'contactPerson',
            },
            {
                title: '预约天数',
                dataIndex: 'dayCount',
                key: 'dayCount',
            },
            {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                render: (text) => String(text) === "0" ? <span style={{color: 'green'}}>启用</span> : <span style={{color: 'red'}}>禁用</span>
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
                    controls.push(
                        <span key="1" className="control-btn blue" onClick={() => this.onUpdateClick(record)}>
                            <Tooltip placement="top" title="修改">
                                <Icon type="edit" />
                            </Tooltip>
                        </span>
                    );
                    controls.push(
                        <Popconfirm key="2" title="确定删除吗?" onConfirm={() => this.onDeleteClick(record.id)} okText="确定" cancelText="取消">
                            <span className="control-btn red">
                                <Tooltip placement="top" title="删除">
                                    <Icon type="delete" />
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
                city: item.city,
                region: item.region,
                contactPerson: item.contactPerson,
                contactPhone: item.contactPhone,
                dayCount: item.dayCount,
                name: item.name,
                state: item.state,
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
                  <ul className="search-one">
                      <li className=""><span>产品类型</span></li>
                      <li><span>服务站地区</span></li>
                      <li><span>设备型号</span></li>
                      <li><span>状态</span></li>
                  </ul>
                  <ul className="search-ul">
                      {/*<li><Input placeholder="服务站名称" onChange={(e) => this.searchNameChange(e)} value={this.state.searchName}/></li>*/}
                      {/*<li><Input placeholder="详细地址" onChange={(e) => this.searchAddressChange(e)} value={this.state.searchAddress}/></li>*/}
                      <li><Button  type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
                      <li><Button  type="primary" onClick={() => this.onExport()}>导出</Button></li>
                  </ul>
                  <ul className="search-func"><li><Button type="primary" onClick={() => this.onAddNewShow()}>产品上线</Button></li></ul>
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
                {/* 添加模态框 */}
              <Modal
                  title='新增服务站'
                  visible={this.state.addnewModalShow}
                  onOk={() => this.onAddNewOk()}
                  onCancel={() => this.onAddNewClose()}
                  confirmLoading={this.state.addnewLoading}
              >
                <Form>
                    <FormItem
                        label="名称"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewName', {
                            initialValue: undefined,
                            rules: [
                                {required: true, whitespace: true, message: '请输入名称'},
                                {max: 18, message: '最多输入18位字符'},
                            ],
                        })(
                            <Input placeholder="请输入服务站名称" />
                        )}
                    </FormItem>
                    <FormItem
                        label="区域"
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
                    <FormItem
                        label="详细地址"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewAddress', {
                            initialValue: undefined,
                            rules: [
                                {required: true, message: '请输入详细地址'},
                                {max: 200, message: '最多输入200字符'},
                            ],
                        })(
                            <Input placeholder="请输入详细地址" />
                        )}
                    </FormItem>
                    <FormItem
                        label="联系人"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewContactPerson', {
                            initialValue: undefined,
                            rules: [
                                {required: true, message: '请输入联系人'},
                                {max: 24, message: '最多输入24字符'},
                            ],
                        })(
                            <Input placeholder="请输入联系人" />
                        )}
                    </FormItem>
                    <FormItem
                        label="联系电话"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewContactPhone', {
                            initialValue: undefined,
                            rules: [
                                {required: true, message: '请输入联系电话'},
                                {max: 50, message: '最多输入50字符'},
                            ],
                        })(
                            <Input placeholder="请输入联系电话" />
                        )}
                    </FormItem>
                    <FormItem
                        label="预约天数"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewDayCount', {
                            initialValue: undefined,
                            rules: [
                                {required: true, message: '请输入最大预约天数'},
                            ],
                        })(
                            <InputNumber min={0} max={60} precision={0} placeholder="请输入最大预约天数"  style={{ width: '100%' }}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="状态"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewState', {
                            rules: [],
                            initialValue: "0",
                        })(
                            <RadioGroup>
                                <Radio value="0">启用</Radio>
                                <Radio value="-1">禁用</Radio>
                            </RadioGroup>
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
              >
                <Form>
                  <FormItem
                      label="服务站"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.name : ''}
                  </FormItem>
                    <FormItem
                        label="地区"
                        {...formItemLayout}
                    >
                        {(!!this.state.nowData && this.state.nowData.province && this.state.nowData.city && this.state.nowData.region) ? `${this.state.nowData.province}/${this.state.nowData.city}/${this.state.nowData.region}` : ''}
                    </FormItem>
                  <FormItem
                      label="详细地址"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.address : ''}
                  </FormItem>
                    <FormItem
                        label="联系电话"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.contactPhone : ''}
                    </FormItem>
                    <FormItem
                        label="联系人"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.contactPerson : ''}
                    </FormItem>
                    <FormItem
                        label="预约天数"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.dayCount : '' }
                    </FormItem>
                    <FormItem
                        label="状态"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? (String(this.state.nowData.state) === "0" ? <span style={{ color: 'green' }}>启用</span> : <span style={{ color: 'red' }}>禁用</span>) : ''}
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
        actions: bindActionCreators({ findAllProvince, findCityOrCounty, queryStationList, addStationList, upStationList, delStationList }, dispatch),
    })
)(WrappedHorizontalRole);
