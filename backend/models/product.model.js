import mongoose from "mongoose";

const productSchema = mongoose.Schema({

    productname: {
        type: String,
        required: true
    },
    price : {
    type:String,
    required:true
},
 images: {
    front: { type: String, required: true },
    left: { type: String, required: true },
    right: { type: String, required: true },
  },
 description:{
    type:String,
    required:true
 }

},
    
    { timestamps: true },
);


 export const productmodel = mongoose.model("Product",productSchema);
