import React, { Component } from 'react';
import {InjectGlobal} from "./style";
import Header from './common/header';
import TestRouter from './router';
import {IconInjectGlobal} from "./statics/iconfont/iconfont";


class App extends Component {
    render() {
        return (
            <div>
                <InjectGlobal/>
                <IconInjectGlobal/>
                <Header/>
                <TestRouter />
            </div>
        );
    }
}

export default App;
