import Joi from "joi";
import mongoose from "mongoose";


  //Validate MongoDB ObjectId
 
const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid category id");
    }
    return value;
};

export const categoryCreateSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required(),

    description: Joi.string()
        .max(500)
        .optional()
});

export const categoryUpdateSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .optional(),

    description: Joi.string()
        .max(500)
        .optional()
});

export const categoryIdSchema = Joi.object({
    id: Joi.string().custom(objectId).required()
});

