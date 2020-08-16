import React, { Component } from "react";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";

import { Card, Input, Tree, InputNumber, Form, Divider, Space, Layout, Button, Typography } from 'antd';
const { DirectoryTree } = Tree;
const { Sider } = Layout;
const { Title } = Typography;
import { LeftOutlined, RightOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined } from '@ant-design/icons';
import '../css/antDesign.css';

import treeData from './TreeData.jsx'
import CanvasDesktop from "./CanvasDesktop.jsx";
import Formula from 'fparser';


class App extends Component {
    constructor(props) {
        super(props)

        this.initialValues = {
            FX: '2*cos(u)',
            FY: '(v/2)*sin(sin(2*u))',
            FZ: 'cos(10*v)/10 + sin(3*u)/3 + v',
            uMin: 0,
            uMax: 2 * Math.PI,
            vMin: 0.5 * Math.PI,
            vMax: Math.PI,
        }
        
        this.state = {
            FX: this.initialValues.FX,
            FY: this.initialValues.FY,
            FZ: this.initialValues.FZ,
            validFX: true,
            validFY: true,
            validFZ: true,
            uMin: this.initialValues.uMin,
            uMax: this.initialValues.uMax,
            vMin: this.initialValues.vMin,
            vMax: this.initialValues.vMax,

            collapsed: false,
        }
        this.formRef = React.createRef();
        document.addEventListener('keydown', this.keydown);
        
    }
    componentDidUpdate() {
        // console.log("app desktop update")
        // console.log(this.state)
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
            // console.error(error)
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
        // console.log(this.state.collapsed)
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    keydown = (ev) => {
        if(ev.keyCode === 69){
            this.toggleExamples();
        }
    }

    toggleExamples = () => {
        var el = document.getElementById("examples");
        if (el.style.display === "none") {
            el.style.display = "block";
        } else {
            el.style.display = "none";
        }
    }

    onBreakpoint = (broken) => {
        // console.log("broken", broken)
        if(broken){
            this.setState({collapsed: true});
        }else{
            this.setState({collapsed: false});
        }
    }

    render = () => {
        return (
            <Layout >
                <Sider 
                    collapsible 
                    collapsed={this.state.collapsed} 
                    trigger={null} 
                    breakpoint="xs" 
                    onBreakpoint={this.onBreakpoint}
                    collapsedWidth={0} 
                    width={400} 
                    theme={"light"}
                    style={{position: "fixed", background: "none", overflow: "inherit", transition: "all 0.25s ease-out 0s"}}
                >                        
                    <Card 
                        hoverable
                        bordered={false} 
                        title="Mathematical Sculptures"
                        style={{ position:"relative", width: 335, left:"30px", top:"25px"}}
                        // style={{ position:"absolute", zIndex: 10, width: 334, left:"4%", top:"4%"}}
                    >
            
                        {/* <Divider orientation="left" style={{marginBottom: "30px"}}>
                            Parametric Equations
                        </Divider> */}
                        <Form 
                            ref={this.formRef} 
                            layout={{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }}
                            initialValues={this.initialValues} autoComplete="off"
                        >
                            <Form.Item 
                                name={'FX'} 
                                hasFeedback 
                                validateStatus={this.state.validFX ? "success" : "warning"}
                                help={this.state.validFX ? null : "Should be a valid formula"}
                            >
                                <Input placeholder="formula for x" addonBefore="x =" onChange={this.handleFX} />
                            </Form.Item>
                            <Form.Item 
                                name={'FY'} 
                                hasFeedback 
                                validateStatus={this.state.validFY ? "success" : "warning"}
                                help={this.state.validFY ? null : "Should be a valid formula"}
                            >
                                <Input placeholder="formula for y" addonBefore="y =" onChange={this.handleFY}/>
                            </Form.Item>
                            <Form.Item 
                                name={'FZ'} 
                                hasFeedback 
                                validateStatus={this.state.validFZ ? "success" : "warning"}
                                help={this.state.validFZ ? null : "Should be a valid formula"}
                            >
                                <Input placeholder="formula for z" addonBefore="z =" onChange={this.handleFZ}/>
                            </Form.Item>
                        </Form>
                        <Space 
                            direction="horizontal" 
                            size="small" 
                            align="center" 
                            style={{marginTop: "-10px"}}
                        >
                            <span className="ant-input-group-addon" id="ranges">Range</span>
                            <Space direction="vertical" size="small">
                                <Input.Group compact>
                                    <InputNumber 
                                        style={{ textAlign: 'center', width: 70, zIndex:2 }}
                                        defaultValue={0} min={-100} max={100} step={0.5}
                                        formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                                        onChange={this.handleUMin} value={this.state.uMin / Math.PI}
                                        />
                                    <Input style={{ width: 60, textAlign: 'center', pointerEvents: 'none', }} placeholder="< u <" />
                                    <InputNumber 
                                        style={{ textAlign: 'center', width: 70 }}
                                        defaultValue={2} min={-100} max={100} step={0.5}
                                        formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                                        onChange={this.handleUMax} value={this.state.uMax / Math.PI} />
                                </Input.Group>
                                <Input.Group compact>
                                    <InputNumber 
                                        style={{ textAlign: 'center', width: 70, zIndex:2 }}
                                        defaultValue={0} min={-100} max={100} step={0.5}
                                        formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                                        onChange={this.handleVMin} value={this.state.vMin / Math.PI} />
                                    <Input style={{ width: 60, textAlign: 'center', pointerEvents: 'none' }} placeholder="< v <" />
                                    <InputNumber 
                                        style={{ textAlign: 'center', width: 70 }}
                                        defaultValue={2} min={-100} max={100} step={0.5}
                                        formatter={value => `${value}π`} parser={value => value.replace('π', '')}
                                        onChange={this.handleVMax} value={this.state.vMax / Math.PI} />
                                </Input.Group>
                            </Space>
                        </Space>
                        <div id="examples" style={{display: "none"}}>
                            <Divider orientation="left" style={{marginBottom: "20px", marginTop: "40px"}}>Examples</Divider>
                            <DirectoryTree
                                showLine={false}
                                showIcon={false}
                                onSelect={this.onSelect}
                                treeData={treeData}
                                height={300}
                                />
                        </div>
                    </Card>
                </Sider>
                <Layout>
                        <Button 
                            type="default" 
                            shape="circle" 
                            onClick={this.toggleCollapse}
                            // icon={this.state.collapsed ? <RightOutlined /> : <LeftOutlined />} 
                            // icon={this.state.collapsed ? <MenuOutlined /> : <MenuFoldOutlined /> } 
                            icon={<MenuOutlined />} 
                            style={{position: "absolute", left: this.state.collapsed ? "30px" : "320px", top: "38px", transition: "all 0.25s ease-out 0s"}}/>
                        <CanvasDesktop 
                            FX={this.state.FX} FY={this.state.FY} FZ={this.state.FZ}
                            uMin={this.state.uMin} uMax={this.state.uMax}
                            vMin={this.state.vMin} vMax={this.state.vMax}
                            THETA={this.state.THETA} PHI={this.state.PHI}
                        />
                </Layout>
            </Layout>
                
        )
    }
}

export default App;