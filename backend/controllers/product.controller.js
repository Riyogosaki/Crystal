import { productmodel } from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
export const creating = async (req, res) => {
  const { productname, frontImage, leftImage, rightImage ,price,description} = req.body;

  if (!productname || !frontImage || !leftImage || !rightImage ||!price ||!description  ) {
    return res.status(400).json({ error: "All fields are required (name + 3 images)" });
  }

  try {
    const frontUpload = await cloudinary.uploader.upload(frontImage, {
      folder: "product",
    });
    const leftUpload = await cloudinary.uploader.upload(leftImage, {
      folder: "product",
    });
    const rightUpload = await cloudinary.uploader.upload(rightImage, {
      folder: "product",
    });

    const newProduct = new productmodel({
      productname,
      price,
      images: {
        front: frontUpload.secure_url,
        left: leftUpload.secure_url,
        right: rightUpload.secure_url,
      },
      description
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, message: savedProduct });
  } catch (error) {
    console.error("Error in Creating an Object", error);
    res.status(500).json({ error: "Error in Creating A Product" });
  }
};


export const getting = async (req, res) => {
  try {
    const products = await productmodel.find({});
    res.status(200).json({ success: true, message: products });
  } catch (error) {
    console.error("Not Able to Get Data", error);
    res.status(500).json({ error: "Not Able to Get Products" });
  }
};

export const deleting = async (req,res)=>{

      const{id} =req.params
    try {
        const product = await productmodel.findByIdAndDelete(id);
        res.status(200).json({success:true,message:product});
        
    } catch (error) {
        console.error("Problem in Deleting Data",error.message);
        res.status(500).json({error:"Product Cannot Be Deleted"});
    }
}

export const gettingimage = async (req,res)=>{
  try {
    const product = await productmodel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: product });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};