/* Manager 系统管理/管理员信息管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import { Form, Button, Icon, Input, Table, message, Popconfirm, Modal, Radio, InputNumber  } from 'antd';
import './index.scss';
import tools from '../../../../util/tools';
// ==================
// 所需的所有组件
// ==================

import UrlBread from '../../../../a_component/urlBread';
import RoleTree from '../../../../a_component/roleTree';

// ==================
// 本页面所需action
// ==================

import { findAll, addAdminUserInfo, deleteAdminUserInfo, updateAdminUserInfo, findAllRole, findAllRoleByUserId } from '../../../../a_action/sys-action';

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
class Manager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      searchUserName: '',
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情
      queryModalShow: false, // 查看详情模态框是否显示
      upModalShow: false, // 修改用户模态框是否显示
      upLoading: false, // 是否正在修改用户中
      roleTreeShow: false, // 角色树是否显示
    };
  }

  componentDidMount() {
    this.onGetData();
  }

  // 查询当前页面所需列表数据
    onGetData() {
        this.props.actions.findAll().then((res) => {
            if(res.returnCode === "0") {
                this.setState({
                    data: res.messsageBody,
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

   // 修改某一条数据 模态框出现
    onUpdateClick(record) {
      const me = this;
      const { form } = me.props;
      console.log('Record:', record);
        form.setFieldsValue({
            upUsername: record.userName,
            upPassword: record.password,
            upSex: record.sex || 1,
            upAge: record.age || undefined,
            upPhone: record.phone || undefined,
            upEmail: record.email || undefined,
            upOrgCode: record.orgCode || undefined,
            upDescription: record.description || undefined,
            upConditions: record.conditions || "0",
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
            'upUsername',
            'upPassword',
            'upSex',
            'upAge',
            'upPhone',
            'upEmail',
            'upOrgCode',
            'upDescription',
            'upConditions',
        ], (err, values) => {
            if(err) { return; }

            me.setState({
                upLoading: true,
            });
            const params = {
                userName: values.upUsername,
                password: values.upPassword,
                sex: values.upSex,
                age: values.upAge || '',
                phone: values.upPhone || '',
                email: values.upEmail || '',
                orgCode: values.upOrgCode || '',
                description: values.upDescription || '',
                adminIp: '',
                conditions: values.upConditions || '0',
            };

            this.props.actions.updateAdminUserInfo(tools.clearNull(params)).then((res) => {
                if (res.returnCode === "0") {
                    message.success("修改成功");
                    this.onGetData();
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
                this.onGetData();
            } else {
                message.error(res.returnMessaage || '删除失败，请重试');
            }
        });
    }

    // 搜索
    onSearch() {

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
          'addnewOrgCode',
          'addnewDescription',
      ]);
        this.setState({
            addnewModalShow: true,
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
            'addnewOrgCode',
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
               orgCode: values.addnewOrgCode || '',
               description: values.addnewDescription || '',
               adminIp: '',
               conditions: '0',
            };

            me.props.actions.addAdminUserInfo(tools.clearNull(params)).then((res) => {
                console.log('添加用户返回数据：', res);
                me.setState({
                    addnewLoading: false,
                });
                this.onGetData();
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

    // 给某个用户分配角色
    onRoleClick(id) {

    }

    // 构建字段
    makeColumns(){
        const columns = [
            {
                title: 'ID',
                dataIndex: 'adminUserId',
                key: 'adminUserId',
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
                    return text === 1 ? '男' : '女';
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
                    let controls = [
                        <span key="0" className="control-query" onClick={() => this.onQueryClick(record)}>查看</span>,
                        <span key="line1" className="ant-divider" />,
                        <span key="1" className="control-update" onClick={() => this.onUpdateClick(record)}>修改</span>,
                        <span key="line2" className="ant-divider" />,
                        <span key="2" className="control-update" onClick={() => this.onRoleTreeShow(record)} >分配角色</span>,
                        <span key="line3" className="ant-divider" />,
                        <Popconfirm key="3" title="确定删除吗?" onConfirm={() => this.onDeleteClick(record.adminUserId)} okText="确定" cancelText="取消">
                            <span className="control-delete">删除</span>
                        </Popconfirm>
                    ];

                    if (text.adminUserId === 1) {
                        controls.splice(-2, 2);
                    }
                    return controls;
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
                adminIp: item.adminIp,
                adminUserId: item.adminUserId,
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
                control: item.adminUserId,
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
          <ul className="search-func">
            <li><Button type="primary" onClick={() => this.onAddNewShow()}><Icon type="plus-circle-o" />添加用户</Button></li>
          </ul>
          <span className="ant-divider" />
          <ul className="search-ul">
            <li><Input placeholder="请输入用户名" onChange={(e) => this.searchUserNameChange(e)} value={this.state.searchUserName}/></li>
            <li><Button icon="search" type="primary" onClick={() => this.onSearch()}>搜索</Button></li>
          </ul>
        </div>
        <div className="system-table">
          <Table
              columns={this.makeColumns()}
              dataSource={this.makeData(this.state.data)}
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
                      label="组织编号"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addnewOrgCode', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (v.length > 12) {
                                      callback('最多输入12个字符');
                                  } else if (!tools.checkStr3(v)) {
                                      callback('只能输入数字');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <Input placeholder="请输入组织编号" />
                      )}
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
                      label="组织编号"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upOrgCode', {
                          initialValue: undefined,
                          rules: [{ validator: (rule, value, callback) => {
                              const v = value;
                              if (v) {
                                  if (v.length > 12) {
                                      callback('最多输入12个字符');
                                  } else if (!tools.checkStr3(v)) {
                                      callback('只能输入数字');
                                  }
                              }
                              callback();
                          }}],
                      })(
                          <Input placeholder="请输入组织编号" />
                      )}
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
                      label="ID"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.adminUserId : ''}
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
                  <FormItem
                      label="创建时间"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.createTime : ''}
                  </FormItem>
                  <FormItem
                      label="创建人"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.creator : ''}
                  </FormItem>
                  <FormItem
                      label="最后修改"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.updateTime : ''}
                  </FormItem>
                  <FormItem
                      label="修改人"
                      {...formItemLayout}
                  >
                      {!!this.state.nowData ? this.state.nowData.updater : ''}
                  </FormItem>
              </Form>
          </Modal>
          {/* 修改用户模态框 */}
          <RoleTree
              userInfo={this.state.nowData}        // 当前操作用户信息
              roleData={this.props.allRoles}        // 所有的角色数据
              modalShow={this.state.roleTreeShow}  // 是否显示
              actions={this.props.actions}
              onClose={() => this.onRoleTreeClose()}
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
    actions: bindActionCreators({ findAll, addAdminUserInfo, deleteAdminUserInfo, updateAdminUserInfo, findAllRole, findAllRoleByUserId }, dispatch),
  })
)(WrappedHorizontalManager);
