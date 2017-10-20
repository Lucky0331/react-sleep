/* 登录页 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Icon, Checkbox, message } from 'antd';
import Vcode from 'react-vcode';
import all from '../../util/all';
import './index.scss';
// ==================
// 所需的所有组件
// ==================

import CanvasBack from '../../a_component/canvasBack';
import LogoImg from '../../assets/logo.png';

// ==================
// 本页面所需action
// ==================

import { onLogin, testPromise } from '../../a_action/app-action';

// ==================
// Definition
// ==================
const FormItem = Form.Item;

class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginLoading: false, // 是否处于正在登陆状态
      rememberPassword: false, // 是否记住密码
      codeValue: '00000', // 当前验证码的值
    };
  }

  componentWillMount() {
      // this.props.history.push('/home');
  }

  componentDidMount() {
    // 进入登陆页时，判断之前是否保存了用户名和密码
      const form = this.props.form;
      let userLoginInfo = localStorage.getItem('userLoginInfo');
      if (userLoginInfo) {
        userLoginInfo = JSON.parse(userLoginInfo);
        this.setState({
            rememberPassword: true,
        });
        form.setFieldsValue({
            username: userLoginInfo.username,
            password: all.uncompile(userLoginInfo.password),
        });
      }
      if (!userLoginInfo) {
          document.getElementById('username').focus();
        } else {
          document.getElementById('vcode').focus();
        }
  }
  // 用户提交登陆
  onSubmit() {
    const form = this.props.form;
    form.validateFields((error, values) => {
      if(error){
        return;
      }
      this.setState({
          loginLoading: true,
      });
      this.props.actions.onLogin({userName: values.username, password: values.password}).then((res) => {
        console.log('登录返回数据：', res);
        if (res.returnCode === '0') {
          // 用户的基本信息和角色信息会在session中保存一份，store中也会保存一份
          sessionStorage.setItem('adminUser', JSON.stringify(res.messsageBody.adminUser)); // 保存用户基础信息
          sessionStorage.setItem('adminRole', JSON.stringify(res.messsageBody.adminRole)); // 保存用户角色信息
          // 如果选择了记住密码，用户名和密码加密保存到localStorage,否则清除
          if (this.state.rememberPassword) {
              localStorage.setItem('userLoginInfo', JSON.stringify({username: values.username, password: all.compile(values.password)})); // 保存用户名和密码
          } else {
            localStorage.removeItem('userLoginInfo');
          }
          message.success('登录成功');
          this.props.history.push('/home');
        } else {
          console.log('res.returnMessage :', res, res.returnMessaage);
          message.error(res.returnMessaage || '登录失败111，请重试');
          this.setState({
            loginLoading: false
          });
        }
      }).catch(() => {
          this.setState({
              loginLoading: false
          });
      });
    });
  }

  // 记住密码按钮点击
   onRemember(e) {
      this.setState({
          rememberPassword: e.target.checked,
      });
   }

  // 验证码改变时触发
  onVcodeChange(code) {
    const form = this.props.form;
    form.setFieldsValue({
      vcode: '',
    });
    this.setState({
      codeValue: code,
    });
  }

  render() {
    const me = this;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="page-login">
        <div className="login-box">
          <Form>
            <div className="title"><img src={LogoImg} alt="logo"/></div>
            <div>
              <FormItem>
                  {getFieldDecorator('username', {
                      rules: [{max: 12, message: '最大长度为12位字符'}, {required: true, whitespace: true, message: '请输入用户名'}],
                  })(
                      <Input
                        prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                        placeholder="用户名"
                        id='form_username'
                        onPressEnter={() => this.onSubmit()}
                      />
                  )}
              </FormItem>
              <FormItem>
                  {getFieldDecorator('password', {
                      rules: [{ required: true, message: '请输入密码' },{max: 18, message: '最大长度18个字符'}],
                  })(
                      <Input
                        prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                        type="password"
                        placeholder="密码"
                        id='form_password'
                        onPressEnter={() => this.onSubmit()}
                      />
                  )}
              </FormItem>
              <FormItem>
              {getFieldDecorator('vcode', {
                  rules: [
                  { validator: (rule, value, callback) => {
                      const v = all.trim(value);
                      console.log('重新校验了吗：',v.toLowerCase(), me.state.codeValue.toLowerCase());
                      if (v) {
                        if (v.length > 4) {
                          callback('验证码为4位字符');
                        } else if (v.toLowerCase() !== me.state.codeValue.toLowerCase()){
                          callback('验证码错误');
                        } else {
                          callback();
                        }
                      } else {
                        callback('请输入验证码');
                      }
                    }}
                  ],
                })(
                  <Input
                    style={{ width:'200px' }}
                    placeholder="请输入验证码"
                    id='form_vcode'
                    onPressEnter={() => this.onSubmit()}
                  />
                )}
                <Vcode
                  height={32}
                  width={150}
                  onChange={(code) => this.onVcodeChange(code)}
                  className='vcode'
                  options={{
                    lines: 16,
                  }}
                />
              </FormItem>
              <div style={{ lineHeight: '28px' }}>
                <Checkbox checked={this.state.rememberPassword} onChange={(e) => this.onRemember(e)}>记住密码</Checkbox>
                <Button className='submit-btn' type="primary" loading={this.state.loginLoading} onClick={() => this.onSubmit()}>{this.state.loginLoading ? '请稍后' : '登录'}</Button>
              </div>
            </div>
          </Form>
        </div>
        <div className='login-back'>
          <CanvasBack />
        </div>
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

LoginContainer.propTypes = {
  location: P.any,
  history: P.any,
  form: P.any,
  actions: P.any,
};

// ==================
// Export
// ==================
const WrappedHorizontalLoginForm = Form.create()(LoginContainer);

export default connect(
  (state) => ({
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ onLogin, testPromise }, dispatch),
  })
)(WrappedHorizontalLoginForm);
