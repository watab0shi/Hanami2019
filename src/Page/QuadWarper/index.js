import { transform2d } from './homograohyUtils';

export default class QuadWarper {
  constructor({ w, h }) {
    this.w = w;
    this.h = h;

    this.currectCorner = -1;
    this.corners = [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h]
    ];

    this.eWarper = document.querySelector('.warper');
    this.eTransform = this.eWarper.querySelector('.warper_transform-container');
    this.eCorners = this.eWarper.querySelectorAll('.warper_handle');
    this.isDisabled = false;

    this.update();
  }

  setCorners(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.corners[0][0] = x1;
    this.corners[0][1] = y1;
    this.corners[1][0] = x2;
    this.corners[1][1] = y2;
    this.corners[2][0] = x3;
    this.corners[2][1] = y3;
    this.corners[3][0] = x4;
    this.corners[3][1] = y4;
    this.update();
  }

  toggleActive() {
    this.isDisabled = !this.isDisabled;
    if(this.isDisabled) this.eWarper.classList.add('is-disabled');
    else              this.eWarper.classList.remove('is-disabled');
  }

  update() {
    const c = this.corners;
    transform2d(this.eTransform, c[0][0], c[0][1], c[1][0], c[1][1],
                                 c[2][0], c[2][1], c[3][0], c[3][1]);
    for (let i = 0; i < 4; ++i) {
      this.eCorners[i].style.left = c[i][0] + "px";
      this.eCorners[i].style.top  = c[i][1] + "px";
    }
  }

  mousePressed(x, y) {
    if(this.isDisabled) return;
    
    let dx, dy, dist;
    let handleRadius = 50;
    
    this.currectCorner = -1;
    for(let i = 0; i < this.eCorners.length; ++i) {
      this.eCorners[i].classList.remove('is-selected');
    }

    for(let i = 0; i < 4; ++i) {
      dx = x - this.corners[i][0];
      dy = y - this.corners[i][1];
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= handleRadius) {
        this.currectCorner = i;
        this.eCorners[i].classList.add('is-selected');
        break;
      }
    }
  }

  mouseReleased() {
    this.currectCorner = -1;
  }

  mouseMoved(x, y) {
    if(this.isDisabled || this.currectCorner < 0) return;

    const curCorner = this.corners[this.currectCorner];
    curCorner[0] = x;
    curCorner[1] = y;
    this.update();
  }
};
