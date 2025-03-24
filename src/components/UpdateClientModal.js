import React, {useState} from 'react';
import { X } from 'lucide-react';
import {db} from '@/lib/db';
import Modal from './Modal';

const UpdateClientModal = ({ client, onClose, onUpdate }) => {
    // Default next follow-up date is 5 days from today.
    const getDefaultNextDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 5);
      return date.toISOString().split("T")[0];
    };
  
    const [followUpDetails, setFollowUpDetails] = useState({
      type: "email",
      notes: "",
      nextFollowUpDate: getDefaultNextDate(),
    });
  
    const [giftDetails, setGiftDetails] = useState({
      status: client.giftStatus?.status === "In Progress"
      ? "Not Started"
      : (client.giftStatus?.status || "Not Started"), 
      details: "",
      notes: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      
      try {
        // Call the database function to update client with all details
        await db.updateClientWithDetails(client.id, {
          followUp: followUpDetails,
          gift: giftDetails,
        });
        
        // Get updated client data including histories
        const updatedClient = await db.getClientDetails(client.id);
        
        // Call the onUpdate function from parent component
        onUpdate(client.id, updatedClient);
        
        // Close modal
        onClose();
      } catch (err) {
        console.error('Error updating client:', err);
        setError('Failed to update client. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Modal onClose={onClose} className="w-[800px] md:w-[700px] sm:w-[90%]">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Update Client Status
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Follow-up Section */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Follow-up Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                  Type of Follow-up
                </label>
                <select
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                  value={followUpDetails.type}
                  onChange={(e) =>
                    setFollowUpDetails((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  disabled={loading}
                >
                  <option value="email">Email</option>
                  <option value="call">Phone Call</option>
                </select>
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                  Follow-up Notes
                </label>
                <textarea
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                  value={followUpDetails.notes}
                  onChange={(e) =>
                    setFollowUpDetails((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="What was discussed?"
                  rows={2}
                  disabled={loading}
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                  value={followUpDetails.nextFollowUpDate}
                  onChange={(e) =>
                    setFollowUpDetails((prev) => ({
                      ...prev,
                      nextFollowUpDate: e.target.value,
                    }))
                  }
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                Note: A follow-up entry will only be recorded if you enter notes.
              </p>
            </div>
          </div>
    
          {/* Gift Section */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Gift Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                  Gift Status
                </label>
                <select
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                  value={giftDetails.status}
                  onChange={(e) =>
                    setGiftDetails((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  disabled={loading}
                >       
                  <option value="Not Started">Not Started</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>
    
              {giftDetails.status === "Sent" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                      Gift Details
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                      value={giftDetails.details}
                      onChange={(e) =>
                        setGiftDetails((prev) => ({
                          ...prev,
                          details: e.target.value,
                        }))
                      }
                      placeholder="What gift was sent?"
                      disabled={loading}
                      required={giftDetails.status === "Sent"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                      Gift Notes
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                      value={giftDetails.notes}
                      onChange={(e) =>
                        setGiftDetails((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Any additional notes..."
                      rows={2}
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-300 italic mt-2">
              Gift history will only be updated when a gift is marked as sent.
            </p>
          </div>
    
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Client'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };

export default UpdateClientModal;