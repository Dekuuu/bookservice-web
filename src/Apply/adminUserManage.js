import React from 'react';
import 'antd/dist/antd.css';
import {Button, Form, Input, Row, Modal, Select, Collapse, Table} from "antd";
import ReactGridManager, {$gridManager} from 'gridmanager-react';
import 'gridmanager-react/css/gm-react.css';
import {UserOutlined} from "@ant-design/icons";
import {LockOutlined} from "@ant-design/icons";
import { MailOutlined  } from '@ant-design/icons';

const {Option} = Select;
const Panel = Collapse.Panel;

class adminUserManage extends React.Component {
    constructor(props) {
        super(props);

        this.tableColumns = [
            {
                title: '用户名',
                dataIndex: 'userName',
                width: 200,
                align: 'center',
            },
            {
                title: '用户类型',
                dataIndex: 'userTypeName',
                width: 200,
                align: 'center',
            },
            {
                title: '邮箱',
                dataIndex: 'email',
                width: 300,
                align: 'center',
                render: (text, record, index) => {
                    return record.email === null ? "空" : record.email
                }
            },
            {
                title: '密码',
                dataIndex: 'password',
                width: 200,
                align: 'center',
            },
            {
                title: '操作',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    return <a href={"#"} onClick={this.updateUser.bind(this, record)}>修改</a>
                },
            },
        ];
        this.state = {
            loading : false,
            userTypeAdd: '',
            userType: '',
            stateSearch: '',
            categoryNoAdd: '',
            addModal: false,
            categoryNoSearch: '',
            categoryNo: '',
            updateModal: false,
            modalValue: {},
            dataSource: [],
            dictsSource: [],
            modalShow: false,
            params: {
                bookNo: '',
                bookName: '',
                categoryNo: '',
                author: '',
            },
            pagination: {
                currentPage: parseInt(window.location.hash.slice(1), 0) || 1,
                pageSize: 10,
                total: '', // 总数
                startIndex: 0,
                endIndex: 10,
                size: 'small',
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                showQuickJumper: true, //	是否可以快速跳转至某页
                hideOnSinglePage: false, // 只有一页时是否隐藏分页器
                showSizeChanger: true,  // 是否可以改变 pageSize
                pageSizeOptions: ['10', '30', '50', '100', '200'],
            },
        };
    }

    componentWillMount() {
        this.getUser();
        this.fetchData();
        this.getAllDicts();
    }

    componentDidMount() {
        document.title = "用户信息管理"
    }

    //获取用户信息
    getUser = () => {
        fetch('/book/logininfo/getUserInfo')
            .then(res => res.json())
            .then(json => {
                if (json.data == null) {
                    alert("请先登录!");
                    window.location.href = "/bookservice-web/login";
                } else if (json.data.userType === 1) {
                    alert("你没有权限访问当前页面!");
                    window.location.href = "/bookservice-web/";
                }
            });
    }

    // 接收子组件表格页码变化后返回的pagination
    paginationChange(pagination) {
        this.state.pagination.currentPage = pagination.current
        this.state.pagination.pageSize = pagination.pageSize
        this.state.pagination.startIndex = (pagination.current - 1) * pagination.pageSize
        this.state.pagination.endIndex = pagination.current * pagination.pageSize
        this.fetchData();
    }

    fetchData = () => {
        this.setState({
            loading : true,
        })
        let data = {
            bookName: document.getElementById("bookNameSearch") == null ? '' : document.getElementById("bookNameSearch").value.trim(),
            categoryNo: this.state.categoryNoSearch,
            author: document.getElementById("authorSearch") == null ? '' : document.getElementById("authorSearch").value.trim(),
            startIndex: this.state.pagination.startIndex,
            endIndex: this.state.pagination.endIndex,
            pageSize: this.state.pagination.pageSize,
            currentPage: this.state.pagination.currentPage,
            total: this.state.pagination.total
        };
        fetch('/book/admin/queryByPage', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.code === 1) {
                    this.state.pagination.total = json.data.total;
                    let pagination = this.state.pagination;
                    this.state.pagination = pagination;
                    this.setState({
                        loading : false,
                        dataSource: json.data.list,
                        pagination: {...pagination},
                    })
                } else {
                    alert(json.data);
                }
            })

    }

    reset = () => {
        document.getElementById("bookNameSearch").value = '';
        document.getElementById("authorSearch").value = '';
        this.state.categoryNoSearch = '';
        this.state.stateSearch = '';

        this.state.pagination.currentPage = 1;
        this.state.pagination.pageSize = 10;
        this.state.pagination.startIndex = 0;
        this.state.pagination.endIndex = 10;
        this.state.pagination.total = '';
        this.state.pagination.size = 'small';
        this.state.pagination.showTotal = (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`;
        this.state.pagination.showQuickJumper = true;
        this.state.pagination.hideOnSinglePage = false;
        this.state.pagination.showSizeChanger = true;
        this.state.pagination.pageSizeOptions = ['10', '30', '50', '100', '200'];
        this.setState({
            stateSearch: '',
            categoryNoSearch: '',
            params: {
                bookNo: '',
                bookName: '',
                categoryNo: '',
                author: '',
            },
            pagination: {
                currentPage: parseInt(window.location.hash.slice(1), 0) || 1,
                pageSize: 10,
                total: '', // 总数
                startIndex: 0,
                endIndex: 10,
                size: 'small',
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                showQuickJumper: true, //	是否可以快速跳转至某页
                hideOnSinglePage: false, // 只有一页时是否隐藏分页器
                showSizeChanger: true,  // 是否可以改变 pageSize
                pageSizeOptions: ['10', '30', '50', '100', '200'],
            },
        });
        this.fetchData();
    }

    add = () => {
        this.setState({
            addModal: true,
        })
    }

    getAllDicts = () => {
        fetch('/book/bookInfo/getAllDicts')
            .then(res => res.json())
            .then(json => {
                this.setState({
                    dictsSource: json.data,
                })
            });
    }

    handleCancel = () => {
        this.setState({
            updateModal: false,
            modalValue: {},
        })
    }

    handleCancelAdd = () => {
        this.setState({
            addModal: false,
            modalValue: {},
        })
    }

    onSelect = (value) => {
        this.state.userType = value;
        this.setState({
            userType: value
        }, () => {
            console.log(this.state.userType)
        })
    }

    onSelectAdd = (value) => {
        this.state.userTypeAdd = value;
        this.setState({
            userTypeAdd: value
        })
    }

    onSelectSearch = (value) => {
        this.state.categoryNoSearch = value;
        this.setState({
            categoryNoSearch: value
        })
    }

    onSelectSearchState = (value) => {
        this.state.stateSearch = value;
        this.setState({
            stateSearch: value
        })
    }

    updateSubmit = () => {
        let newPsw = document.getElementById("password").value;

        //校验密码
        if(newPsw == null || newPsw.trim() === ""){
            alert("密码不能为空!");
            return ;
        }
        let data = {
            "id": this.state.modalValue.id,
            "userName": document.getElementById("userName").value,
            "email": document.getElementById("email").value,
            "userType": this.state.userType === '' ? this.state.modalValue.userType : this.state.userType,
            "newPsw": newPsw,
            "originPsw": this.state.modalValue.password
        };
        fetch('/book/admin/updateUser', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                if (json.data === 1) {
                    alert("修改成功");
                    this.setState({
                        updateModal: false,
                        modalValue: {},
                        userType: ''
                    })
                } else {
                    alert("修改失败");
                    this.setState({
                        updateModal: false,
                        modalValue: {},
                        userType: ''
                    })
                }
                this.fetchData();
            })
        ;
    }

    addSubmit = () => {
        let userName =document.getElementById("userNameAdd").value;
        let userType =this.state.userTypeAdd;
        let password = document.getElementById("passwordAdd").value;
        let phoneRegex = /^1[3456789]\d{9}$/;

        //数据校验
        if(userName ==null || userName.trim() === ""){
            alert("用户名不能为空!");
            return ;
        }

        if(!phoneRegex.test(userName)){
            alert("请输入正确的手机号码");
            return ;
        }

        if(userType ==null || userType === ""){
            alert("用户类型不能为空!");
            return ;
        }

        if(password ==null || password.trim() === ""){
            alert("密码不能为空!");
            return ;
        }
        let data = {
            "userName": userName,
            "userType": userType,
            "email": document.getElementById("emailAdd").value,
            "password": password
        };
        fetch('/book/admin/addUser', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                if (json.data === 1) {
                    alert("添加成功");
                    this.setState({
                        addModal: false,
                        categoryNoAdd: ''
                    })
                } else if (json.data === 0) {
                    alert("账户已存在");
                    this.setState({
                        addModal: false,
                        categoryNoAdd: ''
                    })
                }
                this.fetchData();
            })
        ;
    }

    updateUser = (value) => {
        this.setState({
            modalValue: value,
            updateModal: true,
        })
    }

    add = () => {
        this.setState({
            addModal: true,
        })
    }

    //下一页
    lowerPage = () => {
        let startIndex = this.state.params.startIndex;
        let pageSize = this.state.params.pageSize;
        let total = this.state.params.total;
        let endIndex = this.state.params.endIndex;
        this.state.params.startIndex = startIndex + pageSize < total ? startIndex + pageSize : startIndex;
        this.state.params.endIndex = endIndex + pageSize <= total ? endIndex + pageSize : endIndex;
        this.setState({
            params: {
                startIndex: startIndex + pageSize < total ? startIndex + pageSize : startIndex,
                endIndex: endIndex + pageSize <= total ? endIndex + pageSize : endIndex,
            },
        }, () => {
            console.log(this.state.params);
        });
        this.fetchData();
    }


    //上一页
    upperPage = () => {
        let startIndex = this.state.params.startIndex;
        let pageSize = this.state.params.pageSize;
        let total = this.state.params.total;
        let endIndex = this.state.params.endIndex;
        this.state.params.startIndex = startIndex - pageSize >= 0 ? startIndex - pageSize : startIndex;
        this.state.params.endIndex = endIndex - pageSize > 0 ? endIndex - pageSize : endIndex;
        this.setState({
            params: {
                startIndex: startIndex - pageSize >= 0 ? startIndex - pageSize : startIndex,
                endIndex: endIndex - pageSize > 0 ? endIndex - pageSize : endIndex,
            },
        })
        this.fetchData();
    }

    render() {
        return (
            <div style={{paddingTop: 20}}>
                <Button onClick={this.add} type={"primary"}>新增</Button>

                <Table
                    columns={this.tableColumns}
                    dataSource={this.state.dataSource}
                    bordered  // 是否展示外边框和列边框
                    className="reset-ant-table"
                    pagination={this.state.pagination}
                    onChange={this.paginationChange.bind(this)}
                    loading={this.state.loading}
                    rowClassName={
                        record => {
                            let className = 'reset-ant-table odd';
                            if (record.span > 1) {
                                this.licensesCount = record.span; // 用来初始化合并的行数
                            }
                            if (record.span !== 0) {
                                className = "reset-ant-table odd oddHover";
                                if (this.fakeIndex % 2 === 1) {
                                    className = 'reset-ant-table even evenHover';
                                }
                            } else {
                                if (this.fakeIndex % 2 === 1) {
                                    className = 'reset-ant-table even';
                                }
                            }
                            if (record.span === 0) {
                                this.licensesCount--
                                if (this.licensesCount === 1) {
                                    this.fakeIndex++
                                }
                            }
                            if (record.span === 1) {
                                this.fakeIndex++
                            }
                            return className;
                        }
                    }/>
                {/*<table>
                    <th>用户名</th>&nbsp;
                    <th>用户类型</th>&nbsp;
                    <th>邮箱</th>&nbsp;
                    <th>密码</th>&nbsp;
                    <th>操作</th>&nbsp;
                    {this.state.dataSource.map(record =>(
                        <tr>
                            <td>{record.userName}</td>&nbsp;&nbsp;
                            <td>{record.userTypeName}</td>&nbsp;&nbsp;
                            <td>{record.email === null ? "空" : record.email}</td>&nbsp;&nbsp;
                            <td>{record.password}</td>&nbsp;&nbsp;
                            <td><a href={"#"} onClick={this.updateUser.bind(this,record)}>修改</a></td>&nbsp;&nbsp;
                        </tr>
                    ))}
                    <tr>
                        <td><a onClick={this.upperPage}>上一页</a></td>&nbsp;&nbsp;
                        <a onClick={this.lowerPage}>下一页</a>
                    </tr>
                </table>*/}

                <Modal visible={this.state.updateModal}
                       title={"用户修改"}
                       onCancel={this.handleCancel}
                       onOk={this.updateSubmit}
                       maskClosable={false}
                       width={600}
                       destroyOnClose={true}>

                    用户名：<Input id={"userName"} defaultValue={this.state.modalValue.userName} readOnly allowClear={true} prefix={<UserOutlined />} style={{width: 200 , marginBottom : 10}}/><br/>
                    用户类型：<Select defaultValue={this.state.modalValue.userTypeName}
                                 style={{width: 200 , marginBottom : 10}}
                                 id={"categoryNo"}
                                 onChange={this.onSelect}>
                    <Option value={1}>普通用户</Option>
                    <Option value={0}>管理员</Option>
                </Select><br/>
                    邮箱：<Input id={"email"} defaultValue={this.state.modalValue.email} allowClear={true} prefix={<MailOutlined />} style={{width: 200 , marginBottom : 10}}/><br/>
                    密码：<Input id={"password"} defaultValue={this.state.modalValue.password} allowClear={true} prefix={<LockOutlined />} style={{width: 200 , marginBottom : 10}}/><br/>
                </Modal>

                <Modal visible={this.state.addModal}
                       title={"新增用户"}
                       onCancel={this.handleCancelAdd}
                       onOk={this.addSubmit}
                       maskClosable={false}
                       width={600}
                       destroyOnClose={true}>
                    用户名：<Input id={"userNameAdd"} style={{width: 200, marginBottom: 20}} placeholder={"请输入用户名"}
                               allowClear={true} prefix={<UserOutlined />}/><br/>
                    用户类型：<Select
                    style={{width: 200, marginBottom: 20}}
                    id={"categoryNo"}
                    onChange={this.onSelectAdd}
                    placeholder={"请选择用户类型"}
                    allowClear>
                    <Option value={1}>
                        普通用户
                    </Option>
                    <Option value={0}>
                        管理员
                    </Option>
                </Select><br/>
                    密码：<Input id={"passwordAdd"} placeholder={"请输入密码"} style={{width: 200, marginBottom: 20}}
                              allowClear={true} prefix={<LockOutlined />}/><br/>
                    邮箱：<Input id={"emailAdd"} placeholder={"请输入邮箱"} style={{width: 200, marginBottom: 20}}
                              allowClear={true} prefix={<MailOutlined />}/><br/>
                </Modal>
            </div>
        );
    }
}

/*function fetchData() {
    fetch('http://localhost:8080/testController/test?id=asd')
        .then(res => res.json())
        .then(json => console.log(json.userName))
}*/


export default adminUserManage;
