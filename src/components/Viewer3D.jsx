import { useRef, Component, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useDetectGPU, useTexture } from '@react-three/drei';                                                                                                                                    
import * as THREE from 'three'; 

// Catches WebGL crashes so the rest of the page keeps rendering
class CanvasErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div className="viewer-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 24 }}>
            WebGL is disabled in your browser.<br />
            Enable hardware acceleration in Chrome → Settings → System.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// 临时开关：改成 true 恢复钱包连接提示
const SHOW_WALLET_PROMPT = false;

// Props:
//   selectedNft — nft object | null

export default function Viewer3D({ selectedNft }) {
  return (
    <CanvasErrorBoundary>
      <div className="viewer-container">
        <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 3]} color="#7c3aed" intensity={80} />
          <pointLight position={[-3, -2, 2]} color="#06b6d4" intensity={60} />

          <NftCard nft={selectedNft} />
          <Particles />

          <OrbitControls
            enableZoom={false}
            autoRotate
            autoRotateSpeed={2}
            enableDamping
          />
        </Canvas>

        {SHOW_WALLET_PROMPT && !selectedNft && (
          <div className="viewer-overlay">
            <div className="connect-prompt">
              <div className="icon">🔮</div>
              <p>Connect your Pera wallet<br />to view your NFTs in 3D</p>
            </div>
          </div>
        )}
      </div>
    </CanvasErrorBoundary>
  );
}

// ── NFT Card Mesh ──────────────────────────────────────────────────────────
function NftCard({ nft }) {
  const meshRef = useRef();
  const frontPic = useTexture('/front.jpg');
  const backPic  = useTexture('/back.jpg');

  const cardW  = 2.560;
  const cardH  = 1.440;
  const cardD  = 0.06;
  const radius = 0.06;
  const mask    = useRoundedMask(cardW, cardH, radius);
  const cardGeo = useCardGeometry(cardW, cardH, cardD, radius);

  // TODO: load nft.image as a texture with useTexture (from @react-three/drei)
  //       and apply it to the material's `map` prop

  useFrame(({ clock }) => {
    // TODO: add subtle floating animation using clock.getElapsedTime()
  });

  return (
    <mesh ref={meshRef} geometry={cardGeo}>
      <meshStandardMaterial color="#ffffff" />

      <mesh position={[0, 0, cardD / 2 + 0.001]}>
        <planeGeometry args={[cardW, cardH]} />
        <meshStandardMaterial map={frontPic} alphaMap={mask} transparent alphaTest={0.5} />
      </mesh>

      <mesh position={[0, 0, -(cardD / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[cardW, cardH]} />
        <meshStandardMaterial map={backPic} alphaMap={mask} transparent alphaTest={0.5} />
      </mesh>
    </mesh>
  );
}

// ── Particle Field ─────────────────────────────────────────────────────────
function Particles() {
  // TODO: generate random positions with useMemo,
  //       return a <points> with bufferGeometry + pointsMaterial

  return null;
}

function useCardGeometry(w, h, depth, radius) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w/2 + radius, -h/2);
    shape.lineTo( w/2 - radius, -h/2);
    shape.quadraticCurveTo( w/2, -h/2,  w/2, -h/2 + radius);
    shape.lineTo( w/2,  h/2 - radius);
    shape.quadraticCurveTo( w/2,  h/2,  w/2 - radius,  h/2);
    shape.lineTo(-w/2 + radius,  h/2);
    shape.quadraticCurveTo(-w/2,  h/2, -w/2,  h/2 - radius);
    shape.lineTo(-w/2, -h/2 + radius);
    shape.quadraticCurveTo(-w/2, -h/2, -w/2 + radius, -h/2);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -depth / 2);  // 以中心为原点
    return geo;
  }, [w, h, depth, radius]);
}

function useRoundedMask(cardW, cardH, radius) {
  return useMemo(() => {
    const PX = 1024;
    const PY = Math.round(PX * (cardH / cardW));
    const r = Math.round(PX * (radius / cardW));  // 圆角半径换算成像素

    const canvas = document.createElement('canvas');
    canvas.width = PX;
    canvas.height = PY;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(PX - r, 0);
    ctx.quadraticCurveTo(PX, 0, PX, r);
    ctx.lineTo(PX, PY - r);
    ctx.quadraticCurveTo(PX, PY, PX - r, PY);
    ctx.lineTo(r, PY);
    ctx.quadraticCurveTo(0, PY, 0, PY - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, [cardW, cardH, radius]);
}
