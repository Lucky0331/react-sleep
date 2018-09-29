/* Banner 商城管理/内容管理/banner管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import BraftEditor from "braft-editor";
import "braft-editor/dist/braft.css";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  Icon,
  Input,
  Checkbox,
  Row,
  Col,
  Radio,
  Table,
  Collapse,
  message,
  Modal,
  Upload,
  Tooltip,
  Popconfirm,
  Select,
  Divider,
  Popover,
  Tabs
} from "antd";
import "./index.scss";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  NewActivityList,
  upDateActivityList,
  deleteActivity,
  onChange,
  onOk,
  findProductByWhere,
  upDateOnlineList,
  deleteImage,
  ActivityProductL,
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productModels: [], // 所有的产品型号
      searchName: "", // 搜索 - 发布状态
      searchTitle:"" ,//搜索 - 活动名称
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      searchLiveStatus:'', //搜索 - 标签
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      fileList:[],//活动图上传
    };
    this.editor = null; // 这是新增时候的那个编辑器
  }

  componentDidMount() {
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductByWhere({ pageNum: 0, pageSize: 9999 ,onShelf:1})
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productModels: res.data.result || []
          });
        }
      });
  }
  
  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
    };
    this.props.actions.ActivityProductL(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
      console.log("啥活动列表：", res.data.result);
    });
  }

  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }
  
  // 添加新活动模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTitle",
      "addnewUrl",
      "addnewProduct",
      "addnewDeletFlag",
      "addnewSorts"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      addnewModalShow: true,
      nowData: null
    });
  }

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 添加或修改确定
  onAddNewOk() {
    // console.log('AAAAAAAA');
    const me = this;
    const { form } = me.props;

    form.validateFields(
      [
        "addnewTitle",
        "addnewProduct",
        "addnewUrl",
        "addnewDeletFlag",
        "addnewSorts"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          title: values.addnewTitle,
          acUrl: values.addnewUrl,
          deleteFlag:values.addnewDeletFlag,
          recommend: values.addnewProduct ? String(values.addnewProduct) :undefined,
          sorts:Number(values.addnewSorts),
          acImg:this.state.fileList.map(item => item.url).join(","),
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .NewActivityList(tools.clearNull(params))
            .then(res => {
              me.setState({
                addnewLoading: false
              });
              this.onGetData(1, this.state.pageSize);
              this.onAddNewClose();
            })
            .catch(() => {
              me.setState({
                addnewLoading: false
              });
            });
        } else {
          params.id = this.state.nowData.id;
          me.props.actions
            .upDateActivityList(params)
            .then(res => {
              // 修改
              me.setState({
                addnewLoading: false
              });
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onAddNewClose();
            })
            .catch(() => {
              me.setState({
                addnewLoading: false
              });
            });
        }
      }
    );
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const params = {
      activityId:record.id,
    };
    this.props.actions.activityList(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data2: res.data || [],
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewTitle: String(record.title),
      addnewUrl: record.acUrl,
      addnewProduct: record.recommendProductList ? record.recommendProductList.map((item)=>{return String(item.productId)}) : undefined,
      addnewDeletFlag:record.deleteFlag ? 1 : 0,
      addnewSorts:record.sorts,
      addnewacImg: record.acImg
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
      fileList: record.acImg
        ? record.acImg
          .split(",")
          .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // 活动图上传的列表
    });
  }

  // 发布或回撤
  onUpdateClick2(record) {
    const params = {
      id: Number(record.id)
    };
    this.props.actions
      .upDateOnlineList(params)
      .then(res => {
        if (res.status === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.deleteActivity({ id: id }).then(res => {
      if (res.status === "0") {
        message.success(res.message );
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
    });
  }

  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    console.log("是什么：", record);
    this.setState({
      nowData: record,
      queryModalShow: true
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    console.log("页码改变：", page, pageSize);
    this.onGetData(page, pageSize);
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        fixed: "left",
        width: 100
      },
      {
        title: "端",
        dataIndex: "applicationType",
        key: "applicationType"
      },
      {
        title:'操作人',
        dataIndex:'',
        key:''
      },
      {
        title:"上架时间",
        dataIndex:'onShelfTime',
        key:'onShelfTime'
      },
      {
        title:'状态'
      },
      {
        title:'创建时间'
      },
      {
        title: "使用权限",
        dataIndex:'applyUserType',
        key:'applyUserType'
      },
      {
        title:'单次活动库存限制',
      },
      {
        title:"支持商品",
        dataIndex:'productModel',
        key:'productModel',
      },
      {
        title: "保底价",
        dataIndex: "deleteFlag",
        key: "deleteFlag",
      },
      {
        title:'参与砍价用户设置',
      },
      {
        title:'砍价所需人数'
      },
      {
        title:'单次活动起止时间',
      },
      {
        title:'用户发起活动倒计时'
      },
      {
        title:'活动标题',
      },
      {
        title:'活动商品图'
      },
      {
        title:'是否支持循环开启',
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 100,
        render: (text, record) => {
          const controls = [];
          record.deleteFlag === true &&
          controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="上架">
                <Icon type="login" />
              </Tooltip>
            </span>
          );
          record.deleteFlag === false &&
          controls.push(
            <span
              key="1"
              className="control-btn red"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="下架">
                <Icon type="logout" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="2"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="预览">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          record.deleteFlag === true &&
          controls.push(
            <span
              key="3"
              className="control-btn blue"
              onClick={() => this.onUpdateClick(record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
              </Tooltip>
            </span>
          );
          record.deleteFlag === true &&
          controls.push(
            <Popconfirm
              key="4"
              title="确定删除吗?"
              onConfirm={() => this.onRemoveClick(record.id)}
              okText="确定"
              cancelText="取消"
            >
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
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }

  // 构建table所需数据
  makeData(data) {
    return data.map((item, index) => {
      return {
        id: item.id,
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        applicationType:item.applicationType,//端
        applyUserType:item.applyUserType,//使用权限
        activityType: item.activityType,//活动类型
        basePrice: item.basePrice,//市场价
        newProduct: item.newProduct,//是否推荐
        num: item.num,//数量
        offShelfTime: item.offShelfTime,  //下架时间
        onShelfTime:item.onShelfTime,//上架时间
        onShelf:item.onShelf, //是否上架
        acImg:item.acImg ? item.acImg : '', //活动图片
        productId:item.recommendProductList && item.recommendProductList[0] ? item.recommendProductList[0].productId : '',
      };
    });
  }

  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    
    console.log('这是什么：', this.state.productModels);
    
    const editorProps = {
      height: 400,
      contentFormat: 'html',    // 内容格式HTML
      pasteMode: 'text',      // 粘贴只粘贴文本
     media: {        // 多媒体配置
        allowPasteImage: false,
        image: true,
        video: true,
        audio: false,
        validateFn: (f) => {    // 文件校验
          if(['jpg','jpeg','gif','png','bmp'].includes(f.name.split('.').slice(-1)[0])){ // 用户加入了一张图片
            if(f.size > 1024 * 1024 * 50){ // 最大上传50MB的图片
              return false;
            }
          } else if (['mp4', 'wma', 'rmvb', 'avi'].includes(f.name.split('.').slice(-1)[0])){  // 用户加入了一个视频
            if(f.size > 1024 * 1024 * 500){ // 最大上传500MB的视频
              return false;
            }
          } else{
            message.info('您选择的文件不符合要求');
            return false;
          }
          return true;
        },
        uploadFn:(params) => {    // 把图片和视频上传到服务器
          const serverURL =`${Config.baseURL}/manager/product/uploadImage`; // 上传的接口
          const xhr = new XMLHttpRequest();
          const fd = new FormData();
          const successFn = (response) => {
            console.log('返回了什么：', response);
            params.success({
              url: JSON.parse(xhr.responseText).data,
              meta: {
                id: params.libraryId,
              }
            });
          }
          const progressFn = (event) => {
            params.progress(event.loaded / event.total * 100);
          };
          const errorFn = (response) => {
            params.error({
              msg: '上传失败'
            })
          };
        
          xhr.withCredentials = true;
          xhr.crossOrigin = true;
          xhr.upload.addEventListener("progress", progressFn, false);
          xhr.addEventListener("load", successFn, false);
          xhr.addEventListener("error", errorFn, false);
          xhr.addEventListener("abort", errorFn, false);
        
          fd.append('pImg', params.file);
          xhr.open('POST', serverURL, true);
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
          xhr.send(fd);
        }
      },
      initialContent: '<p>请编写内容...</p>',
      excludeControls: ['undo','redo','superscript', 'subscript','code']
    };
    
    return (
      <div>
        <div className="system-search">
          <Tabs defaultActiveKey="1" onChange={(e) => this.onSearchJump(e)}>
            <TabPane tab="使用中规则" key="1">
              <div>
                <div className="nowList">
                  <span className="fontnow">已上架模板 </span>
                </div>
                <div className="system-table">
                  {/*<Collapse bordered={false} defaultActiveKey={['1']}>*/}
                    {/*<Panel header="健康风险评估卡砍价规则 -- " key="1" className="paneltab">*/}
                      {/*<p>111</p>*/}
                    {/*</Panel>*/}
                    {/*<Panel header="This is panel header 2" key="2" className="paneltab">*/}
                      {/*<p>222</p>*/}
                    {/*</Panel>*/}
                    {/*<Panel header="This is panel header 3" key="3" className="paneltab">*/}
                      {/*<p>333</p>*/}
                    {/*</Panel>*/}
                  {/*</Collapse>*/}
                  <Table
                    columns={this.makeColumns()}
                    dataSource={this.makeData(this.state.data)}
                    scroll={{ x: 2200 }}
                    pagination={{
                      total: this.state.total,
                      current: this.state.pageNum,
                      pageSize: this.state.pageSize,
                      hideOnSinglePage:true,
                      showTotal: (total, range) => `共 ${total} 条数据`,
                      onChange: (page, pageSize) =>
                        this.onTablePageChange(page, pageSize)
                    }}
                    style={{marginBottom:'30px'}}
                  />
                </div>
                {/* 添加模态框 */}
                <Modal
                  title={this.state.addOrUp === "add" ? "添加活动" : "修改活动"}
                  visible={this.state.addnewModalShow}
                  onOk={() => this.onAddNewOk()}
                  onCancel={() => this.onAddNewClose()}
                  confirmLoading={this.state.addnewLoading}
                >
                  <Form>
                    <FormItem label="活动名称" {...formItemLayout}>
                      {getFieldDecorator("addnewTitle", {
                        initialValue: undefined,
                        rules: [
                          { required: true, message: "请输入活动名称" },
                          {
                            validator: (rule, value, callback) => {
                              const v = tools.trim(value);
                              if (v) {
                                if (v.length > 20) {
                                  callback("最多输入20个字");
                                }
                              }
                              callback();
                            }
                          }
                        ]
                      })(<Input placeholder="请输入活动名称" />)}
                    </FormItem>
                    <FormItem label="活动链接" {...formItemLayout}>
                      {getFieldDecorator("addnewUrl", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请输入链接地址" }]
                      })(<Input placeholder="请输入链接地址" />)}
                    </FormItem>
                    <FormItem label="推荐产品" {...formItemLayout}>
                      {getFieldDecorator("addnewProduct",{
                        initialValue: undefined,
                      })(
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="请选择所要推荐产品"
                      >
                      {
                        this.state.productModels.map((item) => {
                          return (
                            <Option key={String(item.id)}>{item.name}</Option>
                          );
                        })
                      }
                      </Select>
                       )}
                    </FormItem>
                    <FormItem label="是否发布" {...formItemLayout}>
                      {getFieldDecorator("addnewDeletFlag", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请选择是否发布" }]
                      })(
                      <Select placeholder="请选择是否发布">
                        <Option value={1}>否</Option>
                        <Option value={0}>是</Option>
                      </Select>
                      )}
                    </FormItem>
                    <FormItem label="排序" {...formItemLayout}>
                      {getFieldDecorator("addnewSorts", {
                        initialValue: undefined,
                        rules: [{ required: true, message: "请输入排序序号" }]
                      })(<Input placeholder="请输入排序序号" />)}
                    </FormItem>
                  </Form>
                </Modal>
              </div>
              <div className="nowWait">
                <span className="fontnow">待发布模板 </span>
              </div>
              <div className="system-table">
                <Collapse bordered={false} defaultActiveKey={['1']}>
                  <Panel header="This is panel header 1" key="1" className="paneltab">
                    <p>111</p>
                  </Panel>
                  <Panel header="This is panel header 2" key="2" className="paneltab">
                    <p>222</p>
                  </Panel>
                  <Panel header="This is panel header 3" key="3" className="paneltab">
                    <p>333</p>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
            <TabPane tab="添加新规则" key="2">
              <Form style={{marginLeft:'20px'}}>
                <FormItem label="1.添加支持的端">
                  {getFieldDecorator("formEnd", {
                    initialValue: undefined,
                  })(
                    <RadioGroup value={this.state.value} style={{marginLeft:'35px'}}>
                      <Radio value={1}>全部</Radio>
                      <Radio value={2}>健康e家商城</Radio>
                      <Radio value={3}>小猫店(小程序)</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label="2.添加使用权限(多选)">
                  {getFieldDecorator("formJurisdiction", {
                    initialValue: undefined,
                  })(
                    <Checkbox.Group style={{ width:'100%',marginLeft:'35px'}}>
                      <Row style={{marginTop:'8px'}}>
                        <Col span={2}><Checkbox value="A">A</Checkbox></Col>
                        <Col span={2}><Checkbox value="B">B</Checkbox></Col>
                        <Col span={2}><Checkbox value="C">C</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>,
                  )}
                </FormItem>
                <FormItem label="3.添加支持商品">
                  {getFieldDecorator("formSupport", {
                    initialValue: undefined,
                  })(
                    <RadioGroup value={this.state.value} style={{marginLeft:'35px'}}>
                      <Radio value={1}>全部</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label="4.设置最低保底价">
                  <FormItem label="Y卡(健康风险评估卡)" {...formItemLayout} labelCol={{ span: 2 }} style={{marginLeft:'35px'}}>
                    {getFieldDecorator("formBottom", {
                      initialValue: undefined,
                    })(
                      <Input style={{width:'200px',marginLeft:'35px'}}/>
                    )}
                  </FormItem>
                </FormItem>
                <FormItem label="5.参与砍价用户设置">
                  {getFieldDecorator("formSetting", {
                    initialValue: undefined,
                  })(
                    <RadioGroup value={this.state.value} style={{marginLeft:'35px'}}>
                      <Radio value={1}>新用户(新注册用户)</Radio>
                      <Radio value={2}>老用户(已有e家号的用户)</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label="6.设置砍价所需人数">
                  {getFieldDecorator("formPerson", {
                    initialValue: undefined,
                  })(
                   <Input style={{width:'200px',marginLeft:'35px'}}/>
                  )}
                </FormItem>
                <FormItem label="7.单次活动起止时间">
                  {getFieldDecorator("formTime", {
                    initialValue: undefined,
                  })(
                   <Input style={{width:'200px',marginLeft:'35px'}}/>
                  )}
                </FormItem>
                <FormItem label="8.用户发起活动倒计时">
                  {getFieldDecorator("formCountdown", {
                    initialValue: undefined,
                  })(
                   <Input style={{width:'200px',marginLeft:'35px'}}/>
                  )}
                </FormItem>
                <FormItem label="9.是否支持循环开启">
                  {getFieldDecorator("formLoop", {
                    initialValue: undefined,
                  })(
                    <RadioGroup value={this.state.value} style={{marginLeft:'35px'}}>
                      <Radio value={1}>是</Radio>
                      <Radio value={2}>否</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem label="10.添加活动商品图文">
                  <FormItem label="①" {...formItemLayout} labelCol={{ span: 1 }}>
                    {getFieldDecorator("formTime", {
                      initialValue: undefined,
                    })(
                      <Input style={{width:'200px',marginLeft:'-25px'}} placeholder="输入活动名称"/>
                    )}
                  </FormItem>
                  <FormItem label="②" {...formItemLayout} labelCol={{ span: 1 }}>
                    {getFieldDecorator("formTitle", {
                      initialValue: undefined,
                    })(
                      <Input style={{width:'200px',marginLeft:'-25px'}} placeholder="输入活动副标题"/>
                    )}
                  </FormItem>
                  <FormItem label="③添加商品活动图" {...formItemLayout} labelCol={{ span: 2 }}>
                    {getFieldDecorator("addNewIcon", {
                    })(
                      <Upload
                        name="pImg"
                        disabled={this.state.addOrUp === "look"}
                        action={`${Config.baseURL}/manager/product/uploadImage`}
                        listType="picture-card"
                        withCredentials={true}
                        fileList={this.state.fileListDetail}
                        beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}
                        onChange={f => this.onUpLoadDetailChange(f)}
                        onRemove={f => this.onUpLoadDetailRemove(f)}
                        style={{marginTop:'5px'}}
                      >
                        {this.state.fileList.length >= 1 ? null : (
                          <div>
                            <Icon type="plus" />
                            <div className="ant-upload-text">选择文件</div>
                          </div>
                        )}
                      </Upload>
                    )}
                  </FormItem>
                </FormItem>
                <FormItem label="11.配置单次活动库存限制">
                  <FormItem label="库存数量" {...formItemLayout} labelCol={{ span: 2 }}>
                    {getFieldDecorator("formStock", {
                      initialValue: undefined,
                    })(
                      <Input style={{width:'200px',marginLeft:'-35px'}} placeholder="输入单次活动库存数量"/>
                    )}
                  </FormItem>
                  <FormItem style={{marginTop:'-15px'}}>
                    <span style={{color:'brown'}}>库存数量不足时,经销商与所属分销商水机或优惠卡不满足最低库存时,经销商与所属分销商无法发起活动</span>
                  </FormItem>
                </FormItem>
                <FormItem label="12.命名规则" {...formItemLayout} labelCol={{ span: 2 }}>
                  {getFieldDecorator("formRule", {
                    initialValue: undefined,
                  })(
                    <Input style={{width:'200px',marginLeft:'-35px'}} placeholder="给设置的规则起名"/>
                  )}
                </FormItem>
                <FormItem label="13.编辑活动规则" labelCol={{ span: 24 }} wrapperCol={{ span: 24}} style={{width:'800px'}}>
                  <BraftEditor {...editorProps} ref={(dom) => this.editor = dom}/>
                </FormItem>
                <FormItem style={{width:'800px',textAlign:'center'}}>
                  <Button onClick={() => this.onOk()} type="primary" style={{width:'160px'}}>确定</Button>
                </FormItem>
              </Form>
            </TabPane>
            <TabPane tab="操作统计" key="3">
            </TabPane>
          </Tabs>
        </div>
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
  actions: P.any
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
  state => ({}),
  dispatch => ({
    actions: bindActionCreators(
      {
        NewActivityList,
        upDateActivityList,
        deleteActivity,
        ActivityProductL,
        onChange,
        onOk,
        findProductByWhere,
        upDateOnlineList,
        deleteImage,
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
