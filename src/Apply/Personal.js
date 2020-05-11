import React from 'react';
import styles from "./Register.less";
import 'antd/dist/antd.css';
import {Button, Form, Input, Row,Modal} from "antd";

class Personal extends React.Component {
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

    emailSubmit=()=>{
        let email=document.getElementById("email").value;
        fetch('/book/logininfo/email?email='+email)
            .then(res => alert("邮件已发送!"));
    }

    componentDidMount(){
        document.title = "个人中心"
    }

    login=()=>{
        let phoneNo=document.getElementById("phoneNo").value;
        let password=document.getElementById("password").value;

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
                    this.props.history.push("/");
                };
            })
    }

    render (){
        return (
            <div style={{margin : "0 auto",width : 400,paddingTop : 20}}>
                <ul>
                    {/*<li style={{paddingBottom : 20}}>
                        <a onClick={this.email} href={"#"}>邮箱认证</a>
                    </li>*/}

                    <li style={{paddingBottom : 20}}>
                        <a href={"/bookservice-web/userIndex"}>我的图书</a>
                    </li>

                    <li style={{paddingBottom : 20}}>
                        <a href={"/bookservice-web/myBorrowing"}>我的借阅</a>
                    </li>

                    <li style={{paddingBottom : 20}}>
                        <a href={"/bookservice-web/myFavorite"}>我的收藏</a>
                    </li>

                    <li style={{paddingBottom : 20}}>
                        <a href={"/bookservice-web/myAccount"}>我的账户</a>
                    </li>
                </ul>
            </div>
        );
    }
}

/*function fetchData() {
    fetch('http://localhost:8080/testController/test?id=asd')
        .then(res => res.json())
        .then(json => console.log(json.userName))
}*/



export default Personal;
