varying vec3 vertexNormal;

void main () {
    float intensity = 1.5 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));

    gl_FragColor = vec4(1, 0, 0, 1) * intensity;
}