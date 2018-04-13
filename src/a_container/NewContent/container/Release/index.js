/* Banner 商城管理/内容管理/banner管理 */

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import P from 'prop-types';
import Config from '../../../../config/config';
import { Form, Button, Icon, Input, Table, message, Modal, Tooltip, Popconfirm, Select, Divider ,Popover ,InputNumber,Upload} from 'antd';
import './index.scss';
import tools from '../../../../util/tools'; // 工具
import Power from '../../../../util/power'; // 权限
import { power } from '../../../../util/data';
// ==================
// 所需的所有组件
// ==================


// ==================
// 本页面所需action
// ==================

import { deleteImage,onChange,onOk,advertPositionList,findProductModelByWhere,findProductTypeByWhere} from '../../../../a_action/shop-action';
import { Cardlist , deleteCard ,addCard,UpdateCard ,UpdateOnline} from '../../../../a_action/card-action'

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
            productTypes:[], //所有的产品类型
            titleList: [],     // 所有的标题位置
            titles:[]  ,   //所有的标题
            searchTitle:'' , //搜索 - 标题
            searchDeleteStatus:'', //搜索 - 是否发布
            searchTypeCode:'', //搜索 - 产品类型
            nowData: null, // 当前选中的信息，用于查看详情、修改、分配菜单
            addnewModalShow: false, // 查看地区模态框是否显示
            upModalShow: false, // 修改模态框是否显示
            upLoading: false, // 是否正在修改用户中
            fileList: [],   // 代言卡上传的列表
            fileListDetail:[] , //背景图上传列表
            fileLoading: false, // 缩略图片正在上传
            pageNum: 1, // 当前第几页
            pageSize: 10, // 每页多少条
            total: 0, // 数据库总共多少条数据
        };
    }

    componentDidMount() {
        this.getAllAdvertPosition();  // 获取所有代言卡列表
        this.getAllProductType();   // 获取所有的产品类型
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }



    // 查询当前页面所需列表数据
    onGetData(pageNum, pageSize) {
        const params = {
            pageNum,
            pageSize,
            deleteStatus:this.state.searchDeleteStatus,
            title: this.state.searchTitle,
            productTypeCode:this.state.searchTypeCode,
        };
        this.props.actions.Cardlist(tools.clearNull(params)).then((res) => {
            console.log('返回的什么：', res.data.result);
            if(res.status === 200) {
                this.setState({
                    data: res.data.result || [],
                    pageNum,
                    pageSize,
                    total: res.data.total || [],
                });
            } else {
                message.error(res.returnMessaage || '获取数据失败，请重试');
            }
            console.log('啥代言卡信息：', res.data.result);
        });
    }

   // 获取代言卡信息
    getAllAdvertPosition() {
        this.props.actions.advertPositionList({ pageNum:0, pageSize: 10 }).then((res) => {
            if(res.returnCode === '0') {
                this.setState({
                    titleList:res.messsageBody.result
                });
            }
        });
    }

    // 获取所有的产品类型，当前页要用
    getAllProductType() {
        this.props.actions.findProductTypeByWhere({ pageNum: 0, pageSize: 9999 }).then((res) => {
            if(res.returnCode === '0') {
                this.setState({
                    productTypes: res.messsageBody.result  || [],
                });
            }
        });
    }

    // 工具 - 根据产品类型ID查产品类型名称
    findProductNameById(id) {
        const t = this.state.productTypes.find((item) => String(item.id) === String(id));
        return t ? t.name : '';
    }


    //搜索 - 发布状态输入框值改变时触发
    searchNameChange(e) {
        this.setState({
            searchDeleteStatus: e,
        });
    }

    //搜索 - 标题输入框值改变时触发
    searchTitleChange(e) {
        this.setState({
            searchTitle: e.target.value,
        });
    }


    // 搜索 - 产品类型输入框值改变时触发
    searchProductType(typeId) {
        this.setState({
            searchTypeCode: typeId,
        });
    }


    // 添加产品代言卡模态框出现
    onAddNewShow() {
        const me = this;
        const { form } = me.props;
        form.resetFields([
            'addnewTypeId',  //添加产品类型
            'addnewTitle',   // 添加标题
            'addnewSlogan',  //添加标语
            'addnewContent',   //添加分享文案的内容
            'addnewConditions',  //添加是否发布
            'addnewColor',   //添加文字颜色
            'addnewBtnColor',   // 添加按钮颜色
            'addnewSorts',  // 添加排序的顺序
            'addnewProductImg',
        ]);
        this.setState({
            addOrUp: 'add',
            fileList: [],
            fileListDetail: [],
            addnewModalShow: true,
            nowData:null
        });
    }

    // 关闭模态框
    onAddNewClose() {
        this.setState({
            addnewModalShow: false,
        });
    }

    // 添加或修改确定
    onAddNewOk() {
        const me = this;
        const { form } = me.props;
        if (me.state.fileLoading || me.state.fileDetailLoading) {
            message.warning('有图片正在上传...');
            return;
        }

        form.validateFields([
            'addnewTypeId',  //添加产品类型
            'addnewTitle',   // 添加标题
            'addnewSlogan',  //添加标语
            'addnewContent',   //添加分享文案的内容
            'addnewConditions',  //添加是否发布
            'addnewColor',   //添加文字颜色
            'addnewBtnColor',   // 添加按钮颜色
            'addnewSorts',  // 添加排序的顺序
            'addnewProductImg',
        ], (err, values) => {
            if (err) { return false; }
            me.setState({
                addnewLoading: true,
            });

            const params = {
                productTypeCode: values.addnewTypeId,    //添加产品类型
                productTypeName: this.findProductNameById(values.addnewTypeId),    //添加产品名称
                name: values.addnewTitle,               // 添加标题
                title: values.addnewSlogan,            //添加标语
                content: values.addnewContent,      //添加分享文案
                deleteStatus: values.addnewConditions ? true : false ,   //添加是否发布
                colorTwo: String(values.addnewBtnColor),           //添加按钮颜色
                colorOne:String(values.addnewColor),               // 添加文字颜色
                sorts: values.addnewSorts,                // 添加排序的顺序
                titleImage: this.state.fileList.map((item) => item.url).join(','),
                contentImage: this.state.fileList.map((item) => item.url).join(','),
                backImage:this.state.fileListDetail.map((item) => item.url).join(','),
            };
            if (this.state.addOrUp === 'add') { // 新增
                me.props.actions.addCard(tools.clearNull(params)).then((res) => {
                    me.setState({
                        addnewLoading: false,
                    });
                    this.onGetData(1, this.state.pageSize);
                    this.onAddNewClose();
                }).catch(() => {
                    me.setState({
                        addnewLoading: false,
                    });
                });
            } else {
                params.id = this.state.nowData.id;
                me.props.actions.UpdateCard(params).then((res) => {  // 修改
                    me.setState({
                        addnewLoading: false,
                    });
                    this.onGetData(this.state.pageNum, this.state.pageSize);
                    this.onAddNewClose();
                }).catch(() => {
                    me.setState({
                        addnewLoading: false,
                    });
                });
            }

        });
    }

    // 修改某一条数据 模态框出现
    onUpdateClick(record) {
        const me = this;
        const { form } = me.props;
        console.log('是什么：', record);
        form.setFieldsValue({
            addnewTypeId:record.productTypeCode,
            addnewTitle:String(record.title),
            addnewSlogan:String(record.name),
            addnewContent:String(record.content),
            addnewConditions: Boolean(record.deleteStatus) ? false : true,
            addnewBtnColor:String(record.colorTwo),
            addnewColor:String(record.colorOne),
            addnewSorts:Number(record.sorts),
        });
        console.log('是什么：', record);
        me.setState({
            nowData: record,
            addOrUp: 'up',
            addnewModalShow: true,
            // fileList: record.contentImage ? record.contentImage.split(',').map((item, index) => ({ uid: index, url: item, status: 'done' })) : [],   // 标题图上传的列表
            fileList: record.titleImage ? record.titleImage.split(',').map((item, index) => ({ uid: index, url: item, status: 'done' })) : [],   // 标题图上传的列表
            fileListDetail: record.backImage ? record.backImage.split(',').map((item, index) => ({ uid: index, url: item, status: 'done' })) : [],   // 背景图上传的列表
        });
    }

    // 发布或取消发布
    onUpdateClick2(record) {
        const params = {
            speakCardId:Number(record.id),
        };
        this.props.actions.UpdateOnline(params).then((res) => {
            if (res.status === 200) {
                message.success("修改成功");
                this.onGetData(this.state.pageNum, this.state.pageSize);
            } else {
                message.error(res.returnMessaage || '修改失败，请重试');
            }
        }).catch(() => {
            message.error('修改失败');
        });
    }

    // 删除某一条数据
    onRemoveClick(id) {
        this.props.actions.deleteCard({id:id}).then((res) => {
            if(res.status === 200) {
                message.success('删除成功');
                this.onGetData(this.state.pageNum, this.state.pageSize);
            } else {
                message.error(res.returnMessaage || '删除失败，请重试');
            }
        });
    }

    // 代言卡图 - 上传中、上传成功、上传失败的回调
    onUpLoadChange(obj) {
        // console.log('图片上传：', obj);
        if (obj.file.status === 'done') {
            // 上传成功后调用,将新的地址加进原list
            if (obj.file.response.messsageBody) {
                const list = _.cloneDeep(this.state.fileList);
                const t = list.find((item) => item.uid === obj.file.uid);
                t.url = obj.file.response.messsageBody;
                this.setState({
                    fileList: list,
                    fileLoading: false,
                });
            } else {
                const list = _.cloneDeep(this.state.fileList);
                this.setState({
                    fileList: list.filter((item) => item.uid !== obj.file.uid),
                    fileLoading: false,
                });
                message.error('图片上传失败');
            }
        } else if (obj.file.status === 'uploading') {
            this.setState({
                fileLoading: true,
            });
        } else if(obj.file.status === 'error'){
            const list = _.cloneDeep(this.state.fileList);
            this.setState({
                fileList: list.filter((item) => item.uid !== obj.file.uid),
                fileLoading: false,
            });
            message.error('图片上传失败');
        }
    }

    // 代言卡图 - 上传前
    onUploadBefore(f, fl) {
        console.log('上传前：', f, fl);
        if (['jpg', 'jpeg', 'png', 'bmp', 'gif'].indexOf(f.type.split('/')[1]) < 0) {
            message.error('只能上传jpg、jpeg、png、bmp、gif格式的图片');
            return false;
        } else {
            const newList = _.cloneDeep(this.state.fileList);
            newList.push(f);
            this.setState({
                fileList: newList,
            });
            return true;
        }
    }

    // 代言卡图 - 删除一个图片
    onUpLoadRemove(f) {
        console.log('删除；', f);
        this.deleteImg(f.url);
        const list = _.cloneDeep(this.state.fileList);
        this.setState({
            fileList: list.filter((item) => item.uid !== f.uid),
        });
    }

    // 真正从服务端删除商品的图片
    deleteImg(uri) {
        const temp = uri.split('/');
        const fileName = temp.splice(-1,1);
        const params = {
            path: temp.join('/'),
            fileName,
        };
        console.log('删除后的是啥？', temp.join('/'), fileName);
        this.props.actions.deleteImage(params);
    }

    // 详细图片 - 上传前
    onUploadDetailBefore(f) {
        if (['jpg', 'jpeg', 'png', 'bmp', 'gif'].indexOf(f.type.split('/')[1]) < 0) {
            message.error('只能上传jpg、jpeg、png、bmp、gif格式的图片');
            return false;
        } else {
            const newList = _.cloneDeep(this.state.fileListDetail);
            newList.push(f);
            this.setState({
                fileListDetail: newList,
            });
            return true;
        }
    }

    // 详细图片 - 上传中、成功、失败
    onUpLoadDetailChange(obj) {
        if (obj.file.status === 'done') {
            // 上传成功后调用,将新的地址加进原list
            if (obj.file.response.messsageBody) {
                const list = _.cloneDeep(this.state.fileListDetail);
                const t = list.find((item) => item.uid === obj.file.uid);
                t.url = obj.file.response.messsageBody;
                this.setState({
                    fileListDetail: list,
                    fileDetailLoading: false,
                });
            } else {
                const list = _.cloneDeep(this.state.fileListDetail);
                this.setState({
                    fileListDetail: list.filter((item) => item.uid !== obj.file.uid),
                    fileDetailLoading: false,
                });
            }
        } else if (obj.file.status === 'uploading') {
            this.setState({
                fileDetailLoading: true,
            });
        } else if(obj.file.status === 'error'){
            const list = _.cloneDeep(this.state.fileListDetail);
            this.setState({
                fileListDetail: list.filter((item) => item.uid !== obj.file.uid),
                fileLoading: false,
            });
            message.error('图片上传失败');
        }
    }

    // 详细图片 - 删除
    onUpLoadDetailRemove(f) {
        const list = _.cloneDeep(this.state.fileListDetail);
        this.setState({
            fileListDetail: list.filter((item) => item.uid !== f.uid),
        });
    }

    // 关闭修改某一条数据
    onUpClose() {
        this.setState({
            upModalShow: false,
        });
    }

    // 搜索
    onSearch() {
        this.onGetData(this.state.pageNum, this.state.pageSize);
    }

    // 查询某一条数据的详情
    onQueryClick(record) {
        console.log('是什么：', record);
        this.setState({
            nowData: record,
            queryModalShow: true,
        });
    }

    // 查看详情模态框关闭
    onQueryModalClose() {
        this.setState({
            queryModalShow: false,
        });
    }

    // 表单页码改变
    onTablePageChange(page, pageSize) {
        console.log('页码改变：', page, pageSize);
        this.onGetData(page, pageSize);
    }


    // 构建字段
    makeColumns(){
        const columns = [
            {
                title: '序号',
                fixed:'left',
                dataIndex: 'serial',
                key: 'serial',
                width:100,
            },
            {
                title: '咨询类型',
                // dataIndex: 'productTypeCode',
                // key: 'productTypeCode',
            },
            {
                title:'咨询标题',
                // dataIndex:'name',
                // key:'name'
            },
            {
                title: '展示样式',
                // dataIndex: 'deleteStatus',
                // key: 'deleteStatus',
            },
            {
                title:'是否设未头条'
            },
            {
                title:'是否发布'
            },
            {
                title:'是否置顶'
            },
            {
                title:'最新发布时间'
            },
            {
                title: '操作',
                key: 'control',
                render: (text, record) => {
                    const controls = [];
                    controls.push(
                        <span key="2" className="control-btn green" onClick={() => this.onQueryClick(record)}>
                            <Tooltip placement="top" title="查看">
                                <Icon type="eye" />
                            </Tooltip>
                        </span>
                    );
                    controls.push(
                        <span key="3" className="control-btn blue" onClick={() => this.onUpdateClick(record)}>
                            <Tooltip placement="top" title="编辑">
                                <Icon type="edit" />
                            </Tooltip>
                        </span>
                    );
                    controls.push(
                        <span key="1" className="control-btn red" onClick={() => this.onUpdateClick2(record)}>
                            <Tooltip placement="top" title="发布">
                                <Icon type="logout" />
                            </Tooltip>
                        </span>
                    );
                    controls.push(
                        <span key="5" className="control-btn red" onClick={() => this.onUpdateClick2(record)}>
                            <Tooltip placement="top" title="设为头条">
                                <Icon type="logout" />
                            </Tooltip>
                        </span>
                    );
                    controls.push(
                        <span key="6" className="control-btn red" onClick={() => this.onUpdateClick2(record)}>
                            <Tooltip placement="top" title="设为置顶">
                                <Icon type="logout" />
                            </Tooltip>
                        </span>
                    );
                    controls.push(
                        <Popconfirm key="4" title="确定删除吗?" onConfirm={() => this.onRemoveClick(record.id)} okText="确定" cancelText="取消">
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
                },
            }
        ];
        return columns;
    }

    // 构建table所需数据
    makeData(data) {
        return data.map((item, index) => {
            return {
                key: index,
                productTypeCode: item.productTypeCode,
                productModelCode: item.productModelCode,
                serial:(index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
                typeId:(item.product)?item.product.typeId :'',
                conditions: item.conditions,
                backImage:item.backImage,
                title:item.title,
                titleImage: item.titleImage,
                productTypeName:item.productTypeName,
                contentImage:item.contentImage,
                name: item.name,
                colorOne:item.colorOne,
                colorTwo:item.colorTwo,
                content:item.content,
                id:item.id,
                deleteStatus:item.deleteStatus,
                sorts:item.sorts,
                realName:(item.distributor) ? item.distributor.realName : '',
            }
        });
    }

    render() {
        const me = this;
        const { form } = me.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return (
            <div>
                <div className="system-search">
                    <ul className="search-ul more-ul">
                        <ul className="search-func">
                            <li>
                                <span>咨询类型</span>
                                <Select allowClear placeholder="全部" style={{ width: '172px' }} onChange={(e) => this.searchProductType(e)}>
                                    {/*{this.state.productTypes.map((item, index) => {*/}
                                        {/*return <Option key={index} value={item.id}>{ item.name }</Option>*/}
                                    {/*})}*/}
                                </Select>
                            </li>
                            <li>
                                <span>咨询标题</span>
                                <Input
                                    style={{ width: '172px' }}
                                    // suffix={ suffix }
                                    // value={ searchOrderId }
                                    // onChange={(e) => this.searchOrderIdChange(e)}
                                />
                            </li>
                            <li style={{marginTop:'2px'}}><Button icon="plus-circle-o" type="primary" onClick={() => this.onAddNewShow()}>添加资讯类型</Button></li>
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
                            onChange: (page, pageSize) => this.onTablePageChange(page, pageSize)
                        }}
                    />
                </div>
                <Modal
                    title='查看地区'
                    visible={this.state.addnewModalShow}
                    onOk={() => this.onAddNewOk()}
                    onCancel={() => this.onAddNewClose()}
                    confirmLoading={this.state.addnewLoading}
                >
                </Modal>
                {/* 添加模态框 */}
                <Modal
                    title={this.state.addOrUp === 'add' ? '添加资讯类型' : '修改资讯类型'}
                    visible={this.state.addnewModalShow}
                    onOk={() => this.onAddNewOk()}
                    onCancel={() => this.onAddNewClose()}
                    confirmLoading={this.state.addnewLoading}
                >
                    <Form>
                        <FormItem
                            label="资讯类型名称"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewTypeId', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, message: '请添写资讯类型名称'},
                                ],
                            })(
                                <Input placeholder="请添写资讯类型名称" />
                            )}
                        </FormItem>
                        <FormItem
                            label="咨询标识"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('addnewTitle', {
                                initialValue: undefined,
                                rules: [
                                    {required: true, message: '请添加咨询标识'},
                                    { validator: (rule, value, callback) => {
                                        const v = tools.trim(value);
                                        if (v) {
                                            if (v.length > 50) {
                                                callback('最多输入20位字符');
                                            }
                                        }
                                        callback();
                                    }}
                                ],
                            })(
                                <Input placeholder="请添加咨询标识" />
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
                        <FormItem
                            label="产品类型"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.findProductNameById(this.state.nowData.productTypeCode): ''}
                        </FormItem>
                        <FormItem
                            label="标题"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.name : ''}
                        </FormItem>
                        <FormItem
                            label="背景图片"
                            {...formItemLayout}
                        >
                            {(!!this.state.nowData && this.state.nowData.backImage) ? this.state.nowData.backImage.split(',').map((item, index) => {
                                return <Popover key={index} placement="right" content={<img className="table-img-big" src={item} />}><img className="small-img" src={item} /></Popover>
                            }) : ''}
                        </FormItem>
                        <FormItem
                            label="代言卡图片"
                            {...formItemLayout}
                        >
                            {(!!this.state.nowData && this.state.nowData.titleImage) ? this.state.nowData.titleImage.split(',').map((item, index) => {
                                return <Popover key={index} placement="right" content={<img className="table-img-big" src={item} />}><img className="small-img" src={item} /></Popover>
                            }): ''}
                        </FormItem>
                        <FormItem
                            label="标语"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.title : ''}
                        </FormItem>
                        <FormItem
                            label="分享文案"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.content : ''}
                        </FormItem>
                        <FormItem
                            label="字体颜色"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.colorOne : ''}
                        </FormItem>
                        <FormItem
                            label="按钮颜色"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.colorTwo : ''}
                        </FormItem>
                        <FormItem
                            label="位置排序"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? this.state.nowData.sorts : ''}
                        </FormItem>
                        <FormItem
                            label="是否发布"
                            {...formItemLayout}
                        >
                            {!!this.state.nowData ? (Boolean(this.state.nowData.deleteStatus) === true ? <span style={{ color: 'green' }}>已发布</span> : <span style={{ color: 'red' }}>未发布</span>) : ''}
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
};

// ==================
// Export
// ==================
const WrappedHorizontalRole = Form.create()(Category);
export default connect(
    (state) => ({
    }),
    (dispatch) => ({
        actions: bindActionCreators({ onChange,deleteImage,onOk ,Cardlist,advertPositionList,findProductModelByWhere,findProductTypeByWhere,deleteCard,addCard,UpdateCard ,UpdateOnline}, dispatch),
    })
)(WrappedHorizontalRole);
