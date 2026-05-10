import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  earthVertex,
  earthFragment,
  atmosphereVertex,
  atmosphereFragment,
} from "./shaders";
import { COUNTRIES, type Country } from "@/lib/countries";

type Props = {
  onCountryClick?: (c: Country) => void;
  className?: string;
};

const latLonToVec3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
};

export function Globe({ onCountryClick, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onClickRef = useRef(onCountryClick);
  onClickRef.current = onCountryClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    let width = container.clientWidth;
    let height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const TL = new THREE.TextureLoader();
    const dayTexture = TL.load("/earth/day.jpg");
    const nightTexture = TL.load("/earth/night.jpg");
    const specularCloudsTexture = TL.load("/earth/specularClouds.jpg");
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    const aniso = renderer.capabilities.getMaxAnisotropy();
    dayTexture.anisotropy = aniso;
    nightTexture.anisotropy = aniso;
    specularCloudsTexture.anisotropy = aniso;

    const atmosphereDayColor = "#4a96e8";
    const atmosphereTwilightColor = "#1950E5";

    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
      uniforms: {
        uDayTexture: new THREE.Uniform(dayTexture),
        uNightTexture: new THREE.Uniform(nightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(specularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(atmosphereTwilightColor),
        ),
      },
    });

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      depthWrite: false,
      uniforms: {
        uOpacity: { value: 1 },
        uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(atmosphereTwilightColor),
        ),
      },
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    atmosphere.scale.setScalar(1.13);

    const earthGroup = new THREE.Group();
    earthGroup.add(earth, atmosphere);
    scene.add(earthGroup);

    // Sun direction (matches reference)
    const sunSpherical = new THREE.Spherical(1, Math.PI * 0.48, -1.8);
    const sunDirection = new THREE.Vector3().setFromSpherical(sunSpherical);
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);

    // Pins
    const pinGroup = new THREE.Group();
    earthGroup.add(pinGroup);
    
    const headGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const pointerGeo = new THREE.ConeGeometry(0.03, 0.07, 16);
    pointerGeo.rotateX(Math.PI); // Point downwards

    const uiColors = [0x6ee7ff, 0xa575ff, 0x4a96e8]; // cyan, violet, blue
    
    const raycastMeshes: THREE.Mesh[] = [];
    const hoverTargets: THREE.Group[] = [];

    const buildPins = (countryList: Country[]) => {
      while(pinGroup.children.length > 0){ 
        pinGroup.remove(pinGroup.children[0]); 
      }
      raycastMeshes.length = 0;
      hoverTargets.length = 0;

      countryList.forEach((c, i) => {
        const color = uiColors[i % uiColors.length];
        const pos = latLonToVec3(c.lat, c.lon, 2.02);
        
        const pinContainer = new THREE.Group();
        pinContainer.position.copy(pos);
        pinContainer.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          pos.clone().normalize()
        );
        pinContainer.userData = { targetScale: 1, country: c };
        
        const mat = new THREE.MeshBasicMaterial({ color });
        
        const head = new THREE.Mesh(headGeo, mat);
        head.position.y = 0.07;
        
        const pointer = new THREE.Mesh(pointerGeo, mat);
        pointer.position.y = 0.035;

        const haloMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.35,
        });
        const halo = new THREE.Mesh(headGeo.clone().scale(1.7, 1.7, 1.7), haloMat);
        halo.position.y = 0.07;
        pinContainer.userData.haloMat = haloMat;
        
        pinContainer.add(head, pointer, halo);
        pinGroup.add(pinContainer);
        hoverTargets.push(pinContainer);
        
        head.userData = { container: pinContainer };
        pointer.userData = { container: pinContainer };
        halo.userData = { container: pinContainer };
        raycastMeshes.push(head, pointer, halo);
      });
    };

    buildPins(COUNTRIES);

    import("@/lib/countries").then(({ fetchAllCountries }) => {
      fetchAllCountries().then((all) => buildPins(all));
    });

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.55;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.target.set(0, 0, 0);

    // Raycasting for clicks and hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos: { x: number; y: number } | null = null;

    const handleDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handleUp = (e: PointerEvent) => {
      if (!downPos) return;
      const dx = e.clientX - downPos.x;
      const dy = e.clientY - downPos.y;
      downPos = null;
      if (Math.hypot(dx, dy) > 6) return; // dragged, ignore
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(raycastMeshes, false);
      if (hits.length > 0) {
        const hit = hits[0].object;
        const container = hit.userData.container;
        if (container && container.userData.country && onClickRef.current) {
          onClickRef.current(container.userData.country);
        }
      }
    };

    const handleMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(raycastMeshes, false);
      
      hoverTargets.forEach((t) => (t.userData.targetScale = 1));
      
      if (hits.length > 0) {
        document.body.style.cursor = "pointer";
        const hit = hits[0].object;
        const container = hit.userData.container;
        if (container) container.userData.targetScale = 1.4;
      } else {
        document.body.style.cursor = "default";
      }
    };

    renderer.domElement.addEventListener("pointerdown", handleDown);
    renderer.domElement.addEventListener("pointerup", handleUp);
    renderer.domElement.addEventListener("pointermove", handleMove);

    // Resize
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Animate
    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      
      hoverTargets.forEach((pin) => {
        // Subtle pin halo pulse
        if (pin.userData.haloMat) {
          pin.userData.haloMat.opacity = 0.25 + Math.sin(t * 2) * 0.12;
        }
        // Smooth scale interpolation for hover effect
        pin.scale.lerp(new THREE.Vector3().setScalar(pin.userData.targetScale), 0.15);
      });

      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.body.style.cursor = "default";
      renderer.domElement.removeEventListener("pointerdown", handleDown);
      renderer.domElement.removeEventListener("pointerup", handleUp);
      renderer.domElement.removeEventListener("pointermove", handleMove);
      controls.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereMaterial.dispose();
      headGeo.dispose();
      pointerGeo.dispose();
      dayTexture.dispose();
      nightTexture.dispose();
      specularCloudsTexture.dispose();
      const gl = renderer.getContext();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative" }}
      aria-label="Interactive 3D globe"
    />
  );
}
