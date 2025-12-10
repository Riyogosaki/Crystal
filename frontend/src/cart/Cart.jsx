import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

const SpaceParticles = ({ count = 100 }) => {
  const particles = useRef();
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 10 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    const color = new THREE.Color(
      Math.random() > 0.8 ? 0x4d79ff : 
      Math.random() > 0.6 ? 0xffdd4d : 0xffffff
    );
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      particles.current.geometry.attributes.position.array[i3] += Math.sin(time * 0.1 + i) * 0.001;
      particles.current.geometry.attributes.position.array[i3 + 2] += Math.cos(time * 0.1 + i) * 0.001;
    }
    
    particles.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        vertexColors
        transparent 
        opacity={0.8} 
        sizeAttenuation
      />
    </points>
  );
};

const Planet = ({ position, size = 1, color = "#ff9933", rings = false }) => {
  const ref = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = time * 0.1;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {rings && (
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[size * 1.8, size * 0.2, 2, 50]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  );
};

const ProductModel = ({ images }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }
  });
  
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} scale={[1.5, 1.5, 1.5]}>
          <boxGeometry args={[1, 1, 1]} />
          {images.front && (
            <meshStandardMaterial attach="material-4" map={new THREE.TextureLoader().load(images.front)} />
          )}
          {images.back && (
            <meshStandardMaterial attach="material-5" map={new THREE.TextureLoader().load(images.back)} />
          )}
          {images.left && (
            <meshStandardMaterial attach="material-0" map={new THREE.TextureLoader().load(images.left)} />
          )}
          {images.right && (
            <meshStandardMaterial attach="material-1" map={new THREE.TextureLoader().load(images.right)} />
          )}
          <meshStandardMaterial attach="material-2" color="#1a1a2e" /> 
          <meshStandardMaterial attach="material-3" color="#1a1a2e" /> 
        </mesh>
      </Float>
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        minDistance={1.5}
        maxDistance={5}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#4cc9f0" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#f72585" />
    </group>
  );
};

const Cart = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentView, setCurrentView] = useState("front");
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://api-roma.onrender.com/api/product/${id}`);
        const data = await res.json();
        setProduct(data.message);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const response = await fetch(`https://api-roma.onrender.com/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          productId: product._id,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        setMessage("Log in to add items");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate("/Login");
        }, 2000);
        return;
      }

      if (response.ok) {
        setMessage("Added to Cart!");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to add");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setMessage("Error, try again");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  if (!product) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        <div className="text-white text-2xl font-bold z-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
            Exploring the cosmos for product...
          </div>
        </div>
      </div>
    );
  }

  const images = {
    front: product.images?.front,
    left: product.images?.left,
    right: product.images?.right,
    back: product.images?.back || product.images?.front,
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-4 overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2}px`,
              height: `${Math.random() * 2}px`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
      </div>

      <motion.div
        className="absolute top-20 right-20 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-40 left-1/4 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-black/80 backdrop-blur-lg border border-cyan-500 text-cyan-300 font-bold py-3 px-6 rounded-xl shadow-xl">
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-md text-cyan-300 px-4 py-2 rounded-full hover:bg-black/70 transition-all flex items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Return to Earth
      </motion.button>

      <div className="container mx-auto pt-20 pb-10 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-cyan-500/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <div className="mb-6">
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold mb-2 text-cyan-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {product.productname}
                </motion.h1>
                <motion.p 
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  ₹ {product.price}
                </motion.p>
              </div>

              <motion.div 
                className="bg-black/40 p-4 rounded-xl mb-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-white/90">
                  {product.description || "Discover this cosmic product. No description provided."}
                </p>
              </motion.div>

              <div className="flex flex-wrap gap-3 mb-6">
                {Object.keys(images).map((view) => (
                  images[view] && (
                    <motion.button
                      key={view}
                      onClick={() => setCurrentView(view)}
                      className={`px-4 py-2 rounded-full text-sm capitalize ${
                        currentView === view 
                          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold" 
                          : "bg-gray-800 text-cyan-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {view}
                    </motion.button>
                  )
                ))}
              </div>

              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(0, 209, 255, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold py-4 rounded-xl shadow-lg relative overflow-hidden"
                onClick={handleAddToCart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="relative z-10">Add to Cosmic Cart 🚀</span>
                <div className="absolute inset-0 flex justify-around items-end">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/40"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </div>
              </motion.button>
            </div>

            <div className="lg:w-1/2 h-96 md:h-[500px] bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-black rounded-2xl overflow-hidden border border-cyan-500/30">
              <Canvas shadows camera={{ position: [0, 0, 3], fov: 50 }}>
                <color attach="background" args={['#000']} />
                <ambientLight intensity={0.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} color="#0ff" intensity={0.5} />
                
                <ProductModel images={images} />
                <SpaceParticles count={200} />
                <Stars radius={50} depth={30} count={2000} factor={3} fade />
                
                <Planet position={[-5, 2, -5]} size={0.8} color="#ff9933" />
                <Planet position={[4, -1, -8]} size={1.2} color="#4d79ff" rings />
              </Canvas>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;