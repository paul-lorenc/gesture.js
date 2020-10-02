function quadBezier(p0,p1,p2, t) {
    pFinal = {};
    pFinal.x = Math.pow(1 - t, 2) * p0.x + 
               (1 - t) * 2 * t * p1.x + 
               t * t * p2.x;
    pFinal.y = Math.pow(1 - t, 2) * p0.y + 
               (1 - t) * 2 * t * p1.y + 
               t * t * p2.y;
    return pFinal;
}

function cubicBezier(p0,p1,p2,p3, t) {
    pFinal = {};
    pFinal.x = Math.pow(1 - t, 3) * p0.x + 
               Math.pow(1 - t, 2) * 3 * t * p1.x + 
               (1 - t) * 3 * t * t * p2.x + 
               t * t * t * p3.x;
    pFinal.y = Math.pow(1 - t, 3) * p0.y + 
               Math.pow(1 - t, 2) * 3 * t * p1.y + 
               (1 - t) * 3 * t * t * p2.y + 
               t * t * t * p3.y;
    return pFinal;
}

function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}

function groupMidpoint(p0,p1) {
    xsum = 0
    ysum = 0
    for(var i = 0; i < p0.length; i++) {
        xsum += p0[i].x + p1[i].x
        ysum += p0[i].y + p1[i].y
    }
    p = {
        x: xsum / (p0.length + p1.length),
        y: ysum / (p0.length + p1.length)
    }
    console.log(p.x, p.y)
    return p
}

function quadBezierInterpolation(p0,p1,c,t) {
    if(p0.length != p1.length) {
        console.log("error! incorrect point array sizes")
        return
    }
    interpolated = []
    for(var i = 0; i < p0.length; i++) {
        interpolated.push(quadBezier(p0[i],c,p1[i],t))
    }

    return interpolated
}


var gesture = function(s) {
    s.point_stack = []
    s.old_point_stack = []
    s.cntr_curve_stack = []
    var override = true;
    var done = false;
    var cntr_curve = true;
    s.setup = function() {
        s.createCanvas(s.windowHeight,s.windowHeight)
    }

    s.draw = function() {
        s.push()
        s.background(75)
        s.noFill()
        if(s.point_stack.length > 22) {
            if(override) {
                s.old_point_stack = s.point_stack
                s.point_stack = []
                override = false;
            } else {
                done = true
            }
        }
        if(cntr_curve) {
            if(s.cntr_curve_stack.length > 3) {
                cntr_curve = false
                return
            }
            s.stroke('red')
            for(var i = 0; i < s.cntr_curve_stack.length; i++) {
                s.ellipse(s.cntr_curve_stack[i].x, s.cntr_curve_stack[i].y, 3)
            }
            return

        }
        s.beginShape()
        for(var i = 0; i < s.point_stack.length; i++) {
            p = s.point_stack[i]
            if(!done) {
                s.ellipse(p.x, p.y, 5)
            }
            if(done) {
                t_c = groupMidpoint(s.point_stack, s.old_point_stack)
                for(var x = -5; x < 5; x += 0.15) {
                    y = sigmoid(x)
                    s.stroke(225*y)
                    i_t_c = cubicBezier(s.cntr_curve_stack[0], s.cntr_curve_stack[1], s.cntr_curve_stack[2], s.cntr_curve_stack[3], y)
                    let t_points = quadBezierInterpolation(s.point_stack, s.old_point_stack, i_t_c, y)
                    s.ellipse(i_t_c.x, i_t_c.y, 2)
                    s.multicurve(t_points)  
                }
                
            }
        }
        s.stroke(0)
        s.multicurve(s.point_stack)
        s.multicurve(s.old_point_stack)
        s.pop()
    }

    s.windowResized = function() {
        s.resizeCanvas(s.windowWidth/4, s.windowHeight/4)
    }

    s.mousePressed = function() {
        p = {
            x: s.mouseX,
            y: s.mouseY
        }
        if(cntr_curve) {
            s.cntr_curve_stack.push(p)
            return
        }
        if(!done) {
            s.point_stack.push(p)
        }
    }

    s.multicurve = function(points) {
        var p0, p1, midx, midy;

        s.beginShape()

        if(points.length < 3) {
            return
        }

        s.vertex(points[0].x, points[0].y);

        for(var i = 1; i < points.length - 2; i += 1) {
            p0 = points[i];
            p1 = points[i + 1];
            midx = (p0.x + p1.x) / 2;
            midy = (p0.y + p1.y) / 2;
            s.quadraticVertex(p0.x, p0.y, midx, midy);
            s.vertex(midx, midy)
        }
        p0 = points[points.length - 2];
        p1 = points[points.length - 1];
        s.quadraticVertex(p0.x, p0.y, p1.x, p1.y);
        s.endShape()
    }
}

var c = new p5(gesture)