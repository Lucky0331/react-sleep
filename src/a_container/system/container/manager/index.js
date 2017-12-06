/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Popconfirm, Modal, Radio, InputNumber, Select, Tooltip, Divider  } from 'antd';
import './index.scss';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
// ==================
// 所需的所有组件
// ==================

import UrlBread from '../../../../a_component/urlBread';
import RoleTree from '../../../../a_component/roleTree';    // 角色树 用于选角色
import OrTree from '../../../../a_component/menuTree/organizationTree'; // 组织部门树 用于选部门编号
// ==================
// 本页面所需action
// ==================

import { findAdminUserByKeys, addAdminUserInfo, deleteAdminUserInfo, updateAdminUserInfo, findAllRole, findAllRoleByUserId, assigningRole, findAllOrganizer } from '../../../../a_action/sys-action';

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
      orgCodeValue: null, // 新增、修改 - 选择的组织部门对象
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      upLoading: false, // 是否正在修改用户中
      roleTreeShow: false, // 角色树是否显示
        orTreeShow: false, // 部门树是否显示
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
      if (!this.props.allOrganizer || this.props.allOrganizer.length <= 0) {
          this.getAllOrganizer();
      }
  }

  // 查询所有组织机构
    getAllOrganizer() {
        this.props.actions.findAllOrganizer();
    }

  // 查询当前页面所需列表数据
    onGetData(pageNum, pageSize) {
        const params = {
            userName: this.state.searchUserName,
            conditions: this.state.searchConditions,
            pageNum,
            pageSize,
        };

        Power.test(power.system.manager.query.code) && this.props.actions.findAdminUserByKeys(tools.clearNull(params)).then((res) => {
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

   // 修改某一条数据 模态框出现
    onUpdateClick(record) {
      const me = this;
      const { form } = me.props;
      console.log('Record:', record);
        form.setFieldsValue({
            upUsername: record.userName,
            upPassword: '______',
            upSex: record.sex || 1,
            upAge: record.age || undefined,
            upPhone: record.phone || undefined,
            upEmail: record.email || undefined,
            upDescription: record.description || undefined,
            upConditions: record.conditions || "0",
        });
        me.setState({
            nowData: record,
            upModalShow: true,
            orgCodeValue: record.orgCode ? { id: Number(record.orgCode), key: record.orgCode, title: this.getNameForId(record.orgCode) } : null,
        });
    }

    // 确定修改某一条数据
    onUpOk() {
      console.log('NOWDATA:', this.state.nowData);
      const me = this;
      const { form } = me.props;
        form.validateFields([
            'upUsername',
            'upPassword',
            'upSex',
            'upAge',
            'upPhone',
            'upEmail',
            'upDescription',
            'upConditions',
        ], (err, values) => {
            if(err) { return; }

            me.setState({
                upLoading: true,
            });

            const params = {
                id: me.state.nowData.id,
                userName: values.upUsername,
                password: values.upPassword === '______' ? null : values.upPassword,
                sex: values.upSex,
                age: values.upAge || '',
                phone: values.upPhone || '',
                email: values.upEmail || '',
                orgCode: this.state.orgCodeValue && this.state.orgCodeValue.id,
                description: values.upDescription || '',
                adminIp: '',
                conditions: values.upConditions || '0',
            };

            this.props.actions.updateAdminUserInfo(tools.clearNull(params)).then((res) => {
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
        this.props.actions.deleteAdminUserInfo({adminUserId: id}).then((res) => {
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

    // 添加新用户模态框出现
    onAddNewShow() {
      const me = this;
      const { form } = me.props;
      form.resetFields([
          'addnewUsername',
          'addnewPassword',
          'addnewSex',
          'addnewAge',
          'addnewPhone',
          'addnewEmail',
          'addnewDescription',
      ]);
        this.setState({
            addnewModalShow: true,
            orgCodeValue: null,
        });
    }

    // 添加新用户确定
    onAddNewOk() {
        const me = this;
        const { form } = me.props;
        form.validateFields([
            'addnewUsername',
            'addnewPassword',
            'addnewSex',
            'addnewAge',
            'addnewPhone',
            'addnewEmail',
            'addnewDescription',
        ], (err, values) => {
            if (err) { return false; }
            console.log('检查通过：', values);
            me.setState({
                addnewLoading: true,
            });
            const params = {
                userName: values.addnewUsername,
                password: values.addnewPassword,
               sex: values.addnewSex,
               age: values.addnewAge || '',
               phone: values.addnewPhone || '',
                email: values.addnewEmail || '',
               orgCode: this.state.orgCodeValue ? this.state.orgCodeValue.id : '',
               description: values.addnewDescription || '',
               adminIp: '',
               conditions: '0',
            };

            me.props.actions.addAdminUserInfo(tools.clearNull(params)).then((res) => {
                console.log('添加用户返回数据：', res);
                if (res.returnCode === '0') {
                    this.onGetData(this.state.pageNum, this.state.pageSize);
                    this.onAddNewClose();
                } else {
                    message.error(res.returnMessaage || '添加失败，请重试');
                }
                me.setState({
                    addnewLoading: false,
                });
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

    // 给某个用户分配角色
    onRoleClick(id) {

    }

    // 表单页码改变
    onTablePageChange(page, pageSize) {
      console.log('页码改变：', page, pageSize);
      this.onGetData(page, pageSize);
    }

    // 工具函数 - 根据组织结构ID查组织结构名称
    getNameForId(id) {
        const p = this.props.allOrganizer.find((item) => {
            return `${item.id}` === `${id}`;
        });
        if (p) {
            return p.orgName;
        }
        return '';
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
                title: '部门',
                dataIndex: 'orgCode',
                key: 'orgCode',
                render: (text, record) => this.getNameForId(text)
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
                    Power.test(power.system.manager.update.code) && controls.push(
                        <span key="1" className="control-btn blue" onClick={() => this.onUpdateClick(record)}>
                            <Tooltip placement="top" title="修改">
                                <Icon type="edit" />
                            </Tooltip>
                        </span>
                    );
                    Power.test(power.system.manager.power.code) && controls.push(
                        <span key="2" className="control-btn blue" onClick={() => this.onRoleTreeShow(record)} >
                            <Tooltip placement="top" title="分配角色">
                                <Icon type="tool" />
                            </Tooltip>
                        </span>
                    );
                    Power.test(power.system.manager.del.code) && text.id !== 1 && controls.push(
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
                            result.push(<Divider key={`line${index}`} type="vertical" />,);
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

    // 打开RoleTree
    onRoleTreeShow(data) {
        this.setState({
            nowData: data,
            roleTreeShow: true,
        });
    }
    // 关闭RoleTree
    onRoleTreeClose() {
        this.setState({
            roleTreeShow: false,
        });
    }

    // RoleTree确定
    onRoleTreeOk(arr) {
        console.log('选中了什么：', arr, this.state.nowData);
        const params = {
            userId: this.state.nowData.id,
            roles: arr.map((item) => item.id).join(','),
        }
        this.props.actions.assigningRole(params).then((res) => {
            if (res.returnCode === '0') {
                message.success('角色分配成功');
            } else {
                message.error(res.returnMessaage || '角色分配失败，请重试');
            }
        });
        this.onRoleTreeClose();
    }

    // 打开OrTree
    onOrTreeShow() {
        this.setState({
            orTreeShow: true,
        });
    }

    // 关闭OrTree
    onOrTreeClose() {
        this.setState({
            orTreeShow: false,
        });
    }

    // OrTree确定
    onOrTreeOk(obj) {
        console.log('OBJ选的什么：', obj);
        this.setState({
            orgCodeValue: obj,
            orTreeShow: false,
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

    return (
      <div>
        <UrlBread location={this.props.location}/>
        <div className="system-search">
            { Power.test(power.system.manager.add.code) && <ul className="search-func"><li><Button type="primary" onClick={() => this.onAddNewShow()}><Icon type="plus-circle-o" />添加用户</Button></li></ul>}
            <Divider type="vertical" />
            { Power.test(power.system.manager.query.code) &&
                <ul className="search-ul">
                    <li>
                        <Input
                            placeholder="用户名"
                            onChange={(e) => this.searchUserNameChange(e)}
                            value={this.state.searchUserName}
                            onPressEnter={() => this.onSearch()}
                        />
                    </li>
                    <li>
                        <Select
                            style={{ width: '150px' }}
                            placeholder="用户状态"
                            allowClear
                            onChange={(e) => this.searchConditions(e)}
                        >
                            <Option value="0">启用</Option>
                            <Option value="-1">禁用</Option>
                        </Select>
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
          {/* 添加用户模态框 */}
          <Modal
              title='新增用户'
              visible={this.state.addnewModalShow}
              onOk={() => this.onAddNewOk()}
              onCancel={() => this.onAddNewClose()}
              confirmLoading={this.state.addnewLoading}
          >
              <Form>
                  <FormItem
                      label="用户名"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewUsername', {
                          initialValue: undefined,
                          rules: [
                              {required: true, message: '请输入用户名'},
                              { validator: (rule, value, callback) => {
                                  const v = value;
                                  if (v) {
                                      if (v.length > 12) {
                                          callback('最多输入12位字符');
                                      } else if (!tools.checkStr2(v)){
                                          callback('只能输入字母、数字及下划线');
                                      }
                                  }
                                  callback();
                              }}
                          ],
                      })(
                          <Input placeholder="用户名" />
                      )}
                  </FormItem>
                  <FormItem
                      label="密码"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewPassword', {
                          initialValue: undefined,
                          rules: [
                              {required: true, message: '请输入密码'},
                              { validator: (rule, value, callback) => {
                                  const v = value;
                                  if (v) {
                                      if (v.length > 12) {
                                          callback('最多输入12位字符');
                                      } else if (v.length < 6) {
                                          callback('密码至少6位字符');
                                      }else if (!tools.checkStr2(v)){
                                          callback('只能输入字母、数字及下划线');
                                      }
                                  }
                                  callback();
                              }}
                          ],
                      })(
                          <Input placeholder="密码" type="password"/>
                      )}
                  </FormItem>
                  <FormItem
                      label="性别"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewSex', {
                          rules: [],
                          initialValue: 1,
                      })(
                          <RadioGroup>
                              <Radio value={1}>男</Radio>
                              <Radio value={0}>女</Radio>
                          </RadioGroup>
                      )}
                  </FormItem>
                  <FormItem
                      label="年龄"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewAge', {
                          rules: [],
                          initialValue: undefined,
                      })(
                          <InputNumber min={1} max={99} />
                      )}
                  </FormItem>
                  <FormItem
                      label="电话"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewPhone', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (!tools.checkPhone(v)) {
                                      callback('请输入有效的手机号码');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <Input placeholder="请输入手机号码" />
                      )}
                  </FormItem>
                  <FormItem
                      label="邮箱"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewEmail', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (!tools.checkEmail(v)) {
                                      callback('请输入有效的邮箱地址');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <Input placeholder="请输入邮箱地址" />
                      )}
                  </FormItem>
                  <FormItem
                      label="部门"
                      {...formItemLayout}
                  >
                      <Input placeholder="请选择部门" readOnly value={this.state.orgCodeValue && this.state.orgCodeValue.title} onClick={() => this.onOrTreeShow()}/>
                  </FormItem>
                  <FormItem
                      label="描述"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewDescription', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (v.length > 100) {
                                      callback('最多输入100个字符');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <TextArea rows={4} autosize={{minRows: 2, maxRows: 6}} />
                      )}
                  </FormItem>
              </Form>
          </Modal>
          {/* 修改用户模态框 */}
          <Modal
              title='修改用户'
              visible={this.state.upModalShow}
              onOk={() => this.onUpOk()}
              onCancel={() => this.onUpClose()}
              confirmLoading={this.state.upLoading}
          >
              <Form>
                  <FormItem
                      label="用户名"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upUsername', {
                          initialValue: undefined,
                          rules: [
                              {required: true, message: '请输入用户名'},
                              { validator: (rule, value, callback) => {
                                  const v = value;
                                  if (v) {
                                      if (v.length > 12) {
                                          callback('最多输入12位字符');
                                      } else if (!tools.checkStr2(v)){
                                          callback('只能输入字母、数字及下划线');
                                      }
                                  }
                                  callback();
                              }}
                          ],
                      })(
                          <Input placeholder="用户名" />
                      )}
                  </FormItem>
                  <FormItem
                      label="密码"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upPassword', {
                          initialValue: '______',
                          rules: [
                              {required: true, message: '请输入密码'},
                              { validator: (rule, value, callback) => {
                                  const v = value;
                                  if (v) {
                                      if (v.length > 12) {
                                          callback('最多输入12位字符');
                                      } else if (v.length < 6) {
                                          callback('密码至少6位字符');
                                      }else if (!tools.checkStr2(v)){
                                          callback('只能输入字母、数字及下划线');
                                      }
                                  }
                                  callback();
                              }}
                          ],
                      })(
                          <Input placeholder="密码" type="password"/>
                      )}
                  </FormItem>
                  <FormItem
                      label="性别"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upSex', {
                          rules: [],
                          initialValue: 1,
                      })(
                          <RadioGroup>
                              <Radio value={1}>男</Radio>
                              <Radio value={0}>女</Radio>
                          </RadioGroup>
                      )}
                  </FormItem>
                  <FormItem
                      label="年龄"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upAge', {
                          rules: [],
                          initialValue: undefined,
                      })(
                          <InputNumber min={1} max={99} />
                      )}
                  </FormItem>
                  <FormItem
                      label="电话"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upPhone', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (!tools.checkPhone(v)) {
                                      callback('请输入有效的手机号码');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <Input placeholder="请输入手机号码" />
                      )}
                  </FormItem>
                  <FormItem
                      label="邮箱"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upEmail', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (!tools.checkEmail(v)) {
                                      callback('请输入有效的邮箱地址');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <Input placeholder="请输入邮箱地址" />
                      )}
                  </FormItem>
                  <FormItem
                      label="部门"
                      {...formItemLayout}
                  >
                      <Input placeholder="请选择部门" value={this.state.orgCodeValue && this.state.orgCodeValue.title} onClick={() => this.onOrTreeShow()} />
                  </FormItem>
                  <FormItem
                      label="描述"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upDescription', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (v.length > 100) {
                                      callback('最多输入100个字符');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <TextArea rows={4} autosize={{minRows: 2, maxRows: 6}} />
                      )}
                  </FormItem>
                  <FormItem
                      label="状态"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upConditions', {
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
                      label="部门"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.getNameForId(this.state.nowData.orgCode) : ''}
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
          {/* 修改用户角色模态框 */}
          <RoleTree
              userInfo={this.state.nowData}        // 当前操作用户信息
              roleData={this.props.allRoles}        // 所有的角色数据
              modalShow={this.state.roleTreeShow}  // 是否显示
              actions={this.props.actions}
              onOk={(arr) => this.onRoleTreeOk(arr)}
              onClose={() => this.onRoleTreeClose()}
          />
          {/* 新增、修改 选组织部门 */}
          <OrTree
              data={this.props.allOrganizer} // 所需菜单原始数据
              defaultKey={this.state.orgCodeValue ? [`${this.state.orgCodeValue.id}`] : []}
              modalShow={this.state.orTreeShow} // Modal是否显示
              onOk={(obj) => this.onOrTreeOk(obj)} // 确定时，获得选中的项信息
              onClose={(obj) => this.onOrTreeClose(obj)} // 关闭
          />
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
  allOrganizer: P.any,
};

// ==================
// Export
// ==================
const WrappedHorizontalManager = Form.create()(Manager);
export default connect(
  (state) => ({
    allRoles: state.sys.allRoles,
    allOrganizer: state.sys.allOrganizer,
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ findAdminUserByKeys, addAdminUserInfo, deleteAdminUserInfo, updateAdminUserInfo, findAllRole, findAllRoleByUserId, assigningRole, findAllOrganizer }, dispatch),
  })
)(WrappedHorizontalManager);
