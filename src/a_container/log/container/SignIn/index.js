/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Modal, Radio, Select, Tooltip } from 'antd';
import './index.scss';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
// ==================
// 所需的所有组件
// ==================

import UrlBread from '../../../../a_component/urlBread';

// ==================
// 本页面所需action
// ==================

import { findAdminUserByKeys, addAdminUserInfo, deleteAdminUserInfo, updateAdminUserInfo, findAllRole, findAllRoleByUserId, assigningRole } from '../../../../a_action/sys-action';
import { findLoginLogBykeys } from '../../../../a_action/log-action';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Manager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [], // 当前页面全部数据
            searchUserName: '',
            searchConditions: null,
            addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
            addnewLoading: false, // 是否正在添加新用户中
            nowData: null, // 当前选中用户的信息，用于查看详情
            queryModalShow: false, // 查看详情模态框是否显示
            upModalShow: false, // 修改用户模态框是否显示
            upLoading: false, // 是否正在修改用户中
            roleTreeShow: false, // 角色树是否显示
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
        };

        Power.test(power.system.manager.query.code) && this.props.actions.findLoginLogBykeys(tools.clearNull(params)).then((res) => {
            if(res.returnCode === "0") {
                this.setState({
                    data: res.messsageBody.result,
                    pageNum,
                    pageSize,
                    total: res.messsageBody.total,
                });
            } else {
                message.error(res.returnMessaage || '获取数据失败，请重试');
            }
        });
    }
    // 搜索 - 用户名输入框值改变时触发
    searchUserNameChange(e) {
        if (e.target.value.length < 20) {
            this.setState({
                searchUserName: e.target.value,
            });
        }
    }

    // 搜索 - 状态选择框值变化时调用
    searchConditions(e) {
        console.log('选择了什么：', e);
        this.setState({
            searchConditions: e || null,
        });
    }

    // 搜索
    onSearch() {
        this.onGetData(1, this.state.pageSize);
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
                title: '用户名',
                dataIndex: 'userName',
                key: 'userName',
            },
            {
                title: '性别',
                dataIndex: 'sex',
                key: 'sex',
                render: (text, record) => {
                    return text !== null ? (text === 1 ? '男' : '女') : '';
                },
            },
            {
                title: '年龄',
                dataIndex: 'age',
                key: 'age',
            },
            {
                title: '电话',
                dataIndex: 'phone',
                key: 'phone',
            },
            {
                title: '邮箱',
                dataIndex: 'email',
                key: 'email',
            },
            {
                title: '状态',
                dataIndex: 'conditions',
                key: 'conditions',
                render: (text, record) => text === "0" ? <span style={{color: 'green'}}>启用</span> : <span style={{color: 'red'}}>禁用</span>
            },
            {
                title: '操作',
                key: 'control',
                width: 200,
                render: (text, record) => {
                    let controls = [];

                    Power.test(power.system.manager.query.code) && controls.push(
                        <span key="0" className="control-btn green" onClick={() => this.onQueryClick(record)}>
                            <Tooltip placement="top" title="查看">
                                <Icon type="eye" />
                            </Tooltip>
                        </span>
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
        console.log('DATA:', data);
        if (!data){return []}
        return data.map((item, index) => {
            return {
                key: index,
                adminIp: item.adminIp,
                password: item.password,
                id: item.id,
                serial: (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                age: item.age,
                conditions: item.conditions,
                creator: item.creator,
                createTime: item.createTime,
                description: item.description,
                email: item.email,
                orgCode: item.orgCode,
                phone: item.phone,
                sex: item.sex,
                updateTime: item.updateTime,
                updater: item.updater,
                userName: item.userName,
                control: item.id,
            }
        });
    }

    render() {
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

        return (
            <div>
              <UrlBread location={this.props.location}/>
              <div className="system-search">
                  { Power.test(power.system.manager.query.code) &&
                  <ul className="search-ul">
                    <li>
                      <Input
                          placeholder="登录人"
                          onChange={(e) => this.searchUserNameChange(e)}
                          value={this.state.searchUserName}
                          onPressEnter={() => this.onSearch()}
                      />
                    </li>
                    <li>
                      <Select
                          style={{ width: '150px' }}
                          placeholder="登录状态"
                          allowClear
                          onChange={(e) => this.searchConditions(e)}
                      >
                        <Option value="0">启用</Option>
                        <Option value="-1">禁用</Option>
                      </Select>
                    </li>
                    <li>
                      <Input
                          placeholder="登录人"
                          onChange={(e) => this.searchUserNameChange(e)}
                          value={this.state.searchUserName}
                          onPressEnter={() => this.onSearch()}
                      />
                    </li>
                    <li><Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
                  </ul>
                  }

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
                {/* 查看用户详情模态框 */}
              <Modal
                  title={this.state.nowData ? `${this.state.nowData.userName}的用户详情` : '用户详情'}
                  visible={this.state.queryModalShow}
                  onOk={() => this.onQueryModalClose()}
                  onCancel={() => this.onQueryModalClose()}
              >
                <Form>
                  <FormItem
                      label="用户名"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.userName : ''}
                  </FormItem>
                  <FormItem
                      label="性别"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? (this.state.nowData.sex === 1 ? '男' : '女') : ''}
                  </FormItem>
                  <FormItem
                      label="年龄"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.age : ''}
                  </FormItem>
                  <FormItem
                      label="电话"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.phone : ''}
                  </FormItem>
                  <FormItem
                      label="邮箱"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.email : ''}
                  </FormItem>
                  <FormItem
                      label="组织编号"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.orgCode : ''}
                  </FormItem>
                  <FormItem
                      label="描述"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.description : ''}
                  </FormItem>
                  <FormItem
                      label="状态"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? (this.state.nowData.conditions === "0" ? <span style={{ color: 'green' }}>启用</span> : <span style={{ color: 'red' }}>禁用</span>) : ''}
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

Manager.propTypes = {
    location: P.any,
    history: P.any,
    actions: P.any,
    allRoles: P.any,
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
    (state) => ({
        allRoles: state.sys.allRoles,
    }),
    (dispatch) => ({
        actions: bindActionCreators({ findLoginLogBykeys, findAdminUserByKeys, addAdminUserInfo, deleteAdminUserInfo, updateAdminUserInfo, findAllRole, findAllRoleByUserId, assigningRole }, dispatch),
    })
)(WrappedHorizontalManager);
