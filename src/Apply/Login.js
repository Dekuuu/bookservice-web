import React from 'react';
import styles from "./Register.less";
import 'antd/dist/antd.css';
import { UserOutlined } from '@ant-design/icons';
import { LockOutlined  } from '@ant-design/icons';
import {Button, Form, Input, Row} from "antd";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modalShow: false,
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

    register=()=> {
        this.props.history.push("/register")
    }

    email=()=>{
        this.setState({
            modalShow : true,
        },()=>{
            console.log(this.state.modalShow);
        })
    }

    handleCancel=()=>{
        this.setState({
            modalShow : false,
        })
    }

    /*emailSubmit=()=>{
        let email=document.getElementById("email").value;
        let token = localStorage.getItem("loginToken");
        fetch('/book/logininfo/email?email='+email+"&token="+token)
            .then(res => alert("邮件已发送!"));
    }*/

    componentDidMount(){
        document.title = "登录"
    }

    login=()=>{
        let phoneNo=document.getElementById("phoneNo").value;
        let password=document.getElementById("password").value;

        //数据校验
        let phoneRegex = /^1[3456789]\d{9}$/;

        if(phoneNo == null || phoneNo.trim()==""){
            alert("手机号不能为空!");
            return ;
        }

        if(password == null || password.trim()==""){
            alert("密码不能为空!");
            return ;
        }

        if("admin" != phoneNo){
            if(!phoneRegex.test(phoneNo)){
                alert("请输入正确的手机号码");
                return ;
            }
        }

        let data={
            "userName": phoneNo,
            "password": password,
        };
        fetch('/book/logininfo/login', {
            method: 'post',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                if(json.code === 1){
                    this.getUser();
                }else{
                    alert(json.data);
                };
            })
    }

    //获取用户信息
    getUser=()=>{
        fetch('/book/logininfo/getUserInfo')
            .then(res => res.json())
            .then(json => {
                if(json.data ==null){
                    alert("请先登录!");
                    window.location.href="/bookservice-web/login";
                }else if(json.data.userType === 1){
                    window.location.href="/bookservice-web/";
                }else if(json.data.userType === 0){
                    window.location.href="/bookservice-web/adminIndex";
                }
            });
    }

    render (){
        return (
            <div style={{margin : "0 auto",width : 400,paddingTop : 20}}>
                <Form className={styles.searchForm}>
                    <Row style={{marginBottom: "20px"}}>
                        账号:<Input placeholder={"请输入手机号"} id={"phoneNo"} style={{width :200}} prefix={<UserOutlined />} allowClear={true}/>
                    </Row>

                    <Row style={{marginBottom: "20px"}}>
                        密码:<Input type={"password"} placeholder={"请输入密码"} id={"password"} style={{width :200}} prefix={<LockOutlined />} allowClear={true}/>
                    </Row>

                    <Row>
                        <Button type={"primary"} onClick={this.login}>登录</Button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </Row>
                </Form>
                {/*<a onClick={this.email} href={"#"}>邮箱认证</a>*/}
                {/*<Modal visible={this.state.modalShow}
                       title={"邮箱认证"}
                        onCancel={this.handleCancel}
                        onOk={this.emailSubmit}
                        maskClosable={false}
                        width={400}>
                    <Input placeholder={"请输入邮箱地址"} id={"email"}/>
                </Modal>*/}
            </div>
        );
    }
}

/*function fetchData() {
    fetch('http://localhost:8080/testController/test?id=asd')
        .then(res => res.json())
        .then(json => console.log(json.userName))
}*/



export default Login;
