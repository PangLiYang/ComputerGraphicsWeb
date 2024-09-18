This repository contains the implementations of OpenGL and WebGL.

for (int i = 0; i < 3; i++) {
        float offset = float(i) * 0.5;
        vec2 cometPos = mix(vec2(1.2 + offset, 1.2 + offset), 
                            vec2(-1.2 - offset, -1.2 - offset), 
                            mod(uTime * 0.3 + float(i) * 0.2, 1.0));
        float cometDist = length(vPos.xy - cometPos);
        float cometSize = 0.03;
        if (cometDist < cometSize) {
            rgb = mix(rgb, normalize(vec3(208,255,255)), smoothstep(cometSize, 0.0, cometDist));
        }
    }