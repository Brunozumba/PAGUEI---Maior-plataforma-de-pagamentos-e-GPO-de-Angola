import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type Demo3DMode = 'express' | 'api' | 'liquido';

const MODE_ORDER: Demo3DMode[] = ['express', 'api', 'liquido'];

const MODE_LABELS: { id: Demo3DMode; label: string; caption: string }[] = [
  {
    id: 'express',
    label: '01. Express 3D',
    caption: 'Cartão & Multicaixa Express sem burocracia',
  },
  {
    id: 'api',
    label: '02. MCP & API 3D',
    caption: 'Conexão instantânea para lojas, apps e agentes IA',
  },
  {
    id: 'liquido',
    label: '03. Liquidação 93,5%',
    caption: '6,5% taxa única · 93,5% direto no seu IBAN',
  },
];

function createCardFaceTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Rich Deep Navy metallic gradient base (#102A56 -> #081833)
  const grad = ctx.createLinearGradient(0, 0, 1024, 640);
  grad.addColorStop(0, '#123166');
  grad.addColorStop(0.55, '#102A56');
  grad.addColorStop(1, '#081833');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  // Subtle concentric precision geometry
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.arc(820, 320, 120 + i * 48, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Emerald Green accent bar (#16B981)
  ctx.fillStyle = '#16B981';
  ctx.fillRect(64, 56, 118, 10);

  // Brand title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 68px system-ui, -apple-system, sans-serif';
  ctx.fillText('PAGUEI!', 64, 146);

  // Subtitle
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('ANGOLA · CHECKOUT IMEDIATO', 64, 190);

  // Masked IBAN / Express footer
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '600 32px monospace';
  ctx.fillText('AO06 · 0040 · EXPRESS · 923 ••• •••', 64, 500);

  ctx.fillStyle = '#16B981';
  ctx.font = '700 24px monospace';
  ctx.fillText('TAXA ÚNICA 6,5%   |   93,5% NA CONTA', 64, 558);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
  grad.addColorStop(0, 'rgba(4, 12, 28, 0.65)');
  grad.addColorStop(0.55, 'rgba(4, 12, 28, 0.25)');
  grad.addColorStop(1, 'rgba(4, 12, 28, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Payment3DScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<Demo3DMode>('express');
  const modeRef = useRef<Demo3DMode>('express');
  const lastManualInteractionRef = useRef<number>(0);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Automatic 3D View Switching
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      const elapsedSinceManual = Date.now() - lastManualInteractionRef.current;
      if (elapsedSinceManual < 8500) return;

      setMode((prev) => {
        const nextIdx = (MODE_ORDER.indexOf(prev) + 1) % MODE_ORDER.length;
        return MODE_ORDER[nextIdx];
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const handleManualModeSelect = (nextMode: Demo3DMode) => {
    lastManualInteractionRef.current = Date.now();
    setMode(nextMode);
  };

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) || '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(mount.clientWidth, 320);
    const height = Math.max(mount.clientHeight, 360);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B1D3D');
    scene.fog = new THREE.FogExp2('#0B1D3D', 0.055);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.3, 1.3, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Balanced Navy + Emerald Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x091936, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4.5, 6, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x16b981, 2.3);
    rimLight.position.set(-4.5, 2.5, -4);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.65;

    // Composite 8-Part 3D PAGUEI! Hero Group
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const cardFaceTex = createCardFaceTexture(maxAnisotropy);

    // 1. Primary Silhouette: Extruded Rounded Card Body
    const cardShape = new THREE.Shape();
    const cw = 3.2;
    const ch = 2.0;
    const cr = 0.18;
    cardShape.moveTo(-cw / 2 + cr, -ch / 2);
    cardShape.lineTo(cw / 2 - cr, -ch / 2);
    cardShape.quadraticCurveTo(cw / 2, -ch / 2, cw / 2, -ch / 2 + cr);
    cardShape.lineTo(cw / 2, ch / 2 - cr);
    cardShape.quadraticCurveTo(cw / 2, ch / 2, cw / 2 - cr, ch / 2);
    cardShape.lineTo(-cw / 2 + cr, ch / 2);
    cardShape.quadraticCurveTo(-cw / 2, ch / 2, -cw / 2, ch / 2 - cr);
    cardShape.lineTo(-cw / 2, -ch / 2 + cr);
    cardShape.quadraticCurveTo(-cw / 2, -ch / 2, -cw / 2 + cr, -ch / 2);

    const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    cardGeo.center();

    const cardBodyMat = new THREE.MeshStandardMaterial({
      color: 0x102a56,
      roughness: 0.32,
      metalness: 0.72,
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardBodyMat);
    cardMesh.castShadow = !isSoftwareGl;
    cardMesh.receiveShadow = true;
    heroGroup.add(cardMesh);

    // 2. Front Graphic Faceplate
    const faceGeo = new THREE.PlaneGeometry(cw * 0.96, ch * 0.94);
    const faceMat = new THREE.MeshStandardMaterial({
      map: cardFaceTex,
      roughness: 0.4,
      metalness: 0.25,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.z = 0.068;
    heroGroup.add(faceMesh);

    // 3. Brushed Platinum-Gold EMV Security Chip
    const chipGeo = new THREE.BoxGeometry(0.46, 0.34, 0.035);
    const chipMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      roughness: 0.16,
      metalness: 0.95,
      clearcoat: 0.85,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(-1.05, 0.1, 0.072);
    heroGroup.add(chipMesh);

    // 4. Emerald Metallic Bevel Trim Ring (#16B981)
    const trimGeo = new THREE.TorusGeometry(2.35, 0.028, 16, 80);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x16b981,
      emissive: 0x16b981,
      emissiveIntensity: 0.42,
      roughness: 0.22,
      metalness: 0.85,
    });
    const outerRing = new THREE.Mesh(trimGeo, trimMat);
    outerRing.rotation.x = Math.PI * 0.44;
    heroGroup.add(outerRing);

    // 5. Secondary Orbiting API / MCP Rail
    const apiRingGeo = new THREE.TorusGeometry(1.92, 0.018, 12, 72);
    const apiRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.9,
    });
    const apiRing = new THREE.Mesh(apiRingGeo, apiRingMat);
    apiRing.rotation.y = Math.PI * 0.25;
    apiRing.rotation.x = -Math.PI * 0.35;
    heroGroup.add(apiRing);

    // 6. Floating Contactless NFC Arcs
    const nfcGroup = new THREE.Group();
    nfcGroup.position.set(1.18, 0.45, 0.14);
    const nfcMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x16b981,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.5,
    });
    for (let i = 0; i < 3; i++) {
      const arcGeo = new THREE.TorusGeometry(0.14 + i * 0.11, 0.014, 10, 24, Math.PI * 0.55);
      const arcMesh = new THREE.Mesh(arcGeo, nfcMat);
      arcMesh.rotation.z = -Math.PI * 0.27;
      nfcGroup.add(arcMesh);
    }
    heroGroup.add(nfcGroup);

    // 7. Orbital Nodes (MCP / Webhook Data Packets)
    const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x16b981,
      emissiveIntensity: 0.55,
      roughness: 0.18,
      metalness: 0.8,
    });
    const nodeCount = 6;
    const orbitNodes = new THREE.Group();
    for (let i = 0; i < nodeCount; i++) {
      const sphere = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      sphere.position.set(Math.cos(angle) * 1.92, Math.sin(angle) * 1.92, 0);
      orbitNodes.add(sphere);
    }
    apiRing.add(orbitNodes);

    // 8. Floating Emerald Settlement Discs
    const tokensGroup = new THREE.Group();
    const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 32);
    const coinMat = new THREE.MeshPhysicalMaterial({
      color: 0x16b981,
      roughness: 0.2,
      metalness: 0.88,
      clearcoat: 0.7,
    });
    const tokenOffsets = [
      new THREE.Vector3(-1.75, -0.75, 0.65),
      new THREE.Vector3(1.85, 0.72, -0.45),
      new THREE.Vector3(1.55, -0.95, 0.55),
    ];
    const tokenMeshes = tokenOffsets.map((pos) => {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.copy(pos);
      coin.rotation.x = Math.PI * 0.42;
      tokensGroup.add(coin);
      return coin;
    });
    heroGroup.add(tokensGroup);

    // Grounded Contact Shadow Plane
    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(5.6, 5.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.75;
    scene.add(shadowPlane);

    const handleResize = () => {
      if (!mount) return;
      const w = Math.max(mount.clientWidth, 300);
      const h = Math.max(mount.clientHeight, 340);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    const pointer = { x: 0, y: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const activeMode = modeRef.current;

      if (!prefersReducedMotion) {
        heroGroup.position.y = Math.sin(elapsed * 1.4) * 0.09;
        const targetRotY =
          activeMode === 'api'
            ? -0.36 + pointer.x * 0.22
            : activeMode === 'liquido'
            ? 0.32 + pointer.x * 0.22
            : Math.sin(elapsed * 0.55) * 0.14 + pointer.x * 0.22;
        const targetRotX =
          activeMode === 'api' ? 0.14 - pointer.y * 0.14 : -0.06 - pointer.y * 0.14;

        heroGroup.rotation.y = THREE.MathUtils.damp(heroGroup.rotation.y, targetRotY, 4.2, delta);
        heroGroup.rotation.x = THREE.MathUtils.damp(heroGroup.rotation.x, targetRotX, 4.2, delta);

        const targetFaceZ = activeMode === 'api' ? 0.34 : 0.068;
        const targetChipZ = activeMode === 'api' ? 0.56 : 0.072;
        const targetNfcZ = activeMode === 'express' ? 0.24 : 0.42;
        const targetOuterScale = activeMode === 'api' ? 1.12 : 1.0;
        const targetApiSpeed = activeMode === 'api' ? 1.45 : 0.52;

        faceMesh.position.z = THREE.MathUtils.damp(faceMesh.position.z, targetFaceZ, 5.5, delta);
        chipMesh.position.z = THREE.MathUtils.damp(chipMesh.position.z, targetChipZ, 5.5, delta);
        nfcGroup.position.z = THREE.MathUtils.damp(nfcGroup.position.z, targetNfcZ, 5.5, delta);

        const nextRingScale = THREE.MathUtils.damp(outerRing.scale.x, targetOuterScale, 5, delta);
        outerRing.scale.setScalar(nextRingScale);
        outerRing.rotation.z += delta * 0.32;
        apiRing.rotation.z -= delta * targetApiSpeed;

        const coinScaleTarget = activeMode === 'liquido' ? 1.32 : 0.9;
        tokenMeshes.forEach((coin, idx) => {
          const s = THREE.MathUtils.damp(coin.scale.x, coinScaleTarget, 5, delta);
          coin.scale.setScalar(s);
          coin.rotation.z += delta * (activeMode === 'liquido' ? 2.2 : 0.9);
          coin.position.y =
            tokenOffsets[idx].y + Math.sin(elapsed * 1.9 + idx * 1.6) * 0.12;
        });
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      envTexture.dispose();
      cardFaceTex.dispose();
      shadowTex.dispose();
      cardGeo.dispose();
      cardBodyMat.dispose();
      faceGeo.dispose();
      faceMat.dispose();
      chipGeo.dispose();
      chipMat.dispose();
      trimGeo.dispose();
      trimMat.dispose();
      apiRingGeo.dispose();
      apiRingMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      coinGeo.dispose();
      coinMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, []);

  const currentMeta = MODE_LABELS.find((m) => m.id === mode) ?? MODE_LABELS[0];

  return (
    <div className="relative w-full h-full min-h-[420px] sm:min-h-[480px] rounded-2xl overflow-hidden bg-[#0B1D3D] border border-[#102A56] flex flex-col justify-between">
      {contextLost ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-[#0B1D3D]">
          <p className="font-display text-xl font-bold mb-2">PAGUEI! 3D</p>
          <p className="text-sm text-slate-300">
            Pagamentos em Angola com BI, IBAN e Multicaixa Express em 2 minutos.
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          aria-label="Demonstração interativa em 3D do sistema de pagamentos PAGUEI!"
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />
      )}

      {/* Minimal Top Caption Overlay */}
      <div className="relative z-10 pointer-events-none p-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#16B981]">Demonstração 3D Automática</p>
          <p className="text-xs text-slate-200 mt-0.5">{currentMeta.caption}</p>
        </div>
        <span className="text-[11px] font-mono text-slate-300 hidden sm:inline">
          Arraste para rodar 360°
        </span>
      </div>

      {/* Compact Bottom 3D Mode Indicator / Switcher Dock */}
      <div className="relative z-10 p-4 flex justify-center">
        <div
          role="tablist"
          aria-label="Modos da demonstração 3D"
          className="inline-flex flex-wrap justify-center gap-1 p-1 rounded-xl bg-[#07152E]/95 border border-white/15"
        >
          {MODE_LABELS.map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleManualModeSelect(item.id)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#16B981] text-[#091936]'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
