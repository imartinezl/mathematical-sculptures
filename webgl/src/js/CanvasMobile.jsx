import Formula from 'fparser';
import React, { Component } from "react";
import { Button, Space, Tooltip, Dropdown, Menu, notification } from 'antd';
import { DownloadOutlined, BorderInnerOutlined, CompassOutlined, CompressOutlined,
    PlusOutlined, MinusOutlined, FullscreenOutlined, FullscreenExitOutlined, QuestionOutlined } from '@ant-design/icons';

import 'rc-color-picker/assets/index.css';
import ColorPicker from 'rc-color-picker';
import '../css/colorPickerMobile.css';
// import 'antd/dist/antd.css';
// import '../css/antDesign.css';


class CanvasMobile extends Component {
    constructor(props) {
        super(props)
        //window.screen.orientation.lock("portrait")

        // global variables
        
        this.canvas = null;
        this.gl = null;
        this.shaderProgram = null;
        this.uniforms = null;
        
        this.AMORTIZATION = 0.8;
        this.drag = false;
        this.translate = false;
        this.zoom = false;

        this.pX = null;
        this.pY = null;
        this.dX = 0;
        this.dY = 0;

        this.dZ = 0;
        
        this.aX = 0;
        this.aY = 0;
        this.tX = 0;
        this.tY = 0;

        this.evCache = [];
        this.prevDiff = -1;
        
        this.PX = 2;
        this.PY = 1;
        this.PZ = -8;
        this.THETA = -Math.PI / 5;
        this.PHI = Math.PI / 6;
        this.resetLook()

        this.colorBack= '#f1f1f1';
        this.colorShape= '#000000';
        this.alphaShape= 0.4

        this.showAxis = false;
        this.colorBackground = false;
        if(this.colorBackground) document.body.style.background = this.colorBack;

        this.state = {
            isFullScreen: false
        }
    }
    componentDidMount() {
        ({canvas:this.canvas, gl:this.gl, shaderProgram: this.shaderProgram, uniforms: this.uniforms} = this.init())
        this.run(this.canvas, this.gl, this.shaderProgram, this.uniforms)
    }
    
    componentDidUpdate(prevProps) {
        if( JSON.stringify(prevProps) !== JSON.stringify(this.props)){
            console.log("canvas did update")
            window.cancelAnimationFrame(this.request);
            this.uniforms = this.initMatrix(this.canvas)
            this.run(this.canvas, this.gl, this.shaderProgram, this.uniforms)
        }
    }
    
    init = () => {
        let {canvas, gl} = this.initCanvas();
        let shaderProgram = this.initShaders(gl)
        let uniforms = this.initMatrix(canvas)
        // this.mouseEvents(canvas);
        this.touchEvents(canvas);
        return {canvas, gl, shaderProgram, uniforms}
    }
    run = (canvas, gl, shaderProgram, uniforms) => {
        let attributes = this.generateVertices();
        let vertexBuffer = this.setVertexBuffer(gl, attributes.vertices);
        this.shadersAttributes(gl, shaderProgram, {vertexBuffer})
        this.draw(canvas, gl, shaderProgram, uniforms, attributes);
    }

    resize = (canvas) => {
        let resized = false
        let realToCSSPixels = window.devicePixelRatio;
    
        let displayWidth  = Math.floor(canvas.clientWidth  * realToCSSPixels);
        let displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);
    
