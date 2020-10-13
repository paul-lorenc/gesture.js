function sinD (angle) {
    return Math.sin(angle*Math.PI/180);
}

function cosD (angle) {
    return Math.cos(angle*Math.PI/180);
}

class Polar {
    constructor(ox,oy,zero,r,theta) {
        this.ox = ox
        this.oy = oy
        this.zero = zero
        this.r = r
        this.theta = theta + this.zero
        this.x = Math.round(this.r*cosD(this.theta) + this.ox)
        this.y = Math.round(this.oy - this.r*sinD(this.theta))
    }

    walk(dr,dtheta) {
        this.ox = this.x
        this.oy = this.y
        this.r *= dr
        this.theta += dtheta
        this.x = Math.round(this.r*cosD(this.theta) + this.ox)
        this.y = Math.round(this.oy - this.r*sinD(this.theta))
    }

    v() {
        return {
            x: this.x,
            y: this.y
        }
    }

    o(p) {
        this.ox = p.x
        this.oy = p.y
    }

    z(zero) {
        this.zero = zero
    }
}