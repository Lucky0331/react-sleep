/* List 商城管理/订单管理/订单列表 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Modal, Tooltip, InputNumber, Select, Divider ,Cascader,DatePicker } from 'antd';
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

import { findAllProvince, findCityOrCounty,findOrderByWhere,addStationList, updateOrder, findProductTypeByWhere,findProductModelByWhere, addProductType, updateProductType, deleteProductType ,onChange,onOk} from '../../../../a_action/shop-action';

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
            productModels: [],  // 所有的产品型号
            searchProductName: '', // 搜索 - 产品名称
            searchModelId: '', // 搜索 - 产品型号
            searchMinPrice: undefined,  // 搜索 - 最小价格
            searchMaxPrice: undefined,  // 搜索- 最大价格
            searchBeginTime: '',  // 搜索 - 开始时间
            searchEndTime: '',  // 搜索- 结束时间
            searchAddress: [], // 搜索 - 地址
            searchorderFrom:'',  //搜索 - 订单来源
            searchName: '', // 搜索 - 状态
            searchPayType:'', //搜索 - 支付类型
            searchConditions:'', //搜索 - 订单状态
            searchorderNo:'',    //搜索 - 订单号
            searchUserName:'',   //搜索 - 经销商账户
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
        if (!this.props.citys.length) { // 获取所有省，全局缓存
            this.getAllCity0();
        } else {
            this.setState({
                citys: this.props.citys.map((item, index) => ({ id: item.id, value: item.areaName, label: item.areaName, isLeaf: false})),
            });
        }
        this.getAllProductType();   // 获取所有的产品类型
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
            isPay: this.state.searchName,
            payType: this.state.searchPayType,
            conditions:this.state.searchConditions,
            id:this.state.searchId,
            userName:this.state.searchUserName,
            ambassadorName:this.state.searchambassadorName,
            modelId: this.state.searchModelId,
            orderFrom:this.state.searchorderFrom,
            orderNo: this.state.searchorderNo,
            province: this.state.searchAddress[0],
            city: this.state.searchAddress[1],
            region: this.state.searchAddress[2],
            minPrice: this.state.searchMinPrice,
            maxPrice: this.state.searchMaxPrice,
            beginTime: this.state.searchBeginTime ? `${tools.dateToStrD(this.state.searchBeginTime._d)} 00:00:00` : '',
            endTime: this.state.searchEndTime ? `${tools.dateToStrD(this.state.searchEndTime._d)} 23:59:59`: '',
        };
        this.props.actions.findOrderByWhere(tools.clearNull(params)).then((res) => {
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
                    productModels: res.messsageBody.modelList.result || [],
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

    // 工具 - 根据ID获取用户来源名字
    getListByModelId(id) {
        switch(String(id)) {
            case '1': return '终端App';
            case '2': return '微信公众号';
            case '3': return '经销商App';
            default: return '';
        }
    }

    // 工具 - 根据ID获取支付方式
    getBypayType(id) {
        switch(String(id)) {
            case '1': return '微信支付';
            case '2': return '支付宝支付';
            case '3': return '银联支付';
            default: return '';
        }
    }

    //工具
    getCity(s,c,q){
        if (!s){
            return '';
        }
        return `${s}/${c}/${q}`;
    }

    //搜索 - 支付状态输入框值改变时触发
    searchNameChange(e) {
        this.setState({
            searchName: e,
        });
    }

    //搜索 - 支付方式输入框值改变时触发
    searchPayTypeChange(e) {
        this.setState({
            searchPayType:e,
        });
    }

    //搜索 - 订单状态改变时触发
    searchConditionsChange(e) {
        this.setState({
            searchConditions:e,
        });
    }

    //搜索 - 订单号
    searchOrderNoChange(e) {
        this.setState({
            searchorderNo:e.target.value,
        });
        console.log('e是什么；',e.target.value)
    }

    //搜索 - 用户账号
    searchUserNameChange(e) {
        this.setState({
            searchUserName:e.target.value,
        });
    }

    //搜索 - 经销商手机号
    ambassadorNameChange(e) {
        this.setState({
            searchambassadorName:e.target.value,
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

    // 搜索 - 产品名称输入框值改变时触发
    searchProductNameChange(e) {
            this.setState({
                searchProductName: e.target.value,
            });
    }

    // 搜索 - 产品型号输入框值改变时触发
    searchModelIdChange(e) {
            this.setState({
                searchModelId: e,
            });
    }

    // 搜索 - 服务站地区输入框值改变时触发
    onSearchAddress(v) {
        this.setState({
            searchAddress: v,
        });
    }

    // 搜索 - 订单来源输入框值改变时触发
    onSearchorderFrom(v) {
        this.setState({
            searchorderFrom: v,
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
        });
    }

    // 搜索 - 结束时间变化
    searchEndTime(v) {
        this.setState({
            searchEndTime: v,
        });
    }

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
                title: '订单号',
                dataIndex: 'orderNo',
                key: 'orderNo',
            },
            {
                title: '订单来源',
                dataIndex: 'orderFrom',
                key: 'orderFrom',
                render: (text) => this.getListByModelId(text),
            },
            {
                title: '用户账号',
                dataIndex: 'userName',
                key: 'userName',
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
                render: (text) => this.findProductNameById(text),
            },
            {
                title: '产品型号',
                dataIndex: 'modelId',
                key: 'modelId',
                render: (text) => this.getNameByModelId(text),
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
                title: '经销商名称',
                dataIndex: 'realName',
                key: 'realName',
            },
            {
                title: '经销商手机号',
                dataIndex: 'ambassadorName',
                key: 'ambassadorName',
            },
            {
                title: '服务站地区',
                dataIndex: 'station',
                key: 'station',
                render: (text, record) => {return record.province ? `${record.province}/${record.city}/${record.region}` : ''},
            },
            {
                title: '服务站名称',
                dataIndex: 'name2',
                key: 'name2',
            },
            {
                title: '下单时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '支付方式',
                dataIndex: 'payType',
                key: 'payType',
                render: (text) => this.getBypayType(text),
                },
            {
                title: '支付状态',
                dataIndex: 'pay',
                key: 'pay',
                render: (text) => String(text) === 'true' ? <span style={{color: 'green'}}>已支付</span> : <span style={{color: 'red'}}>未支付</span>
            },
            {
                title: '订单状态',
                dataIndex: 'conditions',
                key: 'conditions',
                render: (text) => this.getConditionNameById(text)
            },
            {
                title: '操作',
                key: 'control',
                fixed:'right',
                width: 40,
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
                citys: (item.province && item.city && item.region) ? `${item.province}/${item.city}/${item.region}` : '',
                count: item.count,
                ecId: item.ecId,
                fee: item.fee,
                feeType: item.feeType,
                openAccountFee: item.openAccountFee,
                orderType: item.orderType,
                payTime: item.payTime,
                payType: (item.payRecord) ? item.payRecord.payType :'',
                orderNo: item.id,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                createTime: item.createTime,
                pay: item.pay,
                name: (item.product) ? item.product.name : '',
                modelId:(item.product)?item.product.typeCode : '',
                typeId:(item.product)?item.product.typeId :'',
                conditions: item.conditions,
                remark: item.remark,
                shipCode: item.shipCode,
                shipPrice: item.shipPrice,
                transport: item.transport,
                userName: item.userId,
                orderFrom:item.orderFrom,
                realName:(item.distributor) ? item.distributor.realName : '',
                ambassadorName:(item.distributor) ? item.distributor.mobile : '',
                name2:(item.station)? item.station.name : '',
                province:(item.station) ? item.station.province : '',
                city:(item.station) ? item.station.city : '',
                region:(item.station) ? item.station.region : '',
                mchOrderId:(item.payRecord)? item.payRecord.mchOrderId :'',
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
                          <span>订单号</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchOrderNoChange(e)}/>
                      </li>
                      <li>
                          <span>订单来源</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px'}} onChange={(e) => this.onSearchorderFrom(e)}>
                              <Option value={1}>终端app</Option>
                              <Option value={2}>微信公众号</Option>
                              <Option value={3}>经销商app</Option>
                          </Select>
                      </li>
                      <li>
                          <span>用户账号</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchUserNameChange(e)}/>
                      </li>
                      <li>
                          <span>产品名称</span>
                          <Input style={{ width: '172px' }} onChange={(e) => this.searchProductNameChange(e)} value={this.state.searchProductName}/>
                      </li>
                      <li>
                          <span>产品型号</span>
                          <Select allowClear placeholder="全部" style={{ width: '172px' }} onChange={(e) => this.searchModelIdChange(e)}>
                              {this.state.productModels.map((item, index) => {
                                  return <Option key={index} value={item.id}>{ item.name }</Option>
                              })}
                          </Select>
                      </li>

                      <li>
                          <span>总金额</span>
                          <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最小价格" onChange={(e) => this.searchMinPriceChange(e)} value={this.state.searchMinPrice}/>--
                          <InputNumber style={{ width: '80px' }} min={0} max={999999} placeholder="最大价格" onChange={(e) => this.searchMaxPriceChange(e)} value={this.state.searchMaxPrice}/>
                      </li>
                      <li>
                          <span>经销商手机号</span>
                          <Input style={{ width: '172px' }}  onChange={(e) => this.ambassadorNameChange(e)}/>
                      </li>
                      <li>
                          <span>服务站地区</span>
                          <Cascader
                              placeholder="请选择服务区域"
                              style={{ width: '172px' }}
                              onChange={(v) => this.onSearchAddress(v)}
                              options={this.state.citys}
                              loadData={(e) => this.getAllCitySon(e)}
                          />
                      </li>
                      <li>
                          <span>支付方式</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchPayTypeChange(e)}>
                              <Option value={1}>微信</Option>
                              <Option value={2}>支付宝</Option>
                          </Select>
                      </li>
                      <li>
                          <span>支付状态</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchNameChange(e)}>
                              <Option value={0}>未支付</Option>
                              <Option value={1}>已支付</Option>
                          </Select>
                      </li>
                      <li>
                          <span>订单状态</span>
                          <Select placeholder="全部" allowClear style={{ width: '172px' }} onChange={(e) => this.searchConditionsChange(e)}>
                              <Option value={0}>已关闭</Option>
                              <Option value={1}>未完成</Option>
                              <Option value={4}>已完成</Option>
                          </Select>
                      </li>
                      <li>
                          <span style={{marginRight:'10px'}}>下单时间</span>
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
                              placeholder="开始时间"
                              onChange={(e) => this.searchBeginTime(e)}
                          />
                          --
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
                              placeholder="结束时间"
                              onChange={(e) => this.searchEndTime(e)}
                          />
                      </li>
                      <li style={{marginLeft:'40px'}}>
                          <Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button>
                      </li>
                      <li>
                          <Button icon="download" type="primary" onClick={() => this.onExport()}>导出</Button>
                      </li>
                   </ul>
              </div>
              <div className="system-table">
                <Table
                    columns={this.makeColumns()}
                    dataSource={this.makeData(this.state.data)}
                    scroll={{ x: 2000 }}
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
                                <Option value="1">未完成</Option>
                                <Option value="4">已完成</Option>
                                <Option value="0">已关闭</Option>
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
                        {!!this.state.nowData ? this.state.nowData.orderNo : ''}
                    </FormItem>
                    <FormItem
                        label="订单来源"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getListByModelId(this.state.nowData.orderFrom) : ''}
                    </FormItem>
                    <FormItem
                        label="订单状态"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getConditionNameById(this.state.nowData.conditions) : ''}
                    </FormItem>
                    <FormItem
                        label="用户账号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.userName : ''}
                    </FormItem>
                    <FormItem
                        label="产品名称"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.name : ''}
                    </FormItem>
                    <FormItem
                        label="产品类型"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.findProductNameById(this.state.nowData.typeId) : ''}
                    </FormItem>
                    <FormItem
                        label="产品型号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.getNameByModelId(this.state.nowData.modelId) : ''}
                    </FormItem>
                    <FormItem
                        label="数量"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.count : ''}
                    </FormItem>
                    <FormItem
                        label="体检卡号"
                        {...formItemLayout}
                    >
                        {/*{!!this.state.nowData ? this.state.nowData.id : ''}*/}
                    </FormItem>
                    <FormItem
                        label="订单总费用"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.fee : ''}
                    </FormItem>
                    <FormItem
                        label="下单时间"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.createTime : ''}
                    </FormItem>
                  <FormItem
                      label="支付方式"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.getBypayType(this.state.nowData.payType) : ''}
                  </FormItem>
                    <FormItem
                        label="支付状态"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? (String(this.state.nowData.pay) === "true" ? <span style={{ color: 'green' }}>已支付</span> : <span style={{ color: 'red' }}>未支付</span>) : ''}
                    </FormItem>
                    <FormItem
                        label="支付时间"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.createTime : ''}
                    </FormItem>

                    <FormItem
                        label="流水号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.mchOrderId : ''}
                    </FormItem>
                    <FormItem
                        label="经销商名称"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.realName : ''}
                    </FormItem>
                    <FormItem
                        label="经销商手机号"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.ambassadorName : ''}
                    </FormItem>
                    <FormItem
                        label="经销商身份"
                        {...formItemLayout}
                    >
                        {!!this.state.nowData ? this.state.nowData.name : ''}
                    </FormItem>
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
                        {!!this.state.nowData ? this.state.nowData.name2 : ''}
                    </FormItem>
                    <FormItem
                        label="是否承包体检服务"
                        {...formItemLayout}
                    >
                        {/*{!!this.state.nowData ? this.state.nowData.name : ''}*/}
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
        actions: bindActionCreators({findAllProvince, findCityOrCounty, addStationList,findOrderByWhere, updateOrder, findProductModelByWhere,findProductTypeByWhere, addProductType, updateProductType, deleteProductType,onChange,onOk }, dispatch),
    })
)(WrappedHorizontalRole);
