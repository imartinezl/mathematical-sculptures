import React, { Component } from "react";
import Canvas from "./Canvas.jsx";
import Formula from 'fparser';

import { Input, Tree, InputNumber, Form } from 'antd';
import 'antd/dist/antd.css';

const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      x: 'sin(u)10(cos(v))',
      y: 'sin(v)+cos(u)10(cos(v))',
      z: 'cos(v)+10(sin(v))sin(u)',
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
            FZ: '0',
            validFX: true,
            validFY: true,
            validFZ: true,
            uMin: 0,
            uMax: 2*Math.PI,
            vMin: 0,
            vMax: 2*Math.PI
        }
    }
    componentDidUpdate() {
        console.log("component update")
        console.log(this.state)
    }
    validateFormula = (F) => {
        let acceptableVars = ['u', 'v']
        try {
            let formulaTMP = new Formula(F);
            let usedVariables = formulaTMP.getVariables()
            usedVariables.forEach(e => {
                if(!acceptableVars.includes(e)){
                    throw "Not in aceptable variables list"
                }
            });
            let a = formulaTMP.evaluate({ u: 0, v: 0 });
            console.log(a)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
    
    handleFX = (e) => {
        let FX = e.target.value.replace(/\s+/g, '')
        if (this.validateFormula(FX)){
            this.setFX(FX)
            this.setValidFX(true)
        }else{
            this.setValidFX(false)
        }
    }
    handleFY = (e) => {
        let FY = e.target.value.replace(/\s+/g, '')
        if (this.validateFormula(FY)){
            this.setFY(FY)
            this.setValidFY(true)
        }else{
            this.setValidFY(false)
        }
    }
    handleFZ = (e) => {
        let FZ = e.target.value.replace(/\s+/g, '')
        if (this.validateFormula(FZ)){
            this.setFZ(FZ)
            this.setValidFZ(true)
        }else{
            this.setValidFZ(false)
        }
    }
    setValidFX = (validFX) => {
        this.setState({validFX: validFX})
    }
    setValidFY = (validFY) => {
        this.setState({validFY: validFY})
    }
    setValidFZ = (validFZ) => {
        this.setState({validFZ: validFZ})
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

    handleUMin = (uMin) => {
        this.setUMin(uMin*Math.PI)
    }
    handleUMax = (uMax) => {
        this.setUMax(uMax*Math.PI)
    }
    handleVMin = (vMin) => {
        this.setVMin(vMin*Math.PI)
    }
    handleVMax = (vMax) => {
        this.setVMax(vMax*Math.PI)
    }
    setUMin = (uMin) => {
        this.setState({uMin: uMin})
    }
    setUMax = (uMax) => {
        this.setState({uMax: uMax})
    }
    setVMin = (vMin) => {
        this.setState({vMin: vMin})
    }
    setVMax = (vMax) => {
        this.setState({vMax: vMax})
    }

    onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    }
    render() {
        return (
            <div>
                <h2> Hello, World! </h2>
                <Form layout={{labelCol: { span: 8 }, wrapperCol: { span: 16 }}} 
                        initialValues={{FX: 'cos(u)', FY: 'sin(u)', FZ: '0'}}>
                <Form.Item name={'FX'} validateStatus={this.state.validFX ? "success": "warning"}
                hasFeedback help={this.state.validFX ? null: "Should be a valid formula"}>
                    <Input placeholder="formula for x" addonBefore="x =" onChange={this.handleFX}/>
                </Form.Item>
                <Form.Item name={'FY'} validateStatus={this.state.validFY ? "success": "warning"}
                hasFeedback help={this.state.validFX ? null: "Should be a valid formula"}>
                    <Input placeholder="formula for y" addonBefore="y =" onChange={this.handleFY}/>
                </Form.Item>
                <Form.Item name={'FZ'} validateStatus={this.state.validFZ ? "success": "warning"}
                hasFeedback  help={this.state.validFX ? null: "Should be a valid formula"}>
                    <Input placeholder="formula for z" addonBefore="z =" onChange={this.handleFZ}/>
                </Form.Item>
                </Form>
                <Canvas FX={this.state.FX} FY={this.state.FY} FZ={this.state.FZ}
                        uMin={this.state.uMin} uMax={this.state.uMax}
                        vMin={this.state.vMin} vMax={this.state.vMax}/>
                <Tree
                    showLine={false}
                    onSelect={this.onSelect}
                    treeData={treeData}
                />
                <br />
                <Input.Group compact>
                {/* <Input 
                style={{textAlign: 'center', width: 65}} 
                placeholder="min"
                defaultValue="0"
                suffix="π"
                onChange={this.handleUMin}
                /> */}
                <InputNumber
                style={{textAlign: 'center', width: 75}} 
                defaultValue={0}
                min={0}
                max={100}
                step={1}
                formatter={value => `${value}π`}
                parser={value => value.replace('π', '')}
                onChange={this.handleUMin}
                />
                <Input
                    style={{
                    width: 60,
                    textAlign: 'center',
                    pointerEvents: 'none',
                    }}
                    placeholder="< u <"
                />
                {/* <Input 
                style={{textAlign: 'center', width: 65}} 
                placeholder="max"
                defaultValue="2"
                suffix="π"
                onChange={this.handleUMax}
                /> */}
                <InputNumber
                style={{textAlign: 'center', width: 75}} 
                defaultValue={2}
                min={0}
                max={100}
                step={1}
                formatter={value => `${value}π`}
                parser={value => value.replace('π', '')}
                onChange={this.handleUMax}
                />
                </Input.Group>
                <br />
                <br />
                <Input.Group compact>
                <InputNumber
                style={{textAlign: 'center', width: 75}} 
                defaultValue={0}
                min={0}
                max={100}
                step={1}
                formatter={value => `${value}π`}
                parser={value => value.replace('π', '')}
                onChange={this.handleVMin}
                />
                <Input
                    style={{
                    width: 60,
                    textAlign: 'center',
                    pointerEvents: 'none',
                    }}
                    placeholder="< v <"
                />
                <InputNumber
                style={{textAlign: 'center', width: 75}} 
                defaultValue={2}
                min={0}
                max={100}
                step={1}
                formatter={value => `${value}π`}
                parser={value => value.replace('π', '')}
                onChange={this.handleVMax}
                />
                </Input.Group>
            </div>
        );
    }
}

export default App;