import React from 'react';
import {
    Form,
    Input,
    Row,
    Button,
} from 'antd';
import 'antd/dist/antd.css';
import styles from './Register.less';
import {UserOutlined} from "@ant-design/icons";
import { LockOutlined  } from '@ant-design/icons';

class Register extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
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
        let phoneNo=document.getElementById("phoneNo").value;
        let password=document.getElementById("password").value;
        let repassword=document.getElementById("repassword").value;
        let code=document.getElementById("code").value;

        //数据校验
        let phoneRegex = /^1[3456789]\d{9}$/;

        if(phoneNo == null || phoneNo.trim()==""){
            alert("手机号不能为空!");
            return ;
        }
        if(!phoneRegex.test(phoneNo)){
            alert("请输入正确的手机号码");
            return ;
        }

        if(password == null || password.trim()==""){
            alert("密码不能为空!");
            return ;
        }

        if(repassword == null || repassword.trim()==""){
            alert("密码不能为空!");
            return ;
        }

        if(password != repassword){
            alert('两次输入的密码不一致!');
            return ;
        }

        if(code == null || code.trim()==""){
            alert("验证码不能为空!");
            return ;
        }

        let data={
            "userName": phoneNo,
            "password": password,
            "code": code
        };
        fetch('/book/logininfo/register', {
            method: 'post',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                if(json.data === 1){
                    alert("注册成功");
                    window.location.href = "/bookservice-web/login";
                }else{
                    alert(json.data);
                }
            })
    }

    componentDidMount(){
        document.title = "注册"
    }

    //获取验证码
    getCode=()=>{
        let phoneNo=document.getElementById("phoneNo").value;
    //    校验手机号码
        let regex = /^1[3456789]\d{9}$/;

        if(phoneNo == null || phoneNo.trim()==""){
            alert("手机号不能为空!");
            return ;
        }
        if(!regex.test(phoneNo)){
            alert("请输入正确的手机号码");
            return ;
        }
    //    请求发送验证码
        fetch('/book/logininfo/getCode?phoneNo='+phoneNo)
            .then(res => res.json())
            .then(re => {
                if(re.code === 1){
                    alert("验证码发送成功，请在20分钟内尽快完成注册!");
                }else{
                    alert(re.data);
                }
            })
    }

    render (){
        return (
            <div style={{margin : "0 auto",width : 400,paddingTop : 20}}>
                <Form className={styles.searchForm}>
                    <Row style={{marginBottom: "20px"}}>
                        手机号：<Input placeholder={"请输入手机号"} id={"phoneNo"} style={{width :200}} prefix={<UserOutlined />} allowClear={true}/>
                    </Row>

                    <Row style={{marginBottom: "20px"}}>
                        密码：<Input type={"password"} placeholder={"请输入密码"} id={"password"} style={{width :200}} prefix={<LockOutlined />} allowClear={true}/>
                    </Row>

                    <Row style={{marginBottom: "20px"}}>
                        <div>
                            密码：<Input type={"password"} placeholder={"请再次输入密码"} id={"repassword"} style={{width :200}} prefix={<LockOutlined />} allowClear={true}/>
                        </div>
                    </Row>

                    <Row style={{marginBottom: "20px"}}>
                        验证码：<Input placeholder={"请输入验证码"} id={"code"} style={{width :200}} allowClear={true}/>&nbsp;&nbsp;&nbsp;
                        <Button type={"primary"} onClick={this.getCode}>获取验证码</Button>
                    </Row>

                    <Row style={{marginBottom: "20px"}}>
                        <Button type={"primary"} onClick={this.register}>注册</Button>
                    </Row>
                </Form>
            </div>
        );
    }
}

/*function fetchData() {
    fetch('http://localhost:8080/testController/test?id=asd')
        .then(res => res.json())
        .then(json => console.log(json.userName))
}*/



export default Register;
