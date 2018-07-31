/* Banner 商城管理/内容管理/banner管理 */

// ==================
// 所需的各种插件
// ==================

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import P from "prop-types";
import Config from "../../../../config/config";
import moment from "moment";
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
  DatePicker,
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
  deleteImage,
  onChange,
  onOk,
  advertPositionList,
  findProductModelByWhere,
  findProductTypeByWhere,
  findProductByWhere,
} from "../../../../a_action/shop-action";
import {
  LiveVideo,
  DeleteVideo,
  addCard,
  addLiveType,
  updateLiveType,
  UpdateCard,
  UpdateVideo,
  LiveType,
  allPullVideo
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
      datapull:[],//拉取的东西
      productTypes: [], //所有的产品类型
      productModels:[] ,//所有推荐产品型号
      liveTypes:[], //所有的直播分类
      classifyOne:[],  //所有的一级分类
      titleList: [], // 所有的标题位置
      titles: [], //所有的标题
      searchTitle: "", //搜索 - 频道id
      searchTypeCode: "", //搜索 - 产品类型
      pullliveId:"", //拉取操作/搜索频道id
      nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
      pullnowData:null,//指的是拉取后的数据
      addnewModalShow: false, // 添加模态框是否显示
      upModalShow: false, // 修改模态框是否显示
      searchLiveStatus:'', //搜索 - 一级分类
      searchLiveStatusTwo:'', //搜索 - 二级分类
      searchLabel:'',//搜索 - 标签
      searchRecommend:'',//搜索 - 是否推荐
      searchRelease: "", //搜索 - 是否发布
      upLoading: false, // 是否正在修改用户中
      fileList: [], // 封面图上传的列表
      fileLoading: false, // 缩略图片正在上传
      pageNum: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 0 ,// 数据库总共多少条数据
      addnewTitle:'' ,//拉取标题
      addnewTime:'', //拉取时间
      addnewRecommend:'',//是否推荐
      addnewLabel:'' ,//标签
      addnewClassifyOne:'',//一级分类
      addnewClassifyTwo:'',//二级分类
      addnewProduct:'',//推荐产品
      addnewSorts:'',//排序
      coverImage:'',//封面图片
      watchTimes:'',
      realWatchTimes:'',
      pcUrl:'',
      mobileUrl:'',
    };
  }

  componentDidMount() {
    this.getAllProductModel(); // 获取所有的产品型号
    this.LiveTypeAll(); //所有的直播分类、
    this.onGetData(this.state.pageNum, this.state.pageSize);
  }

  // 查询当前页面所需列表数据
  onGetData(pageNum, pageSize) {
    const params = {
      pageNum,
      pageSize,
      liveTypeId: this.state.searchLiveStatus,  //查询一级分类
      liveTypeSubId: this.state.searchLiveStatusTwo,  //查询二级分类
      liveStatus:this.state.searchLabel,//查询标签
      recommend:this.state.searchRecommend,//是否推荐
      deleteFlag:this.state.searchRelease,//是否发布
      liveId: this.state.searchTitle, //频道id
      productTypeCode: this.state.searchTypeCode,
    };
    this.props.actions.LiveVideo(tools.clearNull(params)).then(res => {
      console.log("返回的什么：", res.data.result);
      if (res.status === '0') {
        this.setState({
          data: res.data.result || [],
          pageNum,
          pageSize,
          // classifyOne:res.data.result[].liveType || '',
          total: res.data.total || []
        });
      } else {
        message.error(res.message || "获取数据失败，请重试");
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
  
  // 获取所有产品型号，当前页要用
  getAllProductModel() {
    this.props.actions
      .findProductByWhere({ pageNum: 0, pageSize: 9999 })
      .then(res => {
        if (res.status === "0") {
          this.setState({
            productModels: res.data.result || []
          });
        }
      });
  }

  //所有的直播分类，当前页可用
  LiveTypeAll(){
    this.props.actions
    .LiveType({ pageNum: 0, pageSize: 9999 })
    .then(res => {
      if (res.status === "0") {
        this.setState({
          liveTypes: res.data.result || []
        });
      }
    });
  }

  //拉取视频
  onPullVideo(record) {
    const params= {
      liveId:this.state.pullliveId
    };
    const form = this.props.form;
    this.props.actions.allPullVideo(tools.clearNull(params)).then(res => {
      console.log('又没有拉取到:',res.data)
      if (res.status === '0') {
        this.setState({
          datapull: res.data || [],
          pcUrl:res.data.pcUrl,
          watchTimes:res.data.watchTimes,
          realWatchTimes:res.data.realWatchTimes,
          mobileUrl:res.data.mobileUrl,
        });
        form.setFieldsValue({
          addnewTitle: res.data.name ? res.data.name : '',
          addnewTime:res.data.createTime ? res.data.createTime : '',
          watchTimes:res.data.watchTimes ? res.data.watchTimes : '',
          addnewLabel:res.data.liveStatus ? res.data.liveStatus : "", //标签
          addnewRecommend:res.data.recommend ? res.data.recommend ? 1 : 0 : '' ,//是否推荐
          addnewSorts:res.data.sorts ? res.data.sorts : '',//排序
          addnewClassifyOne:res.data.liveType ? String(res.data.liveType.id) : '',//一级分类名称
          addnewClassifyTwo:res.data.liveType && res.data.liveType.subList.id ? String(res.data.liveType.subList[0].id) : '',//二级分类名称
          // addnewProduct:res.data.recommendProductList[0].productName,//推荐产品
          realWatchTimes:res.data.realWatchTimes ? res.data.realWatchTimes : '',
          pcUrl:res.data.pcUrl ? res.data.pcUrl : "",
          mobileUrl:res.data.mobileUrl ? res.data.mobileUrl : '',
          coverImage: res.data.coverImage
            ? res.data.coverImage
                .split(",")
                .map((item, index) => ({ uid: index, url: item, status: "done" }))
            : [],
        });
        this.setState({
          fileList: res.data.coverImage
            ? res.data.coverImage
              .split(",")
              .map((item, index) => ({ uid: index, url: item, status: "done" }))
            : [], // 封面图上传的列表
        });
      } 
    });
  }
  
  // 工具 - 根据id返回标签名称
  getNameLiveStatusId(id) {
    switch (String(id)) {
      case "1":
        return "直播中";
      case "2":
        return "回放";
      case "3":
        return "视频";
      case "4":
        return "预告";
      default:
        return "";
    }
  }
  

  //搜索 - 一级分类改变时触发
  searchNameChange(e) {
    this.setState({
      searchLiveStatus: e,
      searchLiveStatusTwo:undefined
    });
    console.log("id的数值是：", e);
  }
  
  //二级分类改变时触发
  searchNameChangeTwo(e){
    this.setState({
      searchLiveStatusTwo:e
    })
  }

  //搜索 - 标题输入框值改变时触发
  searchTitleChange(e) {
    this.setState({
      searchTitle: e.target.value
    });
  }

  // 搜索 - 产品类型输入框值改变时触发
  searchProductType(typeId) {
    this.setState({
      searchTypeCode: typeId
    });
  }
  
  //搜索 - 标签
  searchLabelChange(e){
    this.setState({
      searchLabel:e
    })
  }
  
  //搜索 - 是否推荐
  searchRecommendChange(e){
    this.setState({
      searchRecommend:e
    })
  }
  
  //搜索 - 是否发布
  searchReleaseChange(e){
    this.setState({
      searchRelease:e
    })
  }
  
  //根据id值不同显示的字段不同
  Newproduct(e) {
    this.setState({
      id: e
    });
    console.log("id的数值是：", e);
    //产品类型改变时，重置产品型号的值位undefined
    const { form } = this.props;
    form.resetFields(["addnewClassifyTwo"]);//当一级分类改变时二级分类的值undefined
  }

  // 添加直播发布模态框出现
  onAddNewShow() {
    const me = this;
    const { form } = me.props;
    form.resetFields([
      "addnewLiveId", //添加直播id
      "addnewClassifyOne", // 添加一级分类
      "addnewClassifyTwo", //添加二级分类
      "addnewLabel", //添加标签
      "addnewRecommend", //添加是否推荐
      "addnewSorts", //添加排序的顺序
      "addnewProduct", // 推荐产品
      "addnewTime", //添加拉取的时间
      "addnewTitle",//同步标题
      
    ]);
    this.setState({
      addOrUp: "add",
      fileList: [],
      addnewModalShow: true,
      upModalShow:false,
      nowData: null,
      pullnowData:null,
    });
  }

  // 关闭添加模态框
  onAddNewClose() {
    this.setState({
      addnewModalShow: false
    });
  }
  
  // 关闭修改模态框
  onUpNewClose() {
    this.setState({
      upModalShow: false
    });
  }

  // 添加的确定
  onAddNewOk() {
    const me = this;
    const { form } = me.props;
    if (me.state.fileLoading || me.state.fileDetailLoading) {
      message.warning("有图片正在上传...");
      return;
    }
    form.validateFields(
      [
        "addnewLiveId", //添加直播id
        "addnewClassifyOne", // 添加一级分类
        "addnewClassifyTwo", //添加二级分类
        "addnewLabel", //添加标签
        "addnewRecommend", //添加是否推荐
        "addnewSorts", //添加排序的顺序
        "addnewProduct", // 推荐产品
        "addnewTime", //添加拉取的时间
        "addnewTitle",//同步标题
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          addnewLoading: true
        });
        const params = {
          liveId: Number(values.addnewLiveId), //添加直播id
          liveTypeId: String(values.addnewClassifyOne), //添加一级分类
          liveTypeSubId:values.addnewClassifyTwo,//添加二级分类
          liveStatus: values.addnewLabel, // 添加标签
          recommend: values.addnewRecommend , //添加是否推荐
          sorts: values.addnewSorts, // 添加排序的顺序
          recommendProduct: values.addnewProduct,//推荐产品
          name:values.addnewTitle,// 同步标题
          // updateTime:values.addnewTime,//同步拉取时间
          coverImage: this.state.fileList.map(item => item.url).join(","),
          mobileUrl:this.state.mobileUrl,// 手机播放地址
          pcUrl:this.state.pcUrl,// pc播放地址
          realWatchTimes:this.state.realWatchTimes,// 观看次数(真)
          watchTimes:this.state.watchTimes,// 观看次数(假)
        };
        me.props.actions
          .addLiveType(tools.clearNull(params))   // 新增
          .then(res => {
            if(res.status === '0'){
              me.setState({
                addnewLoading: false
              });
              this.onGetData(1, this.state.pageSize);
              this.onAddNewClose();
              message.success(res.message || '直播上传成功')
            }else{
              message.error(res.message || '直播上传失败')
            }
          })
          .catch(() => {
            me.setState({
              addnewLoading: false
            });
          });
      }
    );
  }

  // 修改某一条数据 模态框出现
  onUpdateClick(record) {
    const me = this;
    const { form } = me.props;
    console.log("是什么：", record);
    form.setFieldsValue({
      UpLiveId: Number(record.liveId),//修改直播id
      UpClassifyOne:String(record.liveTypeId),//修改一级分类
      UpClassifyTwo:String(record.liveTypeSubId),//修改二级分类
      UpLabel: record.liveStatus,// 修改标签
      UpRecommend: record.recommend ? 1 : 0,//修改是否推荐
      UpSorts:record.sorts,
      UpTitle: record.name, //修改标题
      mobileUrl:record.mobileUrl,// 手机播放地址
      pcUrl:record.pcUrl,// pc播放地址
      realWatchTimes:record.realWatchTimes,// 观看次数(真)
      watchTimes:record.watchTimes,// 观看次数(假)
    });
    console.log("是什么：", record);
    me.setState({
      nowData: record,
      pullnowData:record,
      addOrUp: "up",
      upModalShow: true,
      fileList: record.coverImage
        ? record.coverImage
          .split(",")
          .map((item, index) => ({ uid: index, url: item, status: "done" }))
        : [], // 封面图上传的列表
    });
  }
  
  // 确定修改某一条数据
  onUpOk() {
    const me = this;
    const { form } = me.props;
    form.validateFields(
      [
        "UpLiveId", //添加直播id
        "UpClassifyOne", // 添加一级分类
        "UpClassifyTwo", //添加二级分类
        "UpLabel", //添加标签
        "UpRecommend", //添加是否推荐
        "UpSorts", //添加排序的顺序
        "UpProduct", // 推荐产品
        "UpTitle",//同步标题
      ],
      (err, values) => {
        if (err) {
          return false;
        }
        me.setState({
          upLoading: true
        });
      const params = {
        liveId: this.state.nowData.liveId, //直播id
        liveTypeId:values.UpClassifyOne, //分类一
        liveTypeSubId: values.UpClassifyTwo, //分类二
        liveStatus: values.UpLabel, //标签
        recommend: values.UpRecommend, //推荐状态
        sorts: values.UpSorts,//排序
        name: values.UpTitle,//标题名称
        coverImage: this.state.fileList.map(item => item.url).join(","),//封面图片
        mobileUrl:this.state.nowData.mobileUrl,// 手机播放地址
        pcUrl:this.state.nowData.pcUrl,// pc播放地址
        realWatchTimes:this.state.nowData.realWatchTimes,// 观看次数(真)
        watchTimes:this.state.nowData.watchTimes,// 观看次数(假)
      };
      this.props.actions
        .updateLiveType(params)
        .then(res => {
          if (res.status === "0") {
            message.success("修改成功");
            this.onGetData(this.state.pageNum, this.state.pageSize);
            this.onUpClose();
          } else {
            message.error(res.message || "修改失败，请重试");
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
    });
  }

  // 发布或取消发布
  onUpdateClick2(record) {
    const params = {
      liveId: Number(record.liveId)
    };
    this.props.actions
      .UpdateVideo(params)
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
  onRemoveClick(liveId) {
    this.props.actions.DeleteVideo({ liveId: liveId }).then(res => {
      if (res.status === "0") {
        message.success("删除成功");
        this.onGetData(this.state.pageNum, this.state.pageSize);
      } else {
        message.error(res.message || "删除失败，请重试");
      }
    });
  }

  // 封面图 - 上传中、上传成功、上传失败的回调
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

  // 封面图 - 上传前
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

  // 封面图 - 删除一个图片
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

  // 搜索
  onSearch() {
    this.onGetData(1, this.state.pageSize);
  }
  
  
  //Input中的删除按钮所删除的条件
  emitEmpty() {
    this.setState({
      searchTitle: ""
    });
  }
  
  //触发拉取操作 - Id改变时
  pullliveId(e){
    this.setState({
      pullliveId: e.target.value
    });
  }


  //拉取的视频-操作
  onPull(){
    this.onPullVideo(this.state.pageNum, this.state.pageSize)
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
        title: "频道ID",
        dataIndex: 'liveId',
        key: 'liveId',
      },
      {
        title: "标题",
        dataIndex:'name',
        key:'name'
      },
      {
        title: "封面图",
        dataIndex: 'coverImage',
        key: 'coverImage',
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
        title: "拉取时间",
        dataIndex:'createTime',
        key:'createTime'
      },
      {
        title: "一级分类",
        dataIndex:'name2',
        key:'name2',
      },
      {
        title: "二级分类",
        dataIndex:'name3',
        key:'name3'
      },
      {
        title: "标签",
        dataIndex:'liveStatus',
        key:'liveStatus',
        render:text => this.getNameLiveStatusId(text),
      },
      {
        title: "是否推荐",
        dataIndex:'recommend',
        key:'recommend',
        render: text =>
          Boolean(text) === true ? (
            <span style={{ color: "green" }}>已推荐</span>
          ) : (
            <span style={{ color: "red" }}>未推荐</span>
          )
      },
      {
        title: "是否发布",
        dataIndex:'deleteFlag',
        key:'deleteFlag',
        render:(text) =>
          Boolean(text) === true ?(
            <span style={{color:"red"}}>未发布</span>
          ):(
            <span style={{color:"green"}}>已发布</span>
          )
      },
      {
        title: "操作",
        key: "control",
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onQueryClick(record)}
            >
              <Tooltip placement="top" title="查看">
                <Icon type="eye" />
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="1"
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
            <span
              key="2"
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
              key="3"
              className="control-btn red"
              onClick={() => this.onUpdateClick2(record)}
            >
            <Tooltip placement="top" title="回撤">
              <Icon type="logout" />
            </Tooltip>
          </span>
          );
          controls.push(
            <Popconfirm
              key="4"
              title="确定删除吗?"
              onConfirm={() => this.onRemoveClick(record.liveId)}
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
        liveId: item.liveId,
        name: item.name,
        serial: index + 1 + (this.state.pageNum - 1) * this.state.pageSize,
        coverImage: item.coverImage,
        liveStatus: item.liveStatus,
        recommendProductList:item.recommendProductList,
        name2: item.liveType ? item.liveType.name : '', //一级分类
        name3:item.liveType &&  item.liveType.subList[0] ? item.liveType.subList[0].name :'', //二级分类
        createTime: item.createTime,
        titleImage: item.titleImage,
        productTypeName: item.productTypeName,
        contentImage: item.contentImage,
        content: item.content,
        recommend:item.recommend,
        deleteFlag:item.deleteFlag,
        deleteStatus: item.deleteStatus,
        realWatchTimes:item.realWatchTimes,
        watchTimes:item.watchTimes,
        liveTypeId:item.liveType ? item.liveType.id : '',//一级分类id
        liveTypeSubId:item.liveType &&  item.liveType.subList[0] ? item.liveType.subList[0].id :'', //二级分类id
        sorts: item.sorts,
        pcUrl:item.pcUrl,
        mobileUrl:item.mobileUrl,
        realName: item.distributor ? item.distributor.realName : ""
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
          <ul className="search-ul">
            <li>
              <span style={{marginRight:'8px'}}>频道ID</span>
              <Input
                style={{ width:"172px" }}
                suffix={suffix}
                value={searchTitle}
                onChange={e => this.searchTitleChange(e)}
              />
            </li>
            <li>
              <span style={{marginRight:'8px'}}>分类</span>
              <Select
                placeholder="一级分类"
                allowClear
                style={{ width: "172px" ,marginRight:'8px'}}
                value={this.state.searchLiveStatus}
                onChange={e => this.searchNameChange(e)}
              >
                {this.state.liveTypes.map((item, index) => (
                  <Option key={index} value={String(item.id)}>
                    {item.name}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="二级分类"
                allowClear
                style={{ width: "172px" }}
                value={this.state.searchLiveStatusTwo}
                onChange={e => this.searchNameChangeTwo(e)}
              >
                {(() => {
                  const id = String(this.state.searchLiveStatus)
                  return this.state.liveTypes.filter(item => String(item.id) === id).map((item, index) => (
                   (item.subList).map((item) =>
                     <Option key={index} value={String(item.id)}>
                      {item.name}
                     </Option>
                    )
                  ))
                })()}
              </Select>
            </li>
            <li>
              <span style={{marginRight:'8px'}}>标签</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchLabelChange(e)}
              >
                <Option value={1}>直播中</Option>
                <Option value={2}>回放</Option>
                <Option value={3}>视频</Option>
                <Option value={4}>预告</Option>
              </Select>
            </li>
            <li>
              <span style={{marginRight:'8px'}}>是否推荐</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchRecommendChange(e)}
              >
                <Option value={1}>已推荐</Option>
                <Option value={0}>未推荐</Option>
              </Select>
            </li>
            <li>
              <span style={{marginRight:'8px'}}>是否发布</span>
              <Select
                placeholder="全部"
                allowClear
                style={{ width: "172px" }}
                onChange={e => this.searchReleaseChange(e)}
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
                  直播发布
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
        {/* 添加模态框 */}
        <Modal
          title="直播发布"
          visible={this.state.addnewModalShow}
          onOk={() => this.onAddNewOk()}
          onCancel={() => this.onAddNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="频道ID" {...formItemLayout}>
              {getFieldDecorator("addnewLiveId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请添写频道ID" }]
              })(
                <Input placeholder="请添写频道ID" onChange={e => this.pullliveId(e)} style={{width:'180px',marginRight:'15px'}}/>
              )}
              {getFieldDecorator("addnewTypeId", {
                initialValue: undefined,
                rules: [{ required: true, message: "请添写频道ID" }]
              })(
                <Button
                  type="primary"
                  onClick={() => this.onPull()}  // 拉取可以拉取到标题、封面图、拉取时间
                >
                  拉取
                </Button>
              )}
            </FormItem>
            <FormItem label="分类" {...formItemLayout}>
              {getFieldDecorator("addnewClassifyOne", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择一级分类" }]
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择一级分类"
                  onChange={e => this.Newproduct(e)}
                >
                  {this.state.liveTypes.map((item, index) => (
                    <Option key={index} value={String(item.id)}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
              {this.state.addnewClassifyOne ? this.state.addnewClassifyOne : ''}
              {getFieldDecorator("addnewClassifyTwo", {
                initialValue: undefined,
                rules: [{ message: "请选择二级分类" }]
              })(
                <Select placeholder="请选择二级分类">
                  {(() => {
                    const id = String(form.getFieldValue("addnewClassifyOne"));
                    return this.state.liveTypes.filter(item => String(item.id) === id).map((item, index) => (
                      (item.subList).map((item) =>
                        <Option key={index} value={String(item.id)}>
                          {item.name}
                        </Option>
                      )
                    ))
                  })()
                  }
                </Select>
              )}
              {this.state.addnewClassifyTwo ? this.state.addnewClassifyTwo : ''}
            </FormItem>
            <FormItem label="标签" {...formItemLayout}>
              {getFieldDecorator("addnewLabel", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择标签" }]
              })(
                <Select placeholder="请选择标签">
                  <Option value={1}>直播中</Option>
                  <Option value={2}>回放</Option>
                  <Option value={3}>视频</Option>
                  <Option value={4}>预告</Option>
                </Select>
              )}
              {this.state.addnewLabel ? this.state.addnewLabel : ''}
            </FormItem>
            <FormItem label="是否推荐" {...formItemLayout}>
              {getFieldDecorator("addnewRecommend", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择是否推荐" }]
              })(
                <Select placeholder="请选择标签">
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </Select>
              )}
              {this.state.addnewRecommend ? this.state.addnewRecommend : ''}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("addnewSorts", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<InputNumber placeholder="请输入排序序号" style={{width:'314px'}}/>)}
              {this.state.addnewSorts ? this.state.addnewSorts : ''}
            </FormItem>
            <FormItem label="推荐产品" {...formItemLayout}>
              {getFieldDecorator('addnewProduct',{
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
              {this.state.addnewProduct ? this.state.addnewProduct : ''}
            </FormItem>
            <FormItem label="标题" {...formItemLayout}>
              {getFieldDecorator("addnewTitle", {
                initialValue: undefined,
                rules: [{ message: "请添写标题名称" }]
              })(<Input placeholder="请添写标题名称" />)}
              {this.state.liveId ? this.state.addnewTitle : ''}
            </FormItem>
            <FormItem label="封面图片上传" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 11 }}>
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
                {this.state.fileList.length >= 3 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
            </FormItem>
            <FormItem label="拉取时间" {...formItemLayout}>
              {getFieldDecorator("addnewTime", {
                initialValue: undefined,
                rules: [{ message: "请添写拉取时间" }]
              })(<Input placeholder="请添写拉取时间" />)}
              {this.state.addnewTime ? this.state.addnewTime : ''}
            </FormItem>
          </Form>
        </Modal>
        {/* 编辑模态框 */}
        <Modal
          title="修改直播发布"
          visible={this.state.upModalShow}
          onOk={() => this.onUpOk()}
          onCancel={() => this.onUpNewClose()}
          confirmLoading={this.state.addnewLoading}
        >
          <Form>
            <FormItem label="频道ID" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.liveId : ''}
            </FormItem>
            <FormItem label="分类" {...formItemLayout}>
              {getFieldDecorator("UpClassifyOne", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择一级分类" }]
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择一级分类"
                  onChange={e => this.Newproduct(e)}
                >
                  {this.state.liveTypes.map((item, index) => (
                    <Option key={index} value={String(item.id)}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
              {this.state.addnewClassifyOne ? this.state.addnewClassifyOne : ''}
              {getFieldDecorator("UpClassifyTwo", {
                initialValue: undefined,
                rules: [{ message: "请选择二级分类" }]
              })(
                <Select placeholder="请选择二级分类">
                  {(() => {
                    const id = String(form.getFieldValue("UpClassifyOne"));
                    return this.state.liveTypes.filter(item => String(item.id) === id).map((item, index) => (
                      (item.subList).map((item) =>
                      <Option key={index} value={String(item.id)}>
                        {item.name}
                      </Option>
                      )
                    ))
                  })()
                  }
                </Select>
              )}
              {this.state.addnewClassifyTwo ? this.state.addnewClassifyTwo : ''}
            </FormItem>
            <FormItem label="标签" {...formItemLayout}>
              {getFieldDecorator("UpLabel", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择标签" }]
              })(
                <Select placeholder="请选择标签">
                  <Option value={1}>直播中</Option>
                  <Option value={2}>回放</Option>
                  <Option value={3}>视频</Option>
                  <Option value={4}>预告</Option>
                </Select>
              )}
              {this.state.addnewLabel ? this.state.addnewLabel : ''}
            </FormItem>
            <FormItem label="是否推荐" {...formItemLayout}>
              {getFieldDecorator("UpRecommend", {
                initialValue: undefined,
                rules: [{ required: true, message: "请选择是否推荐" }]
              })(
                <Select placeholder="请选择标签">
                  <Option value={1}>是</Option>
                  <Option value={0}>否</Option>
                </Select>
              )}
              {this.state.addnewRecommend ? this.state.addnewRecommend : ''}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator("UpSorts", {
                initialValue: undefined,
                rules: [{ required: true, message: "请输入排序序号" }]
              })(<InputNumber placeholder="请输入排序序号" style={{width:'314px'}}/>)}
              {this.state.addnewSorts ? this.state.addnewSorts : ''}
            </FormItem>
            <FormItem label="推荐产品" {...formItemLayout}>
              {getFieldDecorator('UpProduct',{
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
              {this.state.addnewProduct ? this.state.addnewProduct : ''}
            </FormItem>
            <FormItem label="标题" {...formItemLayout}>
              {getFieldDecorator("UpTitle", {
                initialValue: undefined,
                rules: [{ message: "请添写标题名称" }]
              })(<Input placeholder="请添写标题名称" />)}
              {this.state.liveId ? this.state.addnewTitle : ''}
            </FormItem>
            <FormItem label="封面图片上传" {...formItemLayout} labelCol={{ span: 7 }} wrapperCol={{ span: 11 }}>
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
                {this.state.fileList.length >= 3 ? null : (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择文件</div>
                  </div>
                )}
              </Upload>
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
            <FormItem label="频道ID" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.liveId : ""}
            </FormItem>
            <FormItem label="标题" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name : ""}
            </FormItem>
            <FormItem label="封面图" {...formItemLayout}>
              {!!this.state.nowData && this.state.nowData.coverImage
                ? this.state.nowData.coverImage.split(",").map((item, index) => {
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
            <FormItem label="标签" {...formItemLayout}>
              {!!this.state.nowData
                ? this.getNameLiveStatusId(this.state.nowData.liveStatus)
                : ""}
            </FormItem>
            <FormItem label="拉取时间" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.createTime : ""}
            </FormItem>
            <FormItem label="一级分类" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name2 : ""}
            </FormItem>
            <FormItem label="二级分类" {...formItemLayout}>
              {!!this.state.nowData ? this.state.nowData.name3 : ""}
            </FormItem>
            <FormItem label="是否推荐" {...formItemLayout}>
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
            <FormItem label="是否发布" {...formItemLayout}>
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
form: P.any,
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
        deleteImage,
        onOk,
        LiveVideo,
        advertPositionList,
        findProductModelByWhere,
        findProductTypeByWhere,
        DeleteVideo,
        updateLiveType,
        addCard,
        LiveType,
        UpdateCard,
        UpdateVideo,
        findProductByWhere,
        allPullVideo,
        addLiveType
      },
      dispatch
    )
  })
)(WrappedHorizontalRole);
