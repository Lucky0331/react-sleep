/* List 产品管理/产品列表 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import { Router, Route, Link } from "react-router-dom";
import Config from "../../../../config/config";
import {
  Form,
  Button,
  Icon,
  Input,
  InputNumber,
  Checkbox,
  Row,
  Table,
  message,
  Popconfirm,
  Popover,
  Modal,
  Radio,
  Tooltip,
  Select,
  Upload,
  Divider
} from "antd";
import "./index.scss";
import BraftEditor from "braft-editor";
import "braft-editor/dist/braft.css";
import tools from "../../../../util/tools"; // 工具
import Power from "../../../../util/power"; // 权限

import { power } from "../../../../util/data";
import _ from "lodash";
// ==================
// 所需的所有组件
// ==================

// ==================
// 本页面所需action
// ==================

import {
  findProductByWhere,
  findProductTypeByWhere,
  addProduct,
  updateProduct,
  updateProductType,
  deleteProduct,
  removeProduct,
  deleteImage,
  findProductModelByWhere,
  upProductModel,
  onChange3,
  hasRecommendProductType
} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchName: "", // 搜索 - 名称
      addOrUp: "add", // 当前操作是新增还是修改
      addnewModalShow: false, // 添加新用户 或 修改用户 模态框是否显示
      addnewLoading: false, // 是否正在添加新用户中
      upModalShow: false, // 修改模态框是否显示
      upLoading: false, // 是否正在添加新用户中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      queryModalShow: false, // 查看详情模态框是否显示
      maskClose:false,//蒙层是否关闭
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      code: undefined, //产品类型所对应的code值
      fileList: [], // 产品图片已上传的列表
      fileListVideo:[],//产品封面视频上传列表
      fileListDetail: [], // 列表封面图片已上传的列表
      fileLoading: false, // 产品图片正在上传
      fileDetailLoading: false, // 详细图片正在上传
    };
    this.onChange = (editorState) => this.setState({editorState});
    this.editor = null;
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的产品类型
    this.getAllProductModel(); // 获取所有的产品型号
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      onShelf: this.state.searchName,
      productType: this.state.searchTypeId
    };
    this.props.actions.findProductByWhere(tools.clearNull(params)).then(res => {
      if (res.returnCode === "0") {
        this.setState({
          data: res.messsageBody.result || [],
          pageNum,
          pageSize,
          total: res.messsageBody.total
        });
      } else {
        message.error(res.returnMessaage || "获取数据失败，请重试");
      }
    });
  }

  // 获取所有的产品类型，当前页要用
  getAllProductType() {
    this.props.actions
      .findProductTypeByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.returnCode === "0") {
          this.setState({
            productTypes: res.messsageBody.result
          });
        }
      });
  }

  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductModelByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.returnCode === "0") {
          this.setState({
            productModels: res.messsageBody.modelList.result
          });
        }
      });
  }
  // 工具 - 根据产品类型ID查产品类型名称
  findProductNameById(id) {
    const t = this.state.productTypes.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据产品型号ID获取产品型号名称
  getNameByModelId(id) {
    const t = this.state.productModels.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  //工具 - 根据产品型号ID获取产品型号价格
  getNameByModePrice(id) {
    const t = this.state.productPrice.find(
      item => String(item.id) === String(id)
    );
    return t ? t.name : "";
  }

  // 工具 - 根据有效期type获取有效期名称
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0":
        return "长期有效";
      case "1":
        return `${time}天`;
      case "2":
        return `${time}月`;
      case "3":
        return `${time}年`;
      default:
        return "";
    }
  }

  //工具 - 根据活动类型id获取活动名称
  getActivity(id) {
    switch (String(id)) {
      case "1":
        return "普通产品";
      case "2":
        return "活动产品";
      default:
        return "";
    }
  }

  // 搜索 - 产品类型输入框值改变时触发
  onSearchTypeId(typeId) {
    this.setState({
      searchTypeId: typeId
    });
  }

  //搜索 - 产品状态输入框值改变时触发
  searchNameChange(e) {
    this.setState({
      searchName: e
    });
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      addnewName: record.name,
      addnewTypeId: `${record.typeId}`,
      addnewTypeCode: String(record.typeCode),
      addnewOnShelf: record.onShelf ? "1" : "0",
      addnewProductImg: record.productImg,
      addnewDetailImg: record.detailImg,
      addnewTimeLimitNum: record.timeLimitNum,
      addnewTimeLimitType: record.timeLimitType,
      addnewActivityType: record.activityType
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      upModalShow: true,
      code: record.typeId,
      fileList: record.productImg
        ? record.productImg
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // 产品图片已上传的列表
      fileListDetail: record.detailImg
        ? record.detailImg
            .split(",")
            .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : []
    });
  }

  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "addnewName",
        "addnewTypeId",
        "addnewTypeCode",
        "addnewOnShelf",
        "addnewProductImg",
        "addnewDetailImg",
        "addnewTimeLimitNum",
        "addnewTimeLimitType",
        "addnewActivityType"
      ],
      (err, values) => {
        if (err) {
          return;
        }

        me.setState({
          upLoading: true
        });
        const params = {
          id: me.state.nowData.id,
          name: values.addnewName,
          typeId: values.addnewTypeId,
          typeCode: values.addnewTypeCode,
          onShelf: values.addnewOnShelf,
          timeLimitNum: values.addnewTimeLimitNum,
          timeLimitType: values.addnewTimeLimitType,
          activityType: values.addnewActivityType,
          productImg: this.state.fileList.map(item => item.url).join(","),
          // detailImg: this.state.fileListDetail.map(item => item.url).join(",")
        };

        this.props.actions
          .updateProduct(params)
          .then(res => {
            if (res.returnCode === "0") {
              message.success("修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              this.onUpClose();
            } else {
              message.error(res.returnMessaage || "修改失败，请重试");
            }
            me.setState({
              upLoading: false
            });
          })
          .catch(() => {
            me.setState({
              upLoading: false
            });
          });
      }
    );
  }

  // 关闭修改某一条数据
  onUpClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.removeProduct({ id: id }).then(res => {
      if (res.returnCode === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.returnMessaage || "删除失败，请重试");
      }
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询某一条数据的详情
  onQueryClick(record) {
    this.setState({
      nowData: record,
      code: record.typeId,
      queryModalShow: true
    });
  }

  // 查看详情模态框关闭
  onQueryModalClose() {
    this.setState({
      queryModalShow: false
    });
  }

  // 添加新用户模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewName",
      "addnewTypeId",
      "addnewTypeCode",
      "addnewOnShelf",
      "addnewProductImg",
      "addnewDetailImg",
      "addnewTimeLimitType",
      "addnewTimeLimitNum",
      "addnewActivityType"
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      fileListDetail: [],
      addnewModalShow: true,
      nowData: null,
      code: undefined
    });
  }

  // 下架或上架
  onUpdateClick2(record) {
    const params = {
      id: record.id,
      name: record.name,
      price: record.price,
      typeId: Number(record.typeId),
      typeCode: record.typeCode,
      saleMode: Number(record.saleMode),
      marketPrice: record.marketPrice,
      onShelf: record.onShelf ? 1 : 0,
      productImg: record.productImg,
      detailImg: record.detailImg,
      activityType: record.activityType
    };

    this.props.actions
      .deleteProduct(params)
      .then(res => {
        if (res.returnCode === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.returnMessaage || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  //推荐或者不推荐
  onUpdateClick3(record) {
    const params = {
      id: record.id,
      saleMode: Number(record.saleMode),
      onShelf: record.onShelf ? 1 : 0,
      activityType: record.activityType
    };

    this.props.actions
      .hasRecommendProductType(params)
      .then(res => {
        if (res.returnCode === "0") {
          message.success("修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.returnMessaage || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  // 添加或修改确定
  onAddNewOk() {
    console.log("AAAAAAAA");
    const me = this;
    const { form } = me.props;
    if (me.state.fileLoading || me.state.fileDetailLoading) {
      message.warning("有图片正在上传...");
      return;
    }
    console.log('编辑器内容：', this.editor.getHTMLContent());
    form.validateFields(
      [
        "addnewName",
        "addnewTypeId",
        "addnewTypeCode",
        "addnewOnShelf",
        "addnewProductImg",
        "addnewDetailImg",
        "addnewTimeLimitType",
        "addnewTimeLimitNum",
        "addnewActivityType"
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });

        const params = {
          name: values.addnewName,
          typeId: Number(values.addnewTypeId),
          typeCode: Number(values.addnewTypeCode),
          timeLimitType: values.addnewTimeLimitType,
          timeLimitNum: values.addnewTimeLimitNum,
          onShelf: values.addnewOnShelf ? 1 : 0,
          activityType: values.addnewActivityType,
          productImg: this.state.fileList.map(item => item.url).join(","),
          // detailImg: this.state.fileListDetail.map(item => item.url).join(",")
        };
        if (this.state.addOrUp === "add") {
          // 新增
          me.props.actions
            .addProduct(tools.clearNull(params))
            .then(res => {
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
        } else {
          params.id = this.state.nowData.id;
          me.props.actions
            .updateProduct(params)
            .then(res => {
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

  // 关闭模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }

  // 表单页码改变
  onTablePageChange(page, pageSize) {
    this.onGetData(page, pageSize);
  }
  // 真正从服务端删除商品的图片
  deleteImg(uri) {
    const temp = uri.split("/");
    const fileName = temp.splice(-1, 1);
    const params = {
      path: temp.join("/"),
      fileName
    };
    console.log("删除后的是啥？", temp.join("/"), fileName);
    this.props.actions.deleteImage(params);
  }

  // 产品图片 - 上传中、上传成功、上传失败的回调
  onUpLoadChange(obj) {
    console.log("图片上传：", obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.messsageBody) {
        const list = _.cloneDeep(this.state.fileList);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.messsageBody;
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

  // 产品图片 - 上传前
  onUploadBefore(f, fl) {
    console.log("上传前：", f, fl);
    if (
      ["jpg", "jpeg", "png", "bmp", "gif","mp4"].indexOf(f.type.split("/")[1]) < 0
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

  // 产品图片 - 删除一个图片
  onUpLoadRemove(f) {
    console.log("删除；", f);
    this.deleteImg(f.url);
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }

  // 列表封面图片 - 上传前
  onUploadDetailBefore(f) {
    if (
      ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileListDetail);
      newList.push(f);
      this.setState({
        fileListDetail: newList
      });
      return true;
    }
  }

  // 列表封面图片 - 上传中、成功、失败
  onUpLoadDetailChange(obj) {
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.messsageBody) {
        const list = _.cloneDeep(this.state.fileListDetail);
        const t = list.find(item => item.uid === obj.file.uid);
        t.url = obj.file.response.messsageBody;
        this.setState({
          fileListDetail: list,
          fileDetailLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileListDetail);
        this.setState({
          fileListDetail: list.filter(item => item.uid !== obj.file.uid),
          fileDetailLoading: false
        });
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileDetailLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileListDetail);
      this.setState({
        fileListDetail: list.filter(item => item.uid !== obj.file.uid),
        fileLoading: false
      });
      message.error("图片上传失败");
    }
  }

  // 列表封面图片 - 删除
  onUpLoadDetailRemove(f) {
    const list = _.cloneDeep(this.state.fileListDetail);
    this.setState({
      fileListDetail: list.filter(item => item.uid !== f.uid)
    });
  }

  //根据code值不同显示的字段不同
  Newproduct(e) {
    this.setState({
      code: e
    });
    console.log("e的数值是：", e);
    //产品类型改变时，重置产品型号的值位undefined
    const { form } = this.props;
    form.resetFields(["addnewTypeCode"]);
  }

  // 产品型号选择时，查对应的价格,有效期，邮费
  onSelectModels(id) {
    const temp = this.state.productModels.find(item => {
      return String(id) === String(item.id);
    });
    console.log("temp是什么：", temp);
    return temp
      ? {
          price: temp.price,
          date: this.getNameForInDate(temp.timeLimitNum, temp.timeLimitType),
          shipFee: temp.shipFee,
          openAccountFee: temp.openAccountFee,
          charges: temp.chargeTypes
            ? temp.chargeTypes.map((item, index) => (
                <div key={index}>
                  {index + 1}.{item.chargeName}
                </div>
              ))
            : ""
        }
      : {};
  }
  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        width: 100
      },
      // {
      //   title:'列表缩略图'
      // },
      {
        title: "缩略图",
        dataIndex: "productImg",
        key: "productImg",
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
        title: "产品名称",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "产品类型",
        dataIndex: "typeId",
        key: "typeId",
        render: text => this.findProductNameById(text)
      },
      {
        title: "产品型号",
        dataIndex: "typeCode",
        key: "typeCode",
        render: text => this.getNameByModelId(text)
      },
      {
        title: "活动方式",
        dataIndex: "activityType",
        key: "activityType",
        render: text => this.getActivity(text)
      },
      {
        title: "产品状态 ",
        dataIndex: "onShelf",
        key: "onShelf",
        render: text =>
          text ? (
            <span style={{ color: "green" }}>已上架</span>
          ) : (
            <span style={{ color: "red" }}>未上架</span>
          )
      },
      {
        title:'是否设为推荐',
        dataIndex:'newProduct',
        key:'newProduct',
        render:text =>
          text ? (
              <span style={{ color: "green" }}>已推荐</span>
          ):(
              <span style={{ color: "red" }}>未推荐</span>
          )
      },
      {
        title:'排序',
        dataIndex:'sort',
        key:'sort'
      },
      {
        title:'操作',
        key: "control",
        width: 200,
        render: (text, record) => {
          const controls = [];

          !record.onShelf &&
            controls.push(
              <span
                key="0"
                className="control-btn blue"
                onClick={() => this.onUpdateClick2(record)}
              >
                <Tooltip placement="top" title="上架">
                  <Icon type="caret-up" />
                </Tooltip>
              </span>
            );
          record.onShelf &&
            controls.push(
              <span
                key="1"
                className="control-btn red"
                onClick={() => this.onUpdateClick2(record)}
              >
                <Tooltip placement="top" title="下架">
                  <Icon type="caret-down" />
                </Tooltip>
              </span>
            );
          !record.newProduct &&
            controls.push(
              <span
                key="6"
                className="control-btn blue"
                onClick={() => this.onUpdateClick3(record)}
              >
               <Tooltip placement="top" title="推荐">
                 <Icon type="login" />
               </Tooltip>
            </span>
            );
          record.newProduct &&
            controls.push(
              <span
                key="5"
                className="control-btn red"
                onClick={() => this.onUpdateClick3(record)}
              >
             <Tooltip placement="top" title="撤回推荐">
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
              <Tooltip placement="top" title="详情">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          !record.onShelf &&
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
          !record.onShelf &&
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
    console.log("data是个啥：", data);
    return data.map((item, index) => {
      return {
        key: index,
        id: item.id,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        name: item.name,
        typeCode: item.typeCode,
        amount: item.amount,
        buyCount: item.buyCount,
        createTime: item.createTime,
        creator: item.creator,
        detailImg: item.detailImg,
        itemNum: item.itemNum,
        newProduct: item.newProduct,
        offShelfTime: item.offShelfTime,
        onShelf: item.onShelf,
        onShelfTime: item.onShelfTime,
        price: item.typeModel ? item.typeModel.price : "",
        productImg: item.productImg,
        saleMode: item.saleMode,
        typeId: item.typeId,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id,
        activityType: item.activityType,
        timeLimitNum: item.typeModel ? item.typeModel.timeLimitNum : "",
        timeLimitType: item.typeModel ? item.typeModel.timeLimitType : "",
        shipFee: item.typeModel ? item.typeModel.shipFee : "",
        openAccountFee: item.typeModel ? item.typeModel.openAccountFee : "",
        charges: item.typeModel ? item.typeModel.charges : ""
      };
    });
  }

  render() {
    const me = this;
    const { form } = me.props;
    const { getFieldDecorator } = form;
    console.log("AAA:", this.state.code);
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 22 },
        sm: { span: 16 }
      }
    };

    console.log(
      "是啥：",
      this.state.productModels.filter(
        item =>
          String(item.typeId) === String(form.getFieldValue("addnewTypeId"))
      )
    );
    const modelId = form.getFieldValue("addnewTypeCode");
    const obj = this.onSelectModels(modelId);
    console.log("OBJ是什么：", obj);
    const editorProps = {
      height: 400,
      contentFormat: 'html',
      initialContent: '<p>请编写内容...</p>',
    }
    return (
      <div style={{ width: "100%" }}>
        <div className="system-search">
          <ul className="search-ul">
            <li>
              <span style={{ marginRight: "10px" }}>产品类型</span>
              <Select
                allowClear
                whitespace="true"
                placeholder="全部"
                value={this.state.searchTypeId}
                style={{ width: "200px" }}
                onChange={e => this.onSearchTypeId(e)}
              >
                {this.state.productTypes.map((item, index) => {
                  return (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>产品状态</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "120px", marginRight: "25px" }}
                onChange={e => this.searchNameChange(e)}
              >
                <Option value={0}>未上架</Option>
                <Option value={1}>已上架</Option>
              </Select>
            </li>
            <li>
              <Button
                icon="search"
                type="primary"
                onClick={() => this.onSearch()}
              >
                查询
              </Button>
            </li>
          </ul>
          <ul className="search-func">
            <li>
              <Button type="primary" onClick={() => this.onAddNewShow()}>
                <Icon type="plus-circle-o" />添加产品
              </Button>
            </li>
          </ul>
        </div>
        <div className="system-table">
          <Table
            columns={this.makeColumns()}
            className="my-table"
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
          title="添加产品"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          wrapClassName={"codNum"}
          confirmLoading={this.state.addnewLoading}
          maskClosable={this.state.maskClose}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select
                  placeholder="请选择产品类型"
                  onChange={e => this.Newproduct(e)}
                >
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品名称" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入产品名称" },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入80位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入产品名称" />)}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("addnewTypeCode", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请选择产品型号" },
                  {
                    validator: (rule, value, callback) => {
                      console.log("value===", value);
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 20) {
                          callback("最多输入20位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(
                <Select placeholder="请选择产品型号">
                  {this.state.productModels
                    .filter(
                      item =>
                        String(item.typeId) ===
                        String(form.getFieldValue("addnewTypeId"))
                    )
                    .map((item, index) => (
                      <Option key={index} value={`${item.id}`}>
                        {this.getNameByModelId(item.id)}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("addnewActivityType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择活动方式" }]
              })(
                <Select placeholder="请选择活动方式">
                  <Option value={1}>普通商品</Option>
                  <Option value={2}>活动商品</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="价格" {...formItemLayout}>
              {obj.price}
            </FormItem>
            <FormItem
              label="有效期"
              {...formItemLayout}
              className={
                this.state.code === 1 ||
                this.state.code === 2 ||
                this.state.code === 3
                  ? "show"
                  : ""
              }
            >
              {obj.date}
            </FormItem>
            <FormItem
              label="计费方式"
              {...formItemLayout}
              className={
                this.state.code === 2 ||
                this.state.code === 3 ||
                this.state.code === 4 ||
                this.state.code === 5
                  ? "hide"
                  : ""
              }
            >
              {obj.charges}
            </FormItem>
            <FormItem
              label="运费"
              {...formItemLayout}
              className={
                this.state.code === 1 ||
                this.state.code === 4 ||
                this.state.code === 5
                  ? "hide"
                  : ""
              }
            >
              {obj.shipFee}
            </FormItem>
            <FormItem
              label="开户费"
              {...formItemLayout}
              className={
                this.state.code === 2 ||
                this.state.code === 3 ||
                this.state.code === 4 ||
                this.state.code === 5
                  ? "hide"
                  : ""
              }
            >
              {obj.openAccountFee}
            </FormItem>
            <FormItem label="列表封面图片上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <p style={{float:'left',marginTop:'30px',marginLeft:'-195px',color: 'brown'}}>(推荐尺寸500*500)</p>
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/product/uploadImage`}
                listType="picture-card"
                withCredentials
                fileList={this.state.fileListDetail}
                beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}
                onChange={f => this.onUpLoadDetailChange(f)}
                onRemove={f => this.onUpLoadDetailRemove(f)}
              >
                {this.state.fileListDetail.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="产品封面图片上传(最多5张)" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <p style={{float:'left',marginTop:'30px',marginLeft:'-195px',color: 'brown'}}>(推荐尺寸750*600)</p>
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
                {this.state.fileList.length >= 5 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            {/*<FormItem label="产品详情图片上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>*/}
              {/*<Upload*/}
                {/*name="pImg"*/}
                {/*action={`${Config.baseURL}/manager/product/uploadImage`}*/}
                {/*listType="picture-card"*/}
                {/*withCredentials*/}
                {/*fileList={this.state.fileListDetail}*/}
                {/*beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}*/}
                {/*onChange={f => this.onUpLoadDetailChange(f)}*/}
                {/*onRemove={f => this.onUpLoadDetailRemove(f)}*/}
              {/*>*/}
              {/*{this.state.fileListDetail.length >= 1 ? null : (*/}
                {/*<div>*/}
                  {/*<Icon type="plus" />*/}
                  {/*<div className="ant-upload-text">选择文件</div>*/}
                {/*</div>*/}
              {/*)}*/}
              {/*</Upload>*/}
            {/*</FormItem>*/}
            <FormItem label="产品封面视频上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <Upload
                name="video"
                action={`${Config.baseURL}/manager/product/uploadImage`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.fileListVideo}
                beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                onChange={f => this.onUpLoadChange(f)}
                onRemove={f => this.onUpLoadRemove(f)}
              >
                {this.state.fileList.length >= 5 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择视频</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="产品详情" {...formItemLayout} labelCol={{ span: 20 }} wrapperCol={{ span: 20}}>
              <div className="demo">
                <BraftEditor {...editorProps} ref={(dom) => this.editor = dom}/>
              </div>
            </FormItem>
            <FormItem label="是否设为推荐" {...formItemLayout}>
              {getFieldDecorator("addnewConditions", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择是否设为推荐" }]
              })(
                <Select placeholder="请选择是否设为推荐">
                  <Option value={0}>否</Option>
                  <Option value={-1}>是</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("addnewSort", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<InputNumber placeholder="请输入排序序号" style={{width:'314px'}}/>)}
            </FormItem>
          </Form>
        </Modal>
        {/* 修改用户模态框 */}
        <Modal
          title="修改用户"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpClose()}
          wrapClassName={"codNum"}
          confirmLoading={this.state.addnewLoading}
          maskClosable={this.state.maskClose}
        >
          <Form>
            <FormItem label="产品类型" {...formItemLayout}>
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select
                  placeholder="请选择产品类型"
                  onChange={e => this.Newproduct(e)}
                >
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={`${item.id}`}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="产品名称" {...formItemLayout}>
              {getFieldDecorator("addnewName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入产品名称" },
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 30) {
                          callback("最多输入80位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input placeholder="请输入产品名称" />)}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {getFieldDecorator("addnewTypeCode", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请选择产品型号" },
                  {
                    validator: (rule, value, callback) => {
                      console.log("value===", value);
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 20) {
                          callback("最多输入20位字符");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(
                <Select placeholder="请选择产品型号">
                  {this.state.productModels
                    .filter(
                      item =>
                        String(item.typeId) ===
                        String(form.getFieldValue("addnewTypeId"))
                    )
                    .map((item, index) => (
                      <Option key={index} value={`${item.id}`}>
                        {this.getNameByModelId(item.id)}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout}>
              {getFieldDecorator("addnewActivityType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择活动方式" }]
              })(
                <Select placeholder="请选择活动方式">
                  <Option value={1}>普通商品</Option>
                  <Option value={2}>活动商品</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="价格" {...formItemLayout}>
              {obj.price}
            </FormItem>
            <FormItem
              label="有效期"
              {...formItemLayout}
              className={
                this.state.code == 1 ||
                this.state.code == 2 ||
                this.state.code == 3
                  ? "hide"
                  : ""
              }
            >
              {obj.date}
            </FormItem>
            <FormItem
              label="运费"
              {...formItemLayout}
              className={
                this.state.code == 1 ||
                this.state.code == 4 ||
                this.state.code == 5
                  ? "hide"
                  : ""
              }
            >
              {obj.shipFee}
            </FormItem>
            <FormItem
              label="开户费"
              {...formItemLayout}
              className={
                this.state.code === 2 ||
                this.state.code === 3 ||
                this.state.code === 4 ||
                this.state.code === 5
                  ? "hide"
                  : ""
              }
            >
              {obj.openAccountFee}
            </FormItem>
            <FormItem label="列表封面图片上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 11 }}>
              <Upload
                name="pImg"
                action={`${Config.baseURL}/manager/product/uploadImage`}
                listType="picture-card"
                withCredentials
                fileList={this.state.fileListDetail}
                beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}
                onChange={f => this.onUpLoadDetailChange(f)}
                onRemove={f => this.onUpLoadDetailRemove(f)}
              >
                {this.state.fileListDetail.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="产品封面图片上传(最多5张)" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 11 }}>
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
                {this.state.fileList.length >= 5 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            {/*<FormItem label="产品详情图片上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 11 }}>*/}
              {/*<Upload*/}
                {/*name="pImg"*/}
                {/*action={`${Config.baseURL}/manager/product/uploadImage`}*/}
                {/*listType="picture-card"*/}
                {/*withCredentials*/}
                {/*fileList={this.state.fileListDetail}*/}
                {/*beforeUpload={(f, fl) => this.onUploadDetailBefore(f, fl)}*/}
                {/*onChange={f => this.onUpLoadDetailChange(f)}*/}
                {/*onRemove={f => this.onUpLoadDetailRemove(f)}*/}
              {/*>*/}
                {/*{this.state.fileListDetail.length >= 8 ? null : (*/}
                {/*<div>*/}
                 {/*<Icon type="plus" />*/}
                 {/*<div className="ant-upload-text">选择文件</div>*/}
                {/*</div>*/}
              {/*)}*/}
              {/*</Upload>*/}
            {/*</FormItem>*/}
            <FormItem label="产品封面视频上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <Upload
                name="video"
                // action={`${Config.baseURL}/manager/product/uploadImage`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.fileListVideo}
                beforeUpload={(f, fl) => this.onUploadBefore(f, fl)}
                onChange={f => this.onUpLoadChange(f)}
                onRemove={f => this.onUpLoadRemove(f)}
              >
                {this.state.fileList.length >= 5 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择视频</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="产品详情" {...formItemLayout} labelCol={{ span: 20 }} wrapperCol={{ span: 23}}>
              <div className="demo">
                <BraftEditor {...editorProps}/>
              </div>
            </FormItem>
            <FormItem label="是否设为推荐" {...formItemLayout}>
              {getFieldDecorator("addnewConditions", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择是否设为推荐" }]
              })(
                <Select placeholder="请选择是否设为推荐">
                  <Option value={0}>否</Option>
                  <Option value={-1}>是</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("addnewSort", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<InputNumber placeholder="请输入排序序号" style={{width:'314px'}}/>)}
            </FormItem>
          </Form>
        </Modal>
        {/* 查看详情模态框 */}
        <Modal
          title="查看详情"
          visible={this.state.queryModalShow}
          onOk={() => this.onQueryModalClose()}
          wrapClassName={"ship"}
          onCancel={() => this.onQueryModalClose()}
        >
          <Form>
            <FormItem label="产品名称" {...formItemLayout} wrapperCol={{ span: 13}}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout}>
              {!!this.state.nowData
                ? this.findProductNameById(this.state.nowData.typeId)
                : ""}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameByModelId(this.state.nowData.typeCode)
                : ""}
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getActivity(this.state.nowData.activityType)
                : ""}
            </FormItem>
            <FormItem label="价格" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.price : ""}
            </FormItem>
            <FormItem
              label="有效期"
              {...formItemLayout}
              className={
                this.state.code == 1 ||
                this.state.code == 2 ||
                this.state.code == 3
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData
                ? this.getNameForInDate(
                    this.state.nowData.timeLimitNum,
                    this.state.nowData.timeLimitType
                  )
                : ""}
            </FormItem>
            <FormItem
              label="运费"
              {...formItemLayout}
              className={
                this.state.code == 4 || this.state.code == 5 ? "hide" : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.shipFee : ""}
            </FormItem>
            <FormItem
              label="开户费"
              {...formItemLayout}
              className={
                this.state.code == 2 ||
                this.state.code == 3 ||
                this.state.code == 4 ||
                this.state.code == 5
                  ? "hide"
                  : ""
              }
            >
              {!!this.state.nowData ? this.state.nowData.openAccountFee : ""}
            </FormItem>
            <FormItem label="产品图片" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.productImg
                ? this.state.nowData.productImg
                    .split(",")
                    .map((item, index) => {
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
            <FormItem label="详情图片" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.detailImg
                ? this.state.nowData.detailImg.split(",").map((item, index) => {
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
              {/*{(!!this.state.nowData && this.state.nowData.detailImg) ? <Popover placement="right" content={<img className="table-img-big" src={this.state.nowData.detailImg} />}><img className="small-img" src={this.state.nowData.detailImg} /></Popover> : ''}*/}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {!!this.state.nowData
                ? this.state.nowData.onShelf
                  ? "已上架"
                  : "未上架"
                : ""}
            </FormItem>
            <FormItem label="是否推荐" {...formItemLayout}>
              {!!this.state.nowData
                ? this.state.nowData.newProduct
                  ? "已推荐"
                  : "未推荐"
                : ""}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {/*{!!this.state.nowData*/}
                  {/*? this.state.nowData.newProduct :''}*/}
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
  actions: P.any,
  form: P.any
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
        findProductByWhere,
        findProductTypeByWhere,
        addProduct,
        updateProductType,
        deleteProduct,
        removeProduct,
        deleteImage,
        findProductModelByWhere,
        upProductModel,
        updateProduct,
        onChange3,
        hasRecommendProductType
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
