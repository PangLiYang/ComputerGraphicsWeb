
// MATRIX SUPPORT LIBRARY

let mInverse = m => {
   let d = [], de = 0, co = (c, r) => {
      let s = (i, j) => m[c+i & 3 | (r+j & 3) << 2];
      return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                  - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                  + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
   }
   for (let n = 0 ; n < 16 ; n++) d.push(co(n >> 2, n & 3));
   for (let n = 0 ; n <  4 ; n++) de += m[n] * d[n << 2]; 
   for (let n = 0 ; n < 16 ; n++) d[n] /= de;
   return d;
}
let mxm = (a, b) => {
   let d = [];
   for (let n = 0 ; n < 16 ; n++)
      d.push(a[n&3]*b[n&12] + a[n&3|4]*b[n&12|1] + a[n&3|8]*b[n&12|2] + a[n&3|12]*b[n&12|3]);
   return d;
}
let C = t => Math.cos(t), S = t => Math.sin(t);
let mId = () => [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
let mPe = (fl, m) => mxm(m, [1,0,0,0, 0,1,0,0, 0,0,1,-1/fl, 0,0,0,1]);
let mRX = (t, m) => mxm(m, [1,0,0,0, 0,C(t),S(t),0, 0,-S(t),C(t),0, 0,0,0,1]);
let mRY = (t, m) => mxm(m, [C(t),0,-S(t),0, 0,1,0,0, S(t),0,C(t),0, 0,0,0,1]);
let mRZ = (t, m) => mxm(m, [C(t),S(t),0,0, -S(t),C(t),0,0, 0,0,1,0, 0,0,0,1]);
let mSc = (x,y,z, m) => mxm(m, [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]);
let mTr = (x,y,z, m) => mxm(m, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
function Matrix() {
   let stack = [mId()], top = 0;
   let set = arg => { stack[top] = arg; return this; }
   let get = () => stack[top];
   this.identity = () => set(mId());
   this.perspective = fl => set(mPe(fl, get()));
   this.turnX = t => set(mRX(t, get()));
   this.turnY = t => set(mRY(t, get()));
   this.turnZ = t => set(mRZ(t, get()));
   this.scale = (x,y,z) => set(mSc(x,y?y:x,z?z:x, get()));
   this.move = (x,y,z) => set(mTr(x,y,z, get()));
   this.get = () => get();
   this.S = () => set(stack[top++].slice());
   this.R = () => --top;
   this.draw = (shape,color,opacity,texture,bumpTexture) => draw(shape,color,opacity,texture,bumpTexture);
}

// INITIALIZE WEBGL

let start_gl = (canvas, vertexShader, fragmentShader) => {
   let gl = canvas.getContext("webgl");
   let program = gl.createProgram();
   gl.program = program;
   let addshader = (type, src) => {
      let shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
         throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
      gl.attachShader(program, shader);
   };
   addshader(gl.VERTEX_SHADER  , vertexShader  );
   addshader(gl.FRAGMENT_SHADER, fragmentShader);
   gl.linkProgram(program);
   if (! gl.getProgramParameter(program, gl.LINK_STATUS))
      throw "Could not link the shader program!";
   gl.useProgram(program);
   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.BLEND);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   gl.depthFunc(gl.LEQUAL);
   let vertexAttribute = (name, size, position) => {
      let attr = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(attr);
      gl.vertexAttribPointer(attr, size, gl.FLOAT, false, vertexSize * 4, position * 4);
   }
   vertexAttribute('aPos', 3, 0);
   vertexAttribute('aNor', 3, 3);
   vertexAttribute('aUV' , 2, 6);
   vertexAttribute('aTan', 3, 8);
   return gl;
}

// IMPLEMENT VARIOUS 3D SHAPES

let createMesh = (nu, nv, p) => {
   let V = (u,v) => {
      let P = p(u,v);
      let Q = p(u+.001,v);
      let x = Q[0]-P[0], y = Q[1]-P[1], z = Q[2]-P[2], s = Math.sqrt(x*x + y*y + z*z);
      return P.concat([u, 1-v, x/s, y/s, z/s]);
   }

   let mesh = [];
   for (let j = nv-1 ; j >= 0 ; j--) {
      for (let i = 0 ; i <= nu ; i++)
         mesh.push(V(i/nu,(j+1)/nv),  V(i/nu,j/nv));
      mesh.push(V(1,j/nv), V(0,j/nv));
   }
   return new Float32Array(mesh.flat());
}
let sphere = (nu, nv) => createMesh(nu, nv, (u,v) => {
   let theta = 2 * Math.PI * u;
   let phi = Math.PI * (v - .5);
   let x = C(phi) * C(theta),
       y = C(phi) * S(theta),
       z = S(phi);
   return [ x,y,z, x,y,z ];
});
let tube = (nu, nv) => createMesh(nu, nv, (u,v) => {
   let x = C(2 * Math.PI * u),
       y = S(2 * Math.PI * u),
       z = 2 * v - 1;
   return [ x,y,z, x,y,0 ];
});
let disk = (nu, nv) => createMesh(nu, nv, (u,v) => {
   let x = v * C(2 * Math.PI * u),
       y = v * S(2 * Math.PI * u);
   return [ x,y,0, 0,0,1 ];
});
let cylinder = (nu, s) => createMesh(nu, 6, (u,v) => {
   s = s ? s : 1;
   let x = C(2 * Math.PI * u),
       y = S(2 * Math.PI * u);
   switch (5 * v >> 0) {
   case 0: return [ 0,0,-1, 0,0,-1 ];
   case 1: return [ x,y,-1, 0,0,-1 ];
   case 2: return [ x,y,-1, x,y, 0 ];
   case 3: return [ s*x,s*y, 1, x,y, 0 ];
   case 4: return [ s*x,s*y, 1, 0,0, 1 ];
   case 5: return [ 0,0, 1, 0,0, 1 ];
   }
});
let torus = (nu, nv, r, t) => createMesh(nu, nv, (u,v) => {
   r = r ? r : .5;
   t = t ? t : 1;
   let ct = C(2 * Math.PI * u);
   let st = S(2 * Math.PI * u);
   let cp = C(2 * Math.PI * v);
   let sp = S(2 * Math.PI * v);
   let x = (1 + r * cp) * ct,
       y = (1 + r * cp) * st,
       z =      r * Math.max(-t, Math.min(t, sp));
   return [ x,y,z, cp*ct,cp*st,sp ];
});
let strToTris = s => {
   let t = [], i;
   for (let n = 0 ; n < s.length ; n++)
      if ((i = 'N01'.indexOf(s.charAt(n))) >= 0)
         t.push(i-1);
   return new Float32Array(t);
}

let cube = strToTris(`1N100111100 11100110100 N1100100100  N1100100100 NN100101100 1N100111100
                      N1N00N01N00 11N00N11N00 1NN00N10N00  1NN00N10N00 NNN00N00N00 N1N00N01N00
                      11N10011010 11110010010 1N110000010  1N110000010 1NN10001010 11N10011010
                      NN1N00100N0 N11N00000N0 N1NN00010N0  N1NN00010N0 NNNN00110N0 NN1N00100N0
                      N1101011001 11101010001 11N01000001  11N01000001 N1N01001001 N1101011001
                      1NN0N00100N 1N10N01100N NN10N01000N  NN10N01000N NNN0N00000N 1NN0N00100N`);

// API FOR ACCESSING 3D SHAPES

let Cube     = ()      => { return { type: 0, mesh: cube }; }
let Cylinder = (n,s)   => { return { type: 1, mesh: cylinder(n,s) }; }
let Disk     = n       => { return { type: 1, mesh: disk    (n, 1) }; }
let Sphere   = n       => { return { type: 1, mesh: sphere  (n, n>>1) }; }
let Torus    = (n,r,t) => { return { type: 1, mesh: torus   (n, n, r, t) }; }
let Tube     = n       => { return { type: 1, mesh: tube    (n, 1) }; }

// GPU SHADERS

let vertexSize = 11;
let vertexShader = `
   attribute vec3 aPos, aNor, aTan;
   attribute vec2 aUV;
   uniform mat4 uMatrix, uInvMatrix;
   varying vec3 vPos, vNor, vTan;
   varying vec2 vUV;
   void main() {
      vec4 pos = uMatrix * vec4(aPos, 1.0);
      vec4 nor = vec4(aNor, 0.0) * uInvMatrix;
      vec4 tan = vec4(aTan, 0.0) * uInvMatrix;
      vPos = pos.xyz;
      vNor = nor.xyz;
      vTan = tan.xyz;
      vUV  = aUV;
      gl_Position = pos * vec4(1.,1.,-.1,1.);
   }
`;
let fragmentShader = `
   precision mediump float;
   uniform sampler2D uSampler[16];
   uniform vec3 uColor;
   uniform float uOpacity;
   uniform int uTexture, uBumpTexture;
   varying vec3 vPos, vNor, vTan;
   varying vec2 vUV;
   void main(void) {
      vec4 texture = vec4(1.);
      vec3 nor = normalize(vNor);

      for (int i = 0 ; i < 16 ; i++) {
         if (uTexture == i)
	         texture = texture2D(uSampler[i], vUV);
         if (uBumpTexture == i) {
            vec3 b = 2. * texture2D(uSampler[i], vUV).rgb - 1.;
            vec3 tan = normalize(vTan);
            vec3 bin = cross(nor, tan);
            nor = normalize(b.x * tan + b.y * bin + b.z * nor);
         }
      }

      //float c = .05 + max(0., dot(nor, vec3(.557)));
      float c = 1.;

      if (uTexture == 12) {
         c = 1.;
      }

      vec3 color = sqrt(uColor * c) * texture.rgb;
      gl_FragColor = vec4(color, uOpacity * texture.a);
   }
`;

// DECLARE GL-RELATED VARIABLES AND MATRIX OBJECT

let gl = start_gl(canvas1, vertexShader, fragmentShader);
let uColor       = gl.getUniformLocation(gl.program, "uColor"      );
let uInvMatrix   = gl.getUniformLocation(gl.program, "uInvMatrix"  );
let uMatrix      = gl.getUniformLocation(gl.program, "uMatrix"     );
let uOpacity     = gl.getUniformLocation(gl.program, "uOpacity"    );
let uSampler     = gl.getUniformLocation(gl.program, "uSampler"    );
let uTexture     = gl.getUniformLocation(gl.program, "uTexture"    );
let uBumpTexture = gl.getUniformLocation(gl.program, "uBumpTexture");
let M = new Matrix();

gl.uniform1iv(uSampler, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

// LOAD A TEXTURE IMAGE

let texture = (index, fileName) => {
   let image = new Image();
   image.onload = () => {
      gl.activeTexture (gl.TEXTURE0 + index);
      gl.bindTexture   (gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
   }
   image.src = fileName;
}

// DRAW A SINGLE SHAPE TO THE WEBGL CANVAS

let draw = (Shape, color, opacity, texture, bumpTexture) => {
   gl.uniform1f       (uOpacity    , opacity===undefined ? 1 : opacity);
   gl.uniform1i       (uTexture    , texture===undefined ? -1 : texture);
   gl.uniform1i       (uBumpTexture, bumpTexture===undefined ? -1 : bumpTexture);
   gl.uniform3fv      (uColor      , color );
   gl.uniformMatrix4fv(uInvMatrix  , false, mInverse(M.get()));
   gl.uniformMatrix4fv(uMatrix     , false, M.get()          );
   gl.bufferData(gl.ARRAY_BUFFER, Shape.mesh, gl.STATIC_DRAW);
   gl.drawArrays(Shape.type ? gl.TRIANGLE_STRIP : gl.TRIANGLES, 0, Shape.mesh.length / vertexSize);
   return M;
}

// New add features

let target_spine;
let target_ctr = 1;

function createSplineButtons() {
   const buttonContainer = document.getElementById("spline-buttons");
   buttonContainer.innerHTML = "";

   const button2 = document.createElement("button");
   button2.textContent = `Hide Controlers`;
   button2.addEventListener("click", () => {
      clearControl();
   });
   buttonContainer.appendChild(button2);

   controlPointSet.forEach((_, index) => {
      const button = document.createElement("button");
      button.textContent = `Spline ${index + 1}`;
      button.addEventListener("click", () => {
         switchSpline(index);
      });
      buttonContainer.appendChild(button);
   });

   const button = document.createElement("button");
   button.textContent = `Clear Selected`;
   button.addEventListener("click", () => {
      clearSelect();
   });
   buttonContainer.appendChild(button);
}

function switchSpline(index) {
   target_spine = index;
   controlPoints = controlPointSet[index];
   selectedPoint = null;
}

function clearSelect() {
   target_spine = -1;
   controlPoints = null;
   selectedPoint = null;
}

function clearControl() {
   target_ctr *= -1;
}

function getMousePos(event) {
   let rect = canvas1.getBoundingClientRect();
   return {
      x: (event.clientX - rect.left) / rect.width * 2 - 1,
      y: 1 - (event.clientY - rect.top) / rect.height * 2
   };
}

function onMouseDown(event) {
   let {x, y} = getMousePos(event);
   selectedPoint = controlPoints.find(p => distance(x, y, p.x, p.y) < 0.05);
}

function onMouseMove(event) {
   if (selectedPoint) {
      let {x, y} = getMousePos(event);
      selectedPoint.x = x;
      selectedPoint.y = y;
   }
}

function onMouseUp() {
   selectedPoint = null;
}

function distance(x1, y1, x2, y2) {
   return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

let mxv = (m, v) => {
   let d = [];
   for (let i = 0 ; i < 4 ; i++)
      d.push(m[i]*v[0] + m[4 + i]*v[1] + m[8 + i]*v[2] + m[12 + i]*v[3]);
   return d;
}

let renderControlPoint = p => {
   if (p == selectedPoint) {
      M.S().move(p.x, p.y, 0).scale(0.02, 0.02, 0.02).draw(Sphere(30), [1, 0, 0], 1).R();
   } else {
      M.S().move(p.x, p.y, 0).scale(0.02, 0.02, 0.02).draw(Sphere(30), [1, 1, 1], 0.3).R();
   }
}

let renderTargetPoint = p => {
   if (p == selectedPoint) {
      M.S().move(p.x, p.y, 0).scale(0.02, 0.02, 0.02).draw(Sphere(30), [1, 0, 0], 1).R();
   } else {
      M.S().move(p.x, p.y, 0).scale(0.02, 0.02, 0.02).draw(Sphere(30), [1, 1, 0], 1).R();
   }
}

let bezier_matrix = [-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0];

// let controlPointSet = [
//    [{x: -0.6, y: -0.6}, 
//     {x: .1, y: .03}, 
//     {x: 0.55, y: 0.8}, 
//     {x: 0.65, y: 0.5}],
// ];

let controlPointSet = [
   [
      {x: -0.8975, y: -0.13250000000000006},
      {x: -0.3275, y: -0.1200000000000001},
      {x: 0.4724999999999999, y: -0.10499999999999998},
      {x: 0.95, y: -0.09749999999999992}
   ],
   [
      {x: -0.8975, y: 0.06999999999999995},
      {x: -0.345, y: 0.07499999999999996},
      {x: 0.4750000000000001, y: 0.09750000000000003},
      {x: 0.925, y: 0.10250000000000004}
   ],
   [
      {x: -0.635, y: 0.07499999999999996},
      {x: -0.41000000000000003, y: 0.21250000000000002},
      {x: -0.21750000000000003, y: 0.5974999999999999},
      {x: 0.30499999999999994, y: 0.4125}
   ],
   [
      {x: 0.30499999999999994, y: 0.41000000000000003},
      {x: 0.8674999999999999, y: -0.004999999999999893},
      {x: -0.34750000000000003, y: 0},
      {x: 0.18500000000000005, y: -0.375}
   ],
   [
      {x: 0.18500000000000005, y: -0.3700000000000001},
      {x: 0.4475, y: -0.5149999999999999},
      {x: 0.915, y: -0.345},
      {x: 0.5700000000000001, y: 0.2825}
   ],
   [
      {x: 0.29499999999999993, y: -0.3400000000000001},
      {x: 0.040000000000000036, y: -0.08499999999999996},
      {x: 0.49750000000000005, y: -0.16999999999999993},
      {x: 0.7649999999999999, y: -0.10250000000000004}
   ],
   [
      {x: 0.29499999999999993, y: -0.3425},
      {x: 0.7324999999999999, y: -0.51},
      {x: 0.41999999999999993, y: 0.015000000000000013},
      {x: 0.5725, y: 0.2825}
   ],
   [
      {x: -0.20999999999999996, y: 0.235},
      {x: 0.10000000000000009, y: 0.595},
      {x: 0.35749999999999993, y: 0.23750000000000004},
      {x: 0.7324999999999999, y: 0.09750000000000003}
   ],
   [
      {x: -0.20499999999999996, y: 0.23750000000000004},
      {x: -0.43500000000000005, y: 0.01749999999999996},
      {x: -0.34750000000000003, y: -0.24},
      {x: -0.3275, y: -0.48249999999999993}
   ],
   [
      {x: -0.3175, y: -0.49},
      {x: -0.24750000000000005, y: -0.835},
      {x: 0.635, y: -0.9325000000000001},
      {x: 0.8075000000000001, y: -0.3500000000000001}
   ],
   [
      {x: -0.6575, y: -0.12749999999999995},
      {x: -0.2025, y: -0.5049999999999999},
      {x: 0.26, y: -0.9450000000000001},
      {x: 0.8075000000000001, y: -0.3400000000000001}
   ],
   [
      {x: 0.5725, y: 0.275},
      {x: 0.5375000000000001, y: 0.5675},
      {x: 0.5275000000000001, y: 0.74},
      {x: 0.42999999999999994, y: 0.925}
   ],
   [
      {x: 0.6325000000000001, y: 0.9325},
      {x: 0.6950000000000001, y: 0.7},
      {x: 0.8775, y: 0.21250000000000002},
      {x: 0.8049999999999999, y: -0.3474999999999999}
   ]
];