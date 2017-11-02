/* TreeTable 用于角色授权的树形表格 */
import React from 'react';
import P from 'prop-types';
import { Modal, Table, Checkbox } from 'antd';
import './index.scss';
import _ from 'lodash';
class TreeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceData: [], // 原始数据 - 层级数据
            btnDtoChecked: [], // 受控，所有被选中的btnDto数据
            treeChecked: [], // 受控，所有被选中的表格行
        };
    }

    componentDidMount() {
        this.makeSourceData(this.props.menuData);
    }

    componentWillReceiveProps(nextProps) {
        // allMenu变化后，重新处理原始数据; 所选择的项变化，需要隐藏所选择的项
        if (nextProps.menuData !== this.props.menuData) {
            this.makeSourceData(nextProps.menuData);
        }
    }

    // 提交
    onOk() {
        this.props.onOk && this.props.onOk({menus: this.state.treeChecked, btns: this.state.btnDtoChecked});
    }

    // 关闭模态框
    onClose() {
        this.props.onClose();
    }

    // 初始化，把默认选中的勾上
    init() {

    }

    // 处理原始数据，将原始数据处理为层级关系
    makeSourceData(data) {
        console.log('原始数据是什么：', data);
        let d = _.cloneDeep(data);
        // 按照sort排序
        d.sort((a, b) => {
            return a.sorts - b.sorts;
        });

        const sourceData = [];
        d.forEach((item) => {
            if (item.parentId === 0) {
                const temp = this.dataToJson(d, item);
                sourceData.push(temp);
            }
        });
        console.log('jsonMenu是什么：', sourceData);
        // 再来看看哪些需要被默认选中
        const treeChecked = data.filter((item) => item.menuAfiliation === 'Y').map((item) => item.id);
        const btnDtoChecked = [];
        data.forEach((item) => {
            if (item.btnDtoList && item.btnDtoList.length > 0) {
                item.btnDtoList.filter((item2) => item2.menuAfiliation === 'Y').forEach((item3) => btnDtoChecked.push(item3.id));
            }
        });
        this.setState({
            sourceData,
            treeChecked,
            btnDtoChecked,
        });
    }

    // 递归将扁平数据转换为层级数据
    dataToJson(data, one) {
        const child = _.cloneDeep(one);
        child.children = [];
        child.key = child.id;
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

    // Dto受控
    dtoIsChecked(id) {
        return !!this.state.btnDtoChecked.find((item) => item === id);
    }
    // TABLE 字段
    makeColumns() {
        const columns = [{
            title: '菜单',
            dataIndex: 'menuName',
            key: 'menuName',
            width: '25%',
        }, {
            title: '权限',
            dataIndex: 'btnDtoList',
            key: 'btnDtoList',
            width: '70%',
            render: (value, record) => {
                if (value) {
                    return value.map((item, index) => {
                        return <Checkbox key={index} checked={this.dtoIsChecked(item.id)} onChange={(e) => this.onBtnDtoChange(e, item.id)}>{item.btnName}</Checkbox>
                    });
                }
            }
        }];
        return columns;
    }

    // TABLE 列表项前面是否有多选框，并配置行为
    makeRowSelection() {
        return {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(selectedRowKeys, selectedRows);
                this.setState({
                    treeChecked: selectedRowKeys,
                });
            },
            selectedRowKeys: this.state.treeChecked,
        }
    }

    // TABLE btn权限选中和取消选中，需要记录哪些被选中
    onBtnDtoChange(e, id){
        console.log(e, id);
        const old = _.cloneDeep(this.state.btnDtoChecked);

        if (e.target.checked) { // 选中
            old.push(id);
        } else {
            old.splice(old.indexOf(id), 1);
        }
        this.setState({
            btnDtoChecked: old,
        });
        console.log('现在选中的有：', old);
    }

    render() {
        const me = this;
        return (
            <Modal
                className="menu-tree-table"
                zIndex={1001}
                width={680}
                title={this.props.title || '菜单选择'}
                visible={this.props.modalShow}
                onOk={() => this.onOk()}
                onCancel={() => this.onClose()}
                confirmLoading={this.props.loading}
            >
                {
                    this.props.initloading ? <span>正在加载中……</span> :
                    <Table
                        columns={this.makeColumns()}
                        rowSelection={this.makeRowSelection()}
                        dataSource={this.state.sourceData}
                        pagination={false}
                    />
                }
            </Modal>
        );
    }
}

TreeTable.propTypes = {
    title: P.string,        // 指定模态框标题
    menuData: P.any,        // 所有的菜单原始后台数据
    defaultChecked: P.array,   // 需要默认选中的项
    modalShow: P.any,       // 是否显示
    initloading: P.bool, // 初始化时，树是否处于加载中状态
    loading: P.bool,     // 提交表单时，树的确定按钮是否处于等待状态
    onClose: P.any,         // 关闭模态框
    onOk: P.any,            // 确定选择，将所选项信息返回上级
};

export default TreeTable;