        if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
            resized = true
        }
        return resized
    }

    initCanvas = () => {
        let canvas = document.getElementById('canvas');
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
        let gl = canvas.getContext('experimental-webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true });
        return {canvas, gl}
    }
    
    
    generateVertices = () => {
        console.log("generating points");
        let {FX, FY, FZ, uMin, uMax, vMin, vMax} = this.props
        //let uMin = 0.0
        //let uMax = 2 * Math.PI
        let uPoints = 60
        let uStep = (uMax - uMin) / uPoints

        //let vMin = 0.0
        //let vMax = Math.PI
        let vPoints = 120
        let vStep = (vMax - vMin) / vPoints

        // console.log("PRE", FX, FY, FZ)
        // if (this.validateFormula(FX)) this.FX = FX
        // if (this.validateFormula(FY)) this.FY = FY
        // if (this.validateFormula(FZ)) this.FZ = FZ
        // console.log("POS", this.FX, this.FY, this.FZ)

        let x_formula = new Formula(FX);
        let y_formula = new Formula(FY);
        let z_formula = new Formula(FZ);
        let scl = 1;
        let vertices = [];
        vertices = [
            0,0,0 , 1,0,0,
            0,0,0 , 0,1,0,
            0,0,0 , 0,0,1
        ];  
        let xMin = x_formula.evaluate({u: uMin, v:vMin})
        let xMax = x_formula.evaluate({u: uMax, v:vMax})
        let xMean = (xMin + xMax)/2
        let yMin = y_formula.evaluate({u: uMin, v:vMin})
        let yMax = y_formula.evaluate({u: uMax, v:vMax})
        let yMean = (yMin + yMax)/2
        let zMin = z_formula.evaluate({u: uMin, v:vMin})
        let zMax = z_formula.evaluate({u: uMax, v:vMax})
        let zMean = (zMin + zMax)/2

        // let xSum = 0, ySum = 0, zSum = 0

        for (let j = 0; j <= vPoints; j++) {
            for (let i = 0; i <= uPoints; i++) {
                let u = uStep * i
                let v = vStep * j
                let x = x_formula.evaluate({ u: u, v: v });// - xMean;
                let y = y_formula.evaluate({ u: u, v: v });// - yMean;
                let z = z_formula.evaluate({ u: u, v: v });// - zMean;
                x *= scl
                y *= scl
                z *= scl
                // xSum += x
                // ySum += y
                // zSum += z
                vertices.push(x, y, z)
            }
        }
        let n = vertices.length / 3
        // this.rX = xSum / n
        // this.rY = ySum / n
        // this.rZ = zSum / n
        return {vertices, n, uPoints, vPoints}
    }

    setVertexBuffer = (gl, vertices) => {
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vertexBuffer
    }

    initShaders = (gl) => {
        let vertCode =
            `
            precision mediump int;
            precision mediump float;
            
            attribute vec3 position;
            uniform mat4 Pmatrix;
            uniform mat4 Vmatrix;
            uniform mat4 Mmatrix;
            
            void main(void) { 
                gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
            }`;

        let [r, g, b] = this.hexToRgb(this.colorShape)
        let a = this.alphaShape
        let fragCode = 
            `
            precision mediump float;
            precision mediump int;

            uniform vec4 color;
            void main(void) {
                gl_FragColor = color;
            }`;

        let vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertCode);
        gl.compileShader(vertShader);

        let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(fragShader);

        let shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        
        gl.useProgram(shaderProgram);

        return shaderProgram
    }

    shadersUniforms = (gl, shaderProgram, uniforms) => {

        let _color = gl.getUniformLocation(shaderProgram, "color");
        let _Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
        let _Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
        let _Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

        gl.uniform4fv(_color, uniforms.color);
        gl.uniformMatrix4fv(_Pmatrix, false, uniforms.projMatrix);
        gl.uniformMatrix4fv(_Vmatrix, false, uniforms.viewMatrix);
        gl.uniformMatrix4fv(_Mmatrix, false, uniforms.moMatrix);
    }

    shadersAttributes = (gl, shaderProgram, attributes) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, attributes.vertexBuffer);
        let _position = gl.getAttribLocation(shaderProgram, "position");
        gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(_position);
    }

    getProjection = (angle, ratio, zMin, zMax) => {
        var ang = Math.tan((angle * .5) * Math.PI / 180); //angle*.5
        return [
            0.5 / ang, 0, 0, 0,
            0, 0.5 * ratio / ang, 0, 0,
            0, 0, -(zMax + zMin) / (zMax - zMin), -1,
            0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
        ];
    }

    getI4 = () => {
        return [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1];
    }

    initMatrix = (canvas) => {
        let projMatrix = this.getProjection(40, canvas.width / canvas.height, 1, 100);
        let moMatrix = this.getI4();
        let viewMatrix = this.getI4();
        viewMatrix[14] = viewMatrix[14] + this.PZ;

        return {projMatrix, moMatrix, viewMatrix}
    }

    rotateX = (m, angle) => {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        let mv1 = m[1],
            mv5 = m[5],
            mv9 = m[9];

        m[1] = m[1] * c - m[2] * s;
        m[5] = m[5] * c - m[6] * s;
        m[9] = m[9] * c - m[10] * s;

        m[2] = m[2] * c + mv1 * s;
        m[6] = m[6] * c + mv5 * s;
        m[10] = m[10] * c + mv9 * s;
    }

    rotateY = (m, angle) => {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        let mv0 = m[0],
            mv4 = m[4],
            mv8 = m[8];

        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6];
        m[8] = c * m[8] + s * m[10];

        m[2] = c * m[2] - s * mv0;
        m[6] = c * m[6] - s * mv4;
        m[10] = c * m[10] - s * mv8;
    }

    rotateZ = (m, angle) => {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        let mv0 = m[0],
            mv4 = m[4],
            mv8 = m[8];

        m[0] = c * m[0] - s * m[1];
        m[4] = c * m[4] - s * m[5];
        m[8] = c * m[8] - s * m[9];
        m[1] = c * m[1] + s * mv0;
        m[5] = c * m[5] + s * mv4;
        m[9] = c * m[9] + s * mv8;
    }
    setX = (m, x) => {
        m[12]=x;
    }
    setY = (m, y) => {
        m[13]=y;
    }
    setZ = (m, z) => {
        m[14]=z;
    }
    translateX = (m, t) => {
        m[12]+=t;
    }
    translateY = (m, t) => {
        m[13]+=t;
    }
    translateZ = (m, t) => {
        m[14]+=t;
    }
    applyZoom = () => {
        this.PZ -= this.dZ
        this.PZ = Math.max(-45, Math.min(0, this.PZ));
    }

    pointerDown = (ev) => {
        // console.log("pointerDown", ev)
        this.evCache.push(ev)

        this.pX = ev.pageX;
        this.pY = ev.pageY;
    }

    pointerMove = (ev) => {
        // console.log("pointerMove", ev)
        // ev.target.style.border = "dashed"
        for (let i = 0; i < this.evCache.length; i++) {
            if(ev.pointerId == this.evCache[i].pointerId){
                this.evCache[i] = ev;
                break;
            }
        }
        if (this.evCache.length == 2){
            let curDiff = Math.pow(this.evCache[0].clientX - this.evCache[1].clientX, 2) + Math.pow(this.evCache[0].clientY - this.evCache[1].clientY, 2) ;
            if(this.prevDiff > 0){
                this.dZ = 0.07
                if(curDiff < this.prevDiff){
                    // console.log("pinch out")
                    this.dZ *= 1
                }
                if(curDiff > this.prevDiff){
                    // console.log("pinch in")
                    this.dZ *= -1
                }
                this.applyZoom();
            }
            this.prevDiff = curDiff;
        }

        if (this.evCache.length == 1){
            // console.log("rotating")
            let pageX = ev.pageX;
            let pageY = ev.pageY;
            this.dX = (pageX - this.pX) * 2 * Math.PI / canvas.width;
            this.dY = (pageY - this.pY) * 2 * Math.PI / canvas.height;
            this.THETA += this.dX;
            this.PHI += this.dY;
            this.pX = pageX;
            this.pY = pageY;
            
        }
    }

    pointerUp = (ev) => {
        //console.log("pointerUp", ev)
        this.removeEvent(ev)
        // ev.target.style.border = null
        if(this.evCache.length < 2){
            this.prevDiff = -1;
        }
    }
    
    removeEvent = (ev) => {
        for (let i = 0; i < this.evCache.length; i++) {
            if(this.evCache[i].pointerId == ev.pointerId){
                this.evCache.splice(i, 1);
                break
            }
        }
    }

    touchEvents = (canvas) => {
        canvas.addEventListener("pointerdown", this.pointerDown, false)
        canvas.addEventListener("pointermove", this.pointerMove, false)
        canvas.addEventListener("pointerup", this.pointerUp, false)
        canvas.addEventListener("pointercancel", this.pointerUp, false)
        canvas.addEventListener("pointerout", this.pointerUp, false)
        canvas.addEventListener("pointerleave", this.pointerUp, false)

    }

    drawPoints = (gl, n) => {
        gl.drawArrays(gl.POINTS, 0, n);
    }

    drawLines = (gl, uPoints, vPoints) => {
        let start = 6
        if(this.showAxis){
            // start = 6;
            gl.drawArrays(gl.LINES, 0, 6);
        }
        for (let i = 0; i <= vPoints; i++) {
            gl.drawArrays(gl.LINE_STRIP, start+(uPoints + 1) * i, uPoints+1); //LINE_STRIP vs LINE_LOOP
        }
    }

    draw = (canvas, gl, shaderProgram, uniforms, attributes) => {
        
        let resized = this.resize(canvas);
        if (resized) uniforms = this.initMatrix(canvas)

        // clear canvas
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        // gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        [r, g, b] = this.hexToRgb(this.colorBack)
        gl.clearColor(r, g, b, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (!this.drag) {
            this.dX *= this.AMORTIZATION;
            this.dY *= this.AMORTIZATION;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }
        if(!this.translate){
            this.tX *= this.AMORTIZATION;
            this.tY *= this.AMORTIZATION;
            this.PX += this.tX;
            this.PY += this.tY;
        }
        if(this.zoom){
            this.dZ *= this.AMORTIZATION;
            this.applyZoom();
            if(Math.abs(this.dZ) < 0.01){
                this.zoom = false
            }
        }

        //console.log(canvas, gl, shaderProgram, uniforms, attributes)
        uniforms.moMatrix = this.getI4();

        this.setZ(uniforms.viewMatrix, this.PZ);
        this.setX(uniforms.viewMatrix, this.PX);
        this.setY(uniforms.viewMatrix, this.PY);
        this.rotateY(uniforms.moMatrix, this.THETA);
        this.rotateX(uniforms.moMatrix, this.PHI);
        
        let [r, g, b] = this.hexToRgb(this.colorShape)
        let a = this.alphaShape
        uniforms.color = new Float32Array([r, g, b, a]);

        // enable alpha blending
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);


        this.shadersUniforms(gl, shaderProgram, uniforms)

        //this.drawPoints(gl, attributes.n)
        this.drawLines(gl, attributes.uPoints, attributes.vPoints)

        this.request = window.requestAnimationFrame(this.draw.bind(this, canvas, gl, shaderProgram, uniforms, attributes));
    }

    hexToRgb = (hex) => 
        hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16)/255)

    handleColorShape = (color) => {
        this.colorShape = color.color;
        this.alphaShape = color.alpha/100;
    };
    
    handleColorBack = (color) => {
        this.colorBack = color.color;
        // this.canvas.background = color.color;
        if(this.colorBackground) document.body.style.background = color.color;
    };

    openNotification = () => {
        notification.open({
            key: '1',
            placement: 'topRight',
            duration: 6.5,
            top: 75,
            message: 'Navigation Help',
            style: {width: '240px'},
            description: 
            <div>
                <b>Rotate</b> with one finger <br/>
                {/* <b>Pan</b>: hold ctrl + drag <br/> */}
                <b>Zoom in / out</b> with two fingers <br/>
            </div>
            // onClick: () => {console.log('Notification Clicked!');},
        });
    };


    resetLook = (ev) => {
        this.PX = 0; // 2
        this.PY = 0; // 1
        this.PZ = -8;
        this.THETA = -Math.PI / 5;
        this.PHI = Math.PI / 6;
    }
    lookXY = (ev) => {
        this.PX = 0;
        this.PY = 0;
        this.THETA = 0;
        this.PHI = 0;
        ev.preventDefault();
    }
    lookXZ = (ev) => {
        this.PX = 0;
        this.PY = 0;
        this.THETA = 0;
        this.PHI = Math.PI / 2;
        ev.preventDefault();
    }
    lookYZ = (ev) => {
        this.PX = 0;
        this.PY = 0;
        this.THETA = Math.PI / 2;
        this.PHI = 0;
        ev.preventDefault();
    }
    zoomPlus = (ev) => {
        this.zoom = true
        this.dZ = -0.5
        this.applyZoom()
        ev.preventDefault();
    }
    zoomMinus = (ev) => {
        this.zoom = true
        this.dZ = 0.5
        this.applyZoom()
        ev.preventDefault();
    }
    toggleAxis = () => {
        this.showAxis = !this.showAxis
    }
    
    download = (canvas, filename, withFormula=true) => {

        let lnk = document.createElement('a'), ev;
        lnk.download = filename;
        lnk.href = canvas.toDataURL("image/png");
        if (document.createEvent) {
            ev = document.createEvent("MouseEvents");
            ev.initMouseEvent("click", true, true, window,
                            0, 0, 0, 0, 0, false, false, false,
                            false, 0, null);
            lnk.dispatchEvent(ev);
        } else if (lnk.fireEvent) {
            lnk.fireEvent("onclick");
        }
        ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
    }

    render() {
        return (
            <div>
                <canvas id="canvas" style={{touchAction: "none", background: 'white', cursor: "crosshair", display: "block", width: "100vw", height: window.innerHeight }}> 
                    {/* width: document.documentElement.clientWidth, height:document.documentElement.clientHeight }} */}
                </canvas>
                <Space direction="vertical" style={{position: "absolute", right:"4%", top:"25px"}}>
                    <Tooltip title="Help" placement="left">
                        <Button type="default" shape="circle" size="large" icon={<QuestionOutlined />} onClick={this.openNotification}/>
                    </Tooltip>
                </Space>
                <Space direction="vertical" style={{position: "absolute", left:"4%", bottom:"4%"}}>
                    <Tooltip title="Reset View" placement="right">
                        <Button type="default" shape="circle" size="large" icon={<CompressOutlined />} onClick={this.resetLook}/>
                    </Tooltip>
                    <Tooltip title="Look XY Plane" placement="right">
                        <Button type="default" shape="circle" size="large" onClick={this.lookXY}>XY</Button>
                    </Tooltip>
                    <Tooltip title="Look XZ Plane" placement="right">
                        <Button type="default" shape="circle" size="large" onClick={this.lookXZ}>XZ</Button>
                    </Tooltip>
                    <Tooltip title="Look YZ Plane" placement="right">
                        <Button type="default" shape="circle" size="large" onClick={this.lookYZ}>YZ</Button>
                    </Tooltip>
                    <Tooltip title="Download Image" placement="right">
                        <Button type="default" shape="circle" size="large" icon={<DownloadOutlined />} onClick={()=>this.download(this.canvas, 'figure.png')} />
                    </Tooltip>
                </Space>
                <Space direction="vertical" style={{position: "absolute", right:"4%", bottom:"4%"}}>
                    <Tooltip title="Zoom In" placement="left">
                        <Button type="default" shape="circle" size="large" icon={<PlusOutlined />} onClick={this.zoomPlus} />
                    </Tooltip>
                    <Tooltip title="Zoom Out" placement="left">
                        <Button type="default" shape="circle" size="large" icon={<MinusOutlined />} onClick={this.zoomMinus} />
                    </Tooltip>
                    <Tooltip title="Show/Hide Axis" placement="right">
                        <Button type="default" shape="circle" size="large" icon={<BorderInnerOutlined />} onClick={this.toggleAxis} />
                    </Tooltip>
                    <Tooltip title="Shape Color" placement="left">
                        <span><ColorPicker alpha={this.alphaShape*100} color={this.colorShape} onChange={this.handleColorShape} placement="topRight"/></span>
                    </Tooltip>
                    <Tooltip title="Background Color" placement="left">
                        <span><ColorPicker color={this.colorBack} onChange={this.handleColorBack} placement="topRight"/></span>
                    </Tooltip>
                </Space>
            </div>
        );
    }
}

export default CanvasMobile;