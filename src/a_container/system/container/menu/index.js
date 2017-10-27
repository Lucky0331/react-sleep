/* Menu 系统管理/菜单管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tree, Button, Popconfirm, Form, Input, Radio, InputNumber, message } from 'antd';
import P from 'prop-types';
import _ from 'lodash';
import './index.scss';
import tools from '../../../../util/tools';
// ==================
// 所需的所有组件
// ==================

import UrlBread from '../../../../a_component/urlBread';
import MenuTree from '../../../../a_component/menuTree';

// ==================
// 本页面所需action
// ==================

import { findAllMenu, addMenuInfo, deleteMenuInfo, updateMenuInfo } from '../../../../a_action/sys-action';

// ==================
// Definition
// ==================

const TreeNode = Tree.TreeNode;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nowData: null, // 当前选中的菜单项
      sourceData: [], // 经过处理的原始数据
      addLoading: false, // 是否正在增加菜单中
      controlType: -1, // 显示添加子菜单还是显示修改当前菜单信息 0 修改信息， 1添加子菜单
      fatherTreeShow: false, // 选择父级tree是否出现
      treeFatherValue: null, // 树选择的父级信息
    };
  }

  componentDidMount() {
    if (!this.props.allMenu || this.props.allMenu.length <= 0) {
        this.getAllMenus();
    } else {
        this.makeSourceData(this.props.allMenu);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allMenu !== this.props.allMenu) {
      // allMenu变化后，重新处理原始数据
        this.makeSourceData(nextProps.allMenu);
    }
  }
  // 获取所有菜单
  getAllMenus() {
    this.props.actions.findAllMenu();
  }

  // 确定删除当前菜单
   onDeleteOk(){
      this.props.actions.deleteMenuInfo({menuId : this.state.nowData.node.props.id}).then((res) => {
        if (res.returnCode === "0") {
          message.success('删除成功');
          this.getAllMenus();
          this.setState({
              nowData: null,
          });
        } else {
          message.error('删除失败');
        }
      });
   }

   // tree选择某一项
    onTreeSelect(keys, e) {
      const me = this;
      const { form } = me.props;
      const now = e.node.props.data;
      if (e.selected) { // 选中时需要重新设置修改Form中的信息
          form.setFieldsValue({
              upMenuName: now.menuName,
              upMenuUrl: now.menuUrl,
              upConditions: now.conditions,
              upSorts: now.sorts,
              upMenuDesc: now.menuDesc,
              upParentId: (now.parentId || now.parentId === 0) ? now.parentId : undefined,
          });
      } else {
          this.setState({
              controlType: -1,
          });
      }
      this.setState({
          nowData: e.selected ? e : null,
          treeFatherValue: (() => {
              const temp = this.props.allMenu.find((item) => `${item.id}` === `${now.parentId}`);
              if (temp) {
                  return { key: `${temp.id}`, id: temp.id, title: temp.menuName };
              } else {
                  return undefined;
              }
          })()
      });
    }

    // 处理原始数据，将原始数据处理为层级关系
    makeSourceData(data) {
      const d = _.cloneDeep(data);
      const sourceData = [];
       d.forEach((item) => {
           if (!item.parentId && item.parentId !== 0) {
               const temp = this.dataToJson(d, item);
               sourceData.push(temp);
           }
      });
      console.log('jsonMenu是什么：', sourceData);
      this.setState({
          sourceData,
      });
    }

    // 递归将扁平数据转换为层级数据
    dataToJson(data, one) {
     const child = _.cloneDeep(one);
     child.children = [];
     let sonChild = null;
      data.forEach((item) => {
        if (item.parentId === one.id) {
           sonChild = this.dataToJson(data, item);
           child.children.push(sonChild);
        }
      });
      if (child.children.length <=0) {
        child.children = null;
      }
      return child;
    }

    // 构建树结构
    makeTreeDom(data, key = '') {
      return data.map((item, index) => {
        const k = key ? `${key}-${item.id}` : `${item.id}`;
        if (item.children) {
            return (
                <TreeNode title={item.menuName} key={k} id={item.id} p={item.parentId} data={item}>
                    { this.makeTreeDom(item.children, k) }
                </TreeNode>
            );
        } else {
          return <TreeNode title={item.menuName} key={k} id={item.id} p={item.parentId} data={item}/>;
        }
      });
    }

    // 添加子菜单提交
    onAddSubmit() {
      const me = this;
      const { form } = me.props;
      form.validateFields([
          'addMenuName',
          'addMenuUrl',
          'addConditions',
          'addSorts',
          'addMenuDesc',
      ], (err, values) => {
        if (err) { return; }
        const params = {
            menuName: values.addMenuName,
            menuUrl: values.addMenuUrl,
            conditions: values.addConditions,
            sorts: values.addSorts,
            menuDesc: values.addMenuDesc,
            parentId: (me.state.nowData.node.props.id || me.state.nowData.node.props.id === 0 ) ? `${me.state.nowData.node.props.id}` : null,
        };
        me.props.actions.addMenuInfo(tools.clearNull(params)).then((res) => {
          if(res.returnCode === "0") {
            message.success('添加成功');
            form.resetFields([
                'addMenuName',
                'addMenuUrl',
                'addConditions',
                'addSorts',
                'addMenuDesc',
            ]);
            this.getAllMenus(); // 重新获取菜单
              this.setState({
                  nowData: null,
              });
          } else {
            message.error('添加失败');
          }
        });
      });
    }

    // 修改当前菜单
    onUpSubmit() {
        const me = this;
        const { form } = me.props;
        form.validateFields([
            'upMenuName',
            'upMenuUrl',
            'upConditions',
            'upSorts',
            'upMenuDesc',
            'upParentId',
        ], (err, values) => {
          if (err) { return; }
          const params = {
              menuName: values.upMenuName,
              menuUrl: values.upMenuUrl,
              conditions: values.upConditions,
              sorts: values.upSorts,
              menuDesc: values.upMenuDesc,
              parentId: (values.upParentId || values.upParentId === 0) ? values.upParentId : null,
          };
          this.props.actions.updateMenuInfo(params).then((res) => {
              if(res.returnCode === "0") {
                message.success('修改成功');
                this.getAllMenus(); // 重新获取菜单
                  this.setState({
                      nowData: null,
                  });
              } else {
                  message.error('修改失败');
              }
          });
        });
    }

    // 点击操作按钮
    onControlClick(type) {
        const me = this;
        const { form } = me.props;
        const now = this.state.nowData.node.props.data;
        console.log('nowData是什么：', this.state.nowData);
     if (type === 0) { // 修改信息，将当前信息赋予表单

       form.setFieldsValue({
           upMenuName: now.menuName,
           upMenuUrl: now.menuUrl,
           upConditions: now.conditions,
           upSorts: now.sorts,
           upMenuDesc: now.menuDesc,
           upParentId: (now.parentId || now.parentId === 0) ? now.parentId : undefined,
       });
     }
      this.setState({
          controlType: type,
      });
    }

    // 选择父级tree出现
    onFatherShow() {
       this.setState({
           fatherTreeShow: true,
       });
    }

    // tree选择确定
    onTreeOk(obj) {
     this.setState({
         treeFatherValue: obj,
         fatherTreeShow: false,
     });
    }
    // tree选择取消
    onTreeClose() {
       this.setState({
           fatherTreeShow: false,
       });
    }

  render() {
     const me = this;
     const { form } = me.props;
     const { getFieldDecorator } = form;
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 5 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 19 },
        },
    };

    return (
      <div className="page-menu">
        <UrlBread location={this.props.location}/>
        <div className="menubox all_clear">
          <div className="l">
            <div className="title">所有菜单</div>
            <div>
              <Tree
                  defaultExpandedKeys={['yimao']}
                  onSelect={(selectedKeys, e) => this.onTreeSelect(selectedKeys, e)}
              >
                <TreeNode title="翼猫科技智能睡眠系统" key="yimao" data={{}}>
                  { this.makeTreeDom(this.state.sourceData) }
                </TreeNode>
              </Tree>
            </div>
          </div>
          <div className="r">
            <div className="title">{this.state.nowData ? `菜单操作：${this.state.nowData.node.props.title}` : '菜单操作'}</div>
            <div className="control">
                {(() => {
                    let resule;
                    if (! this.state.nowData) {
                        resule =  <span>请从左侧选择一个菜单进行操作</span>;
                    } else if (this.state.nowData.node.props.eventKey === 'yimao') {
                      resule = <Button key="0" type="primary">添加子菜单</Button>;
                    } else {
                      resule = [
                        <Button key="0" type="primary" onClick={() => this.onControlClick(0)}>修改菜单信息</Button>,
                        <Button key="1" type="primary" onClick={() => this.onControlClick(1)}>添加子菜单</Button>,
                        <Popconfirm key="2" title="确定删除该菜单吗?" onConfirm={() => this.onDeleteOk()} okText="确定" cancelText="取消">
                          <Button type="danger">删除</Button>
                        </Popconfirm>
                      ]
                    }
                    return resule;
                 })()}
            </div>
            <div className="forms">
              {/* 修改当前菜单信息 */}
              <div className={this.state.controlType === 0 ? 'forms-box forms-up show' : 'forms-box forms-up'}>
                <div>修改菜单：</div>
                <Form>
                  <FormItem
                      label="ID"
                      {...formItemLayout}
                  >
                    <span>{this.state.nowData ? this.state.nowData.node.props.id : ''}</span>
                  </FormItem>
                  <FormItem
                      label="菜单名称"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upMenuName', {
                          initialValue: undefined,
                          rules: [{max: 12, message: '最大长度为12位字符'}, {required: true, whitespace: true, message: '请输入菜单名'}],
                      })(
                          <Input placeholder="请输入菜单名" />
                      )}
                  </FormItem>
                  <FormItem
                      label="菜单URL"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upMenuUrl', {
                          initialValue: undefined,
                          rules: [{max: 50, message: '最大长度为50位字符'}, {required: true, whitespace: true, message: '请输入菜单URL'}],
                      })(
                          <Input placeholder="请输入菜单名" />
                      )}
                  </FormItem>
                  <FormItem
                      label="菜单描述"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upMenuDesc', {
                          initialValue: undefined,
                          rules: [{max: 100, message: '最大长度为100个字符'}],
                      })(
                          <TextArea placeholder="请输入菜单描述" rows={4} autosize={{ minRows: 2, maxRows: 6 }}/>
                      )}
                  </FormItem>
                  <FormItem
                      label="父级"
                      {...formItemLayout}
                  >
                      <Input placeholder="请选择父级" onClick={() => this.onFatherShow()} value={this.state.treeFatherValue ? this.state.treeFatherValue.title : ''}/>
                  </FormItem>
                  <FormItem
                      label="状态"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upConditions', {
                          initialValue: '0',
                          rules: [],
                      })(
                          <RadioGroup>
                            <Radio value={'0'}>启用</Radio>
                            <Radio value={'-1'}>禁用</Radio>
                          </RadioGroup>
                      )}
                  </FormItem>
                  <FormItem
                      label="排序"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('upSorts', {
                          initialValue: 0,
                          rules: [{required: true, message: '请输入排序号'}],
                      })(
                          <InputNumber min={0} max={99999} />
                      )}
                  </FormItem>
                  <FormItem
                  >
                    <div style={{ textAlign: 'right' }}>
                      <Button style={{width: '150px'}} onClick={() => this.onUpSubmit()}>修改</Button>
                    </div>
                  </FormItem>
                </Form>
              </div>
              {/* 添加子菜单 */}
              <div className={this.state.controlType === 1 ? 'forms-box forms-add show' : 'forms-box forms-add'}>
                <div>添加子菜单：</div>
                <Form>
                  <FormItem
                      label="父级"
                      {...formItemLayout}
                  >
                    <span>{this.state.nowData ? this.state.nowData.node.props.title : ''}</span>
                  </FormItem>
                  <FormItem
                      label="菜单名称"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addMenuName', {
                          initialValue: undefined,
                          rules: [{max: 12, message: '最大长度为12位字符'}, {required: true, whitespace: true, message: '请输入菜单名'}],
                      })(
                          <Input placeholder="请输入菜单名" />
                      )}
                  </FormItem>
                  <FormItem
                      label="菜单URL"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addMenuUrl', {
                          initialValue: undefined,
                          rules: [{max: 50, message: '最大长度为50位字符'}, {required: true, whitespace: true, message: '请输入菜单URL'}],
                      })(
                          <Input placeholder="请输入菜单名" />
                      )}
                  </FormItem>
                  <FormItem
                      label="菜单描述"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addMenuDesc', {
                          initialValue: undefined,
                          rules: [{max: 100, message: '最大长度为100个字符'}],
                      })(
                          <TextArea placeholder="请输入菜单描述" rows={4} autosize={{ minRows: 2, maxRows: 6 }}/>
                      )}
                  </FormItem>
                  <FormItem
                      label="状态"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addConditions', {
                          initialValue: '0',
                          rules: [],
                      })(
                          <RadioGroup>
                            <Radio value={'0'}>启用</Radio>
                            <Radio value={'-1'}>禁用</Radio>
                          </RadioGroup>
                      )}
                  </FormItem>
                  <FormItem
                      label="排序"
                      {...formItemLayout}
                  >
                      {getFieldDecorator('addSorts', {
                          initialValue: 0,
                          rules: [{required: true, message: '请输入排序号'}],
                      })(
                          <InputNumber min={0} max={99999} />
                      )}
                  </FormItem>
                  <FormItem
                  >
                    <div style={{ textAlign: 'right' }}>
                      <Button style={{width: '150px'}} onClick={() => this.onAddSubmit()}>提交</Button>
                    </div>
                  </FormItem>
                </Form>
              </div>
            </div>
          </div>
        </div>
          <MenuTree
              title="父级选择"
              menuData={this.props.allMenu} // 所需菜单原始数据
              defaultKey={this.state.nowData && this.state.nowData.node.props.p ? [`${this.state.nowData.node.props.p}`] : []}  // 需要配默认选中的项
              noShowId={this.state.nowData ? this.state.nowData.node.props.id : null}
              modalShow={this.state.fatherTreeShow} // Modal是否显示
              onOk={(obj) => this.onTreeOk(obj)} // 确定时，获得选中的项信息
              onClose={(obj) => this.onTreeClose(obj)} // 关闭
          />
      </div>
    );
  }
}

// ==================
// PropTypes
// ==================

Menu.propTypes = {
  location: P.any,
  history: P.any,
  actions: P.any,
  allMenu: P.any,
};

// ==================
// Export
// ==================
const WrappedHorizontalMenu = Form.create()(Menu);
export default connect(
  (state) => ({
    allMenu: state.sys.allMenu, // 所有的菜单缓存
  }), 
  (dispatch) => ({
    actions: bindActionCreators({ findAllMenu, addMenuInfo, deleteMenuInfo, updateMenuInfo }, dispatch),
  })
)(WrappedHorizontalMenu);
