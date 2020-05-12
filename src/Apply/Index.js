import React from 'react';
import 'antd/dist/antd.css';
import {Button, Form, Input, Row, Modal, Select, Collapse, Table,Alert} from "antd";
import ReactGridManager, {$gridManager} from 'gridmanager-react';
import 'gridmanager-react/css/gm-react.css';
import requestURL from './../config.json';
import { SearchOutlined  } from '@ant-design/icons';
import { HeartTwoTone   } from '@ant-design/icons';
import style from './style.less';

const {Option} = Select;
const Panel = Collapse.Panel;

class Index extends React.Component {
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
                title: '书名',
                dataIndex: 'bookName',
                width: 200,
                align: 'center',
            },
            {
                title: '类目编号',
                dataIndex: 'categoryNoName',
                width: 200,
                align: 'center',
            },
            {
                title: '书本描述',
                dataIndex: 'description',
                width: 300,
                align: 'center',
            },
            {
                title: '作者',
                dataIndex: 'author',
                width: 200,
                align: 'center',
            },
            {
                title: '可借阅书籍数量',
                dataIndex: 'counts',
                width: 200,
                align: 'center',
            },
            {
                title: '操作',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    // return <a href={"#"} onClick={this.shoucang.bind(this, record)}>{HeartOutlined }</a>
                    return <Button onClick={this.shoucang.bind(this, record)} icon={<HeartTwoTone twoToneColor="#eb2f96"/>} shape={"circle"}></Button>
                },
            },
        ];
        this.state = {
            loading: false,
            monthBorrowing: [],
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
                startIndex: 0,
                endIndex: 10,
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

    componentWillMount() {
        this.fetchData();
        this.getAllDicts();
        this.getMonthBorrows();
    }

    componentDidMount() {
        document.title = "首页"
    }

    fetchData = () => {
        this.setState({
            loading: true,
        })
        let data = {
            bookName: document.getElementById("bookNameSearch") == null ? '' : document.getElementById("bookNameSearch").value.trim(),
            categoryNo: this.state.categoryNoSearch,
            author: document.getElementById("authorSearch") == null ? '' : document.getElementById("authorSearch").value.trim(),
            startIndex: this.state.pagination.startIndex,
            endIndex: this.state.pagination.endIndex,
            pageSize: this.state.pagination.pageSize,
            currentPage: this.state.pagination.currentPage,
            total: this.state.pagination.total,
            state: this.state.stateSearch
        };
        fetch(requestURL.requestURL+'/book/bookInfo/queryByGroup', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                this.state.pagination.total = json.data.total;
                let pagination = this.state.pagination;
                this.state.pagination = pagination;
                this.setState({
                    loading: false,
                    dataSource: json.data.list,
                    pagination: {...pagination},
                }, () => {
                    console.log("f" + this.state.params);
                    console.log("f" + pagination.currentPage);
                })
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


    getMonthBorrows = () => {
        fetch('/book/borrowinfo/queryBorrowingByMonth')
            .then(res => res.json())
            .then(json => {
                this.setState({
                    monthBorrowing: json.data
                })
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
                currentPage: 1,
                pageSize: 10,
                startIndex: 0,
                endIndex: 10,
                total: '', // 总数
                size: 'small',
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                showQuickJumper: true, //	是否可以快速跳转至某页
                hideOnSinglePage: false, // 只有一页时是否隐藏分页器
                showSizeChanger: true,  // 是否可以改变 pageSize
                pageSizeOptions: ['10', '30', '50', '100', '200'],
            }
        }, () => {
            console.log(this.state.pagination);
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

    updateSubmit = () => {
        let data = {
            "id": this.state.modalValue.id,
            "bookNo": document.getElementById("bookNo").value,
            "bookName": document.getElementById("bookName").value,
            "categoryNo": this.state.categoryNo === '' ? this.state.modalValue.categoryNo : this.state.categoryNo,
            "imageUrl": document.getElementById("imageUrl").value,
            "description": document.getElementById("description").value,
            "author": document.getElementById("author").value
        };
        fetch('/book/bookInfo/updateBook', {
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
                        modalValue: {}
                    })
                } else {
                    alert("修改失败");
                    this.setState({
                        updateModal: false,
                        modalValue: {}
                    })
                }
                this.fetchData();
            })
        ;
    }

    addSubmit = () => {
        let data = {
            "bookName": document.getElementById("bookNameAdd").value,
            "categoryNo": this.state.categoryNoAdd,
            "imageUrl": document.getElementById("imageUrlAdd").value,
            "description": document.getElementById("descriptionAdd").value,
            "author": document.getElementById("authorAdd").value
        };
        fetch('/book/bookInfo/addBook', {
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
                } else {
                    alert("添加失败");
                    this.setState({
                        addModal: false,
                        categoryNoAdd: ''
                    })
                }
                this.fetchData();
            })
        ;
    }

    add = () => {
        this.setState({
            addModal: true,
        })
    }

    //打开图片
    openPic = (value) => {
        let blank = window.open('_blank');
        blank.location = "/bookservice-web/" + value;
    }

    //收藏
    shoucang = (record) => {
        let bookName = record.bookName;
        let data = {
            bookName: bookName
        }
        fetch('/book/favorite/favorite', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.code === 1) {
                    alert("收藏成功!");
                    this.fetchData();
                } else {
                    alert(json.data);
                    this.props.history.push({
                        pathname: '/bookservice-web/login'
                    })
                }
            })
    }

    render() {
        return (
            <div style={{paddingTop: 20}}>
                <div style={{float: "left"}} className={"content"}>
                    <Form style={{paddingBottom: 30}}>
                        <Collapse defaultActiveKey={['1']}>
                            <Panel header="首页搜索查询" key="1">
                                书名：<Input placeholder={"请输入书名"} style={{width: 200}} id={"bookNameSearch"}
                                          allowClear={true}/>&nbsp;&nbsp;
                                类目编号：<Select defaultValue={this.state.modalValue.categoryNoName}
                                             style={{width: 200}}
                                             id={"categoryNoSearch"}
                                             onChange={this.onSelectSearch}
                                             placeholder={"请选择类目编号"}
                                             allowClear>
                                {
                                    this.state.dictsSource.map(d => (
                                        <Option key={d.categoryNo} value={d.categoryNo}>
                                            {d.categoryNoName}
                                        </Option>
                                    ))
                                }
                            </Select>&nbsp;&nbsp;
                                作者：<Input placeholder={"请输入作者"} id={"authorSearch"} style={{width: 200}}
                                          allowClear={true}/>
                                <br/> <Button type={"primary"} onClick={this.fetchData} icon={<SearchOutlined />} shape={"circle"}></Button>&nbsp;&nbsp;
                                <Button type={"primary"} onClick={this.reset} >重置</Button>&nbsp;&nbsp;
                                {/*<Button type={"primary"} onClick={this.test}>查询个人借书情况</Button>*/}
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
                        }>
                        {/*<th>书名</th>&nbsp;
                        <th>类目编号</th>&nbsp;
                        <th>图片地址</th>&nbsp;
                        <th>书本描述</th>&nbsp;
                        <th>作者</th>&nbsp;
                        <th>可借阅书籍数量</th>&nbsp;
                        <th>操作</th>&nbsp;
                        {this.state.dataSource.map(record =>(
                            <tr style={{}}>
                                <td>{record.bookName}</td>&nbsp;&nbsp;
                                <td>{record.categoryNoName}</td>&nbsp;&nbsp;
                                <td><img src={"/bookservice-web/"+record.imageUrl} /></td>&nbsp;&nbsp;
                                <td>{record.description}</td>&nbsp;&nbsp;
                                <td>{record.author}</td>&nbsp;&nbsp;
                                <td>{record.counts}</td>&nbsp;&nbsp;
                                <td><a href={"#"} onClick={this.shoucang.bind(this,record)}>收藏</a></td>&nbsp;&nbsp;
                            </tr>
                        ))}
                        <tr>
                            <td><a onClick={this.upperPage}>上一页</a></td>&nbsp;&nbsp;
                            <a onClick={this.lowerPage}>下一页</a>
                        </tr>*/}
                    </Table>

                    <Modal visible={this.state.updateModal}
                           title={"图书修改"}
                           onCancel={this.handleCancel}
                           onOk={this.updateSubmit}
                           maskClosable={false}
                           width={600}>

                        图书编号：<Input id={"bookNo"} defaultValue={this.state.modalValue.bookNo} readOnly/><br/>
                        书名：<Input id={"bookName"} defaultValue={this.state.modalValue.bookName} readOnly/>
                        类目编号：<Select defaultValue={this.state.modalValue.categoryNoName}
                                     style={{width: 200}}
                                     id={"categoryNo"}
                                     onChange={this.onSelect}>
                        {
                            this.state.dictsSource.map(d => (
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
                        书名：<Input id={"bookNameAdd"} style={{width: 200}} placeholder={"请输入书名"}/><br/>
                        类目编号：<Select
                        style={{width: 200}}
                        id={"categoryNo"}
                        onChange={this.onSelectAdd}>
                        {
                            this.state.dictsSource.map(d => (
                                <Option key={d.categoryNo} value={d.categoryNo}>
                                    {d.categoryNoName}
                                </Option>
                            ))
                        }
                        <Option>

                        </Option>
                    </Select><br/>
                        图片：<Input id={"imageUrlAdd"} placeholder={"请输入图片"} style={{width: 200}}/><br/>
                        书本描述：<Input id={"descriptionAdd"} placeholder={"请输入书本描述"} style={{width: 200}}/><br/>
                        作者：<Input id={"authorAdd"} placeholder={"请输入作者"} style={{width: 200}}/><br/>
                    </Modal>
                </div>

                <div style={{float: "left", paddingTop: 170, paddingLeft: 450}}>
                    <h3>热门书籍</h3>
                    <ol>
                        {this.state.monthBorrowing.map(borrow => (
                            <li>
                                <div>
                                    <img src={"/bookservice-web/" + borrow.imageUrl}/>
                                    <span>{borrow.borrowingBookNoName}</span>
                                </div>
                            </li>
                        ))
                        }
                    </ol>
                </div>
            </div>
        );
    }
}

/*function fetchData() {
    fetch('http://localhost:8080/testController/test?id=asd')
        .then(res => res.json())
        .then(json => console.log(json.userName))
}*/


export default Index;
