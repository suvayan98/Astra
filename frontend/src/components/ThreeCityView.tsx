import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Boxes, 
  Sun, 
  Moon, 
  RotateCw, 
  X, 
  Eye, 
  Compass, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { MasterPlanAlternative } from '../types';

interface ThreeCityViewProps {
  activePlan: MasterPlanAlternative | null;
  onClose: () => void;
}

export const ThreeCityView: React.FC<ThreeCityViewProps> = ({ activePlan, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [autoRotate, setAutoRotate] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const windBladesRef = useRef<THREE.Mesh[]>([]);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(timeOfDay === 'night' ? 0x050811 : (timeOfDay === 'sunset' ? 0x1f142b : 0x0a1024));
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.007);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(70, 60, 90);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dirLight.position.set(60, 80, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.8);
    scene.add(ambientLight);

    // 5. Terrain Ground Plate
    const groundGeo = new THREE.PlaneGeometry(130, 130, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: wireframe
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const grid = new THREE.GridHelper(130, 26, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.05;
    scene.add(grid);

    // 6. Central Retention Lake (Reflective Cyan Water Body)
    const waterGeo = new THREE.CylinderGeometry(16, 17, 0.4, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.85
    });
    const lake = new THREE.Mesh(waterGeo, waterMat);
    lake.position.set(30, 0.2, -25);
    scene.add(lake);

    // 7. Procedural Buildings & Facilities Group
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    windBladesRef.current = [];

    // Helper to generate buildings
    const addBuilding = (x: number, z: number, w: number, d: number, h: number, color: number, emissive: number = 0x000000) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.4,
        emissive: emissive,
        emissiveIntensity: 0.4,
        wireframe: wireframe
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      buildingsGroup.add(mesh);
      return mesh;
    };

    // Residential Towers Cluster (Blue)
    for (let i = 0; i < 18; i++) {
      const rx = -35 + (i % 6) * 9 + (Math.random() * 2 - 1);
      const rz = -25 + Math.floor(i / 6) * 12 + (Math.random() * 2 - 1);
      const h = 6 + Math.random() * 14;
      addBuilding(rx, rz, 5.5, 5.5, h, 0x3b82f6, 0x1d4ed8);
    }

    // Commercial Core & Innovation Towers (Amber / Gold)
    for (let i = 0; i < 8; i++) {
      const cx = -5 + (i % 4) * 11;
      const cz = -10 + Math.floor(i / 4) * 14;
      const h = 14 + Math.random() * 16;
      addBuilding(cx, cz, 7, 7, h, 0xf59e0b, 0xb45309);
    }

    // District Hospital (Red with helipad)
    const hospital = addBuilding(-42, 22, 16, 12, 8, 0xef4444, 0x991b1b);
    // Helipad marker on top
    const heliGeo = new THREE.RingGeometry(1.5, 2.5, 16);
    const heliMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const helipad = new THREE.Mesh(heliGeo, heliMat);
    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(-42, 8.05, 22);
    buildingsGroup.add(helipad);

    // Green Schools Campus (Sky Blue)
    addBuilding(-20, 32, 14, 10, 5, 0x0ea5e9, 0x0369a1);

    // Clean-Tech Industrial Park (Purple)
    for (let i = 0; i < 4; i++) {
      const ix = -40 + (i % 2) * 14;
      const iz = -48 + Math.floor(i / 2) * 12;
      addBuilding(ix, iz, 10, 8, 6, 0x8b5cf6, 0x6d28d9);
    }

    // Solar PV Farm Field (Yellow angled panels)
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        const sx = 20 + c * 4.5;
        const sz = 20 + r * 4.5;
        const panelGeo = new THREE.PlaneGeometry(3.5, 2.2);
        const panelMat = new THREE.MeshStandardMaterial({
          color: 0x1e3a8a,
          roughness: 0.1,
          metalness: 0.9,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.2,
          side: THREE.DoubleSide
        });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(sx, 1.2, sz);
        panel.rotation.x = -Math.PI / 3; // 15° fixed solar tilt
        panel.rotation.y = 0;
        buildingsGroup.add(panel);
      }
    }

    // Wind Turbines (2 Boundary units with spinning rotor blades)
    [ [48, -45], [52, -20] ].forEach(([wx, wz]) => {
      // Mast
      const mastGeo = new THREE.CylinderGeometry(0.4, 0.8, 22, 12);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(wx, 11, wz);
      buildingsGroup.add(mast);

      // Nacelle
      const nacGeo = new THREE.BoxGeometry(1.6, 1.2, 2.5);
      const nac = new THREE.Mesh(nacGeo, mastMat);
      nac.position.set(wx, 22, wz);
      buildingsGroup.add(nac);

      // 3 Blades Rotor
      const bladesGroup = new THREE.Group();
      bladesGroup.position.set(wx, 22, wz + 1.4);
      for (let b = 0; b < 3; b++) {
        const bladeGeo = new THREE.ConeGeometry(0.35, 9, 8);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 4.5;
        const bladeHolder = new THREE.Group();
        bladeHolder.rotation.z = (b * Math.PI * 2) / 3;
        bladeHolder.add(blade);
        bladesGroup.add(bladeHolder);
      }
      buildingsGroup.add(bladesGroup);
      windBladesRef.current.push(bladesGroup as any);
    });

    // 8. 3D Native Trees (Foliage green spheres + brown trunks)
    for (let t = 0; t < 60; t++) {
      const tx = 10 + (Math.random() * 45);
      const tz = -10 + (Math.random() * 35);
      // Skip lake area
      if (Math.hypot(tx - 30, tz - (-25)) < 18) continue;

      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(tx, 1, tz);
      buildingsGroup.add(trunk);

      const leafGeo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 0.8, 1);
      const leafMat = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x10b981 : 0x059669,
        roughness: 0.8
      });
      const foliage = new THREE.Mesh(leafGeo, leafMat);
      foliage.position.set(tx, 2.8, tz);
      buildingsGroup.add(foliage);
    }

    // 9. Animation Loop
    let angle = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Auto-orbit camera
      if (autoRotate) {
        angle += 0.003;
        camera.position.x = Math.sin(angle) * 95;
        camera.position.z = Math.cos(angle) * 95;
        camera.lookAt(0, 0, 0);
      }

      // Rotate wind turbine blades
      windBladesRef.current.forEach((rotor) => {
        rotor.rotation.z += 0.04;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [wireframe]);

  // Adjust time of day lighting
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;

    if (timeOfDay === 'night') {
      scene.background = new THREE.Color(0x030712);
      scene.fog = new THREE.FogExp2(0x030712, 0.008);
      dir.intensity = 0.15;
      dir.color.setHex(0x38bdf8);
      hemi.intensity = 0.2;
    } else if (timeOfDay === 'sunset') {
      scene.background = new THREE.Color(0x27122e);
      scene.fog = new THREE.FogExp2(0x27122e, 0.006);
      dir.intensity = 0.9;
      dir.color.setHex(0xf97316);
      hemi.intensity = 0.4;
    } else {
      scene.background = new THREE.Color(0x091024);
      scene.fog = new THREE.FogExp2(0x091024, 0.006);
      dir.intensity = 1.3;
      dir.color.setHex(0xffffff);
      hemi.intensity = 0.6;
    }
  }, [timeOfDay]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col">
      {/* Top Bar Controls */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center">
              3D Smart City Digital Twin
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                {activePlan?.name.split(':')[0] || 'Plan A'} Procedural Mesh
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive WebGL Simulation (Three.js): 20,000 Inhabitants &bull; 500 Acres Footprint
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Time of Day */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded transition ${timeOfDay === 'day' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}
              title="Day Solar Noon"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1.5 rounded transition ${timeOfDay === 'sunset' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
              title="Golden Hour Sunset"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1.5 rounded transition ${timeOfDay === 'night' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}
              title="Night Illumination"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
              autoRotate ? 'bg-slate-800 text-cyan-300 border-cyan-800' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
          </button>

          {/* Wireframe */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
              wireframe ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="flex-1 w-full relative cursor-grab active:cursor-grabbing">
        {/* Floating 3D Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl max-w-xs text-[11px] pointer-events-none">
          <div className="font-semibold text-slate-200 mb-2">Procedural 3D Objects</div>
          <div className="space-y-1.5 text-slate-300 text-[10px]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>Residential Multi-Family Clusters</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Commercial & Innovation Hub Towers</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span>Hospital + Active Helipad (Civic Safety)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
              <span>Retention Bio-Lake (Water Balance)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-indigo-900" />
              <span>15° Tilted Bifacial Solar Arrays</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-200" />
              <span>Dual 2.5 MW Micro-Wind Turbines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
