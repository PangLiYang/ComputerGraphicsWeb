let fragmentShader = `
    precision mediump float;
    uniform float uTime, uFL;
    uniform vec3  uCursor, uL[2];
    uniform mat4 uA[`+NQ+`], uB[`+NQ+`], uC[`+NQ+`];
    varying vec3  vPos;

    vec3 bgColor = vec3(0.1, 0.1, 0.9);
    float epsilon = 0.0001;

    mat4 fixMatrix(mat4 Q) {
        
        Q[0].y += Q[1].x;
        Q[1].x = 0.0;

        Q[0].z += Q[2].x;
        Q[2].x = 0.0;

        Q[0].w += Q[3].x;
        Q[3].x = 0.0;

        Q[1].z += Q[2].y;
        Q[2].y = 0.0;

        Q[1].w += Q[3].y;
        Q[3].y = 0.0;

        Q[2].w += Q[3].z;
        Q[3].z = 0.0;

        return Q;
    }

    vec2 rayQ(vec3 V, vec3 W, mat4 Q) {
        
        Q = fixMatrix(Q);

        float A = Q[0].x * W.x * W.x + Q[1].y * W.y * W.y + Q[2].z * W.z * W.z;
        A += Q[1].z * W.y * W.z + Q[0].z * W.z * W.x + Q[0].y * W.x * W.y;

        float B = 2.0 * (Q[0].x * V.x * W.x + Q[1].y * V.y * W.y + Q[2].z * V.z * W.z);
        B += Q[1].z * (V.y * W.z + V.z * W.y) + Q[0].z * (V.z * W.x + V.x * W.z) + Q[0].y * (V.x * W.y + V.y * W.x);
        B += Q[0].w * W.x + Q[1].w * W.y + Q[2].w * W.z;

        float C = Q[0].x * V.x * V.x + Q[1].y * V.y * V.y + Q[2].z * V.z * V.z;
        C += Q[1].z * V.y * V.z + Q[0].z * V.z * V.x + Q[0].y * V.x * V.y;
        C += Q[0].w * V.x + Q[1].w * V.y + Q[2].w * V.z + Q[3].w;

        float d = B * B - 4.0 * A * C;

        if (d >= 0.0) {
            return vec2((-B - sqrt(d)) / (2.0 * A), (-B + sqrt(d)) / (2.0 * A));
        }

        return vec2(-1.0, -1.0);
    }

    vec3 findNormal(vec3 P, mat4 Q) {
    
        Q = fixMatrix(Q);

        float f1 = 2.0 * Q[0].x * P.x + Q[0].z * P.z + Q[0].y * P.y + Q[0].w;
        float f2 = 2.0 * Q[1].y * P.y + Q[1].z * P.z + Q[0].y * P.x + Q[1].w;
        float f3 = 2.0 * Q[2].z * P.z + Q[1].z * P.y + Q[0].z * P.x + Q[2].w;

        return normalize(vec3(f1, f2, f3));
    }

    mat3 rayQ3(vec3 V, vec3 W, mat4 A, mat4 B, mat4 C, int inOut) {

        vec2 ta = rayQ(V, W, A);
        vec2 tb = rayQ(V, W, B);
        vec2 tc = rayQ(V, W, C);

        float tIn = max(ta.x, max(tb.x, tc.x));
        float tOut = min(ta.y, min(tb.y, tc.y));

        if (tIn > tOut) {
            vec3 r0 = vec3(tIn, tOut, 0.0);
            return mat3(r0, vec3(0.0), vec3(0.0));
        }

        vec3 r0 = vec3(tIn, tOut, 1.0);
        vec3 r1;

        if (inOut == 1) {
            r1 = V + tIn * W;
        } else {
            r1 = V + tOut * W;
        }

        vec3 r2;

        if (inOut == 1) {
            if (tIn == ta.x) {
                r2 = findNormal(r1, A);
            } else if (tIn == tb.x) {
                r2 = findNormal(r1, B);
            } else {
                r2 = findNormal(r1, C);
            }
        } else {
            if (tOut == ta.y) {
                r2 = findNormal(r1, A);
            } else if (tOut == tb.y) {
                r2 = findNormal(r1, B);
            } else {
                r2 = findNormal(r1, C);
            }
        }

        return mat3(r0, r1, r2);
    }

    vec3 findReflection (vec3 W, vec3 N) {
        W = normalize(W);
        N = normalize(N);

        return normalize(W - 2.0 * dot(N, W) * N);
    }

    vec3 findRefraction (vec3 W, vec3 N, float n1, float n2) {
        W = normalize(W);
        N = normalize(N);

        vec3 c1 = dot(W, N) * N;
        vec3 s1 = W - c1;
        vec3 s2 = n1 / n2 * s1;
        vec3 c2 = -sqrt(1.0 - s2 * s2) * N;

        return c2 + s2;
    }

    vec3 findRefraction2 (vec3 W, vec3 N, float n1, float n2) {
        W = normalize(W);
        N = normalize(N);

        vec3 c1 = dot(W, N) * N;
        vec3 s1 = W - c1;
        vec3 s2 = n1 / n2 * s1;
        vec3 c2 = sqrt(1.0 - s2 * s2) * N;

        return c2 + s2;
    }

    void main(void) {

        // Set Background Color

        vec3 color = bgColor;

        // Form The Ray For Tis Pixel

        vec3 V = vec3(0.0, 0.0, 3.0);
        vec3 W = normalize(vec3(vPos.xy, -uFL));

        // Set Materials

        vec3 material, highlight;
        float power;

        //material = vec3(1.,0.,0.);
        //highlight = vec3(1.);
        //power = 20.;

        // Start Ray Tracing

        float tMin = 1000.0;

        for (int i = 0 ; i < ` + NQ + ` ; i++) {

            mat4 A = uA[i];
            mat4 B = uB[i];
            mat4 C = uC[i];

            mat3 info = rayQ3(V, W, A, B, C, 1);

            if (info[0].z > 0.0) {

                float t = info[0].x;

                if (t > 0.0 && t < tMin) {
                    tMin = t;

                    if (i == 6) {
                        material = vec3(0.9, 0.9, 0.9);
                        highlight = 1.2 * material;
                        power = 4.0;
                    } else if (i >= 2) {
                        material = vec3(1.0, 0.0, 0.0);
                        highlight = vec3(1.0);
                        power = 20.0;
                    } else {
                        material = vec3(0.5, 0.17, 0.0);
                        highlight = 1.2 * material;
                        power = 8.0;
                    }
                    
                    color = 0.2 * material;
                    
                    vec3 P = info[1];
                    vec3 N = info[2];

                    for (int k = 0; k < 2; k += 1) {

                        bool inShadow = false;

                        for (int j = 0 ; j < ` + NQ + ` ; j++) {
                        
                            if (j != i) {
                                mat3 obstacle = rayQ3(P, uL[k], uA[j], uB[j], uC[j], 1);

                                if (obstacle[0].z > 0.0 && obstacle[0].x > 0.0) {
                                    inShadow = true;
                                }
                            }
                        }

                        if (!inShadow) {
                            vec3 d = material * max(0.0, dot(N, uL[k]));
                            vec3 E = vec3(0.0, 0.0, 1.0);
                            vec3 R = W - 2.0 * N * dot(N, W);
                            vec3 s = highlight * pow(max(0., dot(R, uL[k])), power);
                            color += d + s;
                        }
                    
                    }

                    // Reflection

                    vec3 R = findReflection(W, N);

                    float rMin = 1000.0;

                    for (int j = 0 ; j < ` + NQ + ` ; j++) {
                    
                        if (i != j && i != 6) {
                            mat3 obj = rayQ3(P + epsilon * R, R, uA[j], uB[j], uC[j], 1);

                            if (obj[0].z > 0.0 && obj[0].x > 0.0 && obj[0].x < rMin) {
                                rMin = obj[0].x;

                                if (j == 6) {
                                    material = 0.5 * vec3(0.9, 0.9, 0.9);
                                    highlight = 1.2 * material;
                                    power = 4.0;
                                } else if (j >= 2) {
                                    material = vec3(1.0, 0.0, 0.0);
                                    highlight = vec3(1.0);
                                    power = 20.0;
                                } else {
                                    material = vec3(0.5, 0.17, 0.0);
                                    highlight = 1.2 * material;
                                    power = 8.0;
                                }

                                color = 0.5 * material;
                            }
                        }
                    }

                    // Refraction

                    if (i == 6) {

                        float rfMin = 1000.0;

                        vec3 rf1 = findRefraction(W, N, 1.0, 1.5);
                        mat3 self = rayQ3(P - epsilon * rf1, rf1, uA[i], uB[i], uC[i], 0);

                        vec3 P2 = self[1];
                        vec3 N2 = self[2];
                        vec3 rf2 = findRefraction2(rf1, N2, 1.5, 1.0);

                        color = 0.7 * bgColor;

                        for (int j = 0 ; j < ` + NQ + ` ; j++) {
                    
                            if (i != j) {

                                mat3 obj = rayQ3(P2 + epsilon * rf2, rf2, uA[j], uB[j], uC[j], 1);

                                if (obj[0].z > 0.0 && obj[0].x > 0.0 && obj[0].x < rfMin) {
                                    rfMin = obj[0].x;

                                    if (j == 6) {
                                        material = vec3(0.9, 0.9, 0.9);
                                        highlight = 1.2 * material;
                                        power = 4.0;
                                    } else if (j >= 2) {
                                        material = vec3(1.0, 0.0, 0.0);
                                        highlight = vec3(1.0);
                                        power = 20.0;
                                    } else {
                                        material = vec3(0.5, 0.17, 0.0);
                                        highlight = 1.2 * material;
                                        power = 8.0;
                                    }

                                    color = 0.2 * material;

                                    for (int k = 0; k < 2; k += 1) {

                                        bool inShadow = false;

                                        for (int h = 0 ; h < ` + NQ + ` ; h++) {
                                        
                                            if (h != j && h != i) {
                                                mat3 obstacle = rayQ3(P, uL[k], uA[h], uB[h], uC[h], 1);

                                                if (obstacle[0].z > 0.0 && obstacle[0].x > 0.0) {
                                                    inShadow = true;
                                                }
                                            }
                                        }

                                        if (!inShadow) {
                                            vec3 d = material * max(0.0, dot(obj[2], uL[1]));
                                            vec3 E = vec3(0.0, 0.0, 1.0);
                                            vec3 R = rf2 - 2.0 * obj[2] * dot(obj[2], rf2);
                                            vec3 s = highlight * pow(max(0., dot(R, uL[1])), power);
                                            color += d + s;
                                        }
                                    
                                    }
                                }
                            }
                        }
                    }    
                }
            }
        }

        gl_FragColor = vec4(sqrt(color), 1.);
    }
`;