import React, { Component } from "react";
import Canvas from "./Canvas.jsx";

import { Input, Tree } from 'antd';
import 'antd/dist/antd.css';

const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
            {
              title: 'leaf',
              key: '0-0-0-2',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [
            {
              title: 'leaf',
              key: '0-0-1-0',
            },
          ],
        }
      ],
    },
  ];

  
class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            FX: 'cos(u)',
            FY: 'sin(u)',
            FZ: '0'
        }
    }
    componentDidUpdate() {
        console.log("component update")
        console.log(this.state)
    }

    handleFX = (e) => {
        let FX = e.target.value.replace(/\s+/g, '')
        this.setFX(FX)
    }
    handleFY = (e) => {
        let FY = e.target.value.replace(/\s+/g, '')
        this.setFY(FY)
    }
    handleFZ = (e) => {
        let FZ = e.target.value.replace(/\s+/g, '')
        this.setFZ(FZ)
    }
    setFX = (FX) => {
        this.setState({FX: FX})
    }
    setFY = (FY) => {
        this.setState({FY: FY})
    }
    setFZ = (FZ) => {
        this.setState({FZ: FZ})
    }

    onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    }
    render() {
        return (
            <div>
                <h2> Hello, World! </h2>
                <Input addonBefore="x =" defaultValue="cos(u)" style={{width: 200}} onChange={this.handleFX}/>
                <Input addonBefore="y =" defaultValue="sin(u)" style={{width: 200}} onChange={this.handleFY}/>
                <Input addonBefore="z =" defaultValue="0" style={{width: 200}} onChange={this.handleFZ}/>
                <Canvas FX={this.state.FX} FY={this.state.FY} FZ={this.state.FZ}/>
                <Tree
                    showLine={false}
                    onSelect={this.onSelect}
                    treeData={treeData}
                />
            </div>
        );
    }
}

export default App;