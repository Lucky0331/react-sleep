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
import $ from 'jquery';
import Power from "../../../../util/power"; // 权限
import { power } from "../../../../util/data";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  updateProductType,
  advertPosition,
  UpdatePosition,
  deletePosition,
  deleteImage,
  onChange,
  onOk,
  adList,
  advertPositionList,
} from "../../../../a_action/shop-action";

import {
  Cardlist,
  deleteCard,
  addCard,
  UpdateCard,
  UpdateOnline,
  CardTypelist,
} from "../../../../a_action/card-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      titleList: [], // 所有的标题位置
      titles: [], //所有的标题
      searchModelId: "", // 搜索 - 产品型号
      searchBanner: "", //搜索 - banner位置
      searchTitle: "", //搜索 - 标题
      searchName: "", //搜索 - 是否发布
      searchTypeCode: "", //搜索 - H5分类
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
    this.getAllCardType(); // 获取所有的宣传卡分类
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      cardCategory:2,
      deleteStatus: this.state.searchName,
      title: this.state.searchTitle,
      cardTypeCode: this.state.searchTypeCode
    };
    this.props.actions.Cardlist(tools.clearNull(params)).then(res => {
      if (res.status === "0") {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          total: res.data.total || []
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
      }
    });
  }
  
  // 获取所有的宣传卡类型，当前页要用
  getAllCardType() {
    this.props.actions
      .CardTypelist({ pageNum: 0, pageSize: 9999 ,cardCategory:2})
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productTypes: res.data.result || []
          });
        }
      });
  }
  
  // 工具 - 根据宣传卡类型ID查宣传卡类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.typeName : "";
  }
  
  //搜索 - 发布状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  //搜索 - 标题输入框值改变时触发
  searchTitleChange(e) {
    this.setState({
      searchTitle: e.target.value
    });
  }
  

  // 添加宣传卡模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewTypeId", //添加宣传卡类型
      "addnewTitle", // 添加标题
      "addnewSlogan", //添加标语
      "addnewContent", //添加分享文案的内容
      "addnewBtnColor", // 添加按钮颜色
      "addnewSorts", // 添加排序的顺序
      "addnewProductImg" ,//添加图标
      "addnewUrl",//添加H5链接
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
        "addnewTypeId", //添加宣传卡类型
        "addnewTitle", // 添加标题
        "addnewSlogan", //添加标语
        "addnewContent", //添加分享文案的内容
        "addnewBtnColor", // 添加按钮颜色
        "addnewSorts", // 添加排序的顺序
        "addnewProductImg" ,//添加图标
        "addnewUrl",//添加H5链接
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          cardTypeCode:values.addnewTypeId, //添加H5代言卡类型
          cardCategory:2,//代言卡型号
          cardTypeName:this.state.addOrUp === "add" ? this.findProductNameById(values.addnewTypeId) : values.addnewTypeName,
          name: values.addnewTitle,//添加标题
          title: values.addnewSlogan,//添加标语
          content: values.addnewContent, //添加分享文案
          colorTwo: String(values.addnewBtnColor), //添加按钮颜色
          sorts: values.addnewSorts,// 添加排序的顺序
          speakCardUrl: values.addnewUrl,//添加H5链接
          titleImage: this.state.fileList.map(item => item.url).join(",") //添加图标
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addCard(tools.clearNull(params))
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
            .UpdateCard(params)
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
      addnewTypeName: record.cardTypeName,//宣传卡类型名称
      addnewTypeId: record.cardTypeCode,//宣传卡类型
      addnewTitle: record.name,//添加标题
      addnewSlogan:record.title,//添加标语
      addnewContent:record.content, //添加分享文案
      addnewBtnColor:record.colorTwo,//按钮颜色
      addnewSorts: record.sorts, //排序
      addnewUrl: record.speakCardUrl, //链接地址
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      addOrUp: "up",
      addnewModalShow: true,
      fileList: record.titleImage
        ? record.titleImage
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [] //图标上传的列表
    });
  }
  
  // 发布或取消发布
  onUpdateClick2(record) {
    const params = {
      speakCardId: Number(record.id)
    };
    this.props.actions
      .UpdateOnline(params)
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
    this.props.actions.deleteCard({ id: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
    });
  }

  // banner图 - 上传中、上传成功、上传失败的回调
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

  // banner图 - 上传前
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

  // banner图 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }

  // 真正从服务端删除商品的图片
  deleteImg(uri) {
    const temp = uri.split("/");
    const fileName = temp.splice(-1, 1);
    const params = {
      path: `${temp.join("/")}${fileName}`,
      // fileName
    };
    console.log("删除后的是啥？", temp.join("/"), fileName);
    this.props.actions.deleteImage(params);
  }

  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }
  
  // 搜索 - 宣传卡类型输入框值改变时触发
  searchProductType(typeId) {
    this.setState({
      searchTypeCode: typeId
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
        title: "宣传卡分类",
        dataIndex: "cardTypeCode",
        key: "cardTypeCode",
        render:text => this.findProductNameById(text)
      },
      {
        title: "标题",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "图标",
        dataIndex: "titleImage",
        key: "titleImage",
        width: 200,
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
        title: "H5链接",
        dataIndex: "speakCardUrl",
        key: "speakCardUrl"
      },
      {
        title: "排序",
        dataIndex: "sorts",
        key: "sorts"
      },
      {
        title: "是否发布",
        dataIndex: "deleteStatus",
        key: "deleteStatus",
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "red" }}>未发布</span>
          ) : (
            <span style={{ color: "green" }}>已发布</span>
          )
      },
      {
        title: "操作",
        key: "control",
        render: (text, record) => {
          const controls = [];
          record.deleteStatus === true &&
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
          record.deleteStatus === false &&
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
          record.deleteStatus === true &&
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
          record.deleteStatus === true &&
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
        key: index,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        addrId: item.addrId,
        count: item.count,
        title: item.title,
        orderNo: item.id,
        createTime: item.createTime,
        name: item.name,
        content:item.content,
        modelId: item.product ? item.product.typeCode : "",
        typeId: item.typeId ,
        conditions: item.conditions,
        url: item.url,
        titleImage: item.titleImage,
        sorts: item.sorts,
        colorTwo: item.colorTwo,
        id: item.id,
        orderFrom: item.orderFrom,
        cardTypeName:item.cardTypeName,
        cardTypeCode:item.cardTypeCode,
        speakCardUrl:item.speakCardUrl,
        deleteStatus:item.deleteStatus,
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

    return (
      <div>
        <div className="system-search">
          <ul className="search-ul more-ul">
            <li>
              <span>宣传卡分类</span>
              <Select allowClear placeholder="全部" style={{ width: '172px' }} onChange={(e) => this.searchProductType(e)}>
                {this.state.productTypes.map((item, index) => {
                  return <Option key={index} value={item.id}>{ item.typeName }</Option>
                })}
              </Select>
            </li>
            <li>
              <span>标题</span>
              <Input
                style={{ width: "172px" }}
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
            className="my-table"
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
        <Modal
          title="查看地区"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        />
        {/* 添加模态框 */}
        <Modal
          title={this.state.addOrUp === "add" ? "添加H5宣传卡" : "修改H5宣传卡"}
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="宣传卡分类" {...formItemLayout}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择宣传卡分类" }]
              })(
                <Select placeholder="请选择宣传卡分类">
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.typeName}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="标题" {...formItemLayout}>
              {getFieldDecorator("addnewTitle", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入H5宣传卡标题" },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入30个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入H5宣传卡标题" />)}
            </FormItem>
            <FormItem label="图标" {...formItemLayout}>
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
            </FormItem>
            <FormItem label="H5链接" {...formItemLayout}>
              {getFieldDecorator("addnewUrl", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入H5链接地址" }]
              })(<Input placeholder="请输入H5链接地址" />)}
            </FormItem>
            <FormItem label="标语" {...formItemLayout}>
              {getFieldDecorator("addnewSlogan", {
                initialValue: undefined,
                rules: [{ required: true, message: "请填写标语" }]
              })(<Input placeholder="请填写标语" />)}
            </FormItem>
            <FormItem label="分享文案" {...formItemLayout}>
              {getFieldDecorator("addnewContent", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入分享文案内容" }]
              })(
                <Input
                  placeholder="请输入分享文案内容"
                  style={{ width: "314px" }}
                />
              )}
            </FormItem>
            <FormItem label="按钮颜色" {...formItemLayout}>
              {getFieldDecorator("addnewBtnColor", {
                initialValue: undefined,
                rules: [{ required: true, message: "请添加按钮颜色" }]
              })(<Input placeholder="请添加按钮颜色" />)}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("addnewSorts", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(
                <InputNumber
                  placeholder="请输入排序序号"
                  style={{ width: "314px" }}
                />
              )}
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
            <FormItem label="宣传卡分类" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.cardTypeName : ""}
            </FormItem>
            <FormItem label="标题" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="图标" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.titleImage
                ? this.state.nowData.titleImage.split(",").map((item, index) => {
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
            <FormItem label="分享文案" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.content : ""}
            </FormItem>
            <FormItem label="按钮颜色" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.colorTwo : ""}
            </FormItem>
            <FormItem label="H5链接" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.speakCardUrl : ""}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.sorts : ""}
            </FormItem>
            <FormItem label="发布状态" {...formItemLayout}>
              {!!this.state.nowData ? (
                Boolean(this.state.nowData.deleteStatus) === true ? (
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
        updateProductType,
        advertPosition,
        UpdatePosition,
        deletePosition,
        onChange,
        deleteImage,
        onOk,
        adList,
        advertPositionList,
        Cardlist,
        deleteCard,
        addCard,
        UpdateCard,
        UpdateOnline,
        CardTypelist,
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
