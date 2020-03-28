// precision highp float;

#define PI 3.1415926535897932384626433832795

// attributes of our mesh
attribute float position;
attribute float angle;
attribute vec2 uv;
attribute vec3 offset;

// built-in uniforms from ThreeJS camera and Object3D
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

// uniforms
uniform float time;
uniform float thickness;
uniform float spread;
uniform float scroller;
uniform vec3 displacement;
// uniform float maxLines;

// // pass a few things along to the vertex shader
// varying vec2 vUv;
// varying vec3 vViewPosition;
// varying vec3 vNormal;

// -----
uniform float mRefractionRatio;
uniform float mFresnelBias;
uniform float mFresnelScale;
uniform float mFresnelPower;

uniform vec3 cameraPosition;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;
// varying vec2 vUv;

// varying vec3 vPos;
// varying vec3 vColor;
// -----

#define M_PI 3.1415926535897932384626433832795
float atan2 (in float y, in float x) {
	bool xgty = (abs(x) > abs(y));
	return mix(M_PI/2.0 - atan(x,y), atan(y,x), float(xgty));
}
vec3 fromBall (float r, float az, float el) {
	return vec3(
    r * cos(el) * cos(az),
    r * cos(el) * sin(az),
    r * sin(el)
  );
}

void toBall (vec3 pos, out float az, out float el) {
	az = atan2(pos.y, pos.x);
	el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
}

// float az = 0.0;
// float el = 0.0;
// vec3 noiser = vec3(lastVel);
// toBall(noiser, az, el);
// lastVel.xyz = fromBall(1.0, az, el);

vec3 ballify (vec3 pos, float r) {
  float az = atan2(pos.y, pos.x);
  float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
  return vec3(
    r * cos(el) * cos(az),
    r * cos(el) * sin(az),
    r * sin(el)
  );
}

mat3 rotateQ (vec3 axis, float rad) {
  float hr = rad / 2.0;
  float s = sin( hr );
  vec4 q = vec4(axis * s, cos( hr ));
  vec3 q2 = q.xyz + q.xyz;
  vec3 qq2 = q.xyz * q2;
  vec2 qx = q.xx * q2.yz;
  float qy = q.y * q2.z;
  vec3 qw = q.w * q2.xyz;

  return mat3(
    1.0 - (qq2.y + qq2.z),  qx.x - qw.z,            qx.y + qw.y,
    qx.x + qw.z,            1.0 - (qq2.x + qq2.z),  qy - qw.x,
    qx.y - qw.y,            qy + qw.x,              1.0 - (qq2.x + qq2.y)
  );
}

mat3 rotateX (float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, s,
    0.0, -s, c
  );
}

mat3 rotateY (float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

mat3 rotateZ (float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    c, s, 0.0,
    -s, c, 0.0,
    0.0, 0.0, 1.0
  );
}


mat4 rotationX( in float angle ) {
  return mat4(	1.0,		0,			0,			0,
          0, 	cos(angle),	-sin(angle),		0,
          0, 	sin(angle),	 cos(angle),		0,
          0, 			0,			  0, 		1);
}

mat4 rotationY( in float angle ) {
  return mat4(	cos(angle),		0,		sin(angle),	0,
              0,		1.0,			 0,	0,
          -sin(angle),	0,		cos(angle),	0,
              0, 		0,				0,	1);
}

