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
import {Form, Button, Icon, Input, InputNumber, Table, message, Popconfirm, Popover, Modal, Radio, Tooltip, Select, Upload, Divider,Switch } from "antd";
import "./index.scss";
import BraftEditor from "braft-editor";
import "braft-editor/dist/braft.css";
import tools from "../../../../util/tools";


import NewActivity from "../../../../assets/newactivity.png";

import _ from "lodash";

// ==================
// 本页面所需action
// ==================
import {findProductByWhere,findProductTypeByWhere,addProduct,updateProduct,deleteProduct,removeProduct,deleteImage,
  findProductModelByWhere,hasRecommendProductType,findProductLabel,findActivityType} from "../../../../a_action/shop-action";

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;
class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // 当前页面全部数据
      productTypes: [], // 所有的产品类型
      productModels: [], // 所有的产品型号
      productLabels:[],//所有产品标签
      activitys:[],//所有的活动方式
      productprice: "", //产品的价格
      searchTypeId: undefined, // 搜索 - 类型名
      searchNewProduct:'',//搜索 - 推荐状态
      searchProduct:"",//搜索 - 活动方式
      searchName: "", // 搜索 - 名称
      addOrUp: "add", // 当前操作是新增add还是下线修改up,还是查看look，还是上线修改topup
      modalShow: false, // 模态框是否显示
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0, // 数据库总共多少条数据
      code: undefined, // 当前选择的产品 - 产品类型所对应的code值
      loading: false, // 正在获取列表数据、修改、新增数据
      fileList: [], // 产品图片已上传的列表
      fileListDetail: [], // 列表封面图片已上传的列表
      fileProgram: [],  // 小程序产品详情图的列表
      formCoverVideo: [],  // 表单 - 当前数据的封面视频
      fileLoading: false, // 产品图片正在上传
      fileDetailLoading: false, // 列表封面图片正在上传
      fileProgramLoading: false, // 小程序产品详情图片正在上传
      fileVideoLoading: false,  // 视频上传中
      temp:[],
      sorts:'',
    };
    this.editor = null; // 这是新增时候的那个编辑器
  }

  componentDidMount() {
    this.getAllProductType(); // 获取所有的产品类型
    this.getAllProductModel(); // 获取所有的产品型号
    this.getAllProductLabel();//获取所有产品标签
    this.getActivityType();//获取所有的活动方式
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      onShelf: this.state.searchName,//产品状态
      productType: this.state.searchTypeId,//产品类型
      newProduct:this.state.searchNewProduct,//推荐查询
      activityType:this.state.searchProduct,//活动方式
    };
    this.props.actions.findProductByWhere(tools.clearNull(params)).then(res => {
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
    });
  }

  // 获取所有的产品类型，当前页要用
  getAllProductType() {
    this.props.actions
      .findProductTypeByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productTypes: res.data.result
          });
        }
      });
  }

  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductModelByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        console.log("这个有东西么:", res.data.modelList.result);
        if (res.status === "0") {
          this.setState({
            productModels: res.data.modelList.result
          });
        }
      });
  }
  
  // 获取所有产品标签，当前页要用
  getAllProductLabel() {
    this.props.actions
      .findProductLabel({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        console.log("有东西么:", res.data);
        if (res.status === "0") {
          this.setState({
            productLabels: res.data || []
          });
        }
      });
  }
  
  //获取所有的活动方式，添加产品时可用
  getActivityType(){
    this.props.actions.findActivityType({pageNum:0,pageSize:9999})
      .then(res=>{
        console.log('拿到所有活动方式：',res.data)
        if(res.status === "0"){
          this.setState({
            activitys:res.data.result || []
          })
        }
      })
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
  
  // 工具 - 根据活动方式ID获取活动方式名称
  getActivityId(dicCode) {
    const t = this.state.activitys.find(
      item => String(item.dicCode) === String(dicCode)
    );
    return t ? t.dicValue : "";
  }

  // 工具 - 根据有效期type获取有效期名称
  getNameForInDate(time, type) {
    switch (String(type)) {
      case "0": return "长期有效";
      case "1": return `${time}天`;
      case "2": return `${time}月`;
      case "3": return `${time}年`;
      default: return "";
    }
  }

  //工具 - 根据活动类型id获取活动名称
  getActivity(id) {
    switch (String(id)) {
      case "1": return "普通产品";
      case "2": return "活动产品";
      default: return "";
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
  
  //搜索 - 推荐状态输入框值改变时触发
  searchNewProduct(e){
    this.setState({
      searchNewProduct: e
    });
  }
  
  //搜索 - 活动方式输入框值改变时触发
  searchProduct(e){
    this.setState({
      searchProduct: e
    });
  }

  // 删除某一条数据
  onRemoveClick(id) {
    this.props.actions.removeProduct({ id: id }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
    });
  }

  // 搜索
  onSearch() {
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  /**
   * 模态框出现
   * @type: look-查看，add新增，up下线修改，topup上线修改，
   * @record: 当前选择的数据行
   * **/
  onModalShow(type, record) {
    const { form } = this.props;
    this.setState({
      addOrUp: type,
      modalShow: true,
    });

    if (type === "add") {
      form.resetFields();
      setTimeout(()=> { // 产品详情内容
        console.log('EDITOR:', this.editor);
        this.editor && this.editor.clear();
      });
      this.setState({
        fileList: [],
        fileProgram:[],
        fileListDetail: [],
        formCoverVideo: [],
        nowData: null,
        code: undefined,
      });
    } else if (type==="up" || type==="look" || type==="topup") {
      form.setFieldsValue({
        formName: record.name,// 产品名称
        formTypeId: String(record.typeId),// 产品类型ID
        formTypeCode: String(record.typeCode),// 产品型号ID
        formActivityType: String(record.activityType),// 活动方式ID
        formConditions: record.newProduct ? 0 : 1,// 是否是推荐
        formSort: record.sorts,// 排序
        formTypeLabel:record.productTagList ? record.productTagList.map((item)=>{return String(item.tagCode)}) : undefined,//产品标签
      });
      setTimeout(()=> { // 产品详情内容
        console.log('详细内容：', record.productDetail);
        this.editor && record.productDetail && this.editor.setContent(record.productDetail);
      }, 16);
      this.setState({
        nowData: record,
        code: record.typeId,
        fileProgram:record.miniDetailImg ? record.miniDetailImg.split(",").map((item,index) => ({ uid: index, url :item, status: "done"})) : [],//小程序封面图上传列表
        fileListDetail: record.detailImg ? record.detailImg.split(",").map((item, index) => ({ uid: index, url: item, status: "done" })) : [], // 列表封面图片已上传的列表
        fileList: record.productImg ? record.productImg.split(",").map((item, index) => ({ uid: index, url: item, status: "done" })): [], // 产品封面图片已上传的列表
        formCoverVideo: record.coverVideo ? record.coverVideo.split(",").map((item, index) => ({ uid: index, url: item, status: "done" })): [], // 封面视频
      });
    }
  }

  /** 上架 **/
  onUpdateClick2(record) {
    const params = {
      id: record.id,
      name: record.name,
      price: record.price,
      typeId: Number(record.typeId),
      typeCode: record.typeCode,
      saleMode: Number(record.saleMode),
      marketPrice: record.marketPrice,
      // onShelf: record.onShelf ? 1 : 0,
      onShelf: 1,
      productImg: record.productImg,
      detailImg: record.detailImg,
      activityType: record.activityType
    };

    this.props.actions
      .deleteProduct(params)
      .then(res => {
        if (res.status === "0") {
          message.success(res.message || "修改成功");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  /** 下架 **/
  onUpdateClick4(record) {
    const params = {
      id: record.id,
      name: record.name,
      price: record.price,
      typeId: Number(record.typeId),
      typeCode: record.typeCode,
      saleMode: Number(record.saleMode),
      marketPrice: record.marketPrice,
      // onShelf: record.onShelf ? 1 : 0,
      onShelf: 0,
      productImg: record.productImg,
      detailImg: record.detailImg,
      activityType: record.activityType
    };

    this.props.actions
      .deleteProduct(params)
      .then(res => {
        if (res.status === "0") {
          message.success("上架成功！");
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }

  /** 推荐或者不推荐 **/
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
  
  //修改排序要传进来的值
  UpdateSorts(e) {
    console.log('排序序号',e)
    this.setState({
      sorts: e
    });
  }

  // 查看、添加或修改确定
  onModalOk() {
    // 查看，直接关闭
    if (this.state.addOrUp === 'look'){
      this.onModalClose();
      return;
    }
    const me = this;
    const { form } = me.props;
    if (me.state.fileLoading || me.state.fileDetailLoading || me.state.fileProgramLoading) {
      message.warning("有图片正在上传...");
      return;
    }
    form.validateFields([
        "formName", // 产品名称
        "formTypeId", // 产品类型ID
        "formTypeCode", // 产品型号ID
        "formTypeLabel", // 产品标签ID
        "formActivityType", // 活动方式ID
        "formConditions", // 是否是推荐ID
        "formSort",  // 排序
        "price",//价格
    ],(err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          loading: true
        });

        const params = {
          name: values.formName, // 产品名称
          typeId: Number(values.formTypeId), // 产品类型ID
          typeCode: Number(values.formTypeCode), // 产品型号ID
          productTag: values.formTypeLabel ? String(values.formTypeLabel) : '', // 产品标签ID
          activityType: values.formActivityType, // 活动方式ID
          productImg: this.state.fileList.map(item => item.url).join(","), // 产品封面图片们
          detailImg: this.state.fileListDetail.map(item => item.url).join(","), // 列表封面图片们
          miniDetailImg : this.state.fileProgram.map(item => item.url).join(","),//小程序列表封面图
          productDetail: this.editor.getHTMLContent(), // 详情图片们
          coverVideo: this.state.formCoverVideo.map(item => item.url).join(","), // 视频
          conditions: values.formConditions, // 是否是推荐
          sorts: values.formSort, // 排序
          // price:this.state.temp.price,//价格
        };
        if (this.state.addOrUp === "add") {
          // 新增
          params.onShelf = 0;
          me.props.actions.addProduct(tools.clearNull(params)).then(res => {
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onModalClose();
            if (res.status === "0") {
              message.success(res.message || "修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              me.setState({
                loading: false
              });
            } else {
              message.error(res.message || "修改失败，请重试");
              me.setState({
                loading: false
              });
            }
          })
        } else { // 修改
          params.id = this.state.nowData.id;
          params.onShelf = this.state.nowData.onShelf;
          me.props.actions.updateProduct(params).then(res => {
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onModalClose();
            if (res.status === "0") {
              message.success(res.message || "修改成功");
              this.onGetData(this.state.pageNum, this.state.pageSize);
              me.setState({
                loading: false
              });
            } else {
              message.error(res.message || "修改失败，请重试");
              me.setState({
                loading: false
              });
            }
          })
        }
      }
    );
  }

  // 关闭模态框
  onModalClose() {
    this.setState({
      modalShow: false
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
      path: `${temp.join("/")}${fileName}`,
      // fileName
    };
    console.log("删除后的是啥？", temp.join("/"), fileName);
    this.props.actions.deleteImage(params);
  }

  /**
   * 产品图片 上传相关 3个方法
   * 1.上传前的校验
   * 2.上传中
   * 3.删除某 个已上传的图片
   * **/
  //产品封面图片上传 - 上传中、上传成功、上传失败的回调
  onUploadBefore(f) {
    console.log('触发了没：', f)
    if(this.state.addOrUp === 'look'){
      return false;
    }
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
  
  // 产品封面图片上传 - 上传中、成功、失败
  onUpLoadChange(obj) {
    console.log('触发这个啊：', obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.data) {
        const list = _.cloneDeep(this.state.fileList);
        const t = list.find(item => item.uid === obj.file.uid);
        console.log('list是什么aaa：',list)
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
  
  // 产品封面图片上传 - 删除
  onUpLoadRemove(f) {
    if(this.state.addOrUp === 'look'){
      return false;
    }
    const list = _.cloneDeep(this.state.fileList);
    this.setState({
      fileList: list.filter(item => item.uid !== f.uid)
    });
  }

  /**
   * 产品图片 上传相关 3个方法
   * 1.上传前的校验
   * 2.上传中
   * 3.删除某 个已上传的图片
   * **/
  // 列表封面图片 - 上传前
  onUploadDetailBefore(f) {
    console.log('触发了没：', f)
    if(this.state.addOrUp === 'look'){
      return false;
    }
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
    console.log('触发这个啊：', obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.data) {
        const list = _.cloneDeep(this.state.fileListDetail);
        const t = list.find(item => item.uid === obj.file.uid);
        console.log('list是什么aaa：',list)
        t.url = obj.file.response.data;
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
        fileDetailLoading: false
      });
      message.error("图片上传失败");
    }
  }

  // 列表封面图片 - 删除
  onUpLoadDetailRemove(f) {
    if(this.state.addOrUp === 'look'){
      return false;
    }
    const list = _.cloneDeep(this.state.fileListDetail);
    this.setState({
      fileListDetail: list.filter(item => item.uid !== f.uid)
    });
  }
  
  /**
   * 小程序列表封面图 上传相关 3个方法
   * 1.上传前的校验
   * 2.上传中
   * 3.删除某 个已上传的图片
   * **/
  // 小程序产品详情图 - 上传前
  onUploadProgramBefore(f) {
    console.log('触发了没：', f)
    if(this.state.addOrUp === 'look'){
      return false;
    }
    if (
      ["jpg", "jpeg", "png", "bmp", "gif"].indexOf(f.type.split("/")[1]) < 0
    ) {
      message.error("只能上传jpg、jpeg、png、bmp、gif格式的图片");
      return false;
    } else {
      const newList = _.cloneDeep(this.state.fileProgram);
      newList.push(f);
      this.setState({
        fileProgram: newList
      });
      return true;
    }
  }
  
  // 小程序产品详情图 - 上传中、成功、失败
  onUpLoadProgramChange(obj) {
    console.log('触发这个啊：', obj);
    if (obj.file.status === "done") {
      // 上传成功后调用,将新的地址加进原list
      if (obj.file.response.data) {
        const list = _.cloneDeep(this.state.fileProgram);
        const t = list.find(item => item.uid === obj.file.uid);
        console.log('list是什么aaa：',list)
        t.url = obj.file.response.data;
        this.setState({
          fileProgram: list,
          fileProgramLoading: false
        });
      } else {
        const list = _.cloneDeep(this.state.fileProgram);
        this.setState({
          fileProgram: list.filter(item => item.uid !== obj.file.uid),
          fileProgramLoading: false
        });
      }
    } else if (obj.file.status === "uploading") {
      this.setState({
        fileProgramLoading: true
      });
    } else if (obj.file.status === "error") {
      const list = _.cloneDeep(this.state.fileProgram);
      this.setState({
        fileProgram: list.filter(item => item.uid !== obj.file.uid),
        fileProgramLoading: false
      });
      message.error("图片上传失败");
    }
  }
  
  // 小程序产品详情图 - 删除
  onUpLoadProgramRemove(f) {
    if(this.state.addOrUp === 'look'){
      return false;
    }
    const list = _.cloneDeep(this.state.fileProgram);
    this.setState({
      fileProgram: list.filter(item => item.uid !== f.uid)
    });
  }

    /**
     * 产品视频 上传相关 3个方法
     * 1.上传前的校验
     * 2.上传中
     * 3.删除某 个已上传的图片
     * **/
    // 产品视频 - 上传前
    onUploadVideoBefore(f, fl) {
      if(this.state.addOrUp === 'look'){
        return false;
      }
      if (
          ["mp4", "wma", "avi", "rmvb"].indexOf(f.type.split("/")[1]) < 0
      ) {
        message.error("只能上传mp4、wma、avi、rmvb格式的视频");
        return false;
      } else {
          const newList = _.cloneDeep(this.state.formCoverVideo);
          newList.push(f);
          this.setState({
              formCoverVideo: newList
          });
          return true;
      }
    }

    // 产品视频 - 上传中、上传成功、上传失败的回调
    onUpLoadVideoChange(obj) {
      if (obj.file.status === "done") {
        // 上传成功后调用,将新的地址加进原list
        if (obj.file.response.data) {
          const list = [...this.state.formCoverVideo];
          const t = list.find(item => item.uid === obj.file.uid);
          t.url = obj.file.response.data;
          this.setState({
            formCoverVideo: list,
            fileVideoLoading: false
          });
        } else {
          const list = [...this.state.formCoverVideo];
          this.setState({
            formCoverVideo: list.filter(item => item.uid !== obj.file.uid),
            fileVideoLoading: false
          });
          message.error("视频上传失败");
        }
        } else if (obj.file.status === "uploading") {
            this.setState({
                fileVideoLoading: true
            });
        } else if (obj.file.status === "error") {
            const list = [...this.state.formCoverVideo];
            this.setState({
                formCoverVideo: list.filter(item => item.uid !== obj.file.uid),
                fileVideoLoading: false
            });
            message.error("视频上传失败");
        }
    }

    // 产品视频 - 删除
    onUpLoadVideoRemove(f) {
      if(this.state.addOrUp === 'look'){
        return false;
      }
      const list = [...this.state.formCoverVideo];
      this.setState({
        formCoverVideo: list.filter(item => item.uid !== f.uid)
      });
    }

  //根据code值不同显示的字段不同
  Newproduct(e) {
    this.setState({
      code: e
    });
    console.log("code的数值是：", e);
    //产品类型改变时，重置产品型号的值位undefined
    const { form } = this.props;
    form.resetFields(["formTypeCode"]);
    form.resetFields(["formTypeLabel"]); //产品标签的值也为undefined
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
  
  //修改排序序号的请求
  onModalUpdateOk(record) {
    console.log('排序序号有么',record.sorts)
    const params = {
      id: record.id,
      sorts:this.state.sorts,
      name:record.name,
      price:record.price,
      typeId:record.typeId,
      typeCode:record.typeCode,
      activityType:record.activityType,
    };
    this.props.actions.updateProduct(params).then(res => {
        if (res.status === "0") {
          message.success("修改成功", 1);
          this.onGetData(this.state.pageNum, this.state.pageSize);
        } else {
          message.error(res.message || "修改失败，请重试");
        }
      })
      .catch(() => {
        message.error("修改失败");
      });
  }
  
  // 构建字段
  makeColumns() {
    const columns = [
      {
        title: "序号",
        dataIndex: "serial",
        key: "serial",
        width: 80
      },
      {
        title:'列表缩略图',
        dataIndex: "detailImg",
        key: "detailImg",
        width: 100,
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
        title: "封面缩略图",
        dataIndex: "productImg",
        key: "productImg",
        width: 100,
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
        key: "name",
        width:300,
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
        render: text => this.getActivityId(text)
      },
      {
        title: "产品状态 ",
        dataIndex: "onShelf",
        key: "onShelf",
        render: (text,record) =>
          record.onShelf == 1 ? (
              <Switch onClick={() => this.onUpdateClick2(record)} checkedChildren="已上架" size="small" defaultChecked checked={Boolean(record.onShelf) == true ? true : false}/>
          ):(
              <Switch onClick={() => this.onUpdateClick4(record)} size="small" checked={Boolean(record.onShelf) == true ? true : false}/>
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
        dataIndex:'sorts',
        key:'sorts',
        render:(text, record) => {
          const sorts = [];
          sorts.push(
            <Popconfirm
              title={
                <div style={{height:'25px'}}>
                  <InputNumber
                    placeholder="修改排序序号"
                    onChange={e => this.UpdateSorts(e)}
                    style={{width:'120px'}}
                    min={0} max={15}
                  />
                </div>
              }
              trigger="click"
              placement="bottomLeft"
              onCancel={() => this.onModalClose()}
              onConfirm={() => this.onModalUpdateOk(record)}
            >
              <span key="1">
                <Tooltip placement="top" title="修改排序">
                 {record.sorts}<Icon type="edit" />
                </Tooltip>
              </span>
            </Popconfirm>
          );
          return sorts;
        }
      },
      {
        title:'操作',
        key: "control",
        width: 270,
        render: (text, record) => {
          const controls = [];
          !record.newProduct &&
            controls.push(
              <span
                key="5"
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
                key="6"
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
              key="7"
              className="control-btn green"
              onClick={() => this.onModalShow("look", record)}
            >
              <Tooltip placement="top" title="详情">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          record.onShelf == 0 &&
          controls.push(
            <span
              key="8"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
              </Tooltip>
            </span>
          );
          record.onShelf == 1 &&
          controls.push(
            <span
              key="9"
              className="control-btn blue"
              onClick={() => this.onModalShow("topup", record)}
            >
              <Tooltip placement="top" title="编辑">
                <Icon type="edit" />
              </Tooltip>
            </span>
          );
          !record.onShelf &&
            controls.push(
              <Popconfirm
                key="10"
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
        name: item.name,    // 产品名字
        typeCode: item.typeCode,    // 产品类型ID
        amount: item.amount,    // 库存
        buyCount: item.buyCount,    // 总共卖出了多少
        createTime: item.createTime,    // 创建时间
        creator: item.creator,  // 创建人
        detailImg: item.detailImg,  // 列表图片src
        productImg: item.productImg,//产品图片
        miniDetailImg:item.miniDetailImg,//小程序img
        itemNum: item.itemNum,  // 不知道什么东西
        newProduct: item.newProduct,    // 
        offShelfTime: item.offShelfTime,
        onShelf: item.onShelf,  // 上架状态
        onShelfTime: item.onShelfTime,  // 上架时间
        productTag:item.productTag,//产品标签
        productTagList:item.productTagList,
        tagCode:item.tagCode,
        price: item.productModel ? item.productModel.price : "",
        sorts:item.sorts,
        productDetail: item.productDetail,
        saleMode: item.saleMode,
        typeId: item.typeId,
        updateTime: item.updateTime,
        updater: item.updater,
        control: item.id,
        activityType: item.activityType,
        coverVideo:item.coverVideo,//封面视频
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
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 22 },
        sm: { span: 16 }
      }
    };
    const formItemLayout1 = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 22 },
        sm: { span: 12 }
      }
    };
    const modelId = form.getFieldValue("formTypeCode");
    const obj = this.onSelectModels(modelId);

    const editorProps = {
      height: 400,
      contentFormat: 'html',    // 内容格式HTML
      pasteMode: 'text',      // 粘贴只粘贴文本
      media: {                // 多媒体配置
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
                    <Option key={index} value={item.id}>{item.name}</Option>
                  );
                })}
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>是否设为推荐</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "120px", marginRight: "25px" }}
                onChange={e => this.searchNewProduct(e)}
              >
                <Option value={1}>已推荐</Option>
                <Option value={0}>未推荐</Option>
              </Select>
            </li>
            <li>
              <span style={{ marginRight: "10px" }}>活动方式</span>
              <Select
                allowClear
                placeholder="全部"
                style={{ width: "120px", marginRight: "25px" }}
                onChange={e => this.searchProduct(e)}
              >
                {this.state.activitys.map((item, index) => {
                  return (
                    <Option key={index} value={item.dicCode}>{item.dicValue}</Option>
                  );
                })}
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
              <Button type="primary" onClick={() => this.onModalShow('add')}><Icon type="plus-circle-o" />添加产品</Button>
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
        {/* 添加、修改、查看模态框 */}
        <Modal
          title={this.state.addOrUp === 'look' ? '查看' : (this.state.addOrUp === 'add' ? '新增' : '修改')}
          visible={this.state.modalShow}
          onOk={() => this.onModalOk()}
          onCancel={() => this.onModalClose()}
          width={620}
          wrapClassName={"codNum"}
          confirmLoading={this.state.loading}
          maskClosable={false}
        >
          <Form style={{marginLeft:'10px'}}>
            <FormItem label="产品名称" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formName", {
                initialValue: undefined,
                rules: [
                  { required: true, message: "请输入产品名称"},
                  {
                    validator: (rule, value, callback) => {
                      const v = tools.trim(value);
                      if (v) {
                        if (v.length > 100) {
                          callback("最多输入100个字");
                        }
                      }
                      callback();
                    }
                  }
                ]
              })(<Input disabled={this.state.addOrUp === "look" || this.state.addOrUp === "topup"} placeholder="请输入产品名称" />)}
            </FormItem>
            <FormItem label="产品类型" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品类型" }]
              })(
                <Select
                  placeholder="请选择产品类型"
                  onChange={e => this.Newproduct(e)}
                  disabled={this.state.addOrUp === "look" || this.state.addOrUp === "topup"}
                >
                  {this.state.productTypes.map((item, index) => (
                    <Option key={index} value={String(item.id)}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="二级分类标签" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formTypeLabel", {
                initialValue: undefined,
              })(
                <Select disabled={this.state.addOrUp === "look" || this.state.addOrUp === "topup"} mode="multiple" placeholder="请选择产品标签">
                  {(() => {
                    const id = String(form.getFieldValue("formTypeId"));
                    return this.state.productLabels.filter(item => String(item.code) === id).map((item, index) => (
                    (item.productTagList).map((item) =>
                      <Option key={index} value={String(item.id)}>
                        {item.tagName}
                      </Option>
                      )
                    ))
                  })()
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="产品型号" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formTypeCode", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择产品型号" }]
              })(
                <Select disabled={this.state.addOrUp === "look" || this.state.addOrUp === "topup"} placeholder="请选择产品型号">
                  {(() => {
                    const id = String(form.getFieldValue("formTypeId"));
                    console.log('走到哪了',id)
                    return this.state.productModels.filter(item => String(item.typeId) === id).map((item, index) => (
                    <Option key={index} value={String(item.id)}>
                      {item.name}
                    </Option>
                    ))
                  })()
                }
                </Select>
              )}
            </FormItem>
            <FormItem label="活动方式" {...formItemLayout} labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator("formActivityType", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择活动方式" }]
              })(
                <Select disabled={this.state.addOrUp === "look" || this.state.addOrUp === "topup"} placeholder="请选择活动方式">
                  {this.state.activitys.map((item, index) => (
                    <Option key={index} value={String(item.dicCode)}>
                      {item.dicValue}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem label="价格" {...formItemLayout}>
              {obj.price}
            </FormItem>
            <FormItem
              label="有效期"
              {...formItemLayout}
              className={this.state.code === 1 || this.state.code === 2 || this.state.code === 3 ? "show" : ""}
            >
              {obj.date}
            </FormItem>
            <FormItem
              label="计费方式"
              {...formItemLayout}
              className={this.state.code === 2 || this.state.code === 3 || this.state.code === 4 || this.state.code === 5 ? "hide" : ""}
            >
              {obj.charges}
            </FormItem>
            <FormItem
              label="运费"
              {...formItemLayout}
              className={this.state.code === 1 || this.state.code === 4 || this.state.code === 5 ? "hide" : "" }
            >
              {obj.shipFee}
            </FormItem>
            <FormItem
              label="开户费"
              {...formItemLayout}
              className={this.state.code === 2 || this.state.code === 3 || this.state.code === 4 || this.state.code === 5 ? "hide" : ""}
            >
              {obj.openAccountFee}
            </FormItem>
            <FormItem label="列表封面图片上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <p style={{float:'left',marginTop:'30px',marginLeft:'-195px',color: '#F92A19'}}>(推荐尺寸500*500)</p>
              {getFieldDecorator("upIcon1", {
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
                >
                  {this.state.fileListDetail.length >= 1 ? null : (
                    <div>
                      <Icon type="plus" />
                      <div className="ant-upload-text">选择文件</div>
                    </div>
                  )}
                </Upload>
            )}
            </FormItem>
            <FormItem label="产品封面图片上传(最多5张)" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <p style={{float:'left',marginTop:'30px',marginLeft:'-195px',color: '#F92A19'}}>(推荐尺寸750*600)</p>
              {getFieldDecorator("upIcon2", {
              })(
                <Upload
                  name="pImg"
                  disabled={this.state.addOrUp === "look"}
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
              )}
            </FormItem>
            <FormItem label="产品封面视频上传" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <Upload
                name="pImg"
                disabled={this.state.addOrUp === "look"}
                action={`${Config.baseURL}/manager/product/uploadVideo`}
                listType="picture-card"
                withCredentials={true}
                fileList={this.state.formCoverVideo}
                beforeUpload={(f, fl) => this.onUploadVideoBefore(f, fl)}
                onChange={f => this.onUpLoadVideoChange(f)}
                onRemove={f => this.onUpLoadVideoRemove(f)}
              >
                {this.state.formCoverVideo.length >= 1 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择视频</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="小程序产品详情图" {...formItemLayout} labelCol={{ span: 10 }} wrapperCol={{ span: 12 }}>
              <p style={{float:'left',marginTop:'30px',marginLeft:'-195px',color: '#F92A19'}}>(推荐尺寸750)</p>
              {getFieldDecorator("upIcon3", {
                rules: [{ required: true}]
              })(
                <Upload
                  name="pImg"
                  disabled={this.state.addOrUp === "look"}
                  action={`${Config.baseURL}/manager/product/uploadImage`}
                  listType="picture-card"
                  withCredentials={true}
                  fileList={this.state.fileProgram}
                  beforeUpload={(f, fl) => this.onUploadProgramBefore(f, fl)}
                  onChange={f => this.onUpLoadProgramChange(f)}
                  onRemove={f => this.onUpLoadProgramRemove(f)}
                >
                  {this.state.fileProgram.length >= 10 ? null : (
                    <div>
                      <Icon type="plus" />
                      <div className="ant-upload-text">选择文件</div>
                    </div>
                  )}
                </Upload>
              )}
            </FormItem>
            <FormItem label="产品详情" labelCol={{ span: 24 }} wrapperCol={{ span: 24}}>
              <BraftEditor {...editorProps} ref={(dom) => this.editor = dom}/>
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("formSort", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<InputNumber disabled={this.state.addOrUp === "look"} placeholder="请输入排序序号" style={{width:'314px'}}/>)}
            </FormItem>
            {/*<FormItem label="是否展示当前商品为新品" {...formItemLayout1}>*/}
              {/*{getFieldDecorator("formNew", {*/}
                {/*initialValue: undefined,*/}
                {/*rules: [{ required: true, message: "请选择是否展示当前商品为新品"}]*/}
              {/*})(*/}
                {/*<Select placeholder="请选择是否展示当前商品为新品">*/}
                  {/*<Option value={1}>是</Option>*/}
                  {/*<Option value={0}>否</Option>*/}
                {/*</Select>*/}
              {/*)}*/}
            {/*</FormItem>*/}
            {/*<FormItem label="是否展示当前商品为热销" {...formItemLayout1}>*/}
              {/*{getFieldDecorator("formHot", {*/}
                {/*initialValue: undefined,*/}
                {/*rules: [{ required: true, message: "请选择是否展示当前商品为热销"}]*/}
              {/*})(*/}
                {/*<Select placeholder="请选择是否展示当前商品为热销">*/}
                  {/*<Option value={1}>是</Option>*/}
                  {/*<Option value={0}>否</Option>*/}
                {/*</Select>*/}
              {/*)}*/}
            {/*</FormItem>*/}
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
        deleteProduct,
        removeProduct,
        deleteImage,
        findProductModelByWhere,
        updateProduct,
        findProductLabel,
        hasRecommendProductType,
        findActivityType
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
