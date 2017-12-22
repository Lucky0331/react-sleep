/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Modal, Tooltip, InputNumber, Select, Divider ,Cascader } from 'antd';
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

import { findAllProvince, findCityOrCounty,findOrderByWhere,addStationList, updateOrder, findProductTypeByWhere, addProductType, updateProductType, deleteProductType } from '../../../../a_action/shop-action';

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
            searchProductName: '', // 搜索 - 类型名
            searchMinPrice: undefined,  // 搜索 - 最小价格
            searchMaxPrice: undefined,  // 搜索- 最大价格
            nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
            addnewModalShow: false, // 查看地区模态框是否显示
            upModalShow: false, // 修改模态框是否显示
            upLoading: false, // 是否正在修改用户中
            pageNum: 0, // 当前第几页
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
            productName: this.state.searchProductName,
            minPrice: this.state.searchMinPrice,
            maxPrice: this.state.searchMaxPrice,

        };
        this.props.actions.findOrderByWhere(tools.clearNull(params)).then((res) => {
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

    // 工具 - 根据受理状态码查询对应的名字
    getConditionNameById(id) {
        switch(id) {
            case 1: return '未受理';
            case 2: return '已受理';
            case 3: return '处理中';
            case 4: return '已完成';
            case -1: return '审核中';
            case -2: return '未通过';
            default: return '';
        }
    }

    // // 工具 - 根据产品类型ID查产品类型名称
    // findProductNameById(id) {
    //     const t = this.state.productTypes.find((item) => String(item.id) === String(id));
    //     return t ? t.name : '';
    // }

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

    // 添加或修改确定
    onAddNewOk() {
        const me = this;
        const { form } = me.props;

        form.validateFields([
            'addnewCitys',
        ], (err, values) => {
            if (err) { return false; }
            me.setState({
                addnewLoading: true,
            });
            console.log('区域是什么；', values.addnewCitys);

            const params = {
                contactPhone: values.addnewContactPhone,
                dayCount: values.addnewDayCount,
                state: values.addnewState,
                code: values.addnewCode,
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

    // 搜索 - 用户名输入框值改变时触发
    searchProductNameChange(e) {
        if (e.target.value.length < 20) {
            this.setState({
                searchProductName: e.target.value,
            });
        }
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
    // 修改某一条数据 模态框出现
    // onUpdateClick(record) {
    //     const me = this;
    //     const { form } = me.props;
    //     console.log('Record:', record);
    //     form.setFieldsValue({
    //         upOrderStatus: `${record.conditions}`
    //     });
    //     me.setState({
    //         nowData: record,
    //         upModalShow: true,
    //     });
    // }

    // 确定修改某一条数据
    onUpOk() {
        const me = this;
        const { form } = me.props;
        form.validateFields([
            'upOrderStatus',
        ], (err, values) => {
            if(err) { return; }

            me.setState({
                upLoading: true,
            });
            const params = {
                orderId: me.state.nowData.id,
                orderStatus: values.upOrderStatus,
            };

            this.props.actions.updateProductType(params).then((res) => {
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

    // 搜索
    onSearch() {
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }
    //导出
    onExport(){
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
                title: '订单号',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: '订单来源'
            },
            {
                title: '用户账户',
                dataIndex: 'userId',
                key: 'userId',
            },
            {
                title: '产品名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '产品类型',
                dataIndex: 'typeId',
                key: 'typeId',
                // render: (text) => this.findProductNameById(text),
            },
            {
                title: '产品型号',
                dataIndex: 'typeCode',
                key: 'typeCode',
            },
            {
                title: '数量',
                dataIndex: 'count',
                key: 'count',
            },
            {
                title: '总金额',
                dataIndex: 'fee',
                key: 'fee',
            },
            {
                title: '经销商名称'
            },
            {
                title: '经销商账户'
            },
            {
                title: '服务站名称',
                dataIndex: 'stationId',
                key: 'stationId',
            },
            {
                title: '下单时间',
                dataIndex: 'payTime',
                key: 'payTime',
                render: (text) => text ? tools.dateToStr(new Date(text)) : ''
            },
            {
                title: '支付方式',
                dataIndex: 'pay',
                key: 'pay',
                render: (text, record) => text ? <span style={{color: 'green'}}>微信</span> : <span style={{color: 'blue'}}>支付宝</span>
            },
            {
                title: '支付状态',
                dataIndex: 'isPay',
                key: 'isPay',
                render: (text, record) => text ? <span style={{color: 'green'}}>已支付</span> : <span style={{color: 'red'}}>未支付</span>
            },
            {
                title: '订单状态',
                dataIndex: 'conditions',
                key: 'conditions',
                render: (text, record) => this.getConditionNameById(text)
            },
            {
                title: '操作',
                key: 'control',
                width: 200,
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
                payType: item.payType,
                citys: (item.province && item.city && item.region) ? `${item.province}/${item.city}/${item.region}` : '',
                province: item.province,
                city: item.city,
                id: item.id,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                createTime: item.createTime,
                pay: item.pay,
                name: item.product ? item.product.name : '',
                typeCode: item.product ? item.product.typeCode : '',
                conditions: item.conditions,
                remark: item.remark,
                shipCode: item.shipCode,
                shipPrice: item.shipPrice,
                transport: item.transport,
                userId: item.userId,
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
                  <ul className="search-ul">
                      <li>订单号  <InputNumber min={0} style={{marginRight:'20px'}}/></li>
                      <li>
                          <span style={{marginRight:'10px'}}>订单来源</span>
                          <Select placeholder="全部" style={{ width: '120px',marginRight:'20px' }}>
                              <Option value={0}>健康e家app</Option>
                              <Option value={1}>经销商app</Option>
                              <Option value={2}>微信公众号</Option>
                          </Select>
                      </li>
                      <li>用户账号  <Input style={{width:'50%',marginRight:'10px'}}/></li>
                      <li>产品名称  <Input style={{width:'50%'}} onChange={(e) => this.searchProductNameChange(e)} value={this.state.searchProductName}/></li>
                      <li>
                          <span style={{marginRight:'10px'}}>产品型号</span>
                          <Select placeholder="全部" style={{ width: '100px',marginRight:'20px' }}>
                              <Option value={1}>水机</Option>
                              <Option value={2}>养未来</Option>
                              <Option value={3}>冷敷贴</Option>
                              <Option value={4}>水机续费订单</Option>
                              <Option value={5}>精准体检</Option>
                              <Option value={6}>智能睡眠</Option>
                          </Select>
                      </li>
                      <li>总金额  <InputNumber min={0} max={999999} placeholder="最小价格" onChange={(e) => this.searchMinPriceChange(e)} value={this.state.searchMinPrice} style={{width:'30%'}}/>--
                          <InputNumber min={0} max={999999} placeholder="最大价格" onChange={(e) => this.searchMaxPriceChange(e)} value={this.state.searchMaxPrice}/>
                      </li>
                      <li>经销商账户  <Input style={{width:'48%'}}/></li>
                   </ul>
                  <ul className="search-ul" style={{marginTop:'20px'}}>
                      <li style={{marginRight:'20px'}}>
                          <ul className="search-func">
                              <span style={{marginRight:'10px'}}>服务站地区</span>
                              <span style={{ color: '#888' }}>
                                    {(this.state.nowData && this.state.addOrUp === 'up' && this.state.nowData.province && this.state.nowData.city && this.state.nowData.region) ? `${this.state.nowData.province}/${this.state.nowData.city}/${this.state.nowData.region}` : null}
                                </span>
                                      {getFieldDecorator('addnewCitys', {
                                          initialValue: undefined,
                                          rules: [
                                              {message: '请选择区域'},
                                          ],
                                      })(
                                          <Cascader
                                              placeholder="请选择服务区域"
                                              options={this.state.citys}
                                              loadData={(e) => this.getAllCitySon(e)}
                                          />
                                      )}
                          </ul>
                      </li>
                      <li>下单时间  <InputNumber style={{width:'30%'}}/>--
                          <InputNumber/>
                      </li>
                      <li>
                          <span style={{marginRight:'10px'}}>支付方式</span>
                          <Select placeholder="全部" style={{ width: '120px',marginRight:'20px' }}>
                              <Option value={0}>微信</Option>
                              <Option value={1}>支付宝</Option>
                          </Select>
                      </li>
                      <li>
                          <span style={{marginRight:'10px'}}>支付状态</span>
                          <Select placeholder="全部" style={{ width: '120px',marginRight:'30px' }}>
                              <Option value={0}>已支付</Option>
                              <Option value={1}>未支付</Option>
                          </Select>
                      </li>
                      <li>
                          <span style={{marginRight:'20px'}}>订单状态</span>
                          <Select placeholder="全部" style={{ width: '120px',marginRight:'70px' }}>
                              <Option value="1">未受理</Option>
                              <Option value="2">已受理</Option>
                              <Option value="3">处理中</Option>
                              <Option value="4">已完成</Option>
                              <Option value="-1">审核中</Option>
                              <Option value="-2">未通过</Option>
                          </Select>
                      </li>
                      <li><Button  type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
                      <li><Button  type="primary" onClick={() => this.onExport()}>导出</Button></li>
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
                {/* 修改用户模态框 */}
              <Modal
                  title='修改订单状态'
                  visible={this.state.upModalShow}
                  onOk={() => this.onUpOk()}
                  onCancel={() => this.onUpClose()}
                  confirmLoading={this.state.upLoading}
              >
                <Form>
                    <FormItem
                        label="状态"
                        {...formItemLayout}
                    >
                        {getFieldDecorator('upOrderStatus', {
                            rules: [],
                            initialValue: "1",
                        })(
                            <Select>
                                <Option value="1">未受理</Option>
                                <Option value="2">已受理</Option>
                                <Option value="3">处理中</Option>
                                <Option value="4">已完成</Option>
                                <Option value="-1">审核中</Option>
                                <Option value="-2">未通过</Option>
                            </Select>
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
                        label="订单号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.id : ''}
                    </FormItem>
                    {/*<FormItem*/}
                        {/*label="产品类型"*/}
                        {/*{...formItemLayout}*/}
                    {/*>*/}
                        {/*{!!this.state.nowData ? this.findProductNameById(this.state.nowData.typeId) : ''}*/}
                    {/*</FormItem>*/}
                  <FormItem
                      label="生成时间"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.createTime : ''}
                  </FormItem>
                  <FormItem
                      label="商品名称"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.name : ''}
                  </FormItem>
                    <FormItem
                        label="商品型号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.typeCode : ''}
                    </FormItem>
                    <FormItem
                        label="购买数量"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.count : ''}
                    </FormItem>
                    <FormItem
                        label="总费用"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.fee : ''}
                    </FormItem>
                    {/*<FormItem*/}
                        {/*label="开户费"*/}
                        {/*{...formItemLayout}*/}
                    {/*>*/}
                        {/*{!!this.state.nowData ? this.state.nowData.openAccountFee : ''}*/}
                    {/*</FormItem>*/}
                    <FormItem
                        label="用户账户"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.userId : ''}
                    </FormItem>
                    <FormItem
                        label="支付状态"
                        {...formItemLayout}
                    >
                        {(!!this.state.nowData) && this.state.nowData.pay ? <span style={{ color: 'green' }}>已支付</span> : <span style={{ color: 'red' }}>未支付</span>}
                    </FormItem>
                    <FormItem
                        label="支付时间"
                        {...formItemLayout}
                    >
                        {(!!this.state.nowData && this.state.nowData.payTime) ? tools.dateToStr(new Date(this.state.nowData.payTime)) : '' }
                    </FormItem>
                    <FormItem
                        label="受理状态"
                        {...formItemLayout}
                    >
                        {(!!this.state.nowData && this.state.nowData.conditions) ? this.getConditionNameById(this.state.nowData.conditions) : ''}
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
        actions: bindActionCreators({findAllProvince, findCityOrCounty, addStationList,findOrderByWhere, updateOrder, findProductTypeByWhere, addProductType, updateProductType, deleteProductType }, dispatch),
    })
)(WrappedHorizontalRole);
