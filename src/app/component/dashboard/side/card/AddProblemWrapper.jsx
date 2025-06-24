import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AddProblem from './AddProblem';

const AddProblemWrapper = ({ teeth }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={handleOpenDialog}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 
          hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
      >
        <Plus className="w-4 h-4" />
        Add Problem
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Problem</h3>
              <button 
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <AddProblem teeth={teeth} onClose={handleCloseDialog} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProblemWrapper;