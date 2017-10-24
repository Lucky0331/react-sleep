/* RoleTree 角色树 */
import React from 'react';
import P from 'prop-types';
import { Modal, Tree, message } from 'antd';
import './index.scss';

const TreeNode = Tree.TreeNode;
class RoleTree extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roleLoading: true, // 是否正在加载当前用户已有角色
            loading: false, // 是否正在分配角色中
            nowRoles: [],   // 当前用户所拥有的角色
            checkedKeys: [], // 受控，所有选中的项
        };
    }

    componentDidMount() {
        if (!this.props.roleData || this.props.roleData.length === 0) {
            this.getRolesData();
        }
    }

    componentWillReceiveProps(nextProps) {
        // 当点开roleTree时，获取当前用户对应的角色信息
        if (nextProps.modalShow !== this.props.modalShow && nextProps.modalShow) {
            this.setState({
                checkedKeys: [], // 选中的用户改变了，清空旧点选的内容
                roleLoading: true,
            });
            this.getNowUserRole(nextProps.userInfo.adminUserId);
        }
    }

    // 获取所有角色数据
    getRolesData() {
        this.props.actions.findAllRole();
    }

    // 获取当前用户角色信息
    getNowUserRole(id) {
        this.props.actions.findAllRoleByUserId({userId: id}).then((res) => {
            if (res.returnCode === "0") {
                const defaultChecked = res.messageBody.map((item) => item.roleId);
                this.setState({
                    nowRoles: res.messsageBody,
                    checkedKeys: defaultChecked,
                    roleLoading: false,
                });
            }
            this.setState({
                roleLoading: false,
            });
        }).catch(() => {
            this.setState({
                roleLoading: false,
            });
        });
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

    // 通过原始数据构建角色树
    createTree(data = []) {
        return data.map((item, index) => {
            return (<TreeNode title={item.roleName} key={item.roleId} />);
        });
    }

    render() {
        console.log('所有的角色信息：', this.props.roleData);
        const me = this;
        return (
            <Modal
                className="role-tree"
                title={me.props.userInfo ? `给${me.props.userInfo.userName}分配角色` : '角色分配'}
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
                    { this.state.roleLoading ? null : this.createTree(this.props.roleData) }
                </Tree>
                {
                    this.state.roleLoading ? <span>正在加载……</span> : null
                }
            </Modal>
        );
    }
}

RoleTree.propTypes = {
    roleData: P.any,        // 所有的角色
    userInfo: P.any,        // 当前操作用户信息
    modalShow: P.any,       // 是否显示
    actions: P.any,         // 在内部调用actions
    onClose: P.any,         // 关闭模态框
};

export default RoleTree;
