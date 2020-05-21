import React from 'react';
import 'antd/dist/antd.css';
import moment from 'moment';
import {Button, Form, Input, Row, Modal, Select, Collapse, DatePicker, Table, Col} from "antd";
import ReactGridManager, {$gridManager} from 'gridmanager-react';
import 'gridmanager-react/css/gm-react.css';
import {Redirect} from 'react-router-dom';
import {SearchOutlined} from "@ant-design/icons";

const {Option} = Select;
const Panel = Collapse.Panel;

class ipLog extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props);
        this.tableColumns = [
            {
                title: 'ip地址',
                dataIndex: 'ip',
                width: 200,
                align: 'center',
            },
            {
                title: '登录状态',
                dataIndex: 'loginSuccess',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    return record.loginSuccess === 1 ? '成功' : '失败'
                },
            },
            {
                title: '用户名',
                dataIndex: 'userName',
                width: 200,
                align: 'center',
            },
            {
                title: '登录时间',
                dataIndex: 'loginTime',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    return text.substring(0, text.lastIndexOf(" "))
                }
            },
        ];
        this.state = {
            loading: false,
            loginSuccess: '',
            dateSearch: '',
            user: {},
            renewAble: '',
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
                startIndex: 0,
                endIndex: 100,
                pageSize: 100,
                currentPage: 1,
                total: 0,
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

    reset = () => {
        this.formRef.current.resetFields();
        document.getElementById("ipSearch").value = '';
        document.getElementById("userSearch").value = '';
        this.state.dateSearch = '';
        this.state.loginSuccess = '';

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
            dateSearch: '',
            loginSuccess: '',
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

    componentWillMount() {
        this.getUser();
        this.fetchData();
    }

    componentDidMount() {
        document.title = "IP日志"
    }

    renewAble = (value) => {
        this.setState({
            loginSuccess: value,
        })
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

    fetchData = () => {
        this.setState({
            loading: true,
        })
        let data = {
            loginTimeSearch: this.state.dateSearch === '' ? undefined : this.state.dateSearch,
            loginSuccess: this.state.loginSuccess === '' ? undefined : this.state.loginSuccess,
            ip: document.getElementById("ipSearch") == null ? '' : document.getElementById("ipSearch").value.trim(),
            userName: document.getElementById("userSearch") == null ? '' : document.getElementById("userSearch").value.trim(),
            startIndex: this.state.pagination.startIndex,
            endIndex: this.state.pagination.endIndex,
            pageSize: this.state.pagination.pageSize,
            currentPage: this.state.pagination.currentPage,
            total: this.state.pagination.total
        };
        fetch('/book/iplog/queryByPage', {
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
                        loading: false,
                        dataSource: json.data.list,
                        pagination: {...pagination},
                    })
                }
            })
    }

    dateSearch = (value) => {
        this.setState({
            dateSearch: moment(value).format("YYYY-MM-DD")
        })
    }

    add = () => {
        this.setState({
            addModal: true,
        })
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
        this.state.categoryNo = value;
        this.setState({
            categoryNo: value
        })
    }

    onSelectAdd = (value) => {
        this.state.categoryNo = value;
        this.setState({
            categoryNoAdd: value
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

    // 接收子组件表格页码变化后返回的pagination
    paginationChange(pagination) {
        this.state.pagination.currentPage = pagination.current
        this.state.pagination.pageSize = pagination.pageSize
        this.state.pagination.startIndex = (pagination.current - 1) * pagination.pageSize
        this.state.pagination.endIndex = pagination.current * pagination.pageSize
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
                <Form style={{paddingBottom: 30}} ref={this.formRef}>
                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="登录日志搜索查询" key="1">
                            <Row gutter={24}>
                                <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                    <Form.Item name="ipSearch" label="ip地址">
                                        <Input placeholder={"请输入ip地址"} style={{width: 200}} id={"ipSearch"}
                                               allowClear={true}/>
                                    </Form.Item>
                                </Col>

                                <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                    <Form.Item name="loginStateSearch" label="登录状态">
                                        <Select placeholder={"请选择登录状态"}
                                                style={{width: 200}}
                                                onChange={this.renewAble}
                                                allowClear>
                                            <Option value={"1"}>成功</Option>
                                            <Option value={"0"}>失败</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                    <Form.Item name="userSearch" label="用户名">
                                        <Input placeholder={"请输入用户名"} style={{width: 200}} id={"userSearch"}
                                               allowClear={true}/>
                                    </Form.Item>
                                </Col>

                                <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                    <Form.Item name="dateSearch" label="登录日期">
                                        <DatePicker placeholder="请选择登陆日期" onChange={this.dateSearch} allowClear/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col span={24} style={{textAlign: 'right'}}>
                                    <Button type={"primary"} onClick={this.fetchData} icon={<SearchOutlined/>}
                                            shape={"circle"}></Button>&nbsp;&nbsp;
                                    <Button type={"primary"} onClick={this.reset}>重置</Button>
                                </Col>
                            </Row>
                        </Panel>
                    </Collapse>
                </Form>

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
                    <th>ip地址</th>&nbsp;
                    <th>登录状态</th>&nbsp;
                    <th>用户名</th>&nbsp;
                    <th>登陆时间</th>&nbsp;
                    {this.state.dataSource.map(record =>(
                        <tr style={{paddingBottom : 10}}>
                            <td>{record.ip}</td>&nbsp;&nbsp;
                            <td>{record.loginSuccess === 1 ? '成功':'失败'}</td>&nbsp;&nbsp;
                            <td>{record.userName}</td>&nbsp;&nbsp;
                            <td>{record.loginTime.substring(0,record.loginTime.lastIndexOf(" "))}</td>&nbsp;&nbsp;
                        </tr>
                    ))}
                    <tr>
                        <td><a onClick={this.upperPage}>上一页</a></td>&nbsp;&nbsp;
                        <a onClick={this.lowerPage}>下一页</a>
                    </tr>
                </table>*/}
            </div>
    );
    }
    }

        /*function fetchData() {
            fetch('http://localhost:8080/testController/test?id=asd')
                .then(res => res.json())
                .then(json => console.log(json.userName))
        }*/


    export default ipLog;
