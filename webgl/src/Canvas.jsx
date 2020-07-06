import React, { Component } from "react";
import Formula from 'fparser';


class Canvas extends Component {
    constructor(props) {
        super(props)

        // global variables

        this.canvas = null;
        this.gl = null;
        this.shaderProgram = null;
        this.uniforms = null;

        this.AMORTIZATION = 0.95;
        this.drag = false;
        this.zoom = false;
        this.pX = null;
        this.pY = null;
        this.dX = 0;
        this.dY = 0;
        this.dZ = 0;
        
        this.THETA = 0;
        this.PHI = 0;
    }
    componentDidMount() {
        ({canvas:this.canvas, gl:this.gl, shaderProgram: this.shaderProgram, uniforms: this.uniforms} = this.init())
        //this.canvas = canvas, this.gl = gl, this.shaderProgram = shaderProgram, this.uniforms = uniforms;
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

    initCanvas = () => {
        let canvas = document.getElementById('mycanvas');
        let gl = canvas.getContext('experimental-webgl', { premultipliedAlpha: false });
        return {canvas, gl}
    }
    
    
    generateVertices = () => {
        console.log("generating points");
        let {FX, FY, FZ, uMin, uMax, vMin, vMax} = this.props
        //let uMin = 0.0
        //let uMax = 2 * Math.PI
        let uPoints = 40
        let uStep = (uMax - uMin) / uPoints

        //let vMin = 0.0
        //let vMax = Math.PI
        let vPoints = 40
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
        for (let j = 0; j <= vPoints; j++) {
            for (let i = 0; i <= uPoints; i++) {
                let u = uStep * i
                let v = vStep * j
                let x = x_formula.evaluate({ u: u, v: v });
                let y =  y_formula.evaluate({ u: u, v: v });
                let z = z_formula.evaluate({ u: u, v: v }) - vMax / 2;
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
            `attribute vec3 position;
            uniform mat4 Pmatrix;
            uniform mat4 Vmatrix;
            uniform mat4 Mmatrix;
            void main(void) { 
                gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
            }`;

        let fragCode =
            `precision mediump float;
            void main(void) {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
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

        let _Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
        let _Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
        let _Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

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
        viewMatrix[14] = viewMatrix[14] - 7;

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
    translateZ = (m, t) => {
        m[14]+=t;
    }

    mouseDown = (e) => {
        // console.log("mouseDown")
        this.drag = true;
        this.pX = e.pageX;
        this.pY = e.pageY;
        e.preventDefault();
        return false;
    }

    mouseUp = (e) => {
        // console.log("mouseUp")
        this.drag = false;
    }

    mouseMove = (e, canvas) => {
        // console.log("mouseMove")
        if (!this.drag) return false;
        this.dX = (e.pageX - this.pX) * 2 * Math.PI / canvas.width;
        this.dY = (e.pageY - this.pY) * 2 * Math.PI / canvas.height;
        this.THETA += this.dX;
        this.PHI += this.dY;
        this.pX = e.pageX;
        this.pY = e.pageY;
        e.preventDefault();
    }

    mouseWheel = (e) => {
        // console.log("mousewheel", e)
        this.zoom = true
        this.dZ = e.deltaY // > 0 ? 1 : -1;
        e.preventDefault();
    }

    mouseEvents = (canvas) => {
        canvas.addEventListener("mousedown", this.mouseDown, false);
        canvas.addEventListener("mouseup", this.mouseUp, false);
        canvas.addEventListener("mouseout", this.mouseUp, false);
        canvas.addEventListener("mousemove", e => this.mouseMove(e, canvas), false);
        canvas.addEventListener("wheel", e => this.mouseWheel(e), false);
    }

    drawPoints = (gl, n) => {
        gl.drawArrays(gl.POINTS, 0, n);
    }

    drawLines = (gl, uPoints, vPoints) => {
        for (let i = 0; i <= vPoints; i++) {
            gl.drawArrays(gl.LINE_STRIP, (uPoints + 1) * i, uPoints+1);
        }
    }

    draw = (canvas, gl, shaderProgram, uniforms, attributes) => {

        if (!this.drag) {
            this.dX *= this.AMORTIZATION;
            this.dY *= this.AMORTIZATION;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }

        //this.viewMatrix[14] = this.viewMatrix[14] - 0.005
        //console.log(canvas, gl, shaderProgram, uniforms, attributes)
        uniforms.moMatrix = this.getI4();

        this.rotateY(uniforms.moMatrix, this.THETA);
        this.rotateX(uniforms.moMatrix, this.PHI);
        if(this.zoom){
            let oldZoom = uniforms.viewMatrix[14]
            let newZoom = oldZoom - this.dZ * 0.0075
            uniforms.viewMatrix[14] = Math.max(-20, Math.min(-2, newZoom));
            this.zoom = false
        }else{
            this.dZ *= 0.75;
            let oldZoom = uniforms.viewMatrix[14]
            let newZoom = oldZoom - this.dZ * 0.0075
            uniforms.viewMatrix[14] = Math.max(-20, Math.min(-2, newZoom));
        }

        // enable alpha blending
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        // clear canvas
        gl.clearColor(0.1, 0.1, 0.1, 0.9);
        gl.clearDepth(1.0);
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.shadersUniforms(gl, shaderProgram, uniforms)

        this.drawPoints(gl, attributes.n)
        this.drawLines(gl, attributes.uPoints, attributes.vPoints)

        window.requestAnimationFrame(this.draw.bind(this, canvas, gl, shaderProgram, uniforms, attributes));
    }

    render() {
        return (
            <div>
                <canvas id="mycanvas" width="600" height="600"
                    style={{ background: "antiquewhite" }}>
                </canvas>
            </div>
        );
    }
}

export default Canvas;