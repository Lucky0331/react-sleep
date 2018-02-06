/* List 体检管理/体检列表 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import Config from '../../../../config/config';
import { Form, Button, Icon, Input, InputNumber, Table, message, Popconfirm, Popover, Modal, Radio, Tooltip, Select, DatePicker, Divider } from 'antd';
import './index.scss';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
import moment from 'moment';
// ==================
// 所需的所有组件
// ==================


// ==================
// 本页面所需action
// ==================

import { ticketList, ticketSave, ticketUpdate } from '../../../../a_action/phy-action';
import {onChange ,onOk} from '../../../../a_action/shop-action'
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
            searchMobile: '', // 搜索 - 手机号
            searchTicketNo: '', // 搜索 - 体检卡号
            searchDate: undefined, // 搜索 - 预约体检日期
            searchBeginTime: '',  // 搜索 - 开始时间
            searchEndTime: '',  // 搜索- 结束时间
            searchUserSource : '',  //搜索 - 用户来源
            searchState: '',  //搜索 - 体检卡状态
            addnewPersonShow: false, // 添加体检人模态框是否显示
            addnewLoading: false, // 是否正在添加体检人
            upModalShow: false, // 修改体检人模态框是否显示
            upLoading: false, // 是否正在体检人
            nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
            queryModalShow: false, // 查看详情模态框是否显示
            pageNum: 1, // 当前第几页
            pageSize: 10, // 每页多少条
            total: 0, // 数据库总共多少条数据
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
            ticketNo: this.state.searchTicketNo,
            state: this.state.searchState,
            userSource:this.state.searchUserSource,
            beginTime: this.state.searchBeginTime ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00` : '',
            endTime: this.state.searchEndTime ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`: '',
        };
        this.props.actions.ticketList(tools.clearNull(params)).then((res) => {
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


    // 表单页码改变
    onTablePageChange(page, pageSize) {
        this.onGetData(page, pageSize);
    }

    // 工具 - 根据产品类型ID查产品类型名称
    findProductNameById(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    // 工具 - 根据ID获取用户来源名字
    getNameByModelId(id) {
        switch(String(id)) {
            case '1': return '终端用户App';
            case '2': return '微信公众号';
            case '3': return '体检系统';
            case '4': return '经销商APP';
            case '5': return '后台管理系统';
            default: return '';
        }
    }

    // 工具 - 根据type获取状态名称
    getNameByType(type) {
        switch(String(type)) {
            case '1': return '未使用';
            case '2': return '已使用';
            case '3': return '已禁用';
            case '4': return '已过期';
            default: return '';
        }
    }

    // 搜索 - 手机号输入框值改变时触发
    searchMobileChange(e) {
        this.setState({
            searchMobile: e
        });
    }

    // 搜索 - 体检卡输入框值改变时触发
    searchTicketNoChange(e) {
            this.setState({
                searchTicketNo: e.target.value,
            });
    }

    // 搜索 - 体检卡状态
    searchStateChange(e) {
        this.setState({
            searchState: e,
        });
    }

    // 搜索 - 用户来源
    searchUserSourceChange(e) {
        this.setState({
            searchUserSource: e,
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

    // 查看详情模态框关闭
    onQueryModalClose() {
        this.setState({
            queryModalShow: false,
        });
    }

    // 添加体检人模态框出现
    onAddNewShow() {
        const me = this;
        const { form } = me.props;
        form.resetFields([
            'addnewCode',
            'addnewName',
            'addnewIdCard',
            'addnewMobile',
            'addnewSex',
            'addnewHeight',
            'addnewWeight',
            'addnewReserveTime',
            'addnewReserveFrom',
            'addnewBirthDate',
        ]);
        this.setState({
            nowData:null,
            addnewPersonShow: true,
        });
    }

    // 添加的确定
    onAddNewOk() {
        const me = this;
        const { form } = me.props;

        form.validateFields([
            'addnewCode',
            'addnewName',
            'addnewIdCard',
            'addnewMobile',
            'addnewSex',
            'addnewHeight',
            'addnewWeight',
            'addnewReserveTime',
            'addnewReserveFrom',
            'addnewBirthDate',
        ], (err, values) => {
            if (err) { return false; }
            me.setState({
                addnewLoading: true,
            });
            console.log('获取到的值：', values);
            const params = {
                ticketNo: values.addnewCode,
                userName: values.addnewName,
                idCard: values.addnewIdCard,
                phone: values.addnewMobile,
                sex: values.addnewSex,
                height: values.addnewHeight,
                weight: values.addnewWeight,
                reserveTime: values.addnewReserveTime ? tools.dateToStr2(values.addnewReserveTime._d) : null,
                birthDate: values.addnewBirthDate ? tools.dateformart(values.addnewBirthDate._d) : null,
                reserveFrom: 5,
            };
                me.props.actions.ticketSave(params).then((res) => { // 新增
                    me.setState({
                        addnewLoading: false,
                    });
                    this.onGetData(this.state.pageNum, this.state.pageSize);
                    this.onAddNewClose();
                }).catch(() => {
                    me.setState({
                        addnewLoading: false,
                    });
                });
        });
    }

    // 关闭模态框
    onAddNewClose() {
        this.setState({
            addnewPersonShow: false,
        });
    }


    // 修改某一条数据 模态框出现
    onUpdateClick(record) {
        const me = this;
        const { form } = me.props;
        console.log('Record:', record);
        form.setFieldsValue({
            upTicketNo: record.ticketNo,
            upUserName: record.username,
            upIdCard: record.idCard,
            upMobile: record.phone,
            upSex: record.sex,
            upHeight: record.height,
            upWeight: record.weight,
            upReserveForm:record.reserveFrom,
            upReserveTime: record.reserveTime ? tools.dateToStr2(record.reserveTime._d) : '',
            upBirthDate: record.birthdate ? moment(record.birthdate) : undefined,
        });
        me.setState({
            nowData: record,
            upModalShow: true,
        });
    }


    // 确定修改某一条数据
    onUpOk() {
        const me = this;
        const { form } = me.props;
        form.validateFields([
            'upTicketNo',
            'upUserName',
            'upIdCard',
            'upMobile',
            'upSex',
            'upHeight',
            'upWeight',
            'upReserveForm',
            'upReserveTime',
            'upBirthDate',
        ], (err, values) => {
            if(err) { return; }

            me.setState({
                upLoading: true,
            });
            const params = {
                id: me.state.nowData.id,
                ticketNo:me.state.nowData.ticketNo,
                idCard:values.upIdCard,
                userName: values.upUserName,
                phone: values.upMobile,
                sex: values.upSex,
                height: values.upHeight,
                weight:values.upWeight,
                reserveForm: me.state.nowData.reserveFrom,
                birthDate: values.upBirthDate ? `${tools.dateToStrD(values.upBirthDate._d)}` : '' ,
                reserveTime: values.upReserveTime ? `${tools.dateToStr2(values.upReserveTime._d)}` : '',
            };

            me.props.actions.ticketUpdate(params).then((res) => { // 修改
                me.setState({
                    addnewLoading: false,
                });
                this.onGetData(this.state.pageNum, this.state.pageSize);
                this.onAddNewClose();
            }).catch(() => {
                me.setState({
                    addnewLoading: false,
                });
            });
            console.log('什么时间：',`${tools.dateToStr2(values.upReserveTime._d)}`)
        });
    }
    // 关闭修改某一条数据
    onUpClose() {
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
                width: 90,
            },
            {
                title: '服务站名称',
                dataIndex: 'name',
                key: 'name',
                width: 180,
            },
            {
                title: '体检卡号',
                dataIndex: 'ticketNo',
                key: 'ticketNo',
                width: 200,
            },
            {
                title: '体检人',
                dataIndex: 'username',
                key: 'username',
                width: 90,
            },
            {
                title: '身份证',
                dataIndex: 'idCard',
                key: 'idCard',
                width: 200,
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                key: 'phone',
                width: 150,
            },
            {
                title: '性别',
                dataIndex: 'sex',
                key: 'sex',
                width: 100,
                render: (text) => String(text) === '0' ? <span>女</span> :
                    <span>男</span>
            },
            {
                title: '预约体检日期',
                dataIndex: 'reserveTime',
                key: 'reserveTime',
                width: 200,
            },
            {
                title: '实际体检日期',
                dataIndex: 'createTime',
                key: 'createTime',
                width: 200,
            },
            {
                title: '体检卡状态 ',
                dataIndex: 'conditions',
                key: 'conditions',
                width: 130,
                render: (text) => this.getNameByType(text),
            },
            {
                title: '用户来源',
                dataIndex: 'userSource',
                key: 'userSource',
                width: 130,
                render: (text) => this.getNameByModelId(text),
            },
            {
                title: '操作',
                key: 'control',
                width: 150,
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
                        <span key="2" className="control-btn blue" onClick={() => this.onUpdateClick(record)}>
                            <Tooltip placement="top" title="编辑">
                                <Icon type="edit" />
                            </Tooltip>
                        </span>
                    );
                    (record.ticketStatus === 1) && controls.push(
                        <span key="3" className="control-btn red" onClick={() => this.onUpdateClick(record)}>
                            <Tooltip placement="top" title="再次体检">
                                <Icon type="medicine-box" />
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
        console.log('data是个啥：', data);
        return data.map((item, index) => {
            return {
                key: index,
                id: item.id,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                arriveTime: item.useTime,
                ticketNo: item.ticketNo,
                conditions: item.ticketStatus,
                createTime: item.createTime,
                creator: item.creator,
                idCard: item.hraCustomer ? item.hraCustomer.idcard : null,
                phone: item.hraCustomer ? item.hraCustomer.phone : null,
                username: item.hraCustomer ? item.hraCustomer.username : null,
                birthdate: item.hraCustomer ? item.hraCustomer.birthdate : null,
                height: item.hraCustomer ? item.hraCustomer.height : 'XXX',
                weight: item.hraCustomer ? item.hraCustomer.weight : 'XX' ,
                reserveTime: item.reserveTime,
                reserveFrom: item.reserveFrom,
                sex: item.hraCustomer ? item.hraCustomer.sex : null,
                stationId: item.stationId,
                name: item.station ? item.station.name :null,
                updateTime: item.updateTime,
                updater: item.updater,
                userSource: item.reserveFrom,
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
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        console.log('是啥：', form.getFieldValue('addnewTypeId'));
        return (
            <div style={{ width: '100%' }}>
              <div className="system-search">
                  <ul className="search-ul">
                      <li>
                          <span>用户来源：</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px',marginRight:'10px'}} onChange={(e) => this.searchUserSourceChange(e)}>
                              <Option value={1}>终端用户app</Option>
                              <Option value={2}>微信公众号</Option>
                              <Option value={3}>体检系统</Option>
                              <Option value={4}>经销商APP </Option>
                              <Option value={5}>后台管理系统</Option>
                          </Select>
                      </li>
                      <li>
                          <span>体检卡号状态：</span>
                          <Select placeholder="全部" allowClear style={{  width: '172px',marginRight:'10px'}} onChange={(e) => this.searchStateChange(e)}>
                              <Option value={1}>未使用</Option>
                              <Option value={2}>已使用</Option>
                              <Option value={3}>已禁用</Option>
                              <Option value={4}>已过期</Option>
                          </Select>
                      </li>
                      <li>
                          <span>手机号：</span>
                          <InputNumber style={{ width: '172px',marginRight:'10px'}} onChange={(e) => this.searchMobileChange(e)}/>
                      </li>
                      <li>
                          <span>体检卡号：</span>
                          <Input style={{ width: '172px',marginRight:'10px'}} onChange={(e) => this.searchTicketNoChange(e)}/>
                      </li>
                      <li style={{marginRight:'20px'}}>
                          <span style={{marginRight:'10px'}}>下单时间: </span>
                          <DatePicker
                              style={{ width: '180px' }}
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
                              style={{ width: '180px' }}
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
                      <li><Button icon="search" type="primary" onClick={() => this.onSearch()} style={{marginRight:'20px',marginTop:'10px'}}>查询</Button></li>
                      <ul className="search-func"><li><Button type="primary" onClick={() => this.onAddNewShow()}><Icon type="plus-circle-o" />新增体检人</Button></li></ul>
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
                {/* 添加模态框 */}
              <Modal
                  title='请录入体检人信息'
                  visible={this.state.addnewPersonShow}
                  onOk={() => this.onAddNewOk()}
                  onCancel={() => this.onAddNewClose()}
                  confirmLoading={this.state.addnewLoading}
              >
                <Form>
                  <FormItem
                      label="体检卡号"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewCode', {
                          initialValue: undefined,
                          rules: [
                              {required: true, whitespace: true, message: '请输入体检卡号'},
                          ],
                      })(
                          <Input placeholder="请输入体检卡号" />
                      )}
                  </FormItem>
                    <FormItem
                        label="体检人"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewName', {
                            initialValue: undefined,
                            rules: [
                                {required: true, whitespace: true, message: '请输入体检人姓名'},
                                {max: 12, message: '最多输入12位字符'},
                            ],
                        })(
                            <Input placeholder="请输入体检人姓名" />
                        )}
                    </FormItem>
                    <FormItem
                        label="身份证号"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewIdCard', {
                            initialValue: undefined,
                            rules: [
                                {required: true, whitespace: true,min:18,max:18,message:'请输入18位有效身份证'},
                            ],
                        })(
                            <Input placeholder="请输入身份证号" />
                        )}
                    </FormItem>
                    <FormItem
                        label="手机号"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewMobile', {
                            initialValue: undefined,
                            rules: [
                                {required: true, whitespace: true,min:11,max:11,message:'请输入正确的手机号'},
                            ],
                        })(
                            <Input placeholder="请输入手机号" />
                        )}
                    </FormItem>
                    <FormItem
                        label="出生日期"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewBirthDate', {
                            initialValue: undefined,
                            rules: [
                                {required: true,message: '请选择出生日期'},
                            ],
                        })(
                            <DatePicker />
                        )}
                    </FormItem>
                    <FormItem
                        label="性别"
                        {...formItemLayout}
                    >
                            {getFieldDecorator('addnewSex', {
                            initialValue: true,
                            rules: [
                                {required: true,message: '请选择性别'},
                            ],
                        })(
                            <RadioGroup>
                                <Radio value={1}>男</Radio>
                                <Radio value={0}>女</Radio>
                            </RadioGroup>
                        )}
                    </FormItem>
                    <FormItem
                        label="身高"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewHeight', {
                            initialValue: undefined,
                            rules: [
                                {required: true,message: '请输入身高'},
                            ],
                        })(
                            <InputNumber min={0} max={300} placeholder="请输入身高(cm)"  style={{ width: '100%' }}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="体重"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewWeight', {
                            initialValue: undefined,
                            rules: [
                                {required: true,message: '请输入体重'},
                            ],
                        })(
                            <InputNumber min={0} max={300}  placeholder="请输入体重(kg)"  style={{ width: '100%' }}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="预约日期"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewReserveTime', {
                            initialValue: undefined,
                            rules: [
                                {required: true,message: '请选择预约体检日期'},
                            ],
                        })(
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择预约体检日期"
                                onChange={onChange}
                                onOk={onOk}
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
              >
                <Form>
                    <FormItem
                        label="体检卡号"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.ticketNo : ''}
                    </FormItem>
                  <FormItem
                      label="体检人"
                      {...formItemLayout}
                      style={{ marginLeft:'20px'}}
                  >
                      {!!this.state.nowData ? this.state.nowData.username : ''}
                  </FormItem>
                    <FormItem
                        label="身份证号"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.idCard : ''}
                    </FormItem>
                    <FormItem
                        label="手机号"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.phone : ''}
                    </FormItem>
                    <FormItem
                        label="出生日期"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.birthdate : ''}
                    </FormItem>
                    <FormItem
                        label="性别"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? (String(this.state.nowData.sex) === "0" ? <span>女</span> : <span>男</span>) : ''}
                    </FormItem>
                    <FormItem
                        label="身高"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? `${this.state.nowData.height}cm` : ''}
                    </FormItem>
                    <FormItem
                        label="体重"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? `${this.state.nowData.weight}kg` : ''}
                    </FormItem>
                    <FormItem
                        label="用户来源"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.getNameByModelId(this.state.nowData.userSource) : ''}</FormItem>
                    <FormItem
                        label="预约体检日期"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.reserveTime : ''}
                    </FormItem>
                    <FormItem
                        label="实际体检日期"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.createTime : ''}
                    </FormItem>
                    <FormItem
                        label="体检卡号状态"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.getNameByType(this.state.nowData.conditions) : ''}
                    </FormItem>
                    <FormItem
                        label="操作人"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.updater : ''}
                    </FormItem>
                    <FormItem
                        label="操作时间"
                        {...formItemLayout}
                        style={{ marginLeft:'20px'}}
                    >
                        {!!this.state.nowData ? this.state.nowData.reserveTime : ''}
                    </FormItem>
                </Form>
              </Modal>
                {/* 修改用户模态框 */}
                <Modal
                    title='修改体检人信息'
                    visible={this.state.upModalShow}
                    onOk={() => this.onUpOk()}
                    onCancel={() => this.onUpClose()}
                    confirmLoading={this.state.upLoading}
                >
                    <Form>
                        <FormItem
                            label="体检卡号"
                            {...formItemLayout}
                            // style={{ marginLeft:'20px'}}
                        >
                            {!!this.state.nowData ? this.state.nowData.ticketNo : ''}
                        </FormItem>
                        <FormItem
                            label="体检人"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upUserName', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, whitespace: true, message: '请输入体检人姓名'},
                                    {max: 12, message: '最多输入12位字符'},
                                ],
                            })(
                                <Input placeholder="请输入体检人姓名" />
                            )}
                        </FormItem>
                        <FormItem
                            label="身份证号"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upIdCard', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, whitespace: true,min:18,max:18,message:'请输入18位有效身份证'},
                                ],
                            })(
                                <Input placeholder="请输入身份证号" />
                            )}
                        </FormItem>
                        <FormItem
                            label="手机号"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upMobile', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, whitespace: true,min:11,max:11,message:'请输入正确的手机号'},
                                ],
                            })(
                                <Input placeholder="请输入手机号" />
                            )}
                        </FormItem>
                        <FormItem
                            label="出生日期"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upBirthDate', {
                                initialValue: undefined,
                                rules: [
                                    {required: true,message: '请选择出生日期'},
                                ],
                            })(
                                <DatePicker />
                            )}
                        </FormItem>
                        <FormItem
                            label="性别"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upSex', {
                                initialValue: undefined,
                                rules: [
                                    {required: true,message: '请选择性别'},
                                ],
                            })(
                                <RadioGroup>
                                    <Radio value={1}>男</Radio>
                                    <Radio value={0}>女</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem
                            label="身高"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upHeight', {
                                initialValue: undefined,
                                rules: [
                                    {required: true,message: '请输入身高'},
                                ],
                            })(
                                <InputNumber min={0} max={300} precision={0} placeholder="请输入身高(cm)"  style={{ width: '100%' }}/>
                            )}
                        </FormItem>
                        <FormItem
                            label="体重"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upWeight', {
                                initialValue: undefined,
                                rules: [
                                    {required: true,message: '请输入体重'},
                                ],
                            })(
                                <InputNumber min={0} max={300}  placeholder="请输入体重(kg)"  style={{ width: '100%' }}/>
                            )}
                        </FormItem>
                        <FormItem
                            label="预约日期"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('upReserveTime', {
                                initialValue: undefined,
                                rules: [
                                    {required: true,message: '请选择预约体检日期'},
                                ],
                            })(
                                <DatePicker
                                    style={{ width: '100%' }}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    placeholder="请选择预约体检日期"
                                    onChange={onChange}
                                    onOk={onOk}
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
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
    (state) => ({

    }),
    (dispatch) => ({
        actions: bindActionCreators({ ticketList, ticketSave, ticketUpdate ,onChange,onOk}, dispatch),
    })
)(WrappedHorizontalRole);
