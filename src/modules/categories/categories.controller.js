import * as categoryService from "./categories.service.js";


 //Create Category

export const createCategory = async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
        success: true,
        data: category
    });
};


  //Get Category By ID
 
export const getCategoryById = async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: "Category not found"
        });
    }

    res.json({
        success: true,
        data: category
    });
};


  //Update Category
 
export const updateCategory = async (req, res) => {
    const category = await categoryService.updateCategory(
        req.params.id,
        req.body
    );

    if (!category) {
        return res.status(404).json({
            success: false,
            message: "Category not found"
        });
    }

    res.json({
        success: true,
        data: category
    });
};


  //Delete Category
 
export const deleteCategory = async (req, res) => {
    const category = await categoryService.deleteCategory(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: "Category not found"
        });
    }

    res.json({
        success: true,
        message: "Category deleted successfully"
    });
};


 // List Categories
 
export const listCategories = async (req, res) => {
    const categories = await categoryService.listCategories();

    res.json({
        success: true,
        data: categories
    });
};
