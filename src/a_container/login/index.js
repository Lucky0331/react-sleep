/* 登录页 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Form, Input, Button, Icon, Checkbox, message } from "antd";
import Vcode from "react-vcode";
import all from "../../util/all";
import "./index.scss";
// ==================
// 所需的所有组件
// ==================

import LogoImg from "../../assets/logo.png";
// import BackImg from '../../assets/banner.jpg'

// ==================
// 本页面所需action
// ==================

import { onLogin } from "../../a_action/app-action";
import {
  findAllRoleByUserId,
  findAllMenuByRoleId
} from "../../a_action/sys-action";
// ==================
// Definition
// ==================
const FormItem = Form.Item;

class LoginContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      adminBtn: [],
      loginLoading: false, // 是否处于正在登陆状态
      rememberPassword: false, // 是否记住密码
      codeValue: "00000", // 当前验证码的值
      show: false // 加载完毕时触发动画
    };
  }

  componentWillMount() {
    // this.props.history.push('/home');
  }

  componentDidMount() {
    // 进入登陆页时，判断之前是否保存了用户名和密码
    const form = this.props.form;
    let userLoginInfo = localStorage.getItem("userLoginInfo");
    if (userLoginInfo) {
      userLoginInfo = JSON.parse(userLoginInfo);
      this.setState({
        rememberPassword: true
      });
      form.setFieldsValue({
        username: userLoginInfo.username,
        password: all.uncompile(userLoginInfo.password)
      });
    }
    if (!userLoginInfo) {
      document.getElementById("username").focus();
    } else {
      document.getElementById("vcode").focus();
    }
    this.setState({
      show: true
    });
    
  }

  async doSubmit(userName, password, callback, me, values) {
    let userInfo = null;
    let roleInfo = [];
    let menusInfo = [];
    let btnInfo = [];
    try {
      const userRes = await this.props.actions.onLogin({ userName, password });
      console.log("1.通过帐号密码得到userID：", userRes);
      if (userRes.status === "0") {
        userInfo = userRes.data.adminUser;
        menusInfo = userRes.data.adminRole;
        btnInfo = userRes.data.adminRole.btnDtoList;
      } else {
        message.error(userRes.message || "登录失败，请重试");
      }
    } catch (err) {
      console.log("登陆报错：", err);
    }

    console.log("最终返回：", { userInfo, roleInfo, menusInfo, btnInfo });
    console.log("btn权限是:", btnInfo);
    callback({ userInfo, roleInfo, menusInfo, btnInfo }, me, values);
  }

  // 处理原始数据，将原始数据处理为层级关系
  makeSourceData(menusInfo) {
    let m = _.cloneDeep(menusInfo);
    // 按照sort排序
    m.sort((a, b) => {
      return a.sorts - b.sorts;
    });
    const sourceData = [];
    m.forEach(item => {
      if (item.btnDtoList) {
        const temp = this.Menu(m, item);
        sourceData.push(temp);
      }
    });

    const treeDom = this.makeTreeDom(sourceData, "");
    this.setState({
      sourceData,
      treeDom
    });
  }

  // 递归将扁平数据转换为层级数据
  Menu(menusInfo, one) {
    const child = _.cloneDeep(one);
    child.children = [];
    let sonChild = null;
    menusInfo.forEach(item => {
      if (item.btnDtoList) {
        sonChild = this.Menu(menusInfo, item);
        child.children.push(sonChild);
      }
    });
    if (child.children.length <= 0) {
      child.children = null;
    }
    return child;
  }

  // 用户提交登陆
  onSubmit() {
    const me = this;
    const form = this.props.form;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.setState({
        loginLoading: true
      });
      this.doSubmit(
        values.username,
        values.password,
        this.onSubmitResult,
        me,
        values
      );
    });
  }

  onSubmitResult(loginInfo, me, values) {
    if (!loginInfo || !loginInfo.userInfo) {
      me.setState({
        loginLoading: false
      });
    } else {
      sessionStorage.setItem("adminUser", JSON.stringify(loginInfo.userInfo)); // 保存用户基础信息
      sessionStorage.setItem("adminRole", JSON.stringify(loginInfo.roleInfo)); // 保存用户角色信息
      sessionStorage.setItem("adminMenu", JSON.stringify(loginInfo.menusInfo)); // 保存用户菜单信息
      sessionStorage.setItem("adminBtn", JSON.stringify(loginInfo.btnInfo)); // 保存用户按钮信息

      // 如果选择了记住密码，用户名和密码加密保存到localStorage,否则清除
      if (me.state.rememberPassword) {
        localStorage.setItem(
          "userLoginInfo",
          JSON.stringify({
            username: values.username,
            password: all.compile(values.password)
          })
        ); // 保存用户名和密码
      } else {
        localStorage.removeItem("userLoginInfo");
      }
      // 登陆成功后，还需要获取用户的所有角色，每个角色所拥有的菜单，全部保存于sessionStorage
      message.success("登录成功");
      me.props.history.push("/home");
    }
  }

  // 记住密码按钮点击
  onRemember(e) {
    this.setState({
      rememberPassword: e.target.checked
    });
  }

  // 验证码改变时触发
  onVcodeChange(code) {
    const form = this.props.form;
    form.setFieldsValue({
      // vcode: code,  // 测试环境开发模式自动赋值验证码
      vcode: "" // 正式环境，这里应该赋值''
    });
    this.setState({
      codeValue: code
    });
  }

  render() {
    const me = this;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="page-login">
        {/*<div className="backImg"><img src={BackImg} alt="back"/></div>*/}
        <div
          className={
            this.state.show
              ? "login-box all_trans500 show"
              : "login-box all_trans500"
          }
        >
          <Form className="login">
            <div className="title">
              <img src={LogoImg} alt="logo" />
            </div>
            <div style={{ display: "block", margin: "auto" ,width:'350px'}}>
              <FormItem>
                {getFieldDecorator("username", {
                  rules: [
                    { max: 18, message: "最大长度为18位字符" },
                    {
                      required: true,
                      whitespace: true,
                      message: "请输入用户名"
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon
                        type="user"
                        style={{ fontSize: 14, fontWeight: "800",color:'#a1a1a1' }}
                      />
                    }
                    size="large"
                    placeholder="请输入用户名"
                    id="form_username"
                    onPressEnter={() => this.onSubmit()}
                    style={{
                      display: "block",
                      margin: "auto",
                      marginTop: "20px",
                    }}
                  />
                )}
              </FormItem>
              <FormItem style={{marginBottom:"24px"}}>
                {getFieldDecorator("password", {
                  rules: [
                    { required: true, message: "请输入密码" },
                    { max: 18, message: "最大长度18个字符" }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon
                        type="lock"
                        style={{ fontSize: 14, fontWeight: "800", color:'#a1a1a1'}}
                      />
                    }
                    size="large"
                    type="password"
                    placeholder="请输入密码"
                    id="form_password"
                    onPressEnter={() => this.onSubmit()}
                    style={{
                      display: "block",
                      margin: "auto",
                      marginTop: "10px",
                    }}
                  />
                )}
              </FormItem>
              <FormItem
                style={{ display: "block", margin: "auto",}}
              >
                {getFieldDecorator("vcode", {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        const v = all.trim(value);
                        if (v) {
                          if (v.length > 4) {
                            callback("验证码为4位字符");
                          } else if (
                            v.toLowerCase() !== me.state.codeValue.toLowerCase()
                          ) {
                            callback("验证码错误");
                          } else {
                            callback();
                          }
                        } else {
                          callback("请输入验证码");
                        }
                      }
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon
                        type="safety"
                        style={{ fontSize: 14, fontWeight: "800", color:'#a1a1a1'}}
                      />
                    }
                    style={{ width: "55%" ,fontSize:'13px'}}
                    placeholder="请输入验证码"
                    id="form_vcode"
                    size="large"
                    onPressEnter={() => this.onSubmit()}
                  />
                )}
                <Vcode
                  height={38}
                  lineCount={50}
                  onChange={code => this.onVcodeChange(code)}
                  className="vcode"
                  options={{
                    lines: 16,
                    codes:[1,2,3,4,5,6,7,8,9,0]
                  }}
                  style={{
                    backgroundColor:'#353535',
                    color:'#a1a1a1',
                    borderColor: '#2a2a2a',
                    boxShadow: '0px 0px 1px 1px #212121 inset',
                  }}
                />
              </FormItem>
              <div
                style={{
                  lineHeight: "28px",
                  margin: "auto",
                  marginTop: "40px",
                  paddingBottom: "65px",
                  color:'#a1a1a1'
                }}
              >
                <Checkbox
                  checked={this.state.rememberPassword}
                  onChange={e => this.onRemember(e)}
                >
                  记住密码
                </Checkbox>
                <Button
                  className="submit-btn"
                  type="primary"
                  loading={this.state.loginLoading}
                  onClick={() => this.onSubmit()}
                >
                  {this.state.loginLoading ? "请稍后" : "登录"}
                </Button>
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
  actions: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalLoginForm = Form.create()(LoginContainer);

export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators(
      { onLogin, findAllRoleByUserId, findAllMenuByRoleId },
      dispatch
    )
  })
)(WrappedHorizontalLoginForm);
