import Order from "../models/order.model.js";

export const placeCODOrder = async (req, res) => {
  try {
    const { items, amount } = req.body;
    const user = req.user;

    if (!items || !amount) {
      return res.status(400).json({ success: false, message: "Missing order info" });
    }

    const order = new Order({
      user: user._id,
      items,
      amount,
      paymentInfo: {
        method: "COD",
        status: "Pending",
      },
    });

    await order.save();
    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("❌ COD Order Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("❌ Fetch Order History Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
