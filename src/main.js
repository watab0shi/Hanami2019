import Page from './Page';

document.addEventListener('DOMContentLoaded', () => {
  const page = new Page();

  window.addEventListener('mousedown', e => { page.mousePressed(e.clientX, e.clientY); });
  window.addEventListener('mouseup',   e => { page.mouseReleased(); });
  window.addEventListener('mousemove', e => { page.mouseMoved(e.clientX, e.clientY); });
  window.addEventListener('keydown',   e => { page.keyPressed(e.key); });
});