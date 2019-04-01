import QuadWarper from './QuadWarper';
import config from '../config';
import { delay } from '../util';

import Canvas from './Canvas';

export default class Page {
  constructor() {
    this.w = config.w;
    this.h = config.h;
    const dpr = window.devicePixelRatio;

    this.qrImg = document.getElementById('img-qr');
    this.qrImg.src = 'https://chart.apis.google.com/chart?cht=qr&chs=200x200&chl=' + location.href + 'sp/';

    this.canvas = new Canvas({
      w: this.w,
      h: this.h,
      dpr: dpr,
      eContainer: document.getElementById('canvas-container')
    });

    this.warper = new QuadWarper({ w: this.w, h: this.h });
    // this.warper.setCorners(200,144,1281,0,0,945,1281,945);

    this.HOST = location.origin.replace(/^http/, 'ws');
    this.ws = null;
    this.reConnectInterval = 3000;

    this.initWebSocket();
  }

  toggleQR() {
    const cl = this.qrImg.classList;
    if(cl.contains('is-hidden')) cl.remove('is-hidden');
    else cl.add('is-hidden');
  }

  initWebSocket() {
    this.ws = new WebSocket(this.HOST);

    this.ws.onopen = e => {
      console.log('[ws:open]');
    };

    this.ws.onmessage = e => {
      const data = JSON.parse(e.data);
      console.log('[ws:message]', data);

      if(data.address === '/complete') {
        this.canvas.toggleSpread();
      }
    };
    
    this.ws.onclose = async e => {
      console.log('[ws:close]');
      await delay(this.reConnectInterval);
      this.initWebSocket();
    };
  }

  mousePressed(x, y) {
    this.warper.mousePressed(x, y);
    this.canvas.mousePressed(x, y);
  }

  mouseReleased() {
    this.warper.mouseReleased();
  }

  mouseMoved(x, y) {
    this.warper.mouseMoved(x, y);
  }

  keyPressed(key) {
    if(key === ' ') this.warper.toggleActive();
    if(key === 'Enter') console.log(this.warper.corners.toString());
    if(key === 's') this.canvas.toggleSpread();
    if(key === 'q') this.toggleQR();
  }
};
