import React from 'react';
import styles from "./Register.less";
import 'antd/dist/antd.css';
import {Button, Form, Input, Row,Modal,Select} from "antd";
import ReactGridManager, {$gridManager} from 'gridmanager-react';
import 'gridmanager-react/css/gm-react.css';
import {LockOutlined} from "@ant-design/icons";
import { MailOutlined  } from '@ant-design/icons';
const { Option }= Select;

class Account extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPassword : '',
            user : {
                userName : '',
                password : '',
                email : ''
            },
            stateSearch: '',
            categoryNoAdd :'',
            updateEmail : false,
            categoryNoSearch : '',
            categoryNo : '',
            updatePswModal : false,
            modalValue:{},
            dataSource:[],
            dictsSource:[],
            modalShow: false,
            params:{
                bookNo : '',
                bookName : '',
                categoryNo : '',
                author : '',
                startIndex : 0,
                endIndex: 100,
                pageSize: 100,
                currentPage: 1,
                total: 0,
            },
            pagination: {
                current: parseInt(window.location.hash.slice(1), 0) || 1,
                pageSize: 10,
                total: '', // 总数
                size: 'small',
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                showQuickJumper: true, //	是否可以快速跳转至某页
                hideOnSinglePage: false, // 只有一页时是否隐藏分页器
                showSizeChanger: true,  // 是否可以改变 pageSize
                pageSizeOptions: ['10', '30', '50', '100', '200'],
            },
        };
    }

    componentWillMount(){
        this.getUser();
    }

    componentDidMount(){
        document.title = "我的账户"
    }

    add=()=>{
        this.setState({
            updateEmail : true,
        })
    }

    //获取用户信息
    getUser=()=>{
        fetch('/book/logininfo/getUserInfo')
            .then(res => res.json())
            .then(json => {
                if(json.data!=null){
                    this.setState({
                        user : {
                            userName : json.data.userName,
                            password : "*************",
                            email : json.data.email
                        },
                    },()=>{
                        console.log(this.state.user);
                    });
                }else{
                    alert("请先登录!");
                    window.location.href="/bookservice-web/login";
                }
            });
    }

    handleCancel=()=>{
        this.setState({
            updatePswModal : false,
            modalValue : {},
        })
    }

    updatePsw=()=>{
        this.setState({
            updatePswModal : true,
        })
    }

    handleCancelAdd=()=>{
        this.setState({
            updateEmail : false,
            modalValue : {},
        })
    }

    updateEmailSubmit=()=>{
        let newEmail = document.getElementById("newEmail").value;

        //校验邮箱格式
        let regex = /^([0-9a-zA-Z])+\@([0-9a-zA-Z])+((\.com)|(\.cn)){1,2}$/;

        if(!regex.test(newEmail)){
            alert("请输入正确的邮箱!");
            return ;
        }
        let data = {
            email : newEmail
        }
        fetch('/book/logininfo/updateEmail', {
            method: 'post',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res =>res.json())
            .then(json => {
                if(json.code === 0){
                    alert(json.data);
                }else if(json.code === 1){
                    alert("邮件发送成功，请尽快登录邮箱完成验证");
                }
                this.setState({
                    updateEmail : false,
                })
            })
    }

    updatePswSubmit=()=>{
        let originPsw = document.getElementById("originPsw").value;
        let newPsw = document.getElementById("newPsw").value;
        let renewPsw = document.getElementById("renewPsw").value;

        if(originPsw == null || originPsw.trim() === ""){
            alert("旧密码不能为空!");
            return ;
        }

        if(newPsw == null || newPsw.trim() === ""){
            alert("新密码不能为空!");
            return ;
        }

        if(renewPsw == null || renewPsw.trim() === ""){
            alert("新密码不能为空!");
            return ;
        }

        if(newPsw !== renewPsw){
            alert("两次输入的密码不一致!");
            return ;
        }
        let data={
            originPsw : originPsw,
            newPsw : newPsw,
        }
        fetch('/book/logininfo/updatePsw', {
            method: 'post',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res =>res.json())
            .then(json => {
                if(json.code === 1 && json.data === 1){
                    alert("修改成功");
                    window.location.href = "/bookservice-web/login";
                }else if(json.code === 1 && json.data === 0){
                    alert("密码错误");
                }else if(json.data === "请先登录"){
                    alert(json.data);
                    window.location.href = "/bookservice-web/login";
                }else{
                    alert(json.data);
                }
                this.setState({
                    updatePswModal : false,
                })
            })
    }

    updateEmail=()=>{
        this.setState({
            updateEmail : true,
        })
    }

    add=()=>{
        this.setState({
            updateEmail : true,
        })
    }

    render (){
        return (
            <div style={{margin : "0 auto", width : 600}}>
                <Form >
                    <Row style={{paddingBottom : 20}}>
                        账号：<Input style={{width : 200}} id={"userName"} value={this.state.user.userName} readOnly/>&nbsp;&nbsp;
                    </Row>

                    <Row style={{paddingBottom : 20}}>
                        密码：<Input style={{width : 200}} id={"password"} value={this.state.user.password} readOnly/>&nbsp;&nbsp;<a href={"#"} onClick={this.updatePsw}>修改</a>
                    </Row>

                    <Row style={{paddingBottom : 20}}>
                        邮箱：<Input style={{width : 200}} id={"email"} value={this.state.user.email} readOnly/><a href={"#"} onClick={this.updateEmail}>修改</a>
                    </Row>
                </Form>

                <Modal visible={this.state.updatePswModal}
                       title={"修改密码"}
                       onCancel={this.handleCancel}
                       onOk={this.updatePswSubmit}
                       maskClosable={false}
                       width={600}
                        destroyOnClose={true}>

                    原来的密码：<Input id={"originPsw"} placeholder={"请输入原来的密码"} type={"password"} prefix={<LockOutlined />} allowClear={true}/><br/>
                    新的密码：<Input id={"newPsw"} placeholder={"请输入新的密码"} type={"password"} prefix={<LockOutlined />} allowClear={true}/>
                    新的密码：<Input id={"renewPsw"} placeholder={"请重新输入新的密码"} type={"password"} prefix={<LockOutlined />} allowClear={true}/>
                </Modal>

                <Modal visible={this.state.updateEmail}
                       title={"修改邮箱"}
                       onCancel={this.handleCancelAdd}
                       onOk={this.updateEmailSubmit}
                       maskClosable={false}
                       width={600}
                       destroyOnClose={true}>
                    邮箱：<Input id={"newEmail"} placeholder={"请输入新的邮箱地址"} style={{width :200}} prefix={<MailOutlined />} allowClear={true}/>
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



export default Account;
