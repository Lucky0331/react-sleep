/* 登录页 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Input, Button, Icon, Checkbox, message } from 'antd';
import all from '../../util/all';
import './index.scss';
// ==================
// 所需的所有组件
// ==================

import Header from '../../a_component/header';

// ==================
// 本页面所需action
// ==================

import { onLogin } from '../../a_action/app-action';

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
      this.props.actions.onLogin({username: values.username, password: values.password}).then((res) => {
        if (res) {
          message.success('登陆成功');
          // 如果选择了记住密码，用户名和密码加密保存到localStorage,否则清除
            if (this.state.rememberPassword) {
                localStorage.setItem('userLoginInfo', JSON.stringify({username: values.username, password: all.compile(values.password)}));
            } else {
              localStorage.removeItem('userLoginInfo');
            }
          this.props.history.push('/home');
        } else {
          message.error('登陆失败，请重试');
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
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="page-login" >
        <Header history={this.props.history}/>
        <div className="login-box">
          <Form>
            <div className="title">登陆</div>
            <div>
              <FormItem>
                  {getFieldDecorator('username', {
                      rules: [{max: 12, message: '最大长度为12位字符'}, {required: true, whitespace: true, message: '请输入用户名'}],
                  })(
                      <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="用户名" />
                  )}
              </FormItem>
              <FormItem>
                  {getFieldDecorator('password', {
                      rules: [{ required: true, message: '请输入密码' },{max: 18, message: '最大长度18个字符'}],
                  })(
                      <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
                  )}
              </FormItem>
              <div>
                <Checkbox checked={this.state.rememberPassword} onChange={(e) => this.onRemember(e)}>记住密码</Checkbox>
                <Button className='submit-btn' type="primary" loading={this.state.loginLoading} onClick={() => this.onSubmit()}>{this.state.loginLoading ? '请稍后' : '登陆'}</Button>
              </div>
            </div>
          </Form>
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
    actions: bindActionCreators({ onLogin }, dispatch),
  })
)(WrappedHorizontalLoginForm);
