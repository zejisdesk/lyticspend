import React, { useState } from 'react';
import IconDropdown from './IconDropdown';
import ConfirmationModal from './ConfirmationModal';

const CategoryManagementModal = ({ 
  isOpen, 
  onClose, 
  title,
  categories, 
  categoryType, 
  searchQuery, 
  setSearchQuery, 
  editingCategory, 
  setEditingCategory, 
  newCategoryName, 
  setNewCategoryName, 
  newCategoryIcon, 
  setNewCategoryIcon, 
  addCategory, 
  updateCategory, 
  removeCategory, 
  resetCategories 
}) => {
  // Confirmation modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Filter categories based on search query
  const filteredCategories = searchQuery.trim() === '' 
    ? categories 
    : categories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handle add category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    addCategory(categoryType, {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon
    });
    
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
    setEditingCategory(null);
  };

  // Handle update category
  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    setShowUpdateConfirmation(true);
  };
  
  // Confirm update category
  const confirmUpdateCategory = () => {
    updateCategory(categoryType, editingCategory.id, {
      ...editingCategory,
      name: newCategoryName.trim(),
      icon: newCategoryIcon
    });
    
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
    setEditingCategory(null);
    setShowUpdateConfirmation(false);
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
  };

  // Handle delete category
  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };
  
  // Confirm delete category
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    
    removeCategory(categoryType, categoryToDelete.id);
    
    if (editingCategory && editingCategory.id === categoryToDelete.id) {
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryIcon('fa-tag');
    }
    
    setCategoryToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Handle reset categories
  const handleResetCategories = () => {
    setShowResetConfirmation(true);
  };
  
  // Confirm reset categories
  const confirmResetCategories = () => {
    resetCategories(categoryType);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
    setShowResetConfirmation(false);
  };

  // Handle close modal
  const handleCloseModal = () => {
    onClose();
    setSearchQuery('');
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content category-modal">
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDeleteCategory}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete?.name || ''}"?`}
          actionType="delete"
        />
        
        {/* Reset Confirmation Modal */}
        <ConfirmationModal
          isOpen={showResetConfirmation}
          onClose={() => setShowResetConfirmation(false)}
          onConfirm={confirmResetCategories}
          title="Reset Categories"
          message="Are you sure you want to reset all categories to default? This action cannot be undone."
          actionType="reset"
        />
        
        {/* Update Confirmation Modal */}
        <ConfirmationModal
          isOpen={showUpdateConfirmation}
          onClose={() => setShowUpdateConfirmation(false)}
          onConfirm={confirmUpdateCategory}
          title="Update Category"
          message={`Are you sure you want to update the category "${editingCategory?.name || ''}"?`}
          actionType="update"
        />
        
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={handleCloseModal}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          
          {/* Category Search */}
          <div className="category-search-container">
            <div className="category-search-input-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="category-search-input"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-button"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button 
              className="small-reset-button" 
              onClick={handleResetCategories}
              title="Reset to default categories"
            >
              Reset
            </button>
          </div>

          {/* Categories List */}
          <div className="categories-list">
            {filteredCategories.map(category => (
              <div key={category.id} className="category-item">
                <div className="category-info">
                  <i className={`fas ${category.icon} category-icon`}></i>
                  <span className="category-name">{category.name}</span>
                </div>
                <div className="category-actions">
                  <button 
                    className="edit-category-button"
                    onClick={() => handleEditCategory(category)}
                    title="Edit category"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-category-button"
                    onClick={() => handleDeleteCategory(category)}
                    title="Delete category"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Category Form */}
          <div className="category-form">
            <h4>{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
            
            <div className="form-group">
              <label htmlFor="categoryName">Name</label>
              <input
                type="text"
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="categoryIcon">Icon</label>
              <IconDropdown
                id="categoryIcon"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                showFooter={false}
              />
            </div>
            
            <div className={`form-actions ${editingCategory ? 'editing' : ''}`}>
              <button 
                className="primary-button"
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              >
                {editingCategory ? 'Update' : 'Add'}
              </button>
              
              {editingCategory && (
                <button 
                  className="secondary-button"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                    setNewCategoryIcon('fa-tag');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementModal;
