import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const NODE_COLOR = '#1f2937'; // Dark Gray
const EDGE_COLOR = '#1f2937'; // Dark Gray
const EMISSIVE_COLOR = '#374151'; // Slightly lighter gray for emissive effect

const sampleInterests = [
  'Music', 'Travel', 'Photography', 'Technology', 'Art', 'Fitness',
  'Cooking', 'Reading', 'Gaming', 'Fashion', 'Movies', 'Sports',
];

const getRandomInterests = (count: number) => {
  const shuffled = [...sampleInterests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const createGraph = (nodeCount: number) => {
  const nodes = [];
  const links: { source: number; target: number; }[] = [];

  const interests = getRandomInterests(nodeCount);
  for (let i = 0; i < nodeCount; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const size = Math.random() * 0.5 + 0.5;
    nodes.push({
      id: i,
      position: new THREE.Vector3(x, y, z),
      size,
      label: interests[i],
    });
  }

  for (let i = 0; i < nodeCount * 3; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    const target = Math.floor(Math.random() * nodeCount);
    if (source !== target && !links.some(
      (link) => (link.source === source && link.target === target) ||
        (link.source === target && link.target === source)
    )) {
      links.push({ source, target });
    }
  }

  return { nodes, links };
};

const Graph = () => {
  const groupRef = useRef<THREE.Group>(null);
  const graph = useMemo(() => createGraph(30), []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {graph.nodes.map((node) => (
        <mesh key={node.id} position={node.position} scale={[node.size, node.size, node.size]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={NODE_COLOR} emissive={EMISSIVE_COLOR} emissiveIntensity={0.3} />
          <Text position={[0, 0.7, 0]} fontSize={0.3} color="#000000" anchorX="center" anchorY="middle">
            {node.label}
          </Text>
        </mesh>
      ))}

      {graph.links.map((link, index) => {
        const sourceNode = graph.nodes[link.source];
        const targetNode = graph.nodes[link.target];
        const direction = new THREE.Vector3().subVectors(targetNode.position, sourceNode.position);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(sourceNode.position, targetNode.position).multiplyScalar(0.5);
        const orientation = new THREE.Matrix4();
        orientation.lookAt(sourceNode.position, targetNode.position, new THREE.Object3D().up);
        orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        return (
          <mesh key={index} position={midpoint} rotation={new THREE.Euler().setFromRotationMatrix(orientation)}>
            <cylinderGeometry args={[0.05, 0.05, length, 8, 1]} />
            <meshStandardMaterial color={EDGE_COLOR} opacity={0.8} transparent />
          </mesh>
        );
      })}
    </group>
  );
};

const DataVisualization3D: React.FC = () => {
  return (
    <div className="relative w-full max-w-5xl h-[450px] mx-auto"> {/* Increased height for larger graph */}
      <Canvas
        camera={{ position: [0, 0, 20], fov: 80 }}
        className="absolute inset-0 w-full h-full"
        gl={{ alpha: true }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Graph />
        <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default DataVisualization3D;
