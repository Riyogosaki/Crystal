import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { motion } from "framer-motion";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

const FloatingCubes = () => {
  const meshRef = useRef();
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3 + Math.sin(i * 0.5) * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 0.8) * 1.5;
        
        return (
          <mesh 
            key={i}
            ref={i === 0 ? meshRef : null}
            position={[x, y, z]}
            rotation={[Math.PI / 4, Math.PI / 4, 0]}
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#0ea5e9" : "#8b5cf6"} 
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Particles = ({ count = 100 }) => {
  const particles = useRef([]);
  
  useEffect(() => {
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: Math.random() * 10 - 5,
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
      vz: (Math.random() - 0.5) * 0.01,
      size: Math.random() * 0.1 + 0.05,
    }));
  }, [count]);

  useFrame(() => {
    particles.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      
      if (Math.abs(p.x) > 5) p.vx *= -1;
      if (Math.abs(p.y) > 5) p.vy *= -1;
      if (Math.abs(p.z) > 5) p.vz *= -1;
    });
  });

  return (
    <group>
      {particles.current.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const FloatingOrbs = () => {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[2, 1, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          emissive="#0ea5e9" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh position={[-1.5, -1, 1]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

const ThreeDScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#0ea5e9" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#8b5cf6" />
      <Stars radius={50} depth={50} count={1000} factor={4} />
      <FloatingCubes />
      <Particles count={150} />
      <FloatingOrbs />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("https://api-roma.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include", 
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Login failed");

    navigate("/");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-70">
        <ThreeDScene />
      </div>
      
      <div className="fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-500/20"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
            }}
            animate={{
              x: ["0%", "100%", "0%"],
              y: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-8"
            >
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-purple-500 p-1 rounded-full mb-4">
                <div className="bg-gray-900 rounded-full p-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <motion.h1 
                className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p 
                className="text-gray-400"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Sign in to continue your journey
              </motion.p>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors duration-300">
                  <div className="text-cyan-400">
                    <MdOutlineMail size={20} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setActiveField('username')}
                    onBlur={() => setActiveField(null)}
                    className="bg-transparent outline-none flex-1 placeholder-gray-500"
                    required
                  />
                </label>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <label className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors duration-300">
                  <div className="text-cyan-400">
                    <MdPassword size={20} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                    className="bg-transparent outline-none flex-1 placeholder-gray-500"
                    required
                  />
                </label>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-400 bg-red-900/30 p-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </form>

            <motion.div 
              className="mt-6 text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <p className="text-gray-400">Don't have an account?</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-2"
              >
                <Link 
                  to="/signup" 
                  className="inline-block bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent font-medium"
                >
                  Create an Account
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-cyan-500/10 blur-xl"
        animate={{
          y: [0, -30, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-purple-500/10 blur-xl"
        animate={{
          y: [0, 30, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default Login;