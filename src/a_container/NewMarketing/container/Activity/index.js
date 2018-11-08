/* Banner 商城管理/内容管理/banner管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  Icon,
  Input,
  Table,
  message,
  Modal,
  Tooltip,
  Popconfirm,
  Select,
  Divider,
  Checkbox,
  Row, Col,
  Popover,
  Radio,
  Upload
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
  ActivityList,
  ChannelFromSave,
  findProductByWhere,
  upDateOnlineList,
  deleteImage,
  activityList,
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productModels: [], // 所有的产品型号
      channels: [], // 所有的渠道
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
      fileList:[] ,//活动图片上传列表
      fileListBack:[],//背景图片上传列表
      acType: undefined, // 当前选择的兑换类型
    };
  }

  componentDidMount() {
    this.getAllProductModel(); // 获取所有的产品型号
    this.getChannelFrom();//获取所有的渠道
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
  
  //端是什么
  getSideId(type){
    switch (String(type)){
    case "1":
      return "公众号";
    case "2":
      return "小程序";
    default:
      return "";
    }
  }
  
  //活动类型
  getActivityId(type){
    switch (String(type)){
    case "1":
      return "普通活动";
    case "2":
      return "兑换活动";
    default:
      return "";
    }
  }
  
  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      deleteFlag: this.state.searchName,
      title: this.state.searchTitle,
      apId: this.state.searchBanner
    };
    this.props.actions.ActivityList(tools.clearNull(params)).then(res => {
      // console.log("返回的什么：", res.data.result.recommendProductList);
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
      console.log("啥活动：", res.data.result);
    });
  }

  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  //搜索 - 活动名称输入框值改变时触发
  searchTitleChange(e) {
    this.setState({
      searchTitle: e.target.value
    });
  }

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }
  
  //获取渠道有哪些
  getChannelFrom(){
    this.props.actions.ChannelFromSave({pageNum:0,pageSize: 10}).then(res=>{
      if(res.status === "0"){
        this.setState({
          channels:res.data.result || []
        })
      }
    })
  }
  
  // 活动图 - 上传中、上传成功、上传失败的回调
  onUpLoadChange(obj) {
    // console.log('图片上传：', obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.data) {
        const list = _.cloneDeep(this.state.fileList);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.data;
        this.setState({
          fileList: list,
          fileLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileList);
        this.setState({
          fileList: list.filter(item => item.uid !== obj.file.uid),
          fileLoading: false
        });
        message.error("图片上传失败");
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileList);
      this.setState({
        fileList: list.filter(item => item.uid !== obj.file.uid),
        fileLoading: false
      });
      message.error("图片上传失败");
    }
  }
  
  // 活动图 - 上传前
  onUploadBefore(f, fl) {
    console.log("上传前：", f, fl);
    if (
      ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileList);
      newList.push(f);
      this.setState({
        fileList: newList
      });
      return true;
    }
  }
  
  // 活动图 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }
  
  // 背景图 - 上传中、上传成功、上传失败的回调
  onUpLoadBackChange(obj) {
    console.log('图片上传：', obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.data) {
        const list = _.cloneDeep(this.state.fileListBack);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.data;
        this.setState({
          fileListBack: list,
          fileBackLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileListBack);
        this.setState({
          fileListBack: list.filter(item => item.uid !== obj.file.uid),
          fileBackLoading: false
        });
        message.error("图片上传失败");
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileBackLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileListBack);
      this.setState({
        fileListBack: list.filter(item => item.uid !== obj.file.uid),
        fileBackLoading: false
      });
      message.error("图片上传失败");
    }
  }
  
  // 背景图 - 上传前
  onUploadBackBefore(f, fl) {
    console.log("上传前：", f, fl);
    if (
      ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileListBack);
      newList.push(f);
      this.setState({
        fileListBack: newList
      });
      return true;
    }
  }
  
  // 背景图 - 删除一个图片
  onUpLoadBackRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileListBack);
    this.setState({
      fileListBack: list.filter(item => item.uid !== f.uid)
    });
  }
  
  // 真正从服务端删除商品的图片
  deleteImg(uri) {
    const temp = uri.split("/");
    const fileName = temp.splice(-1, 1);
    const params = {
      path: `${temp.join("/")}${fileName}`,
    };
    console.log("删除后的是啥？", temp.join("/"), fileName);
    this.props.actions.deleteImage(params);
  }

  // 添加新活动模态框出现
  onAddNewShow(record) {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTitle",
      "addnewUrl",
      "addnewProduct",
      "addnewDeletFlag",
      "addnewbtnColor",
      "addnewSorts",
      "formEnd",
      "formChannel",
      "formActivityType"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListBack:[],
      // acType:record.acType,
      addnewModalShow: true,
      nowData: null,
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
    const me = this;
    const { form } = me.props;
    const acTypeTwo = [
      "addnewTitle",
      "addnewProduct",
      "addnewUrl",
      "addnewDeletFlag",
      "addnewSorts",
      "formEnd",
      "formActivityType",
      "formLayout"
    ];
    if ([2].includes(this.state.acType)) {
      acTypeTwo.push("formChannel", "addnewbtnColor");
    }
    form.validateFields(acTypeTwo,(err, values) => {
      if (err) {
        return false;
      }
      me.setState({
        addnewLoading: true
      });
      const params = {
        side:values.formEnd ? String(values.formEnd) : undefined,//端
        channel:values.formChannel ? String(values.formChannel) : undefined,//渠道
        acType:values.formActivityType ? String(values.formActivityType) : undefined,
        title: values.addnewTitle,
        acUrl: values.addnewUrl,
        layoutType:values.formLayout ? String(values.formLayout) : undefined,//布局 1-大图 2-小图
        deleteFlag:values.addnewDeletFlag,
        backColor:values.addnewbtnColor,//兑换按钮颜色
        recommend: values.addnewProduct ? String(values.addnewProduct) : undefined,
        sorts:Number(values.addnewSorts),
        acImg:this.state.fileList.map(item => item.url).join(","),
        backImg:this.state.fileListBack.map(item=>item.url).join(",")
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
      formEnd:record.side,//端
      formChannel:record.channel ? record.channel.split(",").map((item)=>{return String(item)}) :undefined,//渠道
      formActivityType:record.acType,//活动类型
      addnewUrl: record.acUrl,
      formLayout:record.layoutType,//背景图大图小图
      addnewProduct: record.recommendProductList ? record.recommendProductList.map((item)=>{return String(item.productId)}) : undefined,
      addnewDeletFlag:record.deleteFlag ? 1 : 0,
      addnewbtnColor:record.backColor,//按钮颜色
      addnewSorts:record.sorts,
      addnewacImg: record.acImg
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      acType:record.acType,
      addOrUp: "up",
      addnewModalShow: true,
      fileList: record.acImg
        ? record.acImg
        .split(",")
        .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // 活动图上传的列表
      fileListBack:record.backImg ?
         record.backImg
         .split(",")
         .map((item, index) => ({ uid: index, url: item, status: "done" }))
         :[],//背景图上传的列表
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

  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchTitle: ""
    });
  }

  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      {
        title:'端',
        dataIndex:'side',
        key:'side',
        render:text => this.getSideId(text)
      },
      {
        title: "活动名称",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "活动链接",
        dataIndex: "acUrl",
        key: "acUrl"
      },
      {
        title:'发布时间',
        dataIndex:'updateTime',
        key:'updateTime'
      },
      {
        title:"活动图片",
        dataIndex:'acImg',
        key:'acImg',
        render: (text, index) => {
          if (text) {
            const img = text.split(",");
            return (
              <Popover
                key={index}
                placement="right"
                content={<img className="table-img-big" src={img[0]} />}
              >
                <img className="table-img" src={img[0]} />
              </Popover>
            );
          }
          return "";
        }
      },
      {
        title: "是否发布",
        dataIndex: "deleteFlag",
        key: "deleteFlag",
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "red" }}>未发布</span>
          ) : (
            <span style={{ color: "green" }}>已发布</span>
          )
      },
      {
        title:'排序',
        dataIndex:'sorts',
        key:'sorts'
      },
      {
        title: "操作",
        key: "control",
        render: (text, record) => {
          const controls = [];
          record.deleteFlag === true &&
          controls.push(
            <span
              key="0"
              className="control-btn blue"
              onClick={() => this.onUpdateClick2(record)}
            >
              <Tooltip placement="top" title="发布">
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
              <Tooltip placement="top" title="回撤">
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
        title: item.title,//活动名称
        orderNo: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        updateTime: item.updateTime,//发布时间
        deleteFlag: item.deleteFlag,//是否发布
        acUrl: item.acUrl,  //链接地址
        acType:item.acType,//活动类型
        sorts:item.sorts,
        side:item.side,//端
        backColor:item.backColor,//兑换按钮颜色
        layoutType:item.layoutType,//大图 小图
        backImg:item.backImg ? item.backImg : '',//背景图
        channel:item.channel,//渠道
        recommendProductList:item.recommendProductList, //推荐产品有哪些
        acImg:item.acImg ? item.acImg : '', //活动图片
        productId:item.recommendProductList && item.recommendProductList[0] ? item.recommendProductList[0].productId : '',
        // productName:item.recommendProductList ? item.recommendProductList.map((item)=>{ return (item.productId)}).join(",") :'',
        productName:item.recommendProductList && item.recommendProductList[0] ? item.recommendProductList[0].productId : '',
        productName2:item.recommendProductList && item.recommendProductList[1] ? item.recommendProductList[1].productId : '',
        productName3:item.recommendProductList && item.recommendProductList[2] ? item.recommendProductList[2].productId : '',
        productName4:item.recommendProductList && item.recommendProductList[3] ? item.recommendProductList[3].productId : '',
        productName5:item.recommendProductList && item.recommendProductList[4] ? item.recommendProductList[4].productId : '',
        productName6:item.recommendProductList && item.recommendProductList[5] ? item.recommendProductList[5].productId : '',
        productName7:item.recommendProductList && item.recommendProductList[6] ? item.recommendProductList[6].productId : '',
        productName8:item.recommendProductList && item.recommendProductList[7] ? item.recommendProductList[7].productId : '',
        productName9:item.recommendProductList && item.recommendProductList[8]? item.recommendProductList[8].productId : '',
        productName10:item.recommendProductList && item.recommendProductList[9] ? item.recommendProductList[9].productId : '',
      };
    });
  }

  //根据acType值不同 显不显示渠道
  Newproduct(e) {
    this.setState({
      acType: e
    });
    console.log("acType的数值是：", e);
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

    const { searchTitle } = this.state;
    const suffix = searchTitle ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;
    console.log('这是什么：', this.state.productModels);
    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>活动名称</span>
              <Input
                style={{ width:"172px" }}
                suffix={suffix}
                value={searchTitle}
                onChange={e => this.searchTitleChange(e)}
              />
            </li>
            <li>
              <span>是否发布</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchNameChange(e)}
              >
                <Option value={0}>已发布</Option>
                <Option value={1}>未发布</Option>
              </Select>
            </li>
            <li style={{ marginLeft: "40px", marginRight: "15px" }}>
              <Button
                icon="search"
                type="primary"
                onClick={() => this.onSearch()}
              >
                搜索
              </Button>
            </li>
            <ul className="search-func">
              <li style={{ marginTop: "2px" }}>
                <Button
                  icon="plus-circle-o"
                  type="primary"
                  onClick={() => this.onAddNewShow()}
                >
                  添加
                </Button>
              </li>
            </ul>
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
              onChange: (page, pageSize) =>
                this.onTablePageChange(page, pageSize)
            }}
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
            <FormItem label="端" {...formItemLayout}>
              {getFieldDecorator("formEnd", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请选择所要配置的端" }
                ]
              })(
                <Select placeholder='请选择所要配置的端'>
                  <Option value={1}>公众号</Option>
                  <Option value={2}>小程序</Option>
                </Select>
              )}
            </FormItem>
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
            <FormItem label="活动类型" {...formItemLayout} >
              {getFieldDecorator("formActivityType", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请选择活动类型" }
                ]
              })(
                <Select placeholder='请选择活动类型' onChange={e => this.Newproduct(e)}>
                  <Option value={1}>普通活动</Option>
                  <Option value={2}>兑换活动</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="渠道" {...formItemLayout} className={this.state.acType === 1 ? 'hide' : 'show'}>
              {getFieldDecorator("formChannel", {
                initialValue: undefined,
              })(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="请选择所要配置的渠道"
                  >
                  {
                    this.state.channels.map((item) => {
                    return (
                       <Option key={String(item.dicCode)}>{item.dicValue}</Option>
                     );
                    })
                  }
              </Select>
              )}
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
            <FormItem label="活动图片" {...formItemLayout}>
              {getFieldDecorator("formLayout", {
                initialValue: undefined,
                rules: []
              })(
                <Select placeholder='请选择图片大小'>
                  <Option value={1}>大图</Option>
                  <Option value={2}>小图</Option>
                </Select>
              )}
              {getFieldDecorator("upIcon", {
              })(
                <Upload
                  name="pImg"
                  action={`${Config.baseURL}/manager/product/uploadImage`}
                  listType="picture-card"
                  withCredentials={true}
                  fileList={this.state.fileList}
                  beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                  onChange={f => this.onUpLoadChange(f)}
                  onRemove={f => this.onUpLoadRemove(f)}
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
            <FormItem label="背景图片" {...formItemLayout} className={this.state.acType === 1 ? 'hide' : 'show'}>
              {getFieldDecorator("upIcon1", {
                rules: [{required: true, message: "请选择背景图片"}]
              })(
                <Upload
                  name="pImg"
                  action={`${Config.baseURL}/manager/product/uploadImage`}
                  listType="picture-card"
                  withCredentials={true}
                  fileList={this.state.fileListBack}
                  beforeUpload={(f, fl) => this.onUploadBackBefore(f, fl)}
                  onChange={f => this.onUpLoadBackChange(f)}
                  onRemove={f => this.onUpLoadBackRemove(f)}
                >
                {this.state.fileListBack.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
                </Upload>
              )}
            </FormItem>
            <FormItem label="兑换按钮颜色" {...formItemLayout} className={this.state.acType === 1 ? 'hide' : 'show'}>
              {getFieldDecorator("addnewbtnColor", {
                initialValue: undefined,
                rules: [{required: true, message: "请选择兑换按钮颜色"}]
              })(<Input placeholder="请输入兑换按钮颜色" />)}
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
        {/* 查看详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="端" {...formItemLayout}>
              {!!this.state.nowData ? this.getSideId(this.state.nowData.side) :''}
            </FormItem>
            <FormItem label="活动名称" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.title : ""}
            </FormItem>
            <FormItem label="活动链接" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.acUrl : ""}
            </FormItem>
            <FormItem label="活动类型" {...formItemLayout}>
              {!!this.state.nowData ? this.getActivityId(this.state.nowData.acType) :''}
            </FormItem>
            <FormItem label="发布时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.updateTime : ""}
            </FormItem>
            <FormItem label="活动图片" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.acImg
                ? this.state.nowData.acImg.split(",").map((item, index) => {
                  return (
                    <Popover
                      key={index}
                      placement="right"
                      content={<img className="table-img-big" src={item} />}
                    >
                      <img className="small-img" src={item} />
                    </Popover>
                  );
                })
              : ""}
            </FormItem>
            <FormItem label="推荐产品" {...formItemLayout} >
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName2) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName3) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName4) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName5) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName6) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName7) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName8) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName9) : ''}</p>
              <p>{!!this.state.nowData ? this.getNameByModelId(this.state.nowData.productName10) : ''}</p>
            </FormItem>
            <FormItem label="发布状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.deleteFlag) === true ? (
                  <span style={{ color: "red" }}>未发布</span>
                ) : (
                  <span style={{ color: "green" }}>已发布</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.sorts : ""}
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
        onChange,
        onOk,
        findProductByWhere,
        ActivityList,
        upDateOnlineList,
        deleteImage,
        activityList,
        ChannelFromSave
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
