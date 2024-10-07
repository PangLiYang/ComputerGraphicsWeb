function Matrix() {
    this.identity = () => value = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    this.translate   = (x,y,z) => value = multiply(value, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
    this.rotateX     = theta   => value = multiply(value, [1,0,0,0,                               0,Math.cos(theta),Math.sin(theta),0, 
                                                           0,-Math.sin(theta),Math.cos(theta),0,  0,0,0,1]);
    this.rotateY     = theta   => value = multiply(value, [Math.cos(theta),0,-Math.sin(theta),0,  0,1,0,0, 
                                                           Math.sin(theta),0,Math.cos(theta),0,   0,0,0,1]);
    this.rotateZ     = theta   => value = multiply(value, [Math.cos(theta),Math.sin(theta),0,0,   -Math.sin(theta),Math.cos(theta),0,0,
                                                           0,0,1,0,                               0,0,0,1]);
    this.scale       = (x,y,z) => value = multiply(value, [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]);
    this.perspective = (x,y,z) => value = multiply(value, [1,0,0,x, 0,1,0,y, 0,0,1,z, 0,0,0,1]);

    this.get = () => value;
    this.set = v => value = v;

    this.transform = vector => {
        let n = vector.length;
        let res = new Array(n);

        for (let i = 0; i < n; i += 1) {
            let curr = 0;
            for (let k = 0; k < n; k += 1) {
                curr += value[k * n + i] * vector[k];
            }
            res[i] = curr;
        }

        value = res;
    }

    let value = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

    let multiply = (matrix1,matrix2) => {
        let res = new Array(matrix1.length);
        let n = Math.sqrt(matrix1.length);

        for (let i = 0; i < n; i += 1) {
            for (let j = 0; j < n; j += 1) {
                let curr = 0;
                for (let k = 0; k < n; k += 1) {
                    curr += matrix1[i * n + k] * matrix2[k * n + j];
                }
                res[i * n + j] = curr;
            }
        }

        return res;
    }
}

function startTest() {

    let resultsContainer = document.getElementById("myList");
    let eps = 0.001;

    function equals(matrix1, matrix2) {

        for (let i = 0; i < matrix1.length; i++) {
            if (Math.abs(matrix1[i] - matrix2[i]) > eps) {
                console.log("error happens in index: " + i);
                console.log("our result: " + matrix1[i]);
                console.log("required answer: " + matrix2[i]);
                return false;
            }
        }
        return true;
    }

    function assert(flag, id) {
        let result = document.createElement("div");
        if (flag) {
            result.className = "pass";
            result.textContent = id + " Pass";
        } else {
            result.className = "fail";
            result.textContent = id + " Fail";
        }
        resultsContainer.appendChild(result);
    }

    let matrix = new Matrix();
    let angle = Math.PI / 2;

    // Test Identity Matrix
    matrix.identity();
    assert(equals(matrix.get(), [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]), "Identity Matrix");

    // Test Translation
    matrix.identity();
    matrix.translate(1, 2, 3);
    assert(equals(matrix.get(), [1,0,0,0, 0,1,0,0, 0,0,1,0, 1,2,3,1]), "Translation Matrix");

    // Test Rotation X
    matrix.identity();
    matrix.rotateX(angle);
    assert(equals(matrix.get(), [1,0,0,0, 0,0,1,0, 0,-1,0,0, 0,0,0,1]), "Rotation X (90 degrees)");

    // Test Rotation Y
    matrix.identity();
    matrix.rotateY(angle);
    assert(equals(matrix.get(), [0,0,-1,0, 0,1,0,0, 1,0,0,0, 0,0,0,1]), "Rotation Y (90 degrees)");

    // Test Rotation Z
    matrix.identity();
    matrix.rotateZ(angle);
    assert(equals(matrix.get(), [0,1,0,0, -1,0,0,0, 0,0,1,0, 0,0,0,1]), "Rotation Z (90 degrees)");

    // Test Scaling
    matrix.identity();
    matrix.scale(2, 3, 4);
    assert(equals(matrix.get(), [2,0,0,0, 0,3,0,0, 0,0,4,0, 0,0,0,1]), "Scaling Matrix");

    // Test Perspective
    matrix.identity();
    matrix.perspective(2, 3, 4);
    assert(equals(matrix.get(), [1,0,0,2, 0,1,0,3, 0,0,1,4, 0,0,0,1]), "Perspective Matrix");

    // Test Transform
    matrix.identity();
    matrix.perspective(2, 3, 4);
    matrix.transform([5,6,7,8]);
    assert(equals(matrix.get(), [5, 6, 7, 64]), "Transform Matrix");
}

window.onload = startTest;