import React from 'react';
import 'antd/dist/antd.css';
import {Button, Form, Input, Row, Modal, Select, Collapse, Table} from "antd";
import ReactGridManager, {$gridManager} from 'gridmanager-react';
import 'gridmanager-react/css/gm-react.css';
import {Redirect} from 'react-router-dom';
const { Option }= Select;
const Panel = Collapse.Panel;

class Borrowing extends React.Component {
    constructor(props) {
        super(props);

        this.tableColumns = [
            {
                title: '图片地址',
                dataIndex: 'imageUrl',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    return <a href={"#"} onClick={this.openPic.bind(this, text)}>
                        <img src={"/bookservice-web/" + text} width={50} height={50}/>
                    </a>
                }
            },
            {
                title: '书本编号',
                dataIndex: 'borrowingBookNo',
                width: 200,
                align: 'center',
            },
            {
                title: '书名',
                dataIndex: 'borrowingBookNoName',
                width: 200,
                align: 'center',
            },
            {
                title: '可续借次数',
                dataIndex: 'renewAble',
                width: 200,
                align: 'center',
            },
            {
                title: '借书时间',
                dataIndex: 'borrowingTime',
                width: 300,
                align: 'center',
            },
            {
                title: '应归还时间',
                dataIndex: 'shouldReturnTime',
                width: 200,
                align: 'center',
            },
            {
                title: '归还时间',
                dataIndex: 'returnTime',
                width: 200,
                align: 'center',
            },
            {
                title: '归还状态',
                dataIndex: 'returnState',
                width: 100,
                align: 'center',
                render : (text,record,index) => {
                    return text === 0 ? <span style={{color: 'red'}}>未归还</span> :
                        text === 1 ? <span>已归还</span> : <span></span>
                }
            },
            {
                title: '操作',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    return record.renewAble === 1 ?
                        <a href={"#"} onClick={this.xujie.bind(this,record.borrowingBookNo)}>续借</a> :
                        <span></span>
                },
            },
        ];
        this.state = {
            returnState : '',
            loading : false,
            user : {},
            renewAble : '',
            stateSearch: '',
            categoryNoAdd :'',
            addModal : false,
            categoryNoSearch : '',
            categoryNo : '',
            updateModal : false,
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

    componentWillMount(){
        this.getUser();
        this.fetchData();
        this.getAllDicts();
    }

    componentDidMount(){
        document.title = "我的借阅"
    }

    renewAble=(value)=>{
        this.setState({
            renewAble : value,
        })
    }

    returnState=(value)=>{
        this.setState({
            returnState : value
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
                }
            });
    }

    fetchData=()=> {
        this.setState({
            loading :true,
        })
        let data={
            renewAble : this.state.renewAble === ''?undefined : this.state.renewAble,
            borrowingBookNo : document.getElementById("bookNoSearch")==null?'':document.getElementById("bookNoSearch").value.trim(),
            borrowingBookNoName : document.getElementById("bookNameSearch")==null?'':document.getElementById("bookNameSearch").value.trim(),
            returnState :this.state.returnState === ''?undefined : this.state.returnState,
            startIndex : this.state.pagination.startIndex,
            endIndex : this.state.pagination.endIndex,
            pageSize : this.state.pagination.pageSize,
            currentPage : this.state.pagination.currentPage,
            total : this.state.pagination.total
        };
        fetch('/book/borrowinfo/queryByPage',{
            method: 'post',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if(json.code === 1){
                    this.state.pagination.total = json.data.total;
                    let pagination = this.state.pagination;
                    this.state.pagination = pagination;
                    this.setState({
                        loading :false,
                        dataSource : json.data.list,
                        pagination: {...pagination},
                    })
                }
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

    //打开图片
    openPic = (value) => {
        let blank = window.open('_blank');
        blank.location = "/bookservice-web/" + value;
    }

    reset=()=>{
        document.getElementById("bookNameSearch").value='';
        document.getElementById("bookNoSearch").value='';
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
            renewAble : '',
            stateSearch : '',
            categoryNoSearch : '',
            returnState : '',
            params:{
                bookNo : '',
                bookName : '',
                categoryNo : '',
                author : '',
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

    add=()=>{
        this.setState({
            addModal : true,
        })
    }

    getAllDicts=()=>{
        fetch('/book/bookInfo/getAllDicts')
            .then(res => res.json())
            .then(json => {
                this.setState({
                    dictsSource : json.data,
                })
            });
    }

    handleCancel=()=>{
        this.setState({
            updateModal : false,
            modalValue : {},
        })
    }

    handleCancelAdd=()=>{
        this.setState({
            addModal : false,
            modalValue : {},
        })
    }

    onSelect=(value)=>{
        this.state.categoryNo = value;
        this.setState({
            categoryNo : value
        })
    }

    onSelectAdd=(value)=>{
        this.state.categoryNo = value;
        this.setState({
            categoryNoAdd : value
        })
    }

    onSelectSearch=(value)=>{
        this.state.categoryNoSearch = value;
        this.setState({
            categoryNoSearch : value
        })
    }

    onSelectSearchState=(value)=>{
        this.state.stateSearch = value;
        this.setState({
            stateSearch : value
        })
    }

    add=()=>{
        this.setState({
            addModal : true,
        })
    }

    render (){
        return (
            <div style={{paddingTop : 20}}>
                <Form style={{paddingBottom : 30}}>
                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="个人借阅图书搜索查询" key="1">
                            书本编号：<Input placeholder={"请输入书本编号"} style={{width : 200}} id={"bookNoSearch"} allowClear={true}/>&nbsp;&nbsp;
                            书名：<Input placeholder={"请输入书名"} style={{width : 200}} id={"bookNameSearch"} allowClear={true}/>&nbsp;&nbsp;
                            可续借：<Select placeholder={"请选择可续借次数"}
                                        style={{width : 200}}
                                        onChange={this.renewAble}
                        allowClear>
                                <Option value={"1"}>可续借</Option>
                                <Option value={"0"}>不可续借</Option>
                            </Select>&nbsp;&nbsp;

                            归还状态：<Select placeholder={"请选择归还状态"}
                                        style={{width : 200}}
                                        onChange={this.returnState}
                                        allowClear>
                            <Option value={"1"}>已归还</Option>
                            <Option value={"0"}>未归还</Option>
                        </Select>&nbsp;&nbsp;
                            <Button type={"primary"} onClick={this.fetchData}>查询</Button>&nbsp;&nbsp;
                            <Button type={"primary"} onClick={this.reset}>重置</Button>&nbsp;&nbsp;
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
                    } />
                {/*<table>
                    <th>书本编号</th>&nbsp;
                    <th>书名</th>&nbsp;
                    <th>图片</th>&nbsp;
                    <th>可续借次数</th>&nbsp;
                    <th>借书时间</th>&nbsp;
                    <th>应归还时间</th>&nbsp;
                    <th>操作</th>&nbsp;
                    {this.state.dataSource.map(record =>(
                        <tr>
                            <td>{record.borrowingBookNo}</td>&nbsp;&nbsp;
                            <td>{record.borrowingBookNoName}</td>&nbsp;&nbsp;
                            <td><img src={"/bookservice-web/"+record.imageUrl} /></td>&nbsp;&nbsp;
                            <td>{record.renewAble}</td>&nbsp;&nbsp;
                            <td>{record.borrowingTime}</td>&nbsp;&nbsp;
                            <td>{record.shouldReturnTime}</td>&nbsp;&nbsp;
                            <td>{record.renewAble === 1?<a href={"#"} onClick={this.xujie.bind(this,record.borrowingBookNo)}>续借</a>:<span></span>}</td>&nbsp;&nbsp;
                        </tr>
                    ))}
                    <tr>
                        <td><a onClick={this.upperPage}>上一页</a></td>&nbsp;&nbsp;
                        <a onClick={this.lowerPage}>下一页</a>
                    </tr>
                </table>*/}

                <Modal visible={this.state.updateModal}
                       title={"图书修改"}
                       onCancel={this.handleCancel}
                       onOk={this.updateSubmit}
                       maskClosable={false}
                       width={600}>

                    图书编号：<Input id={"bookNo"} defaultValue={this.state.modalValue.bookNo} readOnly/><br/>
                    书名：<Input id={"bookName"} defaultValue={this.state.modalValue.bookName} readOnly/>
                    类目编号：<Select defaultValue={this.state.modalValue.categoryNoName}
                                 style={{width : 200}}
                                 id={"categoryNo"}
                                 onChange={this.onSelect}>
                    {
                        this.state.dictsSource.map(d =>(
                            <Option key={d.categoryNo} value={d.categoryNo}>
                                {d.categoryNoName}
                            </Option>
                        ))
                    }
                    <Option>

                    </Option>
                </Select><br/>
                    图片：<Input id={"imageUrl"} defaultValue={this.state.modalValue.imageUrl}/><br/>
                    书本描述：<Input id={"description"} defaultValue={this.state.modalValue.description}/><br/>
                    作者：<Input id={"author"} defaultValue={this.state.modalValue.author}/><br/>
                </Modal>

                <Modal visible={this.state.addModal}
                       title={"新增图书"}
                       onCancel={this.handleCancelAdd}
                       onOk={this.addSubmit}
                       maskClosable={false}
                       width={600}
                       destroyOnClose={true}>
                    书名：<Input id={"bookNameAdd"} style={{width :200}} placeholder={"请输入书名"}/><br/>
                    类目编号：<Select
                    style={{width : 200}}
                    id={"categoryNo"}
                    onChange={this.onSelectAdd}>
                    {
                        this.state.dictsSource.map(d =>(
                            <Option key={d.categoryNo} value={d.categoryNo}>
                                {d.categoryNoName}
                            </Option>
                        ))
                    }
                    <Option>

                    </Option>
                </Select><br/>
                    图片：<Input id={"imageUrlAdd"} placeholder={"请输入图片"} style={{width :200}}/><br/>
                    书本描述：<Input id={"descriptionAdd"} placeholder={"请输入书本描述"} style={{width :200}}/><br/>
                    作者：<Input id={"authorAdd"} placeholder={"请输入作者"} style={{width :200}}/><br/>
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



export default Borrowing;
