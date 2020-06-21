import './style.css';

import p5 from './p5.min.js';
// import * as p5 from './p5.min.js';
// import './p5.easycam.min.js'

const sketch = (p5) => {
    let w = 600,
        h = 600;
    let bg = p5.color(255, 227, 174);

    let uMin = 0,
        uMax = 2 * p5.PI,
        uPoints = 15,
        uStep = (uMax - uMin) / uPoints;

    let vMin = 0,
        vMax = 2 * p5.PI,
        vPoints = 15,
        vStep = (vMax - vMin) / vPoints;

    let scl = 50;
    let points = [];

    p5.setup = function() {
        p5.createCanvas(w, h, p5.WEBGL)

        for (let v = vMin; v <= vMax; v += vStep) {
            for (let u = uMin; u <= uMax; u += uStep) {
                // let x = 10 * p5.sin(u) * p5.cos(v)
                // let y = p5.sin(v) + 10 * p5.cos(u) * p5.cos(v)
                // let z = p5.cos(v) + 10 * p5.sin(u) * p5.sin(v)
                let x = p5.cos(u)
                let y = p5.sin(u)
                let z = v - vMax / 2
                    // point(scl * x, scl * y, scl * z)
                points.push(p5.createVector(x, y, z).mult(scl))
            }
        }
    }

    p5.draw = function() {
        p5.background(bg)
        p5.push()
        p5.rotateX(p5.frameCount * p5.PI / 200);
        p5.rotateY(p5.frameCount * p5.PI / 200);
        // p5.rotateZ(p5.frameCount * p5.PI / 200);
        p5.noFill()
        p5.stroke(0, 50)
        p5.strokeWeight(1.0)
        points.forEach(p => {
            p5.point(p)
        });
        // let count = 0
        // for (let v = vMin; v <= vMax; v += vStep) {
        //     p5.beginShape()
        //     for (let u = uMin; u <= uMax; u += uStep) {
        //         p5.vertex(points[count].x, points[count].y, points[count].z)
        //         count++
        //     }
        //     p5.endShape(p5.CLOSE)
        // }
        // p5.strokeWeight(2)
        // p5.box(200)
        p5.pop()

        if (p5.frameCount % 60 == 0) {
            p5.print(p5.frameRate())
        }
    }
}

const P5 = new p5(sketch);