import {Schema ,  model} from "mongoose";

const categorySchema=new Schema({
    name:{
        type:String,
        required:[true, 'category name is required'],
        unique:[true, 'category name must be unique'],
        minlenth:[3, 'category name must be at least 3 characters'],
        maxlenth:[32, 'category name must be less than 32 characters']
    },
    slug:{
        type:String,
        lowercase:true
    },
    image:{
        type:String,
    }
    
   }, 
   {timestamps:true}
);

const CategoryModel=model("Category", categorySchema);

export default CategoryModel;