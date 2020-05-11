import React from 'react';
import styles from "./Register.less";
import 'antd/dist/antd.css';
import {Button, Form, Input, Row, Modal} from "antd";

class adminIndex extends React.Component {
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

    componentWillMount = () => {
        this.getUser();
    }

    componentDidMount() {
        document.title = "管理员中心"
    }

    render() {
        return (
            <div style={{margin: "0 auto", width: 400, paddingTop: 20}}>
                <ul>
                    <li style={{paddingBottom: 20}}>
                        <a href={"/bookservice-web/ipLog"}>Ip登录情况查阅</a>
                    </li>
                    <li style={{paddingBottom: 20}}>
                        <a href={"/bookservice-web/adminUserManage"}>用户信息管理</a>
                    </li>
                    <li style={{paddingBottom: 20}}>
                        <a href={"/bookservice-web/adminBooksManage"}>图书信息管理</a>
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


export default adminIndex;
