import {BrowserRouter as Router,Route} from 'react-router-dom';
import React from "react";
import App from "../App";
import index from "../Apply/Index";
import Login from '../Apply/Login';
import Register from '../Apply/Register';
import UserIndex from '../Apply/UserIndex';
import Personal from '../Apply/Personal';
import Borrowing from '../Apply/Borrowing';
import Account from '../Apply/Account';
import Favorite from '../Apply/Favorite';
import adminIndex from '../Apply/adminIndex';
import adminUserManage from '../Apply/adminUserManage';
import adminBooksManage from '../Apply/adminBooksManage';
import ipLog from '../Apply/ipLog';

function TestRouter() {

    return (
        <Router>
            <div>
                <Route exact path={"/bookservice-web"} component={index} />
                <Route path={"/bookservice-web/login"} component={Login} />
                <Route path={"/bookservice-web/register"} component={Register}/>
                <Route path={"/bookservice-web/userIndex"} component={UserIndex}/>
                <Route path={"/bookservice-web/personal"} component={Personal}/>
                <Route path={"/bookservice-web/myBorrowing"} component={Borrowing}/>
                <Route path={"/bookservice-web/myAccount"} component={Account}/>
                <Route path={"/bookservice-web/myFavorite"} component={Favorite}/>
                <Route path={"/bookservice-web/adminIndex"} component={adminIndex}/>
                <Route path={"/bookservice-web/ipLog"} component={ipLog}/>
                <Route path={"/bookservice-web/adminUserManage"} component={adminUserManage}/>
                <Route path={"/bookservice-web/adminBooksManage"} component={adminBooksManage}/>
            </div>
        </Router>
    );
}

export default TestRouter;