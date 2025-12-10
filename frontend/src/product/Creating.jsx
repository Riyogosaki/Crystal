import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Creating = () => {
  const [create, setCreate] = useState({
    productname: "",
    price: "",
    frontImage: null,
    leftImage: null,
    rightImage: null,
    description: "",
  });

  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState({});
  const [preview, setPreview] = useState({
    frontImage: null,
    leftImage: null,
    rightImage: null,
  });
  const [showImage, setShowImage] = useState("front");
  const [showHistory, setShowHistory] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/product");
    const data = await res.json();
    setProducts(data.message);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreate((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;
    const file = files[0];
    setCreate((prev) => ({ ...prev, [name]: file }));
    const url = URL.createObjectURL(file);
    setPreview((prev) => ({ ...prev, [name]: url }));
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { productname, price, frontImage, leftImage, rightImage, description } = create;
    if (!productname || !price || !frontImage || !leftImage || !rightImage || !description) {
      alert("Please fill all fields and upload all 3 images");
      return;
    }

    try {
      const frontBase64 = await convertToBase64(frontImage);
      const leftBase64 = await convertToBase64(leftImage);
      const rightBase64 = await convertToBase64(rightImage);

      const res = await fetch("https://api-roma.onrender.com/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productname,
          price,
          frontImage: frontBase64,
          leftImage: leftBase64,
          rightImage: rightBase64,
          description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Product created successfully!");
        setCreate({ productname: "", price: "", frontImage: null, leftImage: null, rightImage: null, description: "" });
        setPreview({ frontImage: null, leftImage: null, rightImage: null });
        setShowImage("front");
        fetchProducts();
      } else {
        alert("Failed to create product");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("Error uploading product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/product/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const handleNext = (productId, images) => {
    setCurrentSlide((prev) => {
      const currentIndex = prev[productId] || 0;
      return { ...prev, [productId]: (currentIndex + 1) % images.length };
    });
  };

  const handlePrev = (productId, images) => {
    setCurrentSlide((prev) => {
      const currentIndex = prev[productId] || 0;
      return { ...prev, [productId]: (currentIndex - 1 + images.length) % images.length };
    });
  };

  const getImageSrc = (imageString) => {
    if (!imageString) return "";
    return imageString.startsWith("data:image") ? imageString : `data:image/jpeg;base64,${imageString}`;
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-200 via-white to-blue-100 text-black">
      <div className="backdrop-blur-sm bg-white/60 p-6 rounded-xl shadow-xl max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">Product Management</h1>

        <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <input name="productname" value={create.productname} onChange={handleInputChange} placeholder="Product Name" className="w-full p-2 border rounded" />
          <input type="number" name="price" value={create.price} onChange={handleInputChange} placeholder="Price" className="w-full p-2 border rounded" />
          <input type="file" name="frontImage" onChange={handleImageChange} accept="image/*" />
          <input type="file" name="leftImage" onChange={handleImageChange} accept="image/*" />
          <input type="file" name="rightImage" onChange={handleImageChange} accept="image/*" />
          <textarea name="description" value={create.description} onChange={handleInputChange} placeholder="Product Description" className="w-full p-2 border rounded" />

          {(preview.frontImage || preview.leftImage || preview.rightImage) && (
            <>
              <div className="flex gap-2 mt-2">
                {['front', 'left', 'right', 'all'].map((dir) => (
                  <button key={dir} type="button" onClick={() => setShowImage(dir)} className={`px-3 py-1 border rounded ${showImage === dir ? 'bg-blue-600 text-white' : ''}`}>{dir}</button>
                ))}
              </div>

              <div className="flex gap-4 justify-center mt-4">
                {showImage === "front" || showImage === "all" ? preview.frontImage && <img src={preview.frontImage} alt="Front" className="w-28 h-28 object-cover rounded border" /> : null}
                {showImage === "left" || showImage === "all" ? preview.leftImage && <img src={preview.leftImage} alt="Left" className="w-28 h-28 object-cover rounded border" /> : null}
                {showImage === "right" || showImage === "all" ? preview.rightImage && <img src={preview.rightImage} alt="Right" className="w-28 h-28 object-cover rounded border" /> : null}
              </div>
            </>
          )}

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
        </form>

        <div className="text-center mt-10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            {showHistory ? "Hide History" : "Show All Data"}
          </button>
        </div>

        {showHistory && (
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => {
                const images = [
                  getImageSrc(product.frontImage),
                  getImageSrc(product.leftImage),
                  getImageSrc(product.rightImage),
                ];
                const current = currentSlide[product._id] || 0;

                return (
                  <motion.div
                    key={product._id}
                    className="border rounded-xl p-4 bg-white text-black shadow-lg relative"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold">{product.productname}</h3>
                    <p className="text-sm text-gray-700 mb-2">₹{product.price}</p>
                    <div className="relative w-full h-56 overflow-hidden rounded-lg">
                      <img src={images[current]} alt={`Slide ${current}`} className="w-full h-full object-cover rounded" />
                      <button onClick={() => handlePrev(product._id, images)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full">◀</button>
                      <button onClick={() => handleNext(product._id, images)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full">▶</button>
                    </div>
                    <div className="flex justify-center gap-2 mt-2">
                      {images.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full cursor-pointer ${i === current ? 'bg-blue-600' : 'bg-gray-400'}`}
                          onClick={() => setCurrentSlide((prev) => ({ ...prev, [product._id]: i }))}
                        />
                      ))}
                    </div>
                    <button onClick={() => handleDelete(product._id)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Creating;
