"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Clock, Plus, Gift, X, AlertCircle, Search, LogOut, User } from 'lucide-react';
import {supabase} from '@/lib/supabase';
import {db} from '@/lib/db';

/**
 * A reusable Modal component that handles the overlay and container styling.
 */
const Modal = ({ children, onClose, className = "" }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
    <div className={`bg-white rounded-lg p-6 relative max-h-[90vh] overflow-y-auto ${className}`}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

/**
 * ClientHistoryModal displays a client’s follow-up and gift history
 * with a simple tabbed interface.
 */
const ClientHistoryModal = ({ client, onClose }) => {
  const [activeTab, setActiveTab] = useState("follow-ups");

  return (
    <Modal onClose={onClose} className="w-[800px] max-h-[80vh]">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        {client.name} - Interaction History
      </h2>
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-4 border-b">
        <button
          className={`pb-2 px-4 ${
            activeTab === "follow-ups"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("follow-ups")}
        >
          Follow-ups
        </button>
        <button
          className={`pb-2 px-4 ${
            activeTab === "gifts"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-600"
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
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium">
                      {new Date(interaction.date).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        interaction.type === "email"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {interaction.type}
                    </span>
                  </div>
                  <p className="text-gray-700">{interaction.notes}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...(client.giftStatus?.giftHistory || [])]
              .reverse()
              .map((gift, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium">
                      {new Date(gift.date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Gift Sent
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{gift.gift}</p>
                  <p className="text-gray-700 mt-1">{gift.notes}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

/**
 * UpdateClientModal allows updating a client’s follow-up and gift status.
 */
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
    status: client.giftStatus?.status || "Not Started",
    details: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(client.id, {
      followUp: followUpDetails,
      gift: giftDetails,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} className="w-[800px] md:w-[700px] sm:w-[90%]">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Update Client Status
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Follow-up Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Follow-up Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Type of Follow-up
              </label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                value={followUpDetails.type}
                onChange={(e) =>
                  setFollowUpDetails((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
              >
                <option value="email">Email</option>
                <option value="call">Phone Call</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Follow-up Notes
              </label>
              <textarea
                className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                value={followUpDetails.notes}
                onChange={(e) =>
                  setFollowUpDetails((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="What was discussed?"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                value={followUpDetails.nextFollowUpDate}
                onChange={(e) =>
                  setFollowUpDetails((prev) => ({
                    ...prev,
                    nextFollowUpDate: e.target.value,
                  }))
                }
              />
            </div>
            <p className="text-sm text-gray-500 italic">
            Note: A follow-up entry will only be recorded if you enter notes.
          </p>
          </div>
        </div>

        {/* Gift Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Gift Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Gift Status
              </label>
              <select
                className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                value={giftDetails.status}
                onChange={(e) =>
                  setGiftDetails((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Sent">Sent</option>
              </select>
            </div>

            {giftDetails.status === "Sent" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Gift Details
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={giftDetails.details}
                    onChange={(e) =>
                      setGiftDetails((prev) => ({
                        ...prev,
                        details: e.target.value,
                      }))
                    }
                    placeholder="What gift was sent?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Gift Notes
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                    value={giftDetails.notes}
                    onChange={(e) =>
                      setGiftDetails((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 italic mt-2">
          Note: Gift history will only be updated if you change the status or mark a gift as sent.
        </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Update Client
          </button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * ClientTracker is the main landing page component for the CRM.
 */
const ClientTracker = ({user}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Starting to fetch clients');
        const data = await db.getClients();
        console.log('Clients fetched succesfully:', data);
        setClients(data);
      } catch (err) {
        console.error('error in fetchclients:', err);
        setError(err.message || 'Failed to fetch Clients');
      }finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "" });
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const ONE_DAY_MS = 1000 * 60 * 60 * 24;

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
      setClients(prev => [...prev, addedClient]);
      setIsAddClientOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await db.deleteClient(clientId);
      setClients(prev => prev.filter(client => client.id !== clientId));
      setClientToDelete(null);
    } catch (err) {
      setError(err.message);
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
    }
    return filtered;
  }, [clients, searchTerm, viewMode, ONE_DAY_MS]);

  const handleUpdateClient = (clientId, updateData) => {
    const today = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/");

    const updatedClients = clients.map((client) => {
      if (client.id === clientId) {
        const updatedClient = {
          ...client,
          lastUpdate: today,
        };
          //update follow-up if user entered notes or intentionally changed something
          if (updateData.followUp.notes.trim() != '') {
            updatedClient.nextContact = updateData.followUp.nextFollowUpDate;
            updatedClient.followUpHistory = [
              ...(client.followUpHistory || []),
            {
              date: today,
              type: updateData.followUp.type,
              notes: updateData.followUp.notes,
            },
          ];
        }

        //only update gift status if its different from the current status
        if (updateData.gift.status !== client.giftStatus?.status || updateData.gift.status === "Sent") {
          if (updateData.gift.status === "Sent") {
            updatedClient.giftStatus = {
              status: updateData.gift.status,
              lastGiftSent: today,
              lastGiftDetails: updateData.gift.details,
              giftHistory: [
                ...(client.giftStatus?.giftHistory || []),
                {
                  date: today,
                  gift: updateData.gift.details,
                  notes: updateData.gift.notes,
                },
              ],
            };
          } else {
            updatedClient.giftStatus = {
              ...client.giftStatus,
              status: updateData.gift.status,
            };
          }
        }

        updatedClient.status = calculateClientStatus(updatedClient);
        return updatedClient;
      }
      return client;
    });

    setClients(updatedClients);
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">CT</span>
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900">
            ClientTrack
          </span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setViewMode("all")}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
              viewMode === "all"
                ? "bg-orange-50 text-orange-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Users size={20} />
            <span>All Clients</span>
          </button>
          <button
            onClick={() => setViewMode("contacts")}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
              viewMode === "contacts"
                ? "bg-orange-50 text-orange-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Clock size={20} />
            <span>Follow-ups</span>
          </button>
          <button
            onClick={() => setViewMode("gifts")}
            className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
              viewMode === "gifts"
                ? "bg-orange-50 text-orange-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Gift size={20} />
            <span>Gift Schedule</span>
          </button>
        </nav>

        <div className = "mt-auto pt-4 border-t border-gray-200">
          <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            <LogOut size = {20}/>
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === "all"
              ? "All Clients"
              : viewMode === "contacts"
              ? "Follow-up Schedule"
              : "Gift Schedule"}
          </h1>
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={20} className="mr-2" />
            Add Client
          </button>
        </div>

        {/* Add Client Modal */}
        {isAddClientOpen && (
          <Modal onClose={() => setIsAddClientOpen(false)} className="w-full max-w-[500px]">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Add New Client
            </h2>
            <form onSubmit={handleAddClient}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg text-gray-900"
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
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove{" "}
              {clients.find((c) => c.id === clientToDelete)?.name}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(clientToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-900"
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
          {filteredClients.length === 0 && (
            <p className="text-orange-600">
              No clients match the current filter criteria.
            </p>
          )}
        </div>

        {/* Client List */}
        <div className="bg-white rounded-lg border border-gray-200">

          <div className="grid grid-cols-[repeat(7,1fr)_minmax(150px,1fr)] gap-4 p-4 border-b border-gray-200 bg-gray-50">
  {['Client Name', 'Email', 'Status', 'Last Update', 'Next Follow-up', 'Next Gift Due', 'Assigned To', 'Actions'].map((header) => (
    <div key={header} className="font-medium text-gray-900">{header}</div>
  ))}
</div>


          <div className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-8 gap-4 p-4 hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">{client.name}</div>
                <div className="text-gray-900">{client.email}</div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </div>
                <div className="text-gray-900">{client.lastUpdate}</div>
                <div
                  className={`flex items-center gap-2 ${
                    isDatePast(client.nextContact)
                      ? "text-red-600 font-medium"
                      : isDateSoon(client.nextContact)
                      ? "text-yellow-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {client.nextContact}
                  {isDatePast(client.nextContact) && <AlertCircle size={16} />}
                </div>
                <div
                  className={
                    isDateSoon(client.nextGift)
                      ? "text-purple-600 font-medium"
                      : "text-gray-700"
                  }
                >
                  {client.nextGift}
                </div>
                <div className="flex -space-x-2">
                  {client.assignedTo.map((person, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-900"
                      title={person}
                    >
                      {person.charAt(0)}
                    </div>
                  ))  || (  // Add a fallback for when assignedTo is undefined
                    <div
                      className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-900"
                      title="Unassigned"
                    >
                      U
                    </div>
                  )}
                </div>
                <div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setIsUpdateModalOpen(true);
                      }}
                      className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setIsHistoryModalOpen(true);
                      }}
                      className="text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => setClientToDelete(client.id)}
                      className="text-sm px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-red-600"
                    >
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
