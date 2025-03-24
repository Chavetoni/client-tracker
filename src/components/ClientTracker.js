"use client";

import React, { useState, useEffect, useMemo, useCallback, use } from 'react';
import { Users, Clock, Plus, Gift, X, AlertCircle, Search, LogOut, User, ChevronLeft,ChevronRight, Moon, Sun} from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {db} from '@/lib/db';
import ClientAssignmentModal from '@/components/ClientAssignmentModal';
import UpdateClientModal from '@/components/UpdateClientModal'
import { ClipboardEdit, History, UserPlus, Trash2 } from 'lucide-react';

/**
 * A reusable Modal component that handles the overlay and container styling.
 */
const Modal = ({ children, onClose, className = "" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto py-8">
    <div className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-6 relative max-h-[90vh] overflow-y-auto ${className}`}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 z-10"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

/**
 * ClientHistoryModal displays a client's follow-up and gift history
 * with a simple tabbed interface.
 */
const ClientHistoryModal = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState("follow-ups");

  return (
    <Modal onClose={onClose} className="w-[800px] max-h-[80vh]">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {client.name} - Interaction History
      </h2>
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`pb-2 px-4 ${
            activeTab === "follow-ups"
              ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("follow-ups")}
        >
          Follow-ups
        </button>
        <button
          className={`pb-2 px-4 ${
            activeTab === "gifts"
              ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("gifts")}
        >
          Gifts
        </button>
      </div>
  
      {/* Content Area */}
      <div className="overflow-y-auto max-h-[60vh]">
        {activeTab === "follow-ups" ? (
          <div className="space-y-4">
            {[...(client.followUpHistory || [])]
              .reverse()
              .map((interaction, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(interaction.date).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        interaction.type === "email"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {interaction.type}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{interaction.notes}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...(client.giftStatus?.giftHistory || [])]
              .reverse()
              .map((gift, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(gift.date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      Gift Sent
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{gift.gift}</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{gift.notes}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

/**
 * UpdateClientModal allows updating a client's follow-up and gift status.
 */

/**
 * ClientTracker is the main landing page component for the CRM.
 */
const ClientTracker = ({user}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
 
//fetch clients
 useEffect(() => {
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch clients');
      const data = await db.getClients();
      console.log('Clients fetched successfully:', data);
      
      // Update client statuses
      const updatedClients = data.map(client => ({
        ...client,
        status: calculateClientStatus(client)
      }));
      
      setClients(updatedClients);
    } catch (err) {
      console.error('Error in fetchClients:', err);
      setError(err.message || 'Failed to fetch Clients');
    } finally {
      setLoading(false);
    }
  };
  
  fetchClients();
  
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

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode')
    setDarkMode(isDarkMode);

    if (isDarkMode){
      document.documentElement.classList.add('dark');
    }else{
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      
      // Save preference to localStorage
      localStorage.setItem('darkMode', newMode.toString());
      
      // Apply or remove the dark class on the document
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newMode;
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "" });
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const ONE_DAY_MS = 1000 * 60 * 60 * 24;
  const[sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  /**
   * Calculates the client status based on last update and next contact dates.
   * Note: The division is applied before rounding.
   */
  const calculateClientStatus = useCallback(
    (client) => {
      const today = new Date();
      const lastUpdate = new Date(client.lastUpdate);
      const nextContact = new Date(client.nextContact);

      const daysSinceUpdate = Math.ceil((today - lastUpdate) / ONE_DAY_MS);
      const daysUntilContact = Math.ceil((nextContact - today) / ONE_DAY_MS);

      if (client.status === "New Client" && daysSinceUpdate < 1) {
        return "New Client";
      }
      if (daysUntilContact <= 0) {
        return "Need Update";
      }
      if (daysUntilContact <= 2) {
        return "Follow-up Soon";
      }
      if (daysSinceUpdate <= 2) {
        return "Updated Recently";
      }
      return "Active";
    },
    [ONE_DAY_MS]
  );

  // Periodically update client statuses (every 24 hours)
  useEffect(() => {
    const updateStatuses = () => {
      setClients((prevClients) =>
        prevClients.map((client) => ({
          ...client,
          status: calculateClientStatus(client),
        }))
      );
    };

    updateStatuses();
    const interval = setInterval(updateStatuses, ONE_DAY_MS);
    return () => clearInterval(interval);
  }, [calculateClientStatus, ONE_DAY_MS]);

  const calculateNextContact = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 5);
    return date.toISOString().split("T")[0].replace(/-/g, "/");
  };

  const handleAddClient = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const newClientData = {
      name: newClient.name,
      email: newClient.email,
      nextContact: calculateNextContact(new Date().toISOString()),
      nextGift: calculateNextContact(new Date().toISOString())
    };
    
    const addedClient = await db.addClient(newClientData);
    
    // Assign to current user if in "my-clients" view
    if (viewMode === "my-clients" && currentUser) {
      await db.assignClientToUser(addedClient.id, currentUser.id);
      
      // Update assignedTo property
      addedClient.assignedTo = [{
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.email.split('@')[0]
      }];
    }
    
    setClients(prev => [...prev, {
      ...addedClient,
      status: calculateClientStatus(addedClient)
    }]);
    
    setIsAddClientOpen(false);
    setNewClient({ name: "", email: "" });
  } catch (err) {
    console.error('Error adding client:', err);
    setError(err.message || 'Failed to add client');
  } finally {
    setLoading(false);
  }
};


const handleDeleteClient = async (clientId) => {
  try {
    setLoading(true);
    const result = await db.deleteClient(clientId);
    
    if (result.success) {
      // Remove client from local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      setClientToDelete(null);
      
      // Show success message
      console.log('Client deleted successfully');
    } else {
      // Show error to user
      setError(`Failed to delete client: ${result.error?.message || 'Unknown error'}`);
      console.error('Detailed deletion error:', result.error);
    }
  } catch (err) {
    console.error('Exception in handleDeleteClient:', err);
    setError('An unexpected error occurred while deleting the client');
  } finally {
    setLoading(false);
  }
};
  const handleUpdateAssignments = async (clientId, updateData) => {
    try {
           // Update the local client data
      const updatedClients = clients.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            assignedTo: updateData.assignedTo
          };
        }
        return client;
      });
      
      setClients(updatedClients);
    } catch (err) {
      console.error('Error updating assignments:', err);
      setError(err.message || 'Failed to update assignments');
    }
  };

  const handleUpdateClient = async (clientId, updatedClientData) => {
    try {
      setLoading(true);
      
      // If we're getting a fully updated client object from getClientDetails
      if (typeof updatedClientData === 'object' && updatedClientData.id) {
        const clientWithStatus = {
          ...updatedClientData,
          status: calculateClientStatus(updatedClientData)
        };
        
        // Update the client in our local state
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === clientId ? clientWithStatus : client
          )
        );
        
        setLoading(false);
        return;
      }
      
      // Legacy support for the old update approach
      const today = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "/");
    
      // Build updates for client record
      const clientUpdates = {
        last_update: today.replace(/\//g, '-')
      };
      
      // Update next contact date if provided in followUp
      if (updatedClientData.followUp && updatedClientData.followUp.nextFollowUpDate) {
        clientUpdates.next_contact = updatedClientData.followUp.nextFollowUpDate;
      }
      
      // Update client in database
      await db.updateClient(clientId, clientUpdates);
      
      // If followUp notes provided, add to history
      if (updatedClientData.followUp && updatedClientData.followUp.notes.trim() !== '') {
        await db.addFollowUpHistory(
          clientId,
          updatedClientData.followUp.type,
          updatedClientData.followUp.notes
        );
      }
      
      // Handle gift status updates
      if (updatedClientData.gift && updatedClientData.gift.status === 'Sent') {
        // Add gift history
        await db.addGiftHistory(
          clientId,
          'Sent',
          updatedClientData.gift.details,
          updatedClientData.gift.notes || ''
        );
        
        // Update next gift date (3 months later)
        const nextGiftDate = new Date();
        nextGiftDate.setMonth(nextGiftDate.getMonth() + 3);
        
        await db.updateClient(clientId, {
          next_gift: nextGiftDate.toISOString().split('T')[0]
        });
      }
      
      // Get the updated client with all history
      const updatedClient = await db.getClientDetails(clientId);
      
      // Update our local state
      const updatedClients = clients.map((client) => {
        if (client.id === clientId) {
          return {
            ...updatedClient,
            status: calculateClientStatus(updatedClient)
          };
        }
        return client;
      });
    
      setClients(updatedClients);
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Need Update":
        return "bg-red-100 text-red-800";
      case "Follow-up Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Updated Recently":
        return "bg-green-100 text-green-800";
      case "New Client":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isDateSoon = (dateStr) => {
    if (dateStr === "-") return false;
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / ONE_DAY_MS);
    return diffDays <= 2 && diffDays >= 0;
  };

  const isDatePast = (dateStr) => {
    if (dateStr === "-") return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date < today;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
   } catch (error) {
      console.error('Error signing out:', error.message);
      alert('Logout failed. Please try again.');
  }
  }

  const handleViewHistory = async (client) => {
    try {
      setLoading(true);
      
      // Fetch complete client details including history
      const clientDetails = await db.getClientDetails(client.id);
      
      // Update the client with fetched details
      setSelectedClient(clientDetails);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error('Error fetching client history:', err);
      setError(err.message || 'Failed to fetch client history');
    } finally {
      setLoading(false);
    }
  };
  

  const filteredClients = useMemo(() => {
    let filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (viewMode === "contacts") {
      filtered = filtered.filter((client) => {
        const today = new Date();
        const nextContact = new Date(client.nextContact);
        const daysUntilContact = Math.ceil((nextContact - today) / ONE_DAY_MS);
        return daysUntilContact <= 2 || client.status === "Need Update";
      });
    } else if (viewMode === "gifts") {
      filtered = filtered.filter((client) => {
        const today = new Date();
        const nextGift = new Date(client.nextGift);
        const daysUntilGift = Math.ceil((nextGift - today) / ONE_DAY_MS);
        return daysUntilGift <= 7;
      });
    } else if (viewMode === "my-clients" && currentUser) {
      filtered = filtered.filter((client) => {
        // Check if client is assigned to current user
        return Array.isArray(client.assignedTo) && 
          client.assignedTo.some(person => 
            (typeof person === 'object' && person.id === currentUser.id) ||
            (typeof person === 'string' && person === currentUser.id)
          );
      });
    }
    
    return filtered;
  }, [clients, searchTerm, viewMode, ONE_DAY_MS, currentUser]);


  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
       {/* Collapsible Sidebar */}
        <aside 
          className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out  ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className={`p-4 flex items-center ${sidebarCollapsed ? 'justify-center' : 'mb-8'}`}>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CT</span>
            </div>
            {!sidebarCollapsed && (
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                ClientTrack
              </span>
            )}
          </div>

          <nav className="flex-1 space-y-2 px-2 ">
            <button
              onClick={() => setViewMode("all")}
              className={`flex items-center w-full p-2 rounded-lg  ${
                viewMode === "all"
                  ? "bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400 "
                  : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-white"
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              title="All Clients"
            >
              <Users size={20} />
              {!sidebarCollapsed && <span>All Clients</span>}
            </button>
            <button
              onClick={() => setViewMode("contacts")}
              className={`flex items-center w-full p-2 rounded-lg ${
                viewMode === "contacts"
                  ? "bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400"
                  : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-white"
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              title="Follow-ups"
            >
              <Clock size={20} />
              {!sidebarCollapsed && <span>Follow-ups</span>}
            </button>
            <button
              onClick={() => setViewMode("gifts")}
              className={`flex items-center w-full p-2 rounded-lg ${
                viewMode === "gifts"
                  ? "bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400"
                  : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-white"
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              title="Gift Schedule"
            >
              <Gift size={20} />
              {!sidebarCollapsed && <span>Gift Schedule</span>}
            </button>
            <button
              onClick={() => setViewMode("my-clients")}
              className={`flex items-center w-full p-2 rounded-lg ${
                viewMode === "my-clients"
                  ? "bg-orange-50 text-orange-600 dark:bg-gray-700 dark:text-orange-400"
                  : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-white"
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              title="My Clients"
            >
              <User size={20} />
              {!sidebarCollapsed && <span>My Clients</span>}
            </button>
          </nav>

          {/* Toggle Button */}
          <div className={`p-2 flex ${sidebarCollapsed ? 'justify-center' : 'justify-end'} mb-2`}>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          <div className={`border-t border-gray-200 dark:border-gray-700 p-2 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={toggleDarkMode}
              className={`flex items-center p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                sidebarCollapsed ? 'justify-center w-10 h-10' : 'space-x-3 w-full'
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <>
                  <Sun size={20} />
                  {!sidebarCollapsed && <span>Light Mode</span>}
                </>
              ) : (
                <>
                  <Moon size={20} />
                  {!sidebarCollapsed && <span>Dark Mode</span>}
                </>
              )}
            </button>
          </div>

          <div className={`border-t border-gray-200 p-2 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center p-2 rounded-lg text-red-600 hover:bg-red-50 ${
                sidebarCollapsed ? 'justify-center w-10 h-10' : 'space-x-3 w-full'
              }`}
              title="Sign Out"
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>



      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewMode === "all"
              ? "All Clients"
              : viewMode === "contacts"
              ? "Follow-up Schedule"
              : viewMode === "gifts"
              ? "Gift Schedule"
              : "My Assigned Clients"}
          </h1>


          {/*Add Client button*/}
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg"
          >
            <Plus size={20} className="mr-2" />
            Add Client
          </button>
        </div>

        {/* Add Client Modal */}
        {isAddClientOpen && (
          <Modal onClose={() => setIsAddClientOpen(false)} className="w-full max-w-[500px]">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Add New Client
          </h2>
          <form onSubmit={handleAddClient}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Client Name
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddClientOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg"
              >
                Add Client
              </button>
            </div>
          </form>
        </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {clientToDelete && (
          <Modal onClose={() => setClientToDelete(null)} className="w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-200">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 mb-6 dark:text-gray-200">
              Are you sure you want to remove{" "}
              {clients.find((c) => c.id === clientToDelete)?.name}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100  rounded-lg dark:text-gray-200 hover:dark:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(clientToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 "
              >
                Delete Client
              </button>
            </div>
          </Modal>
        )}

        {/* Update Client Modal */}
        {isUpdateModalOpen && selectedClient && (
          <UpdateClientModal
            client={selectedClient}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedClient(null);
            }}
            onUpdate={handleUpdateClient}
          />
        )}

        {/* History Modal */}
        {isHistoryModalOpen && selectedClient && (
          <ClientHistoryModal
            client={selectedClient}
            onClose={() => {
              setIsHistoryModalOpen(false);
              setSelectedClient(null);
            }}
          />
        )}
        
        {/* Assignment Modal */}
        {isAssignmentModalOpen && selectedClient && (
          <ClientAssignmentModal
            client={selectedClient}
            onClose={() => {
              setIsAssignmentModalOpen(false);
              setSelectedClient(null);
            }}
            onUpdate={handleUpdateAssignments}
          />
        )}

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Information */}
        <div className="mb-4 text-gray-900">
          {viewMode === "contacts" && (
            <p>
              Showing clients that need to follow-up within the next 2 days or
              are past due.
            </p>
          )}
          {viewMode === "gifts" && (
            <p>
              Showing clients with a gift due within the next 7 days or past due.
            </p>
          )}
          {viewMode === "my-clients" && (
            <p>
              Showing clients assigned to you.
            </p>
          )}
          {filteredClients.length === 0 && (
            <p className="text-orange-600">
              No clients match the current filter criteria.
            </p>
          )}
        </div>

        {/* Client List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

        {/* Table header */}
        <div className="grid grid-cols-[repeat(7,1fr)_minmax(150px,1fr)] gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {['Client Name', 'Email', 'Status', 'Last Update', 'Next Follow-up', 'Next Gift Due', 'Assigned To', 'Actions'].map((header) => (
            <div key={header} className="font-medium text-gray-900 dark:text-gray-200">{header}</div>
          ))}
        </div>

          {/* Table rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-[repeat(7,1fr)_minmax(150px,1fr)] gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-750"
              >
                <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                <div className="text-gray-900 dark:text-gray-200">{client.email}</div>
                
                {/* Status badges - keep colors similar in dark mode for status indicators */}
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </div>
                <div className="text-gray-900 dark:text-gray-200">{client.lastUpdate}</div>
                <div
                  className={`${
                    isDatePast(client.nextContact)
                      ? "text-red-600 font-medium"
                      : isDateSoon(client.nextContact)
                      ? "text-yellow-600 font-medium"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {client.nextContact}
                  {isDatePast(client.nextContact) && <AlertCircle size={16} />}
                </div>
                <div
                  className={
                    isDateSoon(client.nextGift)
                      ? "text-purple-600 font-medium"
                      : "text-gray-700 dark:text-gray-200"
                  }
                >
                  {client.nextGift}
                </div>

                <div className="flex -space-x-2 overflow-hidden">
                  {Array.isArray(client.assignedTo) && 
                  (client.assignedTo[0] === 'Unassigned' ? (
                    <div
                      className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-900"
                      title="Unassigned"
                    >
                      U
                    </div>
                  ) : (
                    client.assignedTo.map((person, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-orange-300 border-2 border-white flex items-center justify-center text-white"
                        title={person.name || person.email || person}
                      >
                        {(person.name ? person.name[0] : person.email ? person.email[0] : person[0]).toUpperCase()}
                      </div>
                    ))
                  ))}
                </div>

                <div>

                <div className="flex flex-col space-y-1">
  <button
    onClick={() => {
      setSelectedClient(client);
      setIsUpdateModalOpen(true);
    }}
    className="flex items-center justify-start w-full px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-gray-700 text-xs dark:bg-gray-600 dark:text-white"
    title="Update Status"
  >
    <ClipboardEdit size={14} className="mr-1" />
    Update
  </button>
  
  <button
    onClick={() => {
      handleViewHistory(client);
    }}
    className="flex items-center justify-start w-full px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-xs dark:bg-gray-600 dark:text-blue-400"
    title="View History"
  >
    <History size={14} className="mr-1" />
    History
  </button>
  
  <button
    onClick={() => {
      setSelectedClient(client);
      setIsAssignmentModalOpen(true);
    }}
    className="flex items-center justify-start w-full px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded text-purple-600 text-xs dark:bg-gray-600 dark:text-purple-400"
    title="Assign Users"
  >
    <UserPlus size={14} className="mr-1" />
    Assign
  </button>
  
  <button
    onClick={() => setClientToDelete(client.id)}
    className="flex items-center justify-start w-full px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-red-600 text-xs dark:bg-gray-600 dark:text-red-400"
    title="Remove Client"
  >
    <Trash2 size={14} className="mr-1" />
    Remove
  </button>
</div>

                </div>
              </div>
            ))}
          </div>


        </div>
      </main>
    </div>
  );
};

export default ClientTracker;
