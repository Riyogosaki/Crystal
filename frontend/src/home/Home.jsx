import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

function AirplaneModel() {
  const group = useRef();
  const { scene } = useGLTF('./brac/scene.gltf');

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const radius = window.innerWidth < 768 ? 2.5 : 4;
    const speed = 0.5;
    const x = Math.cos(t * speed) * radius;
    const z = Math.sin(t * speed) * radius;

    group.current.position.set(x, window.innerWidth < 768 ? 1.5 : 2, z); 
    group.current.rotation.y = -t * speed + Math.PI / 2;
  });

  return <primitive ref={group} object={scene} scale={window.innerWidth < 768 ? 0.06 : 0.09} />;
}

useGLTF.preload('/models/scene.gltf');

const FlyingCanvas = ({ flyAway }) => (
  <motion.div
    initial={{ x: 0 }}
    animate={{ 
      x: flyAway ? 1500 : 0,
      rotate: flyAway ? 45 : 0
    }}
    transition={{ duration: 2, ease: 'easeInOut' }}
    style={{ width: '100%', height: window.innerWidth < 768 ? 300 : 400 }}
    className="relative z-10"
  >
    <Canvas>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <AirplaneModel />
      <OrbitControls enableZoom={false} />
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
    </Canvas>
  </motion.div>
);

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [flyAway, setFlyAway] = useState(false);
  const [pass, setPass] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const handlePacket= ()=> {
    navigate("/product/bracylete");
  }
  const allimages = [
    {images:"/allimages/crystal.png", title:"Crystal Bracelet", price: "$1.1", slug: "bracelet"},
    {images:"/allimages/crystal0.png", title:"Crystal Necklace", price: "$1.2", slug: "necklace"},
    {images:"/allimages/crystal2.png", title:"Diamond Pendant", price: "$1", slug: "pendant"},
    {images:"/allimages/crystal3.png", title:"Black Onyx", price: "$1.2", slug: "onyx"},
    {images:"/allimages/crystal4.png", title:"Sapphire Ring", price: "$2", slug: "ring"},
    {images:"/allimages/crystal5.png", title:"Emerald Earrings", price: "$1.3", slug: "earrings"},
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % allimages.length);
    }, 4000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const handleFly = () => {
    setFlyAway(true);
    setTimeout(() => setFlyAway(false), 3000);
  };
  
  const handletoCart = () => {
    navigate("/cart");
  }
  
  const handleLogin = () => {
    navigate("/login");
  }
  
  const [displayPassword, setDisplayPassword] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden relative'>
      <div 
        className="fixed w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400 pointer-events-none z-50"
        style={{
          left: cursorPosition.x - 16,
          top: cursorPosition.y - 16,
          transform: `scale(${1 + scrollY * 0.0005})`,
          transition: 'transform 0.1s ease-out',
          mixBlendMode: 'screen'
        }}
      ></div>
      
      <div className="fixed inset-0 z-0">
        {[...Array(window.innerWidth < 768 ? 20 : 50)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

<header className="fixed top-0 left-0 w-full p-4 bg-white/60 backdrop-blur-md shadow-md flex justify-between items-center z-50">
  <motion.h1 
    className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 tracking-widest"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    CRYSTAL AURA
  </motion.h1>

  <button 
    className="md:hidden text-white z-50"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
    </svg>
  </button>

  <div className="hidden md:flex items-center space-x-4">
    {['cart', 'profile', 'contact'].map((icon, i) => (
      <motion.div
        key={icon}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1, duration: 0.3 }}
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm cursor-pointer"
        onClick={
          icon === 'cart' ? handletoCart : 
          icon === 'profile' ? handleLogin : 
          undefined
        }
      >
        <img
          src={
            icon === 'cart'
              ? "https://cdn-icons-png.flaticon.com/512/891/891462.png" // 🛒
              : icon === 'profile'
              ? "https://cdn-icons-png.flaticon.com/512/1077/1077063.png" // 👤
              : "https://cdn-icons-png.flaticon.com/512/561/561127.png"   // 📞
          }
          alt={icon}
          className="w-6 h-6 object-contain"
        />
      </motion.div>
    ))}
  </div>

  <AnimatePresence>
    {menuOpen && (
      <motion.nav
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="absolute top-16 right-4 w-52 bg-black/80 backdrop-blur-lg text-white rounded-xl shadow-2xl z-20 border border-white/20 md:hidden"
      >
        <div className="flex flex-col p-4 space-y-3">
          <Link
            to="/product/bracylete"
            className="hover:text-pink-400 transition-colors duration-200 py-2 border-b border-white/10"
            onClick={() => setMenuOpen(false)}
          >
            Crystal Collection
          </Link>
          <Link
            to="/product/bracylete"
            className="hover:text-pink-400 transition-colors duration-200 py-2 border-b border-white/10"
            onClick={() => setMenuOpen(false)}
          >
            Luxury Necklaces
          </Link>
          <button
            onClick={() => {
              setDisplayPassword(true);
              setMenuOpen(false);
            }}
            className="hover:text-pink-400 text-left py-2 flex items-center"
          >
            <span className="mr-2">🔒</span> Create Product
          </button>
          <button
            onClick={handletoCart}
            className="hover:text-pink-400 text-left py-2 flex items-center"
          >
            <span className="mr-2">🛒</span> Shopping Cart
          </button>
          <button
            onClick={handleLogin}
            className="hover:text-pink-400 text-left py-2 flex items-center"
          >
            <span className="mr-2">👤</span> My Account
          </button>
        </div>
      </motion.nav>
    )}
  </AnimatePresence>
</header>


      <main className="pt-24 px-4 text-center relative z-10">
        <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-600/20 rounded-full blur-[80px] animate-pulse"></div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-7xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-300 to-purple-400 px-4 hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            A Raindrop Looking Like A Crystal Stone
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-2xl px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover the extraordinary beauty of handcrafted crystal jewelry that captures the essence of nature's perfection.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={handleFly}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full text-lg font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">FLY WITH US</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </motion.div>
          
          <motion.div 
            className="mt-12 md:mt-16 w-full max-w-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <FlyingCanvas flyAway={flyAway} />
          </motion.div>
        </section>
        
        <motion.section 
          className="my-16 md:my-24 rounded-3xl overflow-hidden relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <img
              src="/allimages/poster.png"
              alt="Crystal Banner"
              className="w-full max-h-[500px] md:max-h-[600px] object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black/90 rounded-3xl"></div>
            <div className="absolute bottom-5 md:bottom-10 left-5 md:left-10 text-left max-w-lg featured-banner-text">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">Summer Collection 2023</h2>
              <p className="text-sm md:text-lg text-gray-300 mb-4 md:mb-6">Exquisite crystal pieces designed to capture the essence of summer nights and starlit skies.</p>
              <button className="px-4 py-2 md:px-6 md:py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition text-sm md:text-base" onClick={handlePacket}>
                Explore Collection
              </button>
            </div>
          </div>
        </motion.section>
        
        <section className="my-16 md:my-32">
          <motion.h1 
            className="text-3xl md:text-6xl font-extrabold text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Crystal Collection
            </span>
          </motion.h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-12 pb-10 md:pb-20">
            {allimages.map((product, index) => (
              <motion.div
                key={index}
                className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-black backdrop-blur-lg border border-white/10 shadow-xl hover:shadow-[0_20px_50px_rgba(192,132,252,0.3)] transition duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-64 md:h-80 overflow-hidden" onClick={handlePacket}>
                  <Link to={`/product/${product.slug}`}>
                    <img
                    onClick={handlePacket}
                      src={product.images}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">{product.title}</h3>
                  <p className="text-pink-400 font-medium mb-3 md:mb-4">{product.price}</p>
                  
                </div>
                
                <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                  Crystal Braces
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        
        <section className="my-16 md:my-32 py-12 md:py-20 bg-gradient-to-r from-black via-gray-900 to-black rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-pink-600/10 rounded-full blur-[60px] md:blur-[80px] animate-pulse"></div>
          </div>
          
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-500">
              Featured Masterpiece
            </span>
          </motion.h2>
          
          <div className="flex justify-center">
            <div className="w-full max-w-xs md:max-w-2xl h-72 md:h-96 relative">
              {allimages.map((item, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: index === activeIndex ? 1 : 0,
                    scale: index === activeIndex ? 1 : 0.8,
                    zIndex: index === activeIndex ? 1 : 0
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-1 mb-4 md:mb-6">
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <img 
                          src={item.images} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onClick={handlePacket}
                        />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">{item.title}</h3>
                  <p className="text-pink-400 font-medium">{item.price}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <motion.section 
          className="my-16 md:my-32 p-6 md:p-10 bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-3xl border border-white/10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6">Thanks For Visting Our Website</h2>
          <p className="text-gray-300 text-center mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            @Ankush Mercendenary Company Tang Hao
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 max-w-lg mx-auto">
           
          </div>
        </motion.section>
      </main>
      
      <footer className="relative mt-16 md:mt-32 px-4 md:px-6 py-12 md:py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden rounded-t-3xl shadow-[0_-5px_40px_rgba(255,255,255,0.1)]">
        <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-pink-500/10 rounded-full blur-2xl md:blur-3xl animate-pulse -z-10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-2xl md:blur-3xl animate-pulse -z-10"></div>

        <div className="max-w-6xl mx-auto text-center space-y-6 md:space-y-10 z-10">
          <motion.h2 
            className="text-3xl md:text-5xl font-extrabold tracking-widest text-pink-400 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-500">
              CRYTAL AURA
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Jewelry That Reflects Your Light
          </motion.p>

          <motion.div 
            className="flex flex-col justify-center space-y-3 md:space-y-0 md:flex-row md:space-x-12 text-sm md:text-lg font-medium text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p>📧 Email: <a href="ankushkumae467@gmail.com" className="hover:text-pink-400 underline transition">ankushkumae467@gmail.com</a></p>
            <p>📞 Phone: <a href="tel:+11234567890" className="hover:text-pink-400 underline transition">+1 (123) 456-7890</a></p>
          </motion.div>

          <motion.div 
            className="flex justify-center gap-6 md:gap-10 mt-6 md:mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {['2111/2111463', '145/145802', '733/733585'].map((icon, i) => (
              <motion.a 
                key={icon}
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-pink-500/30 transition-colors"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <img 
                  src={`https://cdn-icons-png.flaticon.com/512/${icon}.png`} 
                  alt="social"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
              </motion.a>
            ))}
          </motion.div>

          <motion.p 
            className="text-xs md:text-sm text-gray-500 mt-8 md:mt-10 tracking-wider"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            &copy; {new Date().getFullYear()} <span className="text-white font-bold">CrystalAura</span> • All rights reserved.
          </motion.p>
        </div>
      </footer>
      
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed z-0 pointer-events-none"
          style={{
            left: `${10 + i * 20}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          <img
            src={`/allimages/crystal${i}.png`}
            alt="Floating crystal"
            className="w-12 h-12 opacity-20"
          />
        </motion.div>
      ))}
      
      <AnimatePresence>
        {displayPassword && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-2xl border border-white/10 p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h3 className="text-xl font-bold text-white mb-2">Create New Product</h3>
              <p className="text-gray-400 mb-4">Enter the admin password to access the product creation page</p>
              
              <div className="mb-4">
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDisplayPassword(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (pass.toLowerCase() === "ankushkumar") {
                      navigate("/creatingproduct");
                    } else {
                      alert("Incorrect password. Page is locked 🔒");
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;