import React from 'react';
import styles from "./Register.less";
import 'antd/dist/antd.css';
import {Button, Form, Input, Row, Modal, Select, Table, Collapse, Alert, Col} from "antd";
import ReactGridManager, {$gridManager} from 'gridmanager-react';
import 'gridmanager-react/css/gm-react.css';
import {SearchOutlined} from "@ant-design/icons";

const Panel = Collapse.Panel;

const {Option} = Select;

class adminBooksManage extends React.Component {
    formRef = React.createRef();

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
                dataIndex: 'bookNo',
                width: 200,
                align: 'center',
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
                title: '状态',
                dataIndex: 'stateName',
                width: 200,
                align: 'center',
            },
            {
                title: '操作',
                width: 200,
                align: 'center',
                render: (text, record, index) => {
                    return record.stateName === "已借出" ?
                        <span>
                                <a onClick={this.updateBook.bind(this, record.id)}>修改</a>&nbsp;&nbsp;
                            <a onClick={this.returnBook.bind(this, record.bookNo)}>归还</a>&nbsp;&nbsp;
                            <a onClick={this.reNew.bind(this, record.bookNo)}>续借</a>
                                        </span> :
                        record.stateName === "未借出" ?
                            <span>
                                    <a onClick={this.updateBook.bind(this, record.id)}>修改</a>&nbsp;&nbsp;
                                <a onClick={this.borrowBook.bind(this, record.bookNo)}>借阅</a>
                                </span>
                            :
                            record.stateName === "待审核" ?
                                <span>
                                        <a onClick={this.updateBook.bind(this, record.id)}>修改</a>&nbsp;&nbsp;
                                    <a onClick={this.checkBook.bind(this, record.bookNo)}>审核</a>
                                    </span>
                                :
                                record.stateName === "审核失败" ?
                                    <a onClick={this.updateBook.bind(this, record.id)}>修改</a> :
                                    <span></span>
                },
            },
        ];
        this.state = {
            loading: false,
            checkModalValue: {},
            checkBookNo: '',
            checkBookModal: false,
            unCheckedNum: '',
            borrowBookNo: '',
            borrowBookModal: false,
            returnBook: {},
            addImage: '',
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

    reset = () => {
        this.formRef.current.resetFields();
        document.getElementById("bookNoSearch").value = "";
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

    componentWillMount() {
        this.getUser();
        this.fetchData();
        this.getAllDicts();
        this.getUnCheck();
    }

    componentDidMount() {
        this.interval = setInterval(() => this.getUnCheck(), 1000 * 60);
        document.title = "管理员图书信息管理"
    }

    componentWillUnmount() {
        clearInterval(this.interval);
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

    getUnCheck = () => {
        fetch('/book/admin/queryNotCheck').then(res => res.json())
            .then(json => {
                if (json.data != 0) {
                    this.fetchData();
                }
                this.setState({
                    unCheckedNum: json.data
                })
            })
    }

    fetchData = () => {
        this.setState({
            loading: true,
        })
        let data = {
            bookNo: document.getElementById("bookNoSearch") == null ? '' : document.getElementById("bookNoSearch").value.trim(),
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
        fetch('/book/admin/queryBooksByPage', {
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
                })
            })
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
            addImage: '',
        })
    }

    handleCancelBorrow = () => {
        this.setState({
            borrowBookNo: '',
            borrowBookModal: false,
        })
    }

    handleCancelCheck = () => {
        this.setState({
            checkBookNo: '',
            checkBookModal: false,
            checkModalValue: {},
        })
    }

    //审核通过
    passCheck = () => {
        let data = {
            bookNo: this.state.checkModalValue.bookNo,
            bookName: this.state.checkModalValue.bookName,
            donaterName: this.state.checkModalValue.donater,
            donateTime: this.state.checkModalValue.donateTime
        };
        fetch('/book/admin/passCheck', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.data === 1) {
                    alert("审核成功!");
                } else {
                    alert(json.data);
                }
                this.setState({
                    checkBookModal: false,
                    checkModalValue: {},
                })
                this.getUnCheck();
                this.fetchData();
            });
    }

    //审核不通过
    notPassCheck = () => {
        let data = {
            bookNo: this.state.checkModalValue.bookNo,
            bookName: this.state.checkModalValue.bookName,
            donaterName: this.state.checkModalValue.donater,
            donateTime: this.state.checkModalValue.donateTime
        };
        fetch('/book/admin/notPassCheck', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.data === 1) {
                    alert("操作成功!");
                } else {
                    alert(json.data);
                }
                this.setState({
                    checkBookModal: false,
                    checkModalValue: {},
                })
                this.getUnCheck();
                this.fetchData();
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
            "imageUrl": this.state.modalValue.imageUrl,
            "description": document.getElementById("description").value,
            "author": document.getElementById("author").value
        };
        fetch('/book/admin/updateBook', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                if (json.code === 1) {
                    alert("修改成功");
                    this.setState({
                        updateModal: false,
                        modalValue: {}
                    });
                    document.getElementById("image").value = '';
                } else {
                    alert(json.data);
                    this.setState({
                        updateModal: false,
                        modalValue: {}
                    })
                    document.getElementById("image").value = '';
                }
                this.fetchData();
            })
        ;
    }

    //修改上传图片
    updateImg = (event) => {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        fetch('/book/bookInfo/updateImage', {
            method: 'post',
            body: formData,
        }).then(response => response.json())
            .then((data) => {
                if (data.code === 1) {
                    let id = this.state.modalValue.id;
                    let categoryNo = this.state.modalValue.categoryNo;
                    this.setState({
                        modalValue: {
                            imageUrl: data.data,
                            id: id,
                            categoryNo: categoryNo,
                        }
                    })
                } else {
                    alert(data.data);
                }
            });
    }

    //新增上传图片
    AddImg = (event) => {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        fetch('/book/bookInfo/addImage', {
            method: 'post',
            body: formData,
        }).then(response => response.json())
            .then((data) => {
                if (data.code === 1) {
                    this.setState({
                        addImage: data.data,
                    })
                } else {
                    alert(data.data);
                }
            });
    }

    addSubmit = () => {
        let data = {
            "bookName": document.getElementById("bookNameAdd").value,
            "categoryNo": this.state.categoryNoAdd,
            "imageUrl": this.state.addImage,
            "description": document.getElementById("descriptionAdd").value,
            "author": document.getElementById("authorAdd").value
        };
        fetch('/book/admin/addBook', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                if (json.code === 1) {
                    alert("添加成功");
                    this.setState({
                        addModal: false,
                        categoryNoAdd: '',
                        addImage: ''
                    })
                } else {
                    alert(json.data);
                    this.setState({
                        addModal: false,
                        categoryNoAdd: '',
                        addImage: ''
                    })
                }
                this.fetchData();
            })
        ;
    }

    //借阅提交
    borrowSubmit = () => {
        let borrowingBookNo = this.state.borrowBookNo;
        let borrowingName = document.getElementById("userNameBorrow").value;

        //数据校验
        if (borrowingBookNo == null || borrowingBookNo.trim() === "") {
            alert("数据异常，请选择其他书籍");
            return;
        }

        //数据校验
        if (borrowingName == null || borrowingName.trim() === "") {
            alert("请输入借阅人账号");
            return;
        }
        let data = {
            borrowingBookNo: borrowingBookNo,
            borrowingName: borrowingName,
        }

        fetch('/book/admin/borrowBook', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.code === 0) {
                    alert(json.data);
                } else if (json.code === 1) {
                    alert("借阅成功");
                }
                this.setState({
                    borrowBookNo: '',
                    borrowBookModal: false,
                })
                this.fetchData();
            })
    }

    updateBook = (value) => {
        let data = {
            startIndex: 0,
            endIndex: 10,
            bookNo: value
        };
        fetch('/book/admin/queryBooksByPage', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                this.state.modalValue = json.data.list[0];
                this.setState({
                    modalValue: json.data.list[0],
                    updateModal: true,
                }, () => {
                    console.log(this.state.modalValue)
                });
            })
        ;
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

    //归还图书
    returnBook = (value) => {
        let data = {
            borrowingBookNo: value,
            startIndex: this.state.pagination.startIndex,
            endIndex: this.state.pagination.endIndex,
            pageSize: this.state.pagination.pageSize,
            currentPage: this.state.pagination.currentPage,
            total: this.state.pagination.total,
        };
        fetch('/book/admin/queryByBookNo', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.data === null) {
                    alert("数据为空!");
                } else {
                    let choice = window.confirm("确认归还图书吗?图书《" + json.data.borrowingBookNoName + "》于" +
                        json.data.borrowingTime + "被用户" + json.data.borrowingName + "借阅，应归还时间是"
                        + json.data.shouldReturnTime);
                    if (choice) {
                        let postData = {
                            borrowingBookNo: value,
                        };
                        fetch('/book/admin/returnBook', {
                            method: 'post',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(postData)//向服务器发送的数据
                        }).then(result => result.json())
                            .then(json2 => {
                                if (json2.code === 0) {
                                    alert("归还失败");
                                } else if (json2.code === 1) {
                                    alert("归还成功");
                                }
                                this.fetchData();
                            })
                    }
                }
            })
    }

    //续借图书
    reNew = (value) => {
        let data = {
            borrowingBookNo: value,
            startIndex: 0,
            endIndex: 100,
        }
        fetch('/book/admin/reNewBook', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        }).then(res => res.json())
            .then(json => {
                if (json.code === 1) {
                    alert("续借成功");
                } else {
                    alert(json.data);
                }
                this.fetchData();
            })
    }

    //借阅图书
    borrowBook = (value) => {
        this.setState({
            borrowBookModal: true,
            borrowBookNo: value,
        })
    }

    //打开图片
    openPic = (value) => {
        let blank = window.open('_blank');
        blank.location = "/bookservice-web/" + value;
    }

    // 接收子组件表格页码变化后返回的pagination
    paginationChange(pagination) {
        this.state.pagination.currentPage = pagination.current
        this.state.pagination.pageSize = pagination.pageSize
        this.state.pagination.startIndex = (pagination.current - 1) * pagination.pageSize
        this.state.pagination.endIndex = pagination.current * pagination.pageSize
        this.fetchData();
    }

    //审核书籍
    checkBook = (value) => {
        let data = {
            startIndex: this.state.pagination.startIndex,
            endIndex: this.state.pagination.endIndex,
            bookNo: value
        };
        fetch('/book/admin/queryBooksByPage', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)//向服务器发送的数据
        })
            .then(res => res.json())
            .then(json => {
                this.state.checkModalValue = json.data.list[0];
                this.setState({
                    checkModalValue: json.data.list[0],
                    checkBookModal: true,
                }, () => {
                    console.log(this.state.checkModalValue)
                });
            })
    }

    render() {
        return (
            <div>
                <div style={{float: 'left'}}>
                    <Form style={{paddingBottom: 30}} ref={this.formRef}>
                        <Collapse defaultActiveKey={['1']}>
                            <Panel header="管理员图书信息搜索查询" key="1">
                                <Row gutter={18}>
                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <Form.Item name="bookNoSearch" label="书本编号">
                                            <Input placeholder={"请输入书本编号"} style={{width: 200}} id={"bookNoSearch"}
                                                   allowClear={true}/>
                                        </Form.Item>
                                    </Col>

                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <Form.Item name="bookNameSearch" label="书名">
                                            <Input placeholder={"请输入书名"} style={{width: 200}} id={"bookNameSearch"}
                                                   allowClear={true}/>
                                        </Form.Item>
                                    </Col>

                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <Form.Item name="categoryNoSearch" label="类目编号">
                                            <Select defaultValue={this.state.modalValue.categoryNoName}
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
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <Form.Item name="authorSearch" label="作者">
                                            <Input placeholder={"请输入作者"} id={"authorSearch"} style={{width: 200}}
                                                   allowClear={true}/>
                                        </Form.Item>
                                    </Col>

                                    <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
                                        <Form.Item name="stateSearch" label="借出状态">
                                    <Select
                                    style={{width: 200}}
                                    id={"stateSearch"}
                                    onChange={this.onSelectSearchState}
                                    placeholder={"请选择借出状态"}
                                    allowClear>
                                    <Option value={1}>已借出</Option>
                                    <Option value={0}>未借出</Option>
                                    <Option value={2}>待审核</Option>
                                    <Option value={3}>未审核</Option>
                                </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={24}>
                                    <Col span={24} style={{textAlign: 'right'}}>
                                    <Button type={"primary"} onClick={this.fetchData} icon={<SearchOutlined/>}
                                                  shape={"circle"}></Button>&nbsp;&nbsp;
                                    <Button type={"primary"} onClick={this.reset}>重置</Button>&nbsp;&nbsp;
                                    <Button type={"primary"} onClick={this.add}>新增</Button>
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
                        <th>书本编号</th>
                        &nbsp;
                        <th>书名</th>
                        &nbsp;
                        <th>类目编号</th>
                        &nbsp;
                        <th>图片地址</th>
                        &nbsp;
                        <th>书本描述</th>
                        &nbsp;
                        <th>作者</th>
                        &nbsp;
                        <th>状态</th>
                        &nbsp;
                        <th>操作</th>
                        {this.state.dataSource.map(record => (
                            <tr>
                                <td>{record.bookNo}</td>
                                &nbsp;&nbsp;
                                <td>{record.bookName}</td>
                                &nbsp;&nbsp;
                                <td>{record.categoryNoName}</td>
                                &nbsp;&nbsp;
                                <td>
                                    <img src={"http://localhost:9999/bookservice-web/" + record.imageUrl}/>
                                </td>
                                &nbsp;&nbsp;
                                <td>{record.description}</td>
                                &nbsp;&nbsp;
                                <td>{record.author}</td>
                                &nbsp;&nbsp;
                                <td>{record.stateName}</td>
                                &nbsp;&nbsp;
                                <td>
                                    <a onClick={this.updateBook.bind(this, record.id)}>修改</a>&nbsp;&nbsp;
                                    {
                                        record.stateName === "已借出" ?
                                            <span>
                                            <a onClick={this.returnBook.bind(this, record.bookNo)}>归还</a>&nbsp;&nbsp;
                                                <a onClick={this.reNew.bind(this, record.bookNo)}>续借</a>
                                        </span> :
                                            record.stateName === "未借出" ?
                                                <a onClick={this.borrowBook.bind(this, record.bookNo)}>借阅</a> :
                                                record.stateName === "待审核" ?
                                                    <a onClick={this.checkBook.bind(this, record.bookNo)}>审核</a> :
                                                    record.stateName === "审核失败" ?
                                                        <a onClick={this.borrowBook.bind(this, record.bookNo)}>借阅</a> :
                                                        <span></span>
                                    }
                                </td>
                                &nbsp;&nbsp;
                            </tr>
                        ))}
                        <tr>
                            <td><a onClick={this.upperPage}>上一页</a></td>
                            &nbsp;&nbsp;
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
                    </Select><br/>
                        <form id="form-upload" role="form">
                            图片：<img src={this.state.modalValue.imageUrl}/>
                            <input type={"file"} id={"image"} name={"image"} onChange={this.updateImg}/><br/>
                        </form>
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
                        图片： <input type={"file"} id={"imageAdd"} name={"imageAdd"} onChange={this.AddImg}/><br/>
                        书本描述：<Input id={"descriptionAdd"} placeholder={"请输入书本描述"} style={{width: 200}}/><br/>
                        作者：<Input id={"authorAdd"} placeholder={"请输入作者"} style={{width: 200}}/><br/>
                    </Modal>

                    <Modal visible={this.state.borrowBookModal}
                           title={"借阅图书"}
                           onCancel={this.handleCancelBorrow}
                           onOk={this.borrowSubmit}
                           maskClosable={false}
                           width={600}
                           destroyOnClose={true}>
                        用户名：<Input id={"userNameBorrow"} style={{width: 200}} placeholder={"请输入用户名"}/><br/>
                    </Modal>

                    <Modal visible={this.state.checkBookModal}
                           title={"审核图书"}
                           onCancel={this.handleCancelCheck}
                           onOk={this.handleCancelCheck}
                           maskClosable={false}
                           width={600}
                           destroyOnClose={true}>
                        图书编号：<Input defaultValue={this.state.checkModalValue.bookNo} readOnly/><br/>
                        书名：<Input defaultValue={this.state.checkModalValue.bookName} readOnly/>
                        类目编号：<Select defaultValue={this.state.checkModalValue.categoryNoName}
                                     style={{width: 200}}
                                     onChange={this.onSelect}
                                     readOnly>
                        {
                            this.state.dictsSource.map(d => (
                                <Option key={d.categoryNo} value={d.categoryNo}>
                                    {d.categoryNoName}
                                </Option>
                            ))
                        }
                    </Select><br/>
                        图片：<img src={this.state.checkModalValue.imageUrl}/>
                        书本描述：<Input defaultValue={this.state.checkModalValue.description} readOnly/><br/>
                        作者：<Input defaultValue={this.state.checkModalValue.author} readOnly/><br/>
                        <Button type={"primary"} onClick={this.passCheck}>审核通过</Button>&nbsp;&nbsp;
                        <Button type={"danger"} onClick={this.notPassCheck}>不通过</Button>
                    </Modal>
                </div>

                <div style={{float: 'left'}}>
                    {
                        this.state.unCheckedNum == '' || this.state.unCheckedNum == 0 ? <span></span> :
                            <Alert message={"您有" + this.state.unCheckedNum + "条书籍信息待审核"} type={"info"}/>
                    }
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


    export default adminBooksManage;
