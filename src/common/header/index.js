import React , {Component} from 'react';
import {HeaderWrapper , Logo , Nav,NavItem,NavSeach , Addition , Button,SeearchWrapper} from "./style";
import {Select } from 'antd';
const {Option} =Select.Option;
// import { CSSTransition } from 'react-transition-group';

class Header extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            user : {},
        };

        this.handleInputFocus = this.handleInputFocus.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
    }
    componentWillMount=()=>{
        this.getUser();
    }

    //获取用户信息
    getUser=()=>{
        fetch('/book/logininfo/getUserInfo')
            .then(res => res.json())
            .then(json => {
                if(json.data !=null){
                    this.setState({
                        user : json.data,
                    })
                }
                console.log(this.state.user.userType == null);
            });
    }


    render() {
        return(
            <HeaderWrapper>
                <Nav>
                    <NavItem className={'left active'}>
                        <a href="/bookservice-web">首页</a>
                    </NavItem>
                    <NavItem className={'right active'}>
                        {
                            this.state.user.userType == null ? <a href={"/bookservice-web/personal"}>个人中心</a> :
                                <div>
                                    <span>欢迎你,{this.state.user.userName}</span>
                                    <a href={"/bookservice-web/personal"}>个人中心</a>
                                    {this.state.user.userType === 0 ? <span>&nbsp;&nbsp;<a href={"/bookservice-web/adminIndex"}>管理员中心</a></span>
                                    : <span></span>}
                                </div>
                        }
                    </NavItem>
                    {/*<SeearchWrapper>
                        <CSSTransition
                            in={this.state.focused}
                            timeout={200}
                            classNames="slide"
                        >
                            <NavSeach
                                className={this.state.focused ? 'focused': ''}
                                onFocus={this.handleInputFocus}
                                onBlur={this.handleInputBlur}
                            ></NavSeach>
                        </CSSTransition>
                            <span className={this.state.focused ? 'focused iconfont': 'iconfont'}>
                            &#xe600;
                            </span>


                    </SeearchWrapper>*/}
                </Nav>
                <Addition>
                    <Button className={'reg'} >
                        <a href="/bookservice-web/register">注册</a>
                    </Button>
                    <Button className={'reg'} >
                        {
                            this.state.user.userType == null ? <a href={"/bookservice-web/login"}>登录</a> :
                                <a href={"#"} onClick={this.logOut}>退出登录</a>
                        }

                    </Button>
                </Addition>
            </HeaderWrapper>
            )
    }

    handleInputFocus(){
        this.setState({
            focused: true
        })
    }

    logOut=()=>{
        fetch('/book/logininfo/logout').then(res => res.json())
            .then(json => {
                if(json.code === 1){
                    alert("用户已退出登录!");
                    window.location.href = "/bookservice-web/login"
                }else{
                    alert(json.data);
                }
            })
    }

    handleInputBlur(){
        this.setState({
            focused: false
        })
    }

}

export default Header;