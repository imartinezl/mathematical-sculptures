import Formula from 'fparser';
import React, { Component } from "react";
import { Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import 'rc-color-picker/assets/index.css';
import ColorPicker from 'rc-color-picker';
import './colorPicker.css';
import 'antd/dist/antd.css';

class Canvas extends Component {
    constructor(props) {
        super(props)

        // global variables
        
        this.canvas = null;
        this.gl = null;
        this.shaderProgram = null;
        this.uniforms = null;
        
        this.AMORTIZATION = 0.8;
        this.control = false;
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
        
        this.PX = 2;
        this.PY = 1;
        this.PZ = -8;
        this.THETA = -Math.PI / 5;
        this.PHI = Math.PI / 6;

        this.colorBack= '#f1f1f1';
        this.colorShape= '#000000';
        this.alphaShape= 0.4

        this.showAxis = true;
        this.colorBackground = false;
        if(this.colorBackground) document.body.style.background = this.colorBack;
        window.addEventListener('resize', this.resize, false);
    }
    componentDidMount() {
        ({canvas:this.canvas, gl:this.gl, shaderProgram: this.shaderProgram, uniforms: this.uniforms} = this.init())
        this.run(this.canvas, this.gl, this.shaderProgram, this.uniforms)
    }
    
    componentDidUpdate() {
        console.log("component did update")
        this.run(this.canvas, this.gl, this.shaderProgram, this.uniforms)
    }
    
    init = () => {
        let {canvas, gl} = this.initCanvas();
        let shaderProgram = this.initShaders(gl)
        let uniforms = this.initMatrix(canvas)
        this.mouseEvents(canvas);
        return {canvas, gl, shaderProgram, uniforms}
    }
    run = (canvas, gl, shaderProgram, uniforms) => {
        let attributes = this.generateVertices();
        let vertexBuffer = this.setVertexBuffer(gl, attributes.vertices);
        this.shadersAttributes(gl, shaderProgram, {vertexBuffer})
        this.draw(canvas, gl, shaderProgram, uniforms, attributes);
    }

    resize = () => {
        let ratio = this.canvas.width / this.canvas.height;
        let canvas_height = window.innerHeight;
        let canvas_width = canvas_height * ratio;
        if(canvas_width > window.innerWidth){
            canvas_width = window.innerWidth;
            canvas_height = canvas_width/ratio;
        }
        
        // let canvas_width = window.innerWidth;
        // let canvas_height = canvas_width / ratio;
        // if(canvas_height > window.innerHeight){
        //     canvas_height = window.innerHeight;
        //     canvas_width = canvas_height*ratio;
        // }

        this.canvas.style.width = canvas_width + 'px';
        this.canvas.style.height = canvas_height + 'px';
        
        // this.canvas.width = window.innerWidth;
        // this.canvas.height = window.innerHeight;
        // ({canvas:this.canvas, gl:this.gl, shaderProgram: this.shaderProgram, uniforms: this.uniforms} = this.init())
        // this.run(this.canvas, this.gl, this.shaderProgram, this.uniforms)
    }

    initCanvas = () => {
        let canvas = document.getElementById('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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
        if(this.showAxis){
            vertices = [
                0,0,0 , 1,0,0,
                0,0,0 , 0,1,0,
                0,0,0 , 0,0,1
            ];  
        }
        let xMin = x_formula.evaluate({u: uMin, v:vMin})
        let xMax = x_formula.evaluate({u: uMax, v:vMax})
        let xMean = (xMin + xMax)/2
        let yMin = y_formula.evaluate({u: uMin, v:vMin})
        let yMax = y_formula.evaluate({u: uMax, v:vMax})
        let yMean = (yMin + yMax)/2
        let zMin = z_formula.evaluate({u: uMin, v:vMin})
        let zMax = z_formula.evaluate({u: uMax, v:vMax})
        let zMean = (zMin + zMax)/2
        for (let j = 0; j <= vPoints; j++) {
            for (let i = 0; i <= uPoints; i++) {
                let u = uStep * i
                let v = vStep * j
                let x = x_formula.evaluate({ u: u, v: v });// - xMean;
                let y = y_formula.evaluate({ u: u, v: v });// - yMean;
                let z = z_formula.evaluate({ u: u, v: v }) - zMean;
                x *= scl
                y *= scl
                z *= scl
                vertices.push(x, y, z)
            }
        }
        let n = vertices.length / 3
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

    keyDown = (e) => {
        // console.log("keyDown", e)
        if(e.keyCode == 17){
            this.control = true;
        }
        //e.preventDefault();
        return false;
    }

    keyUp = (e) => {
        // console.log("keyUp")
        this.control = false;
    }

    mouseDown = (e) => {
        // console.log("mouseDown")
        if(this.control){
            this.translate = true;
            this.aX = e.pageX;
            this.aY = e.pageY;
        }else{
            this.drag = true;
            this.pX = e.pageX;
            this.pY = e.pageY;
        }
        e.preventDefault();
        return false;
    }

    mouseUp = (e) => {
        // console.log("mouseUp")
        this.drag = false;
        this.translate = false;
        // console.log(this.THETA, this.PHI, this.PX, this.PY, this.PZ)
    }

    mouseMove = (e, canvas) => {
        // console.log("mouseMove", e)
        // console.log(this.control, this.translate, this.drag)
        if (this.translate){
            this.tX = (e.pageX - this.aX) * 2 * Math.PI / canvas.width;
            this.tY = -(e.pageY - this.aY) * 2 * Math.PI / canvas.height;
            this.PX += this.tX;
            this.PY += this.tY;
            this.aX = e.pageX;
            this.aY = e.pageY;
        }else if (this.drag){
            this.dX = (e.pageX - this.pX) * 2 * Math.PI / canvas.width;
            this.dY = (e.pageY - this.pY) * 2 * Math.PI / canvas.height;
            this.THETA += this.dX;
            this.PHI += this.dY;
            this.pX = e.pageX;
            this.pY = e.pageY;
        }
        //if (!this.drag || !this.translate) return false;
        e.preventDefault();
    }

    mouseWheel = (e) => {
        // console.log("mousewheel", e)
        this.zoom = true
        // this.dZ = e.deltaY * 0.0075 // > 0 ? 1 : -1;
        this.dZ = Math.sign(e.deltaY)*0.4
        this.PZ -= this.dZ
        this.PZ = Math.max(-45, Math.min(0, this.PZ));
        e.preventDefault();
    }

    mouseEvents = (canvas) => {
        document.addEventListener("keydown", this.keyDown, false);
        document.addEventListener("keyup", this.keyUp, false);
        canvas.addEventListener("mousedown", this.mouseDown, false);
        canvas.addEventListener("mouseup", this.mouseUp, false);
        canvas.addEventListener("mouseout", this.mouseUp, false);
        canvas.addEventListener("mousemove", e => this.mouseMove(e, canvas), false);
        canvas.addEventListener("wheel", this.mouseWheel, false);

        // canvas.addEventListener("touchstart", this.mouseDown, false);
        // canvas.addEventListener("touchend", this.mouseUp, false);
        // canvas.addEventListener("touchmove", e => this.mouseMove(e, canvas), false);
    }

    drawPoints = (gl, n) => {
        gl.drawArrays(gl.POINTS, 0, n);
    }

    drawLines = (gl, uPoints, vPoints) => {
        let start = 0
        if(this.showAxis){
            start = 6;
            gl.drawArrays(gl.LINES, 0, 6);
            // gl.drawArrays(gl.LINES, 2, 2);
            // gl.drawArrays(gl.LINES, 4, 2);
        }
        for (let i = 0; i <= vPoints; i++) {
            gl.drawArrays(gl.LINE_STRIP, start+(uPoints + 1) * i, uPoints+1); //LINE_STRIP vs LINE_LOOP
        }
    }

    draw = (canvas, gl, shaderProgram, uniforms, attributes) => {

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
            this.PZ -= this.dZ
            this.PZ = Math.max(-45, Math.min(0, this.PZ));
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

        // clear canvas
        //gl.clearColor(0.1, 0.1, 0.1, 1.0);
        [r, g, b] = this.hexToRgb(this.colorBack)
        gl.clearColor(r, g, b, 1.0);
        gl.clearDepth(1.0);
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.shadersUniforms(gl, shaderProgram, uniforms)

        this.drawPoints(gl, attributes.n)
        this.drawLines(gl, attributes.uPoints, attributes.vPoints)

        window.requestAnimationFrame(this.draw.bind(this, canvas, gl, shaderProgram, uniforms, attributes));
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

    lookXZ = () => {
        this.THETA = 0;
        this.PHI = Math.PI / 2;
    }
    lookXY = () => {
        this.THETA = 0;
        this.PHI = 0;
    }
    lookYZ = () => {
        this.THETA = Math.PI / 2;
        this.PHI = 0;
    }

    download = (canvas, filename) => {
        // add text
        let canvas2D = document.getElementById("text")
        let ctx2D = canvas2D.getContext("2d")
        canvas2D.width = canvas.width
        canvas2D.height = canvas.height
        let ctxWeb = canvas.getContext("experimental-webgl")

        ctx2D.fillStyle = "#ffffff"
        ctx2D.fillRect(0, 0, canvas.width, canvas.height)
        ctx2D.drawImage(canvas, 0, 0)
        let px = 30
        let py = 120
        let sep = 20
        let textColor = "#" +('0xffffff' ^ '0x' + this.colorBack.slice(1)).toString(16)
        ctx2D.font = "14px Segoe UI, Roboto, sans-serif"
        ctx2D.fillStyle = textColor;
        ctx2D.textAlign = "right"
        ctx2D.fillText("github.com/imartinezl", canvas2D.width-px, canvas2D.height-20);
        ctx2D.textAlign = "left"
        ctx2D.fillText("x = "+this.props.FX, px, canvas2D.height-py+sep*0);
        ctx2D.fillText("y = "+this.props.FY, px, canvas2D.height-py+sep*1);
        ctx2D.fillText("z = "+this.props.FZ, px, canvas2D.height-py+sep*2);
        ctx2D.fillText(this.props.uMin/Math.PI + "π < u < " + this.props.uMax/Math.PI + "π", px, canvas2D.height-py+sep*4);
        ctx2D.fillText(this.props.vMin/Math.PI + "π < v < " + this.props.vMax/Math.PI + "π", px, canvas2D.height-py+sep*5);

        let lnk = document.createElement('a'), e;
        lnk.download = filename;
        lnk.href = canvas2D.toDataURL("image/png");
        if (document.createEvent) {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window,
                            0, 0, 0, 0, 0, false, false, false,
                            false, 0, null);
            lnk.dispatchEvent(e);
        } else if (lnk.fireEvent) {
            lnk.fireEvent("onclick");
        }
        ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
    }

    render() {
        return (
            <div>
                <canvas id="canvas" style={{background: 'white', cursor: "crosshair"}}></canvas>
                <canvas id="text"></canvas>
                <Space style={{position: "absolute", left:"6%", bottom:"4%"}}>
                <Button type="default" shape="circle" onClick={this.lookXY} style={{}}>XY</Button>
                <Button type="default" shape="circle" onClick={this.lookXZ}>XZ</Button>
                <Button type="default" shape="circle" onClick={this.lookYZ}>YZ</Button>
                <Button type="default" shape="circle" icon={<DownloadOutlined />} onClick={()=>this.download(this.canvas, 'figure.png')} />
                <ColorPicker alpha={this.alphaShape*100} color={this.colorShape} onChange={this.handleColorShape} placement="topRight"/>
                <ColorPicker color={this.colorBack} onChange={this.handleColorBack} placement="topRight"/>
                </Space>
            </div>
        );
    }
}

export default Canvas;