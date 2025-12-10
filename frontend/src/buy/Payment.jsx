import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Payment = () => {
  const location = useLocation();
  const { amount = 0, singleItem = null } = location.state || {};
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("payment");
  const containerRef = useRef(null);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 10 + 5
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().then((loaded) => {
      if (loaded) setRazorpayLoaded(true);
      else alert("❌ Razorpay failed to load. Try refreshing.");
    });

    if (!singleItem) {
      fetch("/api/cart", {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setCartItems(data.items || []))
        .catch((err) => console.error("❌ Failed to fetch cart items:", err));
    }

    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const res = await fetch("https://api-roma.onrender.com/api/order/history", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setOrderHistory(data.orders);
    } catch (err) {
      console.error("❌ Failed to fetch order history", err);
    }
  };

  const confirmCODOrder = async () => {
    try {
      const res = await fetch("https://api-roma.onrender.com/api/order/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount,
          items: singleItem
            ? [singleItem]
            : cartItems.map((item) => ({
                productId: item.productId._id,
                quantity: item.quantity,
              })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        fetchOrderHistory();
      } else {
        alert("❌ COD order failed");
      }
    } catch (error) {
      console.error("❌ COD order error:", error);
      alert("COD failed");
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) return alert("Razorpay not loaded");
    if (!amount || amount <= 0) return alert("Invalid amount");

    try {
      const res = await fetch("https://api-roma.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      const { order } = await res.json();
      if (!order || !order.id) throw new Error("Failed to create Razorpay order");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_yourKeyHere",
        amount: order.amount,
        currency: "INR",
        name: "Crystal Store",
        description: "Secure Payment",
        image: "/logo.png",
        order_id: order.id,
        handler: async function (response) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

          const confirmRes = await fetch("https://api-roma.onrender.com/api/order/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              signature: razorpay_signature,
              amount,
              items: singleItem
                ? [singleItem]
                : cartItems.map((item) => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                  })),
            }),
          });

          const confirmData = await confirmRes.json();
          if (confirmData.success) {
            setPaymentSuccess(true);
            fetchOrderHistory();
          } else {
            alert("⚠️ Payment went through, but order save failed.");
          }
        },
        prefill: {
          name: "Ankush Baby",
          email: "ankush@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#06b6d4",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay payment error:", err);
      alert("Payment failed! Switching to COD.");
      confirmCODOrder();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white px-4 py-8 relative overflow-hidden"
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
        
        {/* Nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen opacity-30 blur-3xl"></div>
      </div>

      {/* Floating cosmic elements */}
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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-zinc-800/70 backdrop-blur-md rounded-xl p-1 flex border border-zinc-700">
            <motion.button
              className={`px-6 py-3 rounded-xl font-medium ${
                activeTab === "payment" 
                  ? "text-black bg-gradient-to-r from-cyan-500 to-blue-500" 
                  : "text-gray-300"
              }`}
              onClick={() => setActiveTab("payment")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Payment
            </motion.button>
            <motion.button
              className={`px-6 py-3 rounded-xl font-medium ${
                activeTab === "history" 
                  ? "text-black bg-gradient-to-r from-cyan-500 to-blue-500" 
                  : "text-gray-300"
              }`}
              onClick={() => setActiveTab("history")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Order History
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-zinc-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-zinc-700 mb-12"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.h1 
                  className="text-3xl font-bold text-cyan-400 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Secure Cosmic Payment
                </motion.h1>
                
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-lg text-gray-300">
                    You're paying:
                  </p>
                  <motion.p 
                    className="text-4xl font-bold mt-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      textShadow: ["0 0 0px #fff", "0 0 20px #06b6d4", "0 0 0px #fff"]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ₹{amount}
                  </motion.p>
                </motion.div>

                <AnimatePresence>
                  {paymentSuccess && (
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl mb-6 shadow-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xl font-semibold">Payment Successful! Your order has been placed.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    onClick={handlePayment}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold py-4 px-8 rounded-xl text-lg shadow-xl relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 30px rgba(14, 165, 233, 0.7)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Pay Now 💳</span>
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
                  
                  <motion.button
                    onClick={confirmCODOrder}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-4 px-8 rounded-xl text-lg shadow-xl"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(234, 179, 8, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cash on Delivery
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-cyan-300 mb-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Your Cosmic Order History
              </motion.h2>
              
              {orderHistory.length === 0 ? (
                <motion.div 
                  className="text-center py-10 bg-zinc-800/70 backdrop-blur-md rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="inline-block p-6 bg-zinc-900/70 backdrop-blur-md rounded-full mb-6">
                    <div className="text-6xl">📦</div>
                  </div>
                  <p className="text-gray-400 text-xl">No orders in your cosmic history yet.</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {orderHistory.map((order, i) => (
                      <motion.div
                        key={i}
                        className="bg-zinc-800/70 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-zinc-700"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">
                              Date: {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className="text-gray-300 mt-1">
                              Payment: {order.paymentInfo.method || "COD"} —{" "}
                              <span className="text-yellow-300">
                                {order.paymentInfo.status || "Pending"}
                              </span>
                            </p>
                          </div>
                          <motion.div
                            className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-xl"
                            whileHover={{ scale: 1.05 }}
                          >
                            ₹{order.amount}
                          </motion.div>
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Items:</h3>
                          <ul className="space-y-2">
                            {order.items.map((item, idx) => (
                              <motion.li 
                                key={idx}
                                className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                              >
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                                <div>
                                  <p className="font-medium">{item.productId?.productname || "Unknown Product"}</p>
                                  <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Payment;