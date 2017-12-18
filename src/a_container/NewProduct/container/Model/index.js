/* Category 商城管理/产品管理/产品型号 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Popconfirm, Modal, Radio, Tooltip, InputNumber, Select  } from 'antd';
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

import { findProductModelByWhere, addProductModel, findProductTypeByWhere, upProductModel, delProductModel } from '../../../../a_action/shop-action';

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // 当前页面全部数据
            productTypes: [],   // 所有的产品类型
            searchTypeId: undefined, // 搜索 - 类型名
            addnewModalShow: false, // 添加模态框是否显示
            addnewLoading: false, // 是否正在添加中
            nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
            queryModalShow: false, // 查看详情模态框是否显示
            upModalShow: false, // 修改模态框是否显示
            upLoading: false, // 是否正在修改用户中
            pageNum: 1, // 当前第几页
            pageSize: 10, // 每页多少条
            total: 0, // 数据库总共多少条数据
        };
    }

    componentDidMount() {
        this.getAllTypes(); // 获取所有产品类型
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    // 查询当前页面所需列表数据
    onGetData(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
            typeId: this.state.searchTypeId,
        };
        this.props.actions.findProductModelByWhere(tools.clearNull(params)).then((res) => {
            console.log('返回的什么：', res);
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

    // 获取所有的产品类型，添加修改要用
    getAllTypes() {
        this.props.actions.findProductTypeByWhere({ pageNum: 0, pageSize: 9999 }).then((res) => {
            if (res.returnCode === '0') {
                this.setState({
                    productTypes: res.messsageBody.result,
                });
            }
        });
    }

    // 工具 - 根据有效期type获取有效期名称
    getNameForInDate(type) {
        switch(String(type)){
            case '0': return '长期有效';
            case '1': return '三天';
            case '2': return '七天';
            case '3': return '一个月';
            case '4': return '半年';
            case '5': return '一年';
            case '6': return '两年';
            default: return '';
        }
    }

    // 工具 - 根据产品类型ID返回产品类型名称
    getNameByTypeId(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }

    // 搜索 - 用户名输入框值改变时触发
    onSearchTypeId(e) {
        this.setState({
            searchTypeId: e,
        });
    }

    // 修改某一条数据 模态框出现
    onUpdateClick(record) {
        const me = this;
        const { form } = me.props;
        console.log('Record:', record);
        form.setFieldsValue({
            upName: record.name,
            upTypeId: record.typeId,
            upPrice: record.price,
            upInDate: record.inDate,
            upConditions: `${record.conditions}`
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
            'upName',
            'upTypeId',
            'upPrice',
            'upConditions',
            'upTimeLimitType',
            'upTimeLimitNum',
        ], (err, values) => {
            if(err) { return; }

            me.setState({
                upLoading: true,
            });
            const params = {
                id: me.state.nowData.id,
                name: values.upName,
                typeId: values.upTypeId,
                price: values.upPrice,
                conditions: values.upConditions,
                timeLimitType: values.upTimeLimitType,
                timeLimitNum: values.upTimeLimitNum,
            };

            this.props.actions.upProductModel(params).then((res) => {
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

    // 删除某一条数据
    onDeleteClick(id) {
        this.props.actions.delProductModel({id: id}).then((res) => {
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

    // 添加新用户模态框出现
    onAddNewShow() {
        const me = this;
        const { form } = me.props;
        form.resetFields([
            'addnewName',
            'addnewTypeId',
            'addnewPrice',
            'addnewInDate',
            'addnewConditions',
            'addnewTimeLimitType',
            'addnewTimeLimitNum',
        ]);
        this.setState({
            addnewModalShow: true,
        });
    }

    // 添加新的确定
    onAddNewOk() {
        const me = this;
        const { form } = me.props;
        form.validateFields([
            'addnewName',
            'addnewTypeId',
            'addnewPrice',
            'addnewInDate',
            'addnewConditions',
            'addnewTimeLimitType',
            'addnewTimeLimitNum',
        ], (err, values) => {
            if (err) { return false; }
            me.setState({
                addnewLoading: true,
            });
            const params = {
                name: values.addnewName,
                typeId: Number(values.addnewTypeId),
                price: values.addnewPrice,
                inDate: Number(values.addnewInDate),
                conditions: values.addnewConditions,
                timeLimitType: values.addnewTimeLimitType,
                timeLimitNum: values.addnewTimeLimitNum,
            };

            me.props.actions.addProductModel(params).then((res) => {
                console.log('添加返回数据：', res);
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

    // 添加新用户取消
    onAddNewClose() {
        this.setState({
            addnewModalShow: false,
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
                dataIndex: 'serial',
                key: 'serial',
            },
            {
                title: '产品型号',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '产品类型',
                dataIndex: 'typeName',
                key: 'typeName',
            },
            {
                title: '价格',
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: '有效期',
                dataIndex: 'inDate',
                key: 'inDate',
                render: (text) => this.getNameForInDate(text),
            },
            // {
            //     title: '产品标识',
            //     dataIndex: 'conditions',
            //     key: 'conditions',
            //     render: (text, record) => text === 0 ? <span style={{color: 'green'}}>启用</span> : <span style={{color: 'red'}}>禁用</span>
            // },
            {
                title: '操作',
                key: 'control',
                width: 200,
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
                        <Popconfirm key="3" title="确定删除吗?" onConfirm={() => this.onDeleteClick(record.id)} okText="确定" cancelText="取消">
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
                            result.push(<span key={`line${index}`} className="ant-divider" />,);
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
                name: item.name,
                typeId: item.typeId,
                typeName: this.getNameByTypeId(item.typeId),
                price: item.price,
                inDate: item.inDate,
                conditions: item.conditions,
                detail: item.detail,
                createTime: item.createTime,
                creator: item.creator,
            }
        });
    }

    render() {
        const me = this;
        const { form } = me.props;
        const { getFieldDecorator, getFieldValue } = form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 15 },
            },
        };
        const addnewTimeLimitType = getFieldValue('addnewTimeLimitType') === 0;
        const upTimeLimitType = getFieldValue('upTimeLimitType') === 0;
        return (
            <div>
              <div className="system-search">
                <span className="ant-divider" />
                  <ul className="search-ul">
                      <li>
                          <Select allowClear placeholder="产品类型" value={this.state.searchTypeId} style={{ width: '200px' }} onChange={(e) => this.onSearchTypeId(e)}>
                              {this.state.productTypes.map((item, index) => {
                                  return <Option key={index} value={item.id}>{ item.name }</Option>
                              })}
                          </Select>
                      </li>
                      <li><Button type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
                      <ul className="search-func"><li><Button type="primary" onClick={() => this.onAddNewShow()}><Icon type="plus-circle-o" />添加产品型号</Button></li></ul>
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
                {/* 添加角色模态框 */}
              <Modal
                  title='添加产品型号'
                  visible={this.state.addnewModalShow}
                  onOk={() => this.onAddNewOk()}
                  onCancel={() => this.onAddNewClose()}
                  confirmLoading={this.state.addnewLoading}
              >
                <Form>
                    <FormItem
                        label="产品类型"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewTypeId', {
                            initialValue: undefined,
                            rules: [
                                {required: true, message: '健康体检'}
                            ],
                        })(
                            <Select style={{marginLeft:'80px',width:'60%'}}>
                                {this.state.productTypes.map((item, index) => {
                                    return <Option key={index} value={item.id}>{ item.name }</Option>
                                })}
                            </Select>
                        )}
                    </FormItem>
                  <FormItem
                      label="产品型号"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewName', {
                          initialValue: undefined,
                          rules: [
                              {required: true, whitespace: true, message: '请输入产品型号名称'},
                              {max: 12, message: '最多输入12字符'}
                          ],
                      })(
                          <Input placeholder="TJK-A" style={{marginLeft:'80px',width:'60%'}}/>
                      )}
                  </FormItem>
                    <FormItem
                        label="描述"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewSay', {
                            initialValue: undefined,
                            rules: [
                                {required: true,whitespace: true,message: '请对产品进行描述'}
                            ],
                        })(
                            <Input placeholder="服务站专用卡" style={{marginLeft:'80px',width:'60%'}}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="体检券数量"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewNum', {
                            initialValue: undefined,
                            rules: [
                                {required: true,whitespace: true,message: '请输入体检券数量'}
                            ],
                        })(
                            <InputNumber placeholder="5" style={{marginLeft:'80px',width:'60%'}}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="单张体检券可用次数"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('addnewTime', {
                            initialValue: undefined,
                            rules: [
                                {required: true,whitespace: true,message: '请填写可用次数'}
                            ],
                        })(
                            <InputNumber placeholder="1" style={{marginLeft:'80px',width:'60%'}}/>
                        )}
                    </FormItem>
                </Form>
                  <FormItem
                      label="产品价格"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewPrice', {
                          initialValue: 0,
                          rules: [{required: true, message: '请输入价格'}],
                      })(
                          <InputNumber min={0} max={99999} style={{marginLeft:'80px',width:'60%'}}/>
                      )}
                  </FormItem>
                  <FormItem
                      label="有效期"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewTimeLimitNum', {
                          initialValue: 0,
                          rules: [
                              {required: true, message: '请输入有效期'}
                          ],
                      })(
                          <InputNumber min={0} max={12} placeholder="请输入有效期" style={{marginLeft:'80px'}}/>
                      )}
                      {getFieldDecorator('addnewTimeLimitType', {
                          initialValue: 0,
                          rules: [
                              {required: true, message: '请选择有效期'}
                          ],
                      })(
                          <Select style={{ marginLeft:'10px' }}>
                              <Option value={0}>年</Option>
                              <Option value={1}>月</Option>
                              <Option value={2}>日</Option>
                          </Select>
                      )}

                  </FormItem>
                  {/*<FormItem*/}
                      {/*label="有效期"*/}
                      {/*style={{ display: addnewTimeLimitType ? 'none' : 'block' }}*/}
                      {/*{...formItemLayout}*/}
                  {/*>*/}
                      {/*{getFieldDecorator('addnewTimeLimitNum', {*/}
                          {/*initialValue: 0,*/}
                          {/*rules: [*/}
                              {/*{required: true, message: '请输入有效期'}*/}
                          {/*],*/}
                      {/*})(*/}
                          {/*<InputNumber min={0} max={12} placeholder="请输入有效期"/>*/}
                      {/*)}*/}
                  {/*</FormItem>*/}
              </Modal>
                {/* 修改用户模态框 */}
              <Modal
                  title='修改产品型号'
                  visible={this.state.upModalShow}
                  onOk={() => this.onUpOk()}
                  onCancel={() => this.onUpClose()}
                  confirmLoading={this.state.upLoading}
              >
                <Form>
                    <FormItem
                        label="型号名称"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('upName', {
                            initialValue: undefined,
                            rules: [
                                {required: true, whitespace: true, message: '请输入产品型号名称'},
                                { validator: (rule, value, callback) => {
                                    const v = tools.trim(value);
                                    if (v) {
                                        if (v.length > 12) {
                                            callback('最多输入12位字符');
                                        }
                                    }
                                    callback();
                                }}
                            ],
                        })(
                            <Input placeholder="请输入产品型号名称" />
                        )}
                    </FormItem>
                    <FormItem
                        label="产品类型"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('upTypeId', {
                            initialValue: undefined,
                            rules: [
                                {required: true, message: '请选择产品类型'}
                            ],
                        })(
                            <Select>
                                {this.state.productTypes.map((item, index) => {
                                    return <Option key={index} value={item.id}>{ item.name }</Option>
                                })}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        label="价格"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('upPrice', {
                            initialValue: 0,
                            rules: [{required: true, message: '请输入价格'}],
                        })(
                            <InputNumber min={0} max={99999} />
                        )}
                    </FormItem>
                    <FormItem
                        label="期限类型"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('upTimeLimitType', {
                            initialValue: 0,
                            rules: [
                                {required: true, message: '请选择有效期'}
                            ],
                        })(
                            <Select style={{ width: '100%' }}>
                                <Option value={0}>长期有效</Option>
                                <Option value={1}>年</Option>
                                <Option value={2}>月</Option>
                                <Option value={3}>日</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        label="有效期"
                        style={{ display: upTimeLimitType ? 'none' : 'block' }}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('upTimeLimitNum', {
                            initialValue: 0,
                            rules: [
                                {required: true, message: '请输入有效期'}
                            ],
                        })(
                            <InputNumber min={0} max={9999} placeholder="请输入有效期"/>
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
                      label="产品型号"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.productModel : ''}
                  </FormItem>
                  <FormItem
                      label="产品类型"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.typeName : ''}
                  </FormItem>
                    <FormItem
                        label="价格"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.price : ''}
                    </FormItem>
                    <FormItem
                        label="有效期"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getNameForInDate(this.state.nowData.inDate) : ''}
                    </FormItem>
                    <FormItem
                        label="状态"
                        {...formItemLayout}
                    >
                        {(!!this.state.nowData) && this.state.nowData.conditions === 0 ? <span style={{ color: 'green' }}>启用</span> : <span style={{ color: 'red' }}>禁用</span>}
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
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
    (state) => ({

    }),
    (dispatch) => ({
        actions: bindActionCreators({ findProductModelByWhere, addProductModel, findProductTypeByWhere, upProductModel, delProductModel }, dispatch),
    })
)(WrappedHorizontalRole);
