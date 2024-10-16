let translation  = (x,y,z) => [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
let rotationX   = theta   =>  [1,0,0,0,                               0,Math.cos(theta),Math.sin(theta),0, 
                               0,-Math.sin(theta),Math.cos(theta),0,  0,0,0,1];

let rotationY   = theta   =>  [Math.cos(theta),0,-Math.sin(theta),0,  0,1,0,0, 
                               Math.sin(theta),0,Math.cos(theta),0,   0,0,0,1];

let rotationZ   = theta   =>  [Math.cos(theta),Math.sin(theta),0,0,   -Math.sin(theta),Math.cos(theta),0,0,
                               0,0,1,0,                               0,0,0,1];

let scale       = (x,y,z) =>  [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];

let multiply = (matrix1,matrix2) => {
    let res = new Array(16).fill(0);
    let n = 4;

    for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
            let curr = 0;
            for (let k = 0; k < n; k += 1) {
                curr += matrix1[k * n + i] * matrix2[j * n + k];
            }
            res[j * n + i] = curr;
        }
    }

    return res;
}

let transpose = matrix => {
    let res = new Array(16).fill(0);
    let n = 4;

    for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
            res[i * n + j] = matrix[j * n + i];
        }
    }

    return res;
}