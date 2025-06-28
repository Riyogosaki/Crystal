import React, { useEffect, useState, useRef } from "react";
import { MdArrowBack, MdArrowForward, MdExpandMore, MdExpandLess } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import {useNavigate} from "react-router-dom";

const Loading = () => (
  <div className="flex justify-center items-center h-screen bg-black backdrop-blur-xl">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl animate-pulse"></div>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-solid relative"></div>
    </div>
  </div>
);

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${i % 3 === 0 ? '#ff00cc' : i % 3 === 1 ? '#00ccff' : '#ccff00'}, transparent)`,
            width: `${Math.random() * 200 + 50}px`,
            height: `${Math.random() * 200 + 50}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const DynamicBackground = () => {
  const [gradientIndex, setGradientIndex] = useState(0);
  const gradients = [
    "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    "linear-gradient(135deg, #23074d, #cc5333)",
    "linear-gradient(135deg, #000428, #004e92)",
    "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)",
    "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prev) => (prev + 1) % gradients.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 z-0"
      style={{ background: gradients[gradientIndex] }}
      animate={{ background: gradients[gradientIndex] }}
      transition={{ duration: 3, ease: "easeInOut" }}
    >
      <FloatingParticles />
    </motion.div>
  );
};

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const imageArray = [images.front, images.left, images.right];
  
  const [dragStart, setDragStart] = useState(0);
  
  const handleDragStart = (e, info) => {
    setDragStart(info.point.x);
  };
  
  const handleDragEnd = (e, info) => {
    const dragDistance = info.point.x - dragStart;
    if (dragDistance > 50) {
      handlePrev();
    } else if (dragDistance < -50) {
      handleNext();
    }
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % imageArray.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-xs mx-auto mt-2">
      <motion.div 
        className="overflow-hidden rounded-2xl border-4 border-white shadow-lg"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="w-full h-64 relative"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ 
              opacity: 1, 
              rotateY: 0,
              transition: { 
                rotateY: { duration: 0.8, ease: [0.65, 0, 0.35, 1] } 
              } 
            }}
            exit={{ 
              opacity: 0, 
              rotateY: -90,
              transition: { 
                duration: 0.8, 
                ease: [0.65, 0, 0.35, 1] 
              } 
            }}
          >
            <img
              src={imageArray[current]}
              alt={`Slide ${current}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.button
        onClick={handlePrev}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.9)" }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow-md z-10"
      >
        <MdArrowBack size={24} />
      </motion.button>
      <motion.button
        onClick={handleNext}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.9)" }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow-md z-10"
      >
        <MdArrowForward size={24} />
      </motion.button>

      <div className="flex justify-center mt-2 space-x-2">
        {imageArray.map((_, i) => (
          <motion.div
          
            key={i}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              i === current ? "bg-blue-400" : "bg-gray-400"
            }`}
            onClick={() => setCurrent(i)}
            whileHover={{ scale: 1.5 }}
            layout
            transition={{ type: "spring", stiffness: 300 }}
          />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = ((centerY - y) / centerY) * 10;
    
    setMousePosition({ x: rotateX, y: rotateY });
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };
  const navigate = useNavigate();
    const handleNavigate = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      className="border rounded-xl p-4 shadow-lg bg-black/30 backdrop-blur-md relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: isHovered ? mousePosition.x : 0,
        rotateY: isHovered ? mousePosition.y : 0,
        scale: isHovered ? 1.05 : 1
      }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ zIndex: 10 }}
      style={{
        transformStyle: "preserve-3d",
        transform: isHovered ? 
          `perspective(1000px) rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg)` : 
          "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      }}
    >
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 10 + 50}% ${mousePosition.y * 10 + 50}%, #00ccff, transparent)`,
            filter: "blur(20px)"
          }}
        />
      )}
      
      <h2 className="text-xl font-semibold mb-1 text-white">{product.productname}</h2>
      <p className="text-lg text-cyan-300 font-medium mb-2">
        ₹ {product.price}
      </p>
      {product.images ? (
        <ImageSlider images={product.images}      />
      ) : (
        <p className="text-gray-300">No images available</p>
      )}
      
      <div className="mt-3 flex flex-wrap gap-2">
        {['Premium', 'New', 'Limited'].map((tag, i) => (
          <motion.span
            key={i}
            className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + i * 0.1 }}
          >
            {tag}
       <button onClick={handleNavigate}>View More</button>

          </motion.span>
        ))}
      </div>
      
      <div className="mt-4">
        <motion.button
          className="flex items-center justify-between w-full text-left text-white/80 hover:text-white"
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-medium">Description</span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {expanded ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </motion.div>
        </motion.button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: { 
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2, delay: 0.1 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: { 
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2 }
                }
              }}
              className="overflow-hidden"
            >
              <p className="mt-2 text-white/90 text-sm bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                {product.description || "No description available"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Product = () => {
  const [display, setDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getting = async () => {
    try {
      const response = await fetch("/api/product");
      const data = await response.json();
      setDisplay(data.message || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getting();
  }, []);

  const filteredProducts = display.filter(product => 
    product.productname.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen p-4 overflow-hidden">
      <DynamicBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-8 text-center text-white mt-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
           Product Showcase
        </motion.h1>
        
        <motion.div
          className="mb-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-black/30 backdrop-blur-lg text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"/>
            </svg>
          </div>
        </motion.div>

        {filteredProducts.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-2xl text-white mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              No products found
            </motion.div>
            <p className="text-white/70">Try adjusting your search or create new products</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >
            {filteredProducts.map((product, index) => (
              <ProductCard key={index} product={product} index={index} />
            ))}
          </div>
        )}
        
        <motion.div 
          className="mt-12 text-center text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {new Date().getFullYear()} Crystal Product Showcase
        </motion.div>
      </div>
    </div>
  );
};

export default Product;