
//Helpers
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

const ge_getSection = (points, t) => {
    let sections = points.length - 2
    let cnt = 0
    let sec = 1/sections
    if(t == 1) {
        return sections-1
    }
    for(var i = 0; i < sections; i++) {
        if(t - cnt <= sec) {
            return i
        }
        cnt += sec
    }
    return i
}

const ge_getMidpoint = (p0,p1) => {
    return {
        x: (p0.x + p1.x)/2,
        y: (p0.y + p1.y)/2
    }
}
const ge_multipointInterpolation = (points, t) => {
    let sec = ge_getSection(points, t)
    let unit = 1/(points.length - 2)
    let rem = t - (sec*unit)
    //t of section
    let new_t = rem/unit

    //get points in section
    var p0,p1,p2

    //if on edges, use first or last points as anchors
    if (sec == 0) {
        p0 = points[0]
        p1 = points[1]
        p2 = ge_getMidpoint(points[1],points[2])
    } 
    else if (sec == points.length-3) {
        psecondtolast = points[points.length - 2]
        p0 = ge_getMidpoint(points[points.length-3],psecondtolast)
        p1 = psecondtolast
        p2 = points[points.length-1]
    }
    //otherwise, use midpoints as anchors
    else {
        pmid = points[sec+1]
        p0 = ge_getMidpoint(points[sec],pmid)
        p1 = pmid
        p2 = ge_getMidpoint(pmid, points[sec+2])
    }
    return quadBezier(p0,p1,p2,new_t)
}

//Every function input:
//s, a reference to a p5 canvas, 
//last_two, an object containing two point arrays of equal sizes

const ge_drawLines = (s, last_two) => {
    s.push()
    s.noFill()
    s.strokeWeight(1)
    for(let i = 0; i <= 1; i+=0.02) { 
        o = ge_multipointInterpolation(last_two[0],i)
        t = ge_multipointInterpolation(last_two[1],i)
        s.line(o.x,o.y,t.x,t.y)
    }
    o = ge_multipointInterpolation(last_two[0],1)
        t = ge_multipointInterpolation(last_two[1],1)
        s.line(o.x,o.y,t.x,t.y)
    s.pop()
}

const ge_revDrawLines = (s, last_two) => {
    s.push()
    s.noFill()
    s.strokeWeight(1)
    for(let i = 0; i <= 1; i+=0.02) { 
        o = ge_multipointInterpolation(last_two[0],i)
        t = ge_multipointInterpolation(last_two[1],1-i)
        s.line(o.x,o.y,t.x,t.y)
    }
    o = ge_multipointInterpolation(last_two[0],1)
        t = ge_multipointInterpolation(last_two[1],0)
        s.line(o.x,o.y,t.x,t.y)
    s.pop()
}

const ge_blackHole = (s, last_two) => {
    s.push()
    s.noFill()
    s.strokeWeight(1)
    let o0 = ge_multipointInterpolation(last_two[0], 0)
    let t0 = ge_multipointInterpolation(last_two[1], 0)
    let o1 = ge_multipointInterpolation(last_two[0], 0.5)
    let t1 = ge_multipointInterpolation(last_two[1], 0.5)
    let mid = ge_getMidpoint(o1,t1)
    s.beginShape()
    s.vertex(o0.x,o0.y)
    s.quadraticVertex(mid.x,mid.y,t0.x,t0.y)
    s.endShape()
    for(let i = -6; i < 6; i+=0.6) { 
        t = sigmoid(i)
        o0 = ge_multipointInterpolation(last_two[0],t)
        t0 = ge_multipointInterpolation(last_two[1],t)
        //gr_mp = groupMidpoint(last_two[0],last_two[1])
        if(t < 0.5) {
            o1 = ge_multipointInterpolation(last_two[0],t + 0.5)
            t1 = ge_multipointInterpolation(last_two[1],t + 0.5)
            
        } else {
            o1 = ge_multipointInterpolation(last_two[0],t - 0.5)
            t1 = ge_multipointInterpolation(last_two[1],t - 0.5)
        }
        mid = ge_getMidpoint(o1,t1)
        s.beginShape()
        s.vertex(o0.x,o0.y)
        s.quadraticVertex(mid.x,mid.y,t0.x,t0.y)
        s.endShape()
    }
    o0 = ge_multipointInterpolation(last_two[0], 1)
    t0 = ge_multipointInterpolation(last_two[1], 1)
    o1 = ge_multipointInterpolation(last_two[0], 0.5)
    t1 = ge_multipointInterpolation(last_two[1], 0.5)
    mid = ge_getMidpoint(o1,t1)
    s.beginShape()
    s.vertex(o0.x,o0.y)
    s.quadraticVertex(mid.x,mid.y,t0.x,t0.y)
    s.endShape()
    s.pop()
}

const ge_gestureArr = [
    ge_drawLines,
    ge_blackHole,
    ge_revDrawLines
]

const ge_pickDrawFunction = () => {
    p = Math.floor(Math.random()*ge_gestureArr.length)
    return ge_gestureArr[p]
}