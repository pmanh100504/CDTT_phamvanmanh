<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Get Categories List (Shared by Admin & Storefront)
     */
    public function getCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    /**
     * Create or Update Category (Admin)
     */
    public function saveCategory(Request $request)
    {
        $data = $request->validate([
            'id' => 'nullable|string',
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100',
            'parentId' => 'nullable|string|exists:categories,id',
            'description' => 'nullable|string'
        ]);

        if (empty($data['id'])) {
            $data['id'] = (string) Str::uuid();
            $category = Category::create($data);
        } else {
            $category = Category::find($data['id']);
            if (!$category) {
                return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);
            }
            $category->update($data);
        }

        return response()->json($category);
    }

    /**
     * Delete Category (Admin)
     */
    public function deleteCategory($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Không tìm thấy danh mục.'], 404);
        }

        // Set parentId of children to null to prevent foreign key errors
        Category::where('parentId', $id)->update(['parentId' => null]);
        
        // Delete all products in this category to prevent NOT NULL constraint violations
        Product::where('categoryId', $id)->delete();

        $category->delete();

        return response()->json(['success' => true]);
    }
}
