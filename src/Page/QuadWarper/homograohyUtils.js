// cite : http://jsfiddle.net/dFrHS/1/

const adj = m => { // Compute the adjugate of m
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
  ];
};

const multmm = (a, b) => { // multiply two matrices
  const c = Array(9);
  for (let i = 0; i != 3; ++i) {
    for (let j = 0; j != 3; ++j) {
      let cij = 0;
      for (let k = 0; k != 3; ++k) {
        cij += a[3*i + k]*b[3*k + j];
      }
      c[3*i + j] = cij;
    }
  }
  return c;
};

const multmv = (m, v) => { // multiply matrix and vector
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
};

// const pdbg = (m, v) => {
//   const r = multmv(m, v);
//   return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
// };

const basisToPoints = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const m = [
    x1, x2, x3,
    y1, y2, y3,
     1,  1,  1
  ];
  const v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
};

const general2DProjection = (x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d, x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) => {
  const s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  const d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
};

// const project = (m, x, y) => {
//   let v = multmv(m, [x, y, 1]);
//   return [v[0]/v[2], v[1]/v[2]];
// };

export const transform2d = (elt, x1, y1, x2, y2, x3, y3, x4, y4) => {
  let w = elt.offsetWidth, h = elt.offsetHeight;
  let t = general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
  for(let i = 0; i != 9; ++i) t[i] = t[i]/t[8];
  t = [t[0], t[3], 0, t[6],
       t[1], t[4], 0, t[7],
          0,    0, 1,    0,
       t[2], t[5], 0, t[8]];
  t = `matrix3d(${ t.join(", ") })`;
  elt.style["-webkit-transform"] = t;
  elt.style["-moz-transform"]    = t;
  elt.style["-o-transform"]      = t;
  elt.style.transform            = t;
};
