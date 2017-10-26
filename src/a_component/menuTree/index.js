/* MenuTree 菜单树 */
import React from 'react';
import P from 'prop-types';
import { Modal, Tree, message } from 'antd';
import './index.scss';

const TreeNode = Tree.TreeNode;
class MenuTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuLoading: true, // 是否正在加载当前用户已有角色
            loading: false, // 是否正在分配菜单中
            nowRoles: [],   // 当前用户所拥有的角色
            checkedKeys: [], // 受控，所有选中的项
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
    }

    // 提交
    onOk() {

    }

    // 关闭模态框
    onClose() {
        this.props.onClose();
    }

    // 复选框选中时触发
    onTreeCheck(checkedKeys, e) {
        console.log('数据：', checkedKeys, e);
    }

    // 通过原始数据构建菜单树
    createTree(data = []) {

    }

    render() {
        console.log('所有的菜单信息：', this.props.menuData);
        const me = this;
        return (
            <Modal
                className="menu-tree"
                title="菜单选择"
                visible={this.props.modalShow}
                onOk={() => this.onOk()}
                onCancel={() => this.onClose()}
                confirmLoading={this.state.loading}
            >
                <Tree
                    checkable
                    checkedKeys={this.state.checkedKeys}
                    onCheck={(checkedKeys, e) => this.onTreeCheck(checkedKeys, e)}
                >
                    { this.state.menuLoading ? null : this.createTree(this.props.menuData) }
                </Tree>
                {
                    this.state.menuLoading ? <span>正在加载……</span> : null
                }
            </Modal>
        );
    }
}

MenuTree.propTypes = {
    menuData: P.any,        // 所有的菜单原始后台数据
    defaultKeys: P.array,   // 需要默认选中的key
    modalShow: P.any,       // 是否显示
    onClose: P.any,         // 关闭模态框
};

export default MenuTree;