mat4 rotationZ( in float angle ) {
  return mat4(	cos(angle),		-sin(angle),	0,	0,
          sin(angle),		cos(angle),		0,	0,
              0,				0,		1,	0,
              0,				0,		0,	1);
}
mat4 scale(float x, float y, float z){
    return mat4(
        vec4(x,   0.0, 0.0, 0.0),
        vec4(0.0, y,   0.0, 0.0),
        vec4(0.0, 0.0, z,   0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
}

mat4 translate(float x, float y, float z){
    return mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(x,   y,   z,   1.0)
    );
}

vec3 spherical (float r, float phi, float theta) {
  return vec3(
    r * cos(phi) * cos(theta),
    r * cos(phi) * sin(theta),
    r * sin(phi)
  );
}

// line
// vec3 defineCurve (float t) {
//   float x = t * 2.0 - 1.0;
//   float y = sin(t + time);
//   return vec3(x, y, 0.0);
// }

// dough nut
// vec3 defineCurve (float t) {
//   float angle = t * 2.0 * PI;
//   vec2 rot = vec2(cos(angle), sin(angle));
//   return vec3(rot.x, rot.y, 0.0);
// }

vec2 defineVoume (float t) {
  return vec2(thickness, thickness);
}

// vec3 defineCurve (float t) {
//   vec3 pos = vec3((t - 0.5) * 1.0);
//   float pX = pos.x;
//   float pY = pos.y;
//   float pZ = pos.y;
//   float piz = 0.001 * 2.0 * 3.14159265;
//   pos.xyz = rotateQ(normalize(vec3(1.0, pY * piz, 1.0)), time + pY * piz) * rotateY(time + pZ * piz) * pos.xyz;
//   pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pY * piz) * rotateZ(time + pZ * piz) * pos.xyz;
//   pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;

//   pos.z += cos(time  + pX * piz * 0.333) * pos.y;

//   // pos.xyz *= 0.00055;
//   float ttTime = time * 0.05;

//   pos.xyz *= rotateX(length(pos.xyz) + ttTime);
//   pos.xyz *= rotateY(length(pos.xyz) + ttTime);
//   pos.xyz *= rotateZ(length(pos.xyz) + ttTime);

//   pos.xyz += ballify(pos.xyz, length(pos.xyz) * 0.25 + 0.75 * length(pos.xyz) * sin(ttTime));
//   return pos.xyz;
// }

// vec3 defineDoughNut (float t) {
//   // Dough nut
//   float angle = t * 2.0 * PI;
//   vec2 rot = vec2(cos(angle), sin(angle));
//   vec3 pos = vec3(rot.x, rot.y, 0.0);
//   return
//     pos;
// }

vec3 defineCurve (float t) {
  float x = t * 2.0 - 1.0;
  x *= 10.0;
  float tick = time * 0.3;
  float y = sin(t + tick + t * offset.x * spread);
  vec3 pos = vec3(x, y, 0.0);
  pos = rotateX(tick + pos.z) * pos;
  pos = rotateX(tick + pos.y) * pos;
  pos = rotateX(tick + pos.x) * pos;
  // pos += offset.x * 0.6 * pos;
  return
    pos;
}

vec4 defineTube (vec3 pos) {
  return
    vec4(pos, 1.0);
}

// vec3 defineCurve (float t) {
//   float beta = t * PI;

//   float r = sin(beta * 1.0 + sin(time)) * 5.25;
//   float phi = sin(beta * 9.0 + time);
//   float theta = 6.0 * beta;

//   return spherical(r, phi, theta);
// }


// vec3 defineCurve (float t) {
//   float beta = t * PI;

//   float r = sin(beta * 1.0 + time * 0.1) * 6.25;
//   float phi = sin(beta * 6.0 + time * 0.0);
//   float theta = beta * 2.0;

//   return spherical(r, phi, theta);
// }

// vec3 defineCurve (float t) {
//   float beta = t * PI;

//   float r = sin(beta * 1.0) * 6.75;
//   float phi = sin(beta * 6.0 + sin(time));
//   float theta = 4.0 * beta;

//   return spherical(r, phi, theta);
// }


void createTube (float t, vec2 volume, out vec3 pos, out vec3 normal) {
  // find next defineCurve along curve
  float nextT = t + (1.0 / lengthSegments);

  // defineCurve the curve in two places
  vec3 cur = defineCurve(t);
  vec3 next = defineCurve(nextT);

  // compute the Frenet-Serret frame
  vec3 T = normalize(next - cur);
  vec3 B = normalize(cross(T, next + cur));
  vec3 N = -normalize(cross(B, T));

  // extrude outward to create a tube
  float tubeAngle = angle;
  float circX = cos(tubeAngle);
  float circY = sin(tubeAngle);

  // compute position and normal
  normal.xyz = normalize(B * circX + N * circY);
  pos.xyz = cur + B * volume.x * circX + N * volume.y * circY;
}

void main (void) {
  // if (offset.y > maxLines) {
  //   gl_Position = vec4(0.0);
  //   return;
  // }

  float t = (position * 2.0) * 0.5 + 0.5;
  vec2 volume = defineVoume(t);
  vec3 transformed;
  vec3 objectNormal;
  createTube(t, volume, transformed, objectNormal);

  vec3 transformedNormal = normalMatrix * objectNormal;
  // vNormal = normalize(transformedNormal);
  // vUv = uv.xy; // swizzle this to match expectations

  vec4 newObjPos = defineTube(transformed);

  // project our vertex position
  vec4 mvPosition = modelViewMatrix * newObjPos;
  // vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;

  vec3 newNormal = transformedNormal;
  vec3 worldNormal = normalize(mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * newNormal.xyz );
  vec4 worldPosition = modelMatrix * newObjPos;
  vec3 I = worldPosition.xyz - cameraPosition;

  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );
  vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );

  // vPos = normalize(gl_Position.xyz);
}