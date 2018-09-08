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
  Popover,
  InputNumber,
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
  onChange,
  onOk,
} from "../../../../a_action/shop-action";
import {
  assistantList,
  AddassistantList,
  UpassistantList,
  DelateassistantList,
  assistantTypeList,
  DownassistantList,
  RemoveList
}from "../../../../a_action/card-action"

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      assistants:[],//所有的问答分类名称
      titleList: [], // 所有的标题位置
      titles: [], //所有的标题
      searchTitle: "", //搜索 - 问题查询
      searchTypeCode:'',//搜索 - 问题分类
      searchRecommend:"",//搜索 - 热门咨询状态
      searchStatus:'',//搜索 - 是否发布
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      addnewModalShow: false, // 查看地区模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在修改用户中
      fileList: [], // 缩略图已上传的列表
      fileLoading: false, // 缩略图片正在上传
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 // 数据库总共多少条数据
    };
  }

  componentDidMount() {
    this.getAllAssistant(); //获取所有的分类名称，当前也可用
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      typeCode: this.state.searchTypeCode,
      questions: this.state.searchTitle,
      recommend:this.state.searchRecommend,//在热门咨询状态
      deleteFlag:this.state.searchStatus,//是否发布
    };
    this.props.actions.assistantList(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data);
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
      console.log("问答列表有了么：", res.data.result);
    });
  }
  
  // 获取所有问答分类，当前页要用
  getAllAssistant() {
    this.props.actions
      .assistantTypeList({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            assistants: res.data.result || []
          });
        }
      });
  }
  
  // 工具 - 根据问题分类ID获取问题分类名称
  getNameTypeCode(typeCode) {
    const t = this.state.assistants.find(
      item => String(item.typeCode) === String(typeCode)
    );
    return t ? t.typeName : "";
  }
  
  //搜索 - 问题分类输入框值改变时触发
  searchTypeCodeChange(e) {
    this.setState({
      searchTypeCode: e
    });
  }

  //搜索 - 问题查询输入框值改变时触发
  searchTitleChange(e) {
    this.setState({
      searchTitle: e.target.value
    });
  }
  
  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchTitle: ""
    });
  }
  
  //热门资讯推荐状态
  searchRecommendChange(e){
    this.setState({
      searchRecommend:e
    })
  }
  
  //发布状态
  searchStatusChange(e){
    this.setState({
      searchStatus:e
    })
  }
  
  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  // 添加新回答模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTitle",
      "addnewConditions",
      "addnewTypeCode",
      "addnewSorts",
      "addnewQuestion",
      "addnewProductImg"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
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
    if (me.state.fileLoading || me.state.fileDetailLoading) {
      message.warning("有图片正在上传...");
      return;
    }

    form.validateFields(
      [
        "addnewTitle",
        "addnewConditions",
        "addnewTypeCode",
        "addnewSorts",
        "addnewQuestion",
        "addnewProductImg"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          questions: values.addnewTitle,//问题
          typeCode:values.addnewTypeCode,//随机typeCode值
          recommend:0,//是否推荐
          deleteFlag: values.addnewConditions ? 1 : 0,//是否发布
          sorts: values.addnewSorts, //排序
          answers: values.addnewQuestion,//回答
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .AddassistantList(tools.clearNull(params))
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
            .UpassistantList(params)
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
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewTitle: String(record.questions),
      addnewConditions: record.recommend ? 0 : 1,
      addnewSorts: record.sorts,
      addnewQuestion: record.answers,
      addnewTypeCode: String(record.typeCode),
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
    });
  }

  // 发布或回撤
  onUpdateClick2(record) {
    const params = {
      id: Number(record.id)
    };
    this.props.actions
      .RemoveList(params)
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
  
  // 推荐或回撤
  onUpdateClick3(record) {
    const params = {
      id: Number(record.id)
    };
    this.props.actions
      .DownassistantList(params)
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
    this.props.actions.DelateassistantList({ id: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
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
  //导出
  onExport() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
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
        fixed: "left",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      {
        title: "问答分类",
        dataIndex: "typeCode",
        key: "typeCode",
        render:text => this.getNameTypeCode(text)
      },
      {
        title: "问题",
        dataIndex: "questions",
        key: "questions"
      },
      {
        title: "回答",
        dataIndex: "answers",
        key: "answers",
      },
      {
        title: "是否设为热门资讯",
        dataIndex: "recommend",
        key: "recommend",
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "green" }}>已推荐</span>
          ) : (
            <span style={{ color: "red" }}>未推荐</span>
          )
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
        title:'最新发布时间',
        dataIndex:'createTime',
        key:'createTime',
      },
      {
        title:"排序",
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
                <Icon type="caret-up" />
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
                <Icon type="caret-down" />
              </Tooltip>
            </span>
          );
          record.recommend === false &&
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onUpdateClick3(record)}
            >
            <Tooltip placement="top" title="推荐">
              <Icon type="login" />
            </Tooltip>
          </span>
          );
          record.recommend === true &&
          controls.push(
            <span
              key="3"
              className="control-btn red"
              onClick={() => this.onUpdateClick3(record)}
            >
            <Tooltip placement="top" title="推荐撤回">
              <Icon type="logout" />
            </Tooltip>
          </span>
          );
          controls.push(
            <span
              key="4"
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
              key="5"
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
              key="6"
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
        key: index,
        orderNo: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        deleteFlag: item.deleteFlag,
        sorts: item.sorts,
        id: item.id,
        typeCode:item.typeCode,
        questions: item.questions, //问题
        answers: item.answers,//回答
        recommend:item.recommend,
        createTime:item.createTime,//最新发布时间
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
  
    const { searchTitle } = this.state;
    const suffix = searchTitle ? (
      <Icon type="close-circle" onClick={() => this.emitEmpty()} />
    ) : null;

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>问答分类</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: '172px' }}
                onChange={e => this.searchTypeCodeChange(e)}
              >
                {
                this.state.assistants.map((item) => {
                  return (
                    <Option key={String(item.typeCode)}>{item.typeName}</Option>
                  );
                })
                }
              </Select>
            </li>
            <li>
              <span>问题查询</span>
              <Input
                suffix={suffix}
                value={searchTitle}
                style={{ width: "190px" }}
                onChange={e => this.searchTitleChange(e)}
              />
            </li>
            <li>
              <span>是否推荐</span>
              <Select
                placeholder="全部"
                allowClear
                style={{width: "120px",marginRight: "25px"}}
                onChange={e => this.searchRecommendChange(e)}
              >
                <Option value={1}>已推荐</Option>
                <Option value={0}>未推荐</Option>
              </Select>
            </li>
            <li>
              <span>发布状态</span>
              <Select
                placeholder="全部"
                allowClear
                style={{width: "120px",marginRight: "25px"}}
                onChange={e => this.searchStatusChange(e)}
              >
                <Option value={0}>已发布</Option>
                <Option value={1}>未发布</Option>
              </Select>
            </li>
            <li style={{ marginRight: "10px" }}>
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
                  添加回答
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
          title={this.state.addOrUp === "add" ? "添加回答" : "修改回答"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="问答分类" {...formItemLayout}>
              {getFieldDecorator("addnewTypeCode", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择问答分类" }]
              })(
                <Select
                  allowClear
                  placeholder="全部"
                  style={{ width: '200px' }}
                >
                {
                  this.state.assistants.map((item) => {
                  return (
                    <Option key={String(item.typeCode)}>{item.typeName}</Option>
                  );
                })
                }
                </Select>
              )}
            </FormItem>
            <FormItem label="问题" {...formItemLayout}>
              {getFieldDecorator("addnewTitle", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入问题" },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 50) {
                          callback("最多输入50个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入问题" />)}
            </FormItem>
            <FormItem label="回答" {...formItemLayout}>
              {getFieldDecorator("addnewQuestion", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入回答" }]
              })(<TextArea
                  placeholder="请输入回答"
                  autosize={{ minRows: 1, maxRows: 8 }}
              />)}
            </FormItem>
            <FormItem label="是否发布" {...formItemLayout}>
              {getFieldDecorator("addnewConditions", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择是否发布" }]
              })(
                <Select placeholder="请选择是否发布">
                  <Option value={1}>未发布</Option>
                  <Option value={0}>已发布</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("addnewSorts", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<InputNumber placeholder="请输入排序序号" style={{width:'315px'}}/> )}
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
            <FormItem label="问答分类" {...formItemLayout}>
              {!!this.state.nowData ? this.getNameTypeCode(this.state.nowData.typeCode) : ""}
            </FormItem>
            <FormItem label="问题" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.questions: ""}
            </FormItem>
            <FormItem label="回答" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.answers: ""}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.sorts : ""}
            </FormItem>
            <FormItem label="推荐状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.recommend) === true ? (
                  <span style={{ color: "green" }}>已推荐</span>
                ) : (
                  <span style={{ color: "red" }}>未推荐</span>
                )
              ) : (
                ""
              )}
            </FormItem>
            <FormItem label="发布状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.conditions) === true ? (
                  <span style={{ color: "red" }}>未发布</span>
                ) : (
                  <span style={{ color: "green" }}>已发布</span>
                )
              ) : (
                ""
              )}
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
        onChange,
        onOk,
        assistantList,
        AddassistantList,
        UpassistantList,
        DelateassistantList,
        assistantTypeList,
        DownassistantList,
        RemoveList
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
