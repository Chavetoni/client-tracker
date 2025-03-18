// src/components/ClientAssignmentModal.js
import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ClientAssignmentModal = ({ client, onClose, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(
    client.assignedTo && Array.isArray(client.assignedTo) && 
    !(client.assignedTo.length === 1 && client.assignedTo[0] === 'Unassigned')
      ? client.assignedTo 
      : []
  );
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would fetch users from Supabase
        // For now, we'll use mock data
        const mockUsers = [
          { id: '1', email: 'user1@example.com', name: 'User One' },
          { id: '2', email: 'user2@example.com', name: 'User Two' },
          { id: '3', email: 'user3@example.com', name: 'User Three' },
        ];
        
        // Add the current user if they're not in the mock list
        if (currentUser && !mockUsers.find(u => u.id === currentUser.id)) {
          mockUsers.push({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.email.split('@')[0]
          });
        }
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => typeof u === 'object' ? u.id === userId : u === userId);
      
      if (isSelected) {
        return prev.filter(u => typeof u === 'object' ? u.id !== userId : u !== userId);
      } else {
        const user = users.find(u => u.id === userId);
        return [...prev, user];
      }
    });
  };

  const handleSelfAssign = () => {
    if (!currentUser) return;
    
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return;
    
    // If already assigned, do nothing
    if (selectedUsers.some(u => typeof u === 'object' ? u.id === user.id : u === user.id)) {
      return;
    }
    
    setSelectedUsers(prev => [...prev, user]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Transform the data for the parent component
      onUpdate(client.id, {
        assignedTo: selectedUsers.length > 0 ? selectedUsers : ['Unassigned']
      });
      onClose();
    } catch (error) {
      console.error('Error updating assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 relative max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 z-10"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Assign Client: {client.name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select team members to assign to this client
        </p>
        
        {currentUser && (
          <button
            type="button"
            onClick={handleSelfAssign}
            className="mb-4 w-full flex items-center justify-center px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800"
          >
            <UserPlus size={18} className="mr-2" />
            Assign to Myself
          </button>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
            ) : (
              users.map(user => (
                <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-orange-500 dark:text-orange-600 mr-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    checked={selectedUsers.some(u => typeof u === 'object' ? u.id === user.id : u === user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.name || user.email.split('@')[0]}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientAssignmentModal;