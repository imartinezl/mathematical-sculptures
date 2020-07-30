import React, { Component } from "react";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";

// Desktop
import { Card, Input, Tree, InputNumber, Form, Divider, Space, Layout, Button, Typography } from 'antd';
const { DirectoryTree } = Tree;
const { Sider } = Layout;
const { Title } = Typography;
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

// Mobile
import { Drawer, List, NavBar, Icon } from 'antd-mobile';
// import 'antd-mobile/dist/antd-mobile.css'; 
import '../css/antDesignMobile.css';


import treeData from './TreeData.jsx'
import Canvas from "./Canvas.jsx";
import CanvasMobile from "./CanvasMobile.jsx";
import Formula from 'fparser';


class App extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            FX: 'cos(u)',
            FY: 'sin(u)',
            FZ: 'v',
            validFX: true,
            validFY: true,
            validFZ: true,
            uMin: 0,
            uMax: 2 * Math.PI,
            vMin: 0,
            vMax: 2 * Math.PI,

            collapsed: false
        }
        this.formRef = React.createRef();
        
    }
    componentDidUpdate() {
        console.log("app update")
        console.log(this.state)
    }
    validateFormula = (F) => {
        let acceptableVars = ['u', 'v']
        try {
            let formulaTMP = new Formula(F);
            let usedVariables = formulaTMP.getVariables()
            usedVariables.forEach(e => {
                if (!acceptableVars.includes(e)) {
                    throw "Not in aceptable variables list"
                }
            });
            let a = formulaTMP.evaluate({ u: 0, v: 0 });
            // console.log(a)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    handleFX = (e) => {
        let FX = e.target.value//.replace(/\s+/g, '')
        if (this.validateFormula(FX)) {
            this.setFX(FX)
            this.setValidFX(true)
        } else {
            this.setValidFX(false)
        }
    }
    handleFY = (e) => {
        let FY = e.target.value//.replace(/\s+/g, '')
        if (this.validateFormula(FY)) {
            this.setFY(FY)
            this.setValidFY(true)
        } else {
            this.setValidFY(false)
        }
    }
    handleFZ = (e) => {
        let FZ = e.target.value//.replace(/\s+/g, '')
        if (this.validateFormula(FZ)) {
            this.setFZ(FZ)
            this.setValidFZ(true)
        } else {
            this.setValidFZ(false)
        }
    }
    setValidFX = (validFX) => {
        this.setState({ validFX: validFX })
    }
    setValidFY = (validFY) => {
        this.setState({ validFY: validFY })
    }
    setValidFZ = (validFZ) => {
        this.setState({ validFZ: validFZ })
    }
    setFX = (FX) => {
        this.setState({ FX: FX })
    }
    setFY = (FY) => {
        this.setState({ FY: FY })
    }
    setFZ = (FZ) => {
        this.setState({ FZ: FZ })
    }

    handleUMin = (uMin) => {
        this.setUMin(uMin * Math.PI)
    }
    handleUMax = (uMax) => {
        this.setUMax(uMax * Math.PI)
    }
    handleVMin = (vMin) => {
        this.setVMin(vMin * Math.PI)
    }
    handleVMax = (vMax) => {
        this.setVMax(vMax * Math.PI)
    }
    setUMin = (uMin) => {
        this.setState({ uMin: uMin })
    }
    setUMax = (uMax) => {
        this.setState({ uMax: uMax })
    }
    setVMin = (vMin) => {
        this.setState({ vMin: vMin })
    }
    setVMax = (vMax) => {
        this.setState({ vMax: vMax })
    }

    onSelect = (selectedKeys, info) => {
        const { FX, FY, FZ, uMin, uMax, vMin, vMax } = info.node
        // console.log('selected', selectedKeys, info);
        this.setFX(FX)
        this.setFY(FY)
        this.setFZ(FZ)
        this.setUMin(uMin)
        this.setUMax(uMax)
        this.setVMin(vMin)
        this.setVMax(vMax)
        this.formRef.current.setFieldsValue({
            FX: FX,
            FY: FY,
            FZ: FZ
        });
    }

    toggleCollapse = () => {
        console.log(this.state.collapsed)
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render = () => {

        const sidebar = (
            <div
                style={{ padding: "30px" }}
            >
                <Divider orientation="left">
                    Parametric Equations
                </Divider>
                <Form 
                    ref={this.formRef} 
                    layout={{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }}
                    initialValues={{FX: 'cos(u)', FY: 'sin(u)', FZ: 'v'}} autoComplete="off"
                >
                    <Form.Item 
                        name={'FX'} 
                        hasFeedback 
                        validateStatus={this.state.validFX ? "success" : "warning"}
                        help={this.state.validFX ? null : "Should be a valid formula"}
                    >
                        <Input size="large" placeholder="formula for x" addonBefore="x =" onChange={this.handleFX} />
                    </Form.Item>
                    <Form.Item 
                        name={'FY'} 
                        hasFeedback 
                        validateStatus={this.state.validFY ? "success" : "warning"}
                        help={this.state.validFY ? null : "Should be a valid formula"}
                    >
                        <Input size="large" placeholder="formula for y" addonBefore="y =" onChange={this.handleFY}/>
                    </Form.Item>
                    <Form.Item 
                        name={'FZ'} 
                        hasFeedback 
                        validateStatus={this.state.validFZ ? "success" : "warning"}
                        help={this.state.validFZ ? null : "Should be a valid formula"}
                    >
                        <Input size="large" placeholder="formula for z" addonBefore="z =" onChange={this.handleFZ}/>
                    </Form.Item>
                </Form>
                <Divider orientation="left">
                    Parameter Range
                </Divider>
                <Space direction="vertical" size="small">
                    <Input.Group compact>
                        <InputNumber 
                            size="large"
                            style={{ textAlign: 'center', width: "20%", minWidth: 80, maxWidth: 100, zIndex:2 }}
                            defaultValue={0} min={-100} max={100} step={0.25} 
                            formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                            onChange={this.handleUMin} value={this.state.uMin / Math.PI}
                            />
                        <Input size="large" style={{ width: 70, textAlign: 'center', pointerEvents: 'none', }} placeholder="< u <" />
                        <InputNumber 
                            size="large"
                            style={{ textAlign: 'center', width: "20%", minWidth: 80, maxWidth: 100 }}
                            defaultValue={2} min={-100} max={100} step={0.25}
                            formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                            onChange={this.handleUMax} value={this.state.uMax / Math.PI} />
                    </Input.Group>
                    <Input.Group compact>
                        <InputNumber 
                            size="large"
                            style={{ textAlign: 'center', width: "20%", minWidth: 80, maxWidth: 100, zIndex:2 }}
                            defaultValue={0} min={-100} max={100} step={0.25} 
                            formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                            onChange={this.handleVMin} value={this.state.vMin / Math.PI} />
                        <Input size="large" style={{ width: 70, textAlign: 'center', pointerEvents: 'none' }} placeholder="< v <" />
                        <InputNumber 
                            size="large"
                            style={{ textAlign: 'center', width: "20%", minWidth: 80, maxWidth: 100 }}
                            defaultValue={2} min={-100} max={100} step={0.25}
                            formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                            onChange={this.handleVMax} value={this.state.vMax / Math.PI} />
                    </Input.Group>
                </Space>
            </div>
        );
      
          return (<div>
            <Button 
                type="default" 
                shape="circle" 
                size= 'large'
                onClick={this.toggleCollapse}
                icon={this.state.collapsed ? <RightOutlined /> : <LeftOutlined />} 
                style={{position: "absolute", left: this.state.collapsed ? "5%" : "80%", top: "4%", transition: "all 0.25s ease-out 0s", zIndex: 5}}
            />      
            <Drawer
                className="my-drawer"
                style={{ minHeight: document.documentElement.clientHeight }}
                // enableDragHandle
                contentStyle={{ color: '#A6A6A6', textAlign: 'center' }}
                sidebar={sidebar}
                open={!this.state.collapsed}
                onOpenChange={this.toggleCollapse}
            >
              <CanvasMobile 
                FX={this.state.FX} FY={this.state.FY} FZ={this.state.FZ}
                uMin={this.state.uMin} uMax={this.state.uMax}
                vMin={this.state.vMin} vMax={this.state.vMax}
                THETA={this.state.THETA} PHI={this.state.PHI}
              />
            </Drawer>
          </div>);
    }

}

export default App;