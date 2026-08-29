import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   PHOTOREALISTIC HUMAN EYE — Uses AI-generated photo textures
   mapped onto 3D sphere geometry with:
     • Full eye photo texture on sphere (sclera + iris + pupil)
     • Corneal dome with physical refraction (IOR 1.376)
     • Wet tear film glossy shell
     • Specular highlights
     • Smooth slow rotation + mouse-follow parallax
   ═══════════════════════════════════════════════════════════════ */

export default function Retina3DScanner() {
  const containerRef = useRef(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060e14');

    const camera = new THREE.PerspectiveCamera(
      28, container.clientWidth / container.clientHeight, 0.1, 100
    );
    camera.position.set(0, 0, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const keyLight = new THREE.DirectionalLight(0xfff4e8, 2.2);
    keyLight.position.set(3, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd0e4ff, 0.6);
    fillLight.position.set(-4, 0.5, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(1, -2, -4);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x303038, 0.5);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xf0ece4, 0x101820, 0.35);
    scene.add(hemi);

    // ── Environment map for reflections ──
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512; envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    const skyGrad = envCtx.createLinearGradient(0, 0, 0, 256);
    skyGrad.addColorStop(0, '#506070');
    skyGrad.addColorStop(0.35, '#252c34');
    skyGrad.addColorStop(0.7, '#141a20');
    skyGrad.addColorStop(1, '#080c12');
    envCtx.fillStyle = skyGrad;
    envCtx.fillRect(0, 0, 512, 256);
    envCtx.fillStyle = 'rgba(255,255,255,0.45)';
    envCtx.beginPath(); envCtx.ellipse(190, 45, 70, 30, 0, 0, Math.PI * 2); envCtx.fill();
    envCtx.fillStyle = 'rgba(255,255,255,0.15)';
    envCtx.beginPath(); envCtx.ellipse(360, 65, 40, 20, 0, 0, Math.PI * 2); envCtx.fill();
    const envTex = new THREE.CanvasTexture(envCanvas);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTex;

    // ── Load photorealistic eye texture ──
    const loader = new THREE.TextureLoader();
    const eyeTexture = loader.load('/eye-texture.jpg');
    eyeTexture.colorSpace = THREE.SRGBColorSpace;
    eyeTexture.anisotropy = 16;

    // ── Eye Group ──
    const eye = new THREE.Group();
    scene.add(eye);

    // ── 1. Eyeball sphere with photo texture ──
    const eyeballGeo = new THREE.SphereGeometry(1.35, 128, 128);

    // Adjust UVs so the photo maps nicely onto the front hemisphere
    const uvAttr = eyeballGeo.attributes.uv;
    const posAttr = eyeballGeo.attributes.position;
    const normal = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      normal.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).normalize();
      // Project from front: map (x, y) of the front-facing normal to UV
      const u = normal.x * 0.48 + 0.5;
      const v = normal.y * 0.48 + 0.5;
      uvAttr.setXY(i, u, v);
    }
    uvAttr.needsUpdate = true;

    const eyeballMat = new THREE.MeshStandardMaterial({
      map: eyeTexture,
      roughness: 0.45,
      metalness: 0.0,
      envMapIntensity: 0.15,
    });
    const eyeball = new THREE.Mesh(eyeballGeo, eyeballMat);
    eye.add(eyeball);

    // ── 2. Corneal dome (refractive transparent dome over iris area) ──
    const corneaGeo = new THREE.SphereGeometry(
      0.7, 128, 128, 0, Math.PI * 2, 0, Math.PI * 0.4
    );
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      roughness: 0.0,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      transmission: 0.95,
      ior: 1.376,
      thickness: 0.12,
      envMapIntensity: 3.5,
      side: THREE.DoubleSide,
    });
    const cornea = new THREE.Mesh(corneaGeo, corneaMat);
    cornea.position.z = 0.88;
    cornea.rotation.x = Math.PI;
    eye.add(cornea);

    // ── 3. Wet tear film (glossy outer shell for wetness) ──
    const tearGeo = new THREE.SphereGeometry(1.37, 128, 128);
    const tearMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.025,
      roughness: 0.0,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      envMapIntensity: 2.0,
      side: THREE.FrontSide,
    });
    const tear = new THREE.Mesh(tearGeo, tearMat);
    eye.add(tear);

    // ── 4. Specular highlights ──
    const makeHL = (x, y, r, op) => {
      const g = new THREE.CircleGeometry(r, 32);
      const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: op, depthWrite: false });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, 1.42);
      return mesh;
    };
    const hl1 = makeHL(0.18, 0.22, 0.07, 0.85);
    const hl2 = makeHL(-0.1, -0.14, 0.035, 0.45);
    eye.add(hl1);
    eye.add(hl2);

    // ── 5. Subtle upper shadow (eyelid shadow simulation) ──
    const shadowGeo = new THREE.PlaneGeometry(4, 1);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.15,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0, 1.6, 1.1);
    shadow.rotation.x = -0.25;
    eye.add(shadow);

    // ── Mouse listener ──
    window.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ──
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.0018;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Gentle parallax follow + slow organic drift
      const tgtY = mx * 0.15 + Math.sin(t * 0.45) * 0.04;
      const tgtX = -my * 0.1 + Math.cos(t * 0.32) * 0.025;

      eye.rotation.y += (tgtY - eye.rotation.y) * 0.02;
      eye.rotation.x += (tgtX - eye.rotation.x) * 0.02;

      // Breathing
      const br = 1 + Math.sin(t * 1.3) * 0.002;
      eye.scale.setScalar(br);

      // Highlights track rotation
      hl1.position.x = 0.18 + eye.rotation.y * 0.1;
      hl1.position.y = 0.22 - eye.rotation.x * 0.07;
      hl2.position.x = -0.1 + eye.rotation.y * 0.07;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onMouseMove]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
