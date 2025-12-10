import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [zoomedItem, setZoomedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    opacity: Math.random() * 0.7 + 0.3,
    duration: Math.random() * 10 + 5
  }));

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("https://api-roma.onrender.com/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        navigate("/Login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const res = await fetch("https://api-roma.onrender.com/api/cart", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart items", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchCartItems();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await fetch(`https://api-roma.onrender.com/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchCartItems();
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const updateQuantity = async (productId, amount) => {
    try {
      const item = cartItems.find(i => i.productId._id === productId);
      const newQuantity = item.quantity + amount;
      if (newQuantity < 1) return;

      await fetch(`https://api-roma.onrender.com/api/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      fetchCartItems();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);
  };

  const togglePaymentOptions = () => {
    setShowPaymentOptions(true);
  };

  const handlePayment = () => {
    const total = calculateTotal();
    navigate("/payment", { state: { amount: total } });
  };

  const handleSinglePayment = (item) => {
    const amount = item.productId.price * item.quantity;
    navigate("/payment", {
      state: {
        amount,
        singleItem: {
          productId: item.productId._id,
          quantity: item.quantity,
        },
      },
    });
  };

  const zoomItem = (item) => {
    setZoomedItem(item);
  };

  const closeZoom = () => {
    setZoomedItem(null);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        {stars.map(star => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 0.3, star.opacity],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen opacity-30 blur-3xl"></div>
      </div>

      {user && (
        <motion.div 
          className="flex items-center gap-6 mb-10 bg-gray-900/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-cyan-500/30 relative z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <img
              src={user.profileImage || "/default-profile.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-cyan-400 object-cover shadow-lg"
            />
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-black font-bold">★</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-cyan-300">{user.fullName}</h2>
            <p className="text-gray-300 text-sm">Username: <span className="text-white">{user.username}</span></p>
            <p className="text-gray-300 text-sm">Email: <span className="text-white">{user.email}</span></p>
            {user.phone && <p className="text-gray-300 text-sm">Phone: <span className="text-white">{user.phone}</span></p>}
            {user.address && <p className="text-gray-300 text-sm">Address: <span className="text-white">{user.address}</span></p>}
            {user.createdAt && (
              <p className="text-gray-500 text-xs mt-1">
                Joined on: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <motion.h1 
        className="text-4xl md:text-5xl font-bold mb-8 text-center relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-cyan-300">COSMIC</span> CART
        <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-2 rounded-full"></div>
      </motion.h1>

      {cartItems.length === 0 ? (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-block p-6 bg-gray-900/70 backdrop-blur-md rounded-full mb-6">
            <div className="text-6xl">🛸</div>
          </div>
          <p className="text-gray-400 text-xl">Your cart is traveling through space...</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-xl text-lg shadow-xl transition-transform"
            onClick={() => navigate("/")}
          >
            Explore Products
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-8 relative z-10">
          {cartItems.map((item, index) => (
            <motion.div
              key={item._id}
              id={`item-${item._id}`}
              className="bg-gray-800/70 backdrop-blur-md p-5 rounded-xl shadow-xl border border-gray-700 relative overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)"
              }}
              onMouseEnter={() => setHoveredItem(item._id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {hoveredItem === item._id && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 pointer-events-none"></div>
              )}
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <motion.div 
                  className="relative cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => zoomItem(item)}
                >
                  <div className="w-40 h-40 bg-gray-900 rounded-xl overflow-hidden shadow-2xl transform-style-3d perspective-1000">
                    <img
                      src={item.productId?.images?.front}
                      alt={item.productId?.productname}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded">
                    3D VIEW
                  </div>
                </motion.div>
                
                <div className="flex-grow">
                  <h2 className="text-xl md:text-2xl font-bold mb-1">{item.productId?.productname}</h2>
                  <p className="text-cyan-300 mb-2 text-lg font-medium">₹ {item.productId?.price}</p>
                  <p className="text-gray-400 text-sm mb-4 max-w-md">{item.productId?.description}</p>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center"
                        onClick={() => updateQuantity(item.productId._id, -1)}
                      >
                        <span className="text-white">-</span>
                      </motion.button>
                      
                      <motion.span 
                        id={`quantity-${item._id}`}
                        className="text-lg w-8 text-center"
                      >
                        {item.quantity}
                      </motion.span>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#22c55e" }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
                        onClick={() => updateQuantity(item.productId._id, 1)}
                      >
                        <span className="text-white">+</span>
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm shadow"
                      onClick={() => handleSinglePayment(item)}
                    >
                      Buy This Item
                    </motion.button>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.2, color: "#ef4444" }}
                  whileTap={{ scale: 0.8 }}
                  className="text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => handleRemove(item.productId._id)}
                  title="Remove"
                >
                  ✖
                </motion.button>
              </div>
            </motion.div>
          ))}

          <motion.div 
            className="text-center mt-12 p-6 bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl border border-cyan-500/30"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-2xl text-gray-300 font-medium">Total:</div>
              <div className="text-3xl text-white font-bold bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-xl">
                ₹{calculateTotal()}
              </div>
            </div>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(14, 165, 233, 0.7)"
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold px-8 py-4 rounded-xl text-lg shadow-xl relative overflow-hidden"
              onClick={togglePaymentOptions}
            >
              <span className="relative z-10">CHECKOUT ALL ITEMS</span>
              <div className="absolute inset-0 flex justify-around items-end pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/40 animate-float"
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "3s",
                    }}
                  />
                ))}
              </div>
            </motion.button>

            <AnimatePresence>
              {showPaymentOptions && (
                <motion.div
                  className="mt-8 p-6 bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-cyan-500/30"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-cyan-400 mb-4">SELECT PAYMENT METHOD</h2>
                  <div className="flex flex-wrap justify-center gap-4">
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-black px-6 py-3 rounded-xl font-bold shadow-md flex items-center gap-2"
                      onClick={handlePayment}
                    >
                      <span>UPI / RAZORPAY</span>
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">$</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-xl font-bold shadow-md flex items-center gap-2"
                      onClick={handlePayment}
                    >
                      <span>CASH ON DELIVERY</span>
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-yellow-500 font-bold">₹</span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {zoomedItem && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeZoom}
          >
            <motion.div 
              className="relative max-w-4xl w-full max-h-[90vh]"
              initial={{ scale: 0.7, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.5, rotateY: -90 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-white text-3xl z-10 hover:text-cyan-400"
                onClick={closeZoom}
              >
                ✖
              </button>
              
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl overflow-hidden border border-cyan-500/30 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                  <div className="flex items-center justify-center">
                    <div className="w-full h-64 md:h-96 bg-gray-800 rounded-xl overflow-hidden transform-style-3d perspective-1000">
                      <img
                        src={zoomedItem.productId?.images?.front}
                        alt={zoomedItem.productId?.productname}
                        className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-cyan-300">{zoomedItem.productId?.productname}</h2>
                    <div className="text-2xl font-bold mb-6">₹ {zoomedItem.productId?.price}</div>
                    <p className="text-gray-300 mb-6">{zoomedItem.productId?.description}</p>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                        <button
                          className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center"
                          onClick={() => updateQuantity(zoomedItem.productId._id, -1)}
                        >
                          <span className="text-white">-</span>
                        </button>
                        
                        <span className="text-lg w-8 text-center">
                          {zoomedItem.quantity}
                        </span>
                        
                        <button
                          className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
                          onClick={() => updateQuantity(zoomedItem.productId._id, 1)}
                        >
                          <span className="text-white">+</span>
                        </button>
                      </div>
                      
                      <div className="text-lg">
                        Total: ₹{zoomedItem.productId?.price * zoomedItem.quantity}
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg text-white font-medium flex-1"
                        onClick={() => handleSinglePayment(zoomedItem)}
                      >
                        Buy Now
                      </button>
                      
                      <button
                        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-medium"
                        onClick={() => handleRemove(zoomedItem.productId._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute top-20 right-20 w-8 h-8 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50"
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
        className="absolute bottom-40 left-1/4 w-6 h-6 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"
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
    </div>
  );
};

export default CartPage;