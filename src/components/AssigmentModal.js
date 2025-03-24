import React, {useState} from 'react';
import { X } from 'lucide-react';

const AssignmentModal = ({ client, onClose, onUpdate }) => {
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(
      client.assignedTo?.map(user => user.id) || []
    );
    const [loading, setLoading] = useState(false);
  
    // Fetch available users when modal opens
    useEffect(() => {
      const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (!error) {
          setAvailableUsers(data);
        }
      };
      fetchUsers();
    }, []);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        // Remove old assignments
        await Promise.all(
          client.assignedTo
            .filter(user => user?.id && !selectedUsers.includes(user.id))
            .map(user => db.unassignClient(client.id, user.id))
        );
  
        // Add new assignments
        await Promise.all(
          selectedUsers
            .filter(userId => !client.assignedTo.find(u => u.id === userId))
            .map(userId => db.assignClient(client.id, userId))
        );
  
        onUpdate();
        onClose();
      } catch (error) {
        console.error('Error updating assignments:', error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Modal onClose={onClose} className="w-[400px]">
        <h2 className="text-xl font-bold mb-4">Manage Assignments</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {availableUsers.map(user => (
              <label key={user.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    setSelectedUsers(prev => 
                      e.target.checked
                        ? [...prev, user.id]
                        : prev.filter(id => id !== user.id)
                    );
                  }}
                />
                <span>{user.email}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {loading ? 'Updating...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

export default AssignmentModal;