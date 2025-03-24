// Enhanced db.js with complete Supabase functionality
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// At the top of your file, after importing supabase
supabase.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
supabase.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enable debug mode - add this line
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
});


export const db = {
  // Fetch clients with their assignments and current status
  async getClients() {
    try {
      console.log('Fetching clients...');
      
      // Get all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');
  
      if (clientsError) {
        console.error('Supabase error fetching clients:', clientsError);
        throw clientsError;
      }
  
      // For each client, get their assignments
      const clientsWithAssignments = await Promise.all(
        clients.map(async (client) => {
          try {
            // Get user assignments
            const { data: assignments, error: assignmentsError } = await supabase
              .from('client_assignments')
              .select('user_id')
              .eq('client_id', client.id);
  
            if (assignmentsError) throw assignmentsError;
  
            // If there are assignments, get the user profiles
            let assignedTo = ['Unassigned'];
            
            if (assignments && assignments.length > 0) {
              // Get user profiles for each assignment
              const userIds = assignments.map(a => a.user_id);
              
              const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, name')
                .in('id', userIds);
                
              if (profilesError) throw profilesError;
              
              if (profiles && profiles.length > 0) {
                assignedTo = profiles.map(profile => ({
                  id: profile.id,
                  email: profile.email,
                  name: profile.name || profile.email.split('@')[0]
                }));
              }
            }
  
            return {
              id: client.id,
              name: client.name,
              email: client.email,
              status: client.status || 'New Client',
              lastUpdate: client.last_update,
              nextContact: client.next_contact,
              nextGift: client.next_gift,
              assignedTo: assignedTo
            };
          } catch (err) {
            console.warn('Error processing client assignments:', err);
            // Return client with default values on error
            return {
              id: client.id,
              name: client.name,
              email: client.email,
              status: client.status || 'New Client',
              lastUpdate: client.last_update,
              nextContact: client.next_contact,
              nextGift: client.next_gift,
              assignedTo: ['Unassigned']
            };
          }
        })
      );
  
      console.log('Clients retrieved with assignments:', clientsWithAssignments);
      return clientsWithAssignments;
    } catch (error) {
      console.error('Error in getClients:', error);
      throw error;
    }
  },

  // Add a new client
  async addClient(clientData) {
    try {
      console.log('Adding client:', clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: clientData.name,
          email: clientData.email,
          status: 'New Client',
          last_update: new Date().toISOString().split('T')[0],
          next_contact: clientData.nextContact || new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0],
          next_gift: clientData.nextGift || new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]
        }])
        .select();

      if (error) {
        console.error('Error adding client:', error);
        throw error;
      }

      console.log('Added client data:', data);
      
      // Transform to frontend format
      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        status: data[0].status,
        lastUpdate: data[0].last_update,
        nextContact: data[0].next_contact,
        nextGift: data[0].next_gift,
        assignedTo: ['Unassigned']
      };
    } catch (error) {
      console.error('Error in addClient:', error);
      throw error;
    }
  },

  // Delete a client
  async deleteClient(clientId) {
    try {
      console.log('Deleting client with ID:', clientId);
      
      // Direct deletion approach - much simpler
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
  
      if (error) {
        console.error('Error deleting client:', error);
        return { success: false, error };
      }
  
      console.log('Client deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in deleteClient:', error);
      return { success: false, error };
    }
  },

  // Update the main client record
  async updateClient(clientId, updateFields) {
    try {
      console.log('Updating client with ID:', clientId, 'Fields:', updateFields);
      
      // Convert field names from camelCase to snake_case if needed
      const dbFields = {};
      
      // Map common fields
      if (updateFields.name) dbFields.name = updateFields.name;
      if (updateFields.email) dbFields.email = updateFields.email;
      if (updateFields.status) dbFields.status = updateFields.status;
      if (updateFields.lastUpdate) dbFields.last_update = updateFields.lastUpdate;
      if (updateFields.nextContact) dbFields.next_contact = updateFields.nextContact;
      if (updateFields.nextGift) dbFields.next_gift = updateFields.nextGift;
      
      // Call supabase update
      const { data, error } = await supabase
        .from('clients')
        .update(dbFields)
        .eq('id', clientId)
        .select();
    
      if (error) {
        console.error('Error updating client', error);
        throw error;
      }
      console.log('Client updated successfully', data[0]);
      return data[0];
    } catch (err) {
      console.error('Error in updateClient', err);
      throw err;
    }
  },

  // Get follow-up history for a client
  async getFollowUpHistory(clientId) {
    try {
      console.log('Fetching follow-up history for client:', clientId);
      
      const { data, error } = await supabase
        .from('follow_up_history')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching follow-up history:', error);
        throw error;
      }
      
      console.log('Follow-up history retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error in getFollowUpHistory:', error);
      throw error;
    }
  },

  // Get gift history for a client
  async getGiftHistory(clientId) {
    try {
      console.log('Fetching gift history for client:', clientId);
      
      const { data, error } = await supabase
        .from('gift_history')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching gift history:', error);
        throw error;
      }
      
      console.log('Gift history retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error in getGiftHistory:', error);
      throw error;
    }
  },

  // Insert follow-up history record 
  async addFollowUpHistory(clientId, type, notes) {
    try {
      console.log('Adding follow-up history for client:', clientId);
      
      const { data, error } = await supabase
        .from('follow_up_history')
        .insert([{
          client_id: clientId,  // Fixed: changed from clientId to client_id
          type,
          notes,
          date: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Error adding follow-up history:', error);
        throw error;
      }
      
      console.log('Follow-up history added:', data[0]);
      return data[0];
    } catch (err) {
      console.error('Error in addFollowUpHistory:', err);
      throw err;
    }
  },

  // Insert gift history (only if gift was sent)
  async addGiftHistory(clientId, status, giftDetails, notes) {
    try {
      console.log('Adding gift history for client:', clientId);
      
      const { data, error } = await supabase
        .from('gift_history')
        .insert([{
          client_id: clientId,
          status,
          gift_details: giftDetails,  // Fixed: renamed to match DB schema
          notes,
          date: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Error adding gift history:', error);
        throw error;
      }
      
      console.log('Gift history added:', data[0]);
      return data[0];
    } catch (err) {
      console.error('Error in addGiftHistory:', err);
      throw err;
    }
  },

  // Get all users for client assignment
  async getUsers() {
    try {
      console.log('Fetching users for assignment...');
      
      // Note: In Supabase, accessing auth.users directly requires special permissions
      // This will need to be handled depending on your Supabase setup
      // You might need a server-side function or use a custom users table
      
      // For now, we'll use a simplified approach (you'll need to adjust this):
      const { data, error } = await supabase
        .from('profiles')  // Assuming you have a profiles table linked to auth.users
        .select('id, email');
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },
  
  // Assign a user to a client
  async assignClientToUser(clientId, userId) {
    try {
      console.log('Assigning client to user. Client:', clientId, 'User:', userId);
      
      // First, ensure the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
        if (profileError) {
          console.error(`User profile not found for ID: ${userId}. Ensure the user is signed up and the trigger is working.`);
          throw profileError;
        }
      
      // Now create the assignment
      const { data, error } = await supabase
        .from('client_assignments')
        .insert([{
          client_id: clientId,
          user_id: userId,
          assigned_at: new Date().toISOString()
        }])
        .select();
        
      if (error) {
        // If assignment already exists, this is not a critical error
        if (error.code === '23505') { // Unique violation
          console.log('Assignment already exists');
          return { id: 'existing', client_id: clientId, user_id: userId };
        }
        console.error('Error assigning client to user:', error);
        throw error;
      }
      
      console.log('Client assigned to user:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error in assignClientToUser:', error);
      throw error;
    }
  },
  
  // Remove a user assignment from a client
  async unassignClientFromUser(clientId, userId) {
    try {
      console.log('Removing user assignment. Client:', clientId, 'User:', userId);
      
      const { error } = await supabase
        .from('client_assignments')
        .delete()
        .eq('client_id', clientId)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error removing assignment:', error);
        throw error;
      }
      
      console.log('Assignment removed successfully');
      return true;
    } catch (error) {
      console.error('Error in unassignClientFromUser:', error);
      throw error;
    }
  },
  
  // Update client with follow-up and gift details in a single transaction
  async updateClientWithDetails(clientId, updateData) {
    try {
      console.log('Updating client with details. Client:', clientId);
      console.log('Update data:', updateData);
      
      // Start a transaction for updating multiple tables
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Update client record
      const clientUpdates = {
        last_update: today
      };
      
      // Update next contact date if provided
      if (updateData.followUp?.nextFollowUpDate) {
        clientUpdates.next_contact = updateData.followUp.nextFollowUpDate;
      }
      
      // Update client record
      const { data: updatedClient, error: clientError } = await supabase
        .from('clients')
        .update(clientUpdates)
        .eq('id', clientId)
        .select();
        
      if (clientError) {
        console.error('Error updating client record:', clientError);
        throw clientError;
      }
      
      // 2. Add follow-up history if notes provided
      if (updateData.followUp?.notes && updateData.followUp.notes.trim() !== '') {
        await this.addFollowUpHistory(
          clientId,
          updateData.followUp.type || 'email',
          updateData.followUp.notes
        );
      }
      
      // 3. Handle gift status update
      if (updateData.gift) {
        // If gift was sent, add to history and update next gift date
        if (updateData.gift.status === 'Sent' && updateData.gift.details) {
          // Add gift history
          await this.addGiftHistory(
            clientId,
            'Sent',
            updateData.gift.details,
            updateData.gift.notes || ''
          );
          
          // Set next gift date to 3 months later
          const nextGiftDate = new Date();
          nextGiftDate.setMonth(nextGiftDate.getMonth() + 3);
          
          await supabase
            .from('clients')
            .update({
              next_gift: nextGiftDate.toISOString().split('T')[0]
            })
            .eq('id', clientId);
        }
      }
      
      console.log('Client updated with all details successfully');
      return updatedClient[0];
    } catch (error) {
      console.error('Error in updateClientWithDetails:', error);
      throw error;
    }
  },
  
  // Get client details including follow-up and gift history
  async getClientDetails(clientId) {
    try {
      console.log('Fetching complete client details. Client:', clientId);
      
      // Get client record
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (clientError) {
        console.error('Error fetching client:', clientError);
        throw clientError;
      }
      
      // Get follow-up history
      const followUpHistory = await this.getFollowUpHistory(clientId);
      
      // Get gift history
      const giftHistory = await this.getGiftHistory(clientId);
      
      // Get assignments
      let assignmentData = [];
      const { data: assignments, error: assignmentsError } = await supabase
        .from('client_assignments')
        .select('*')  // Just get the assignments without the join
        .eq('client_id', clientId);
        
      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
      } else {
        assignmentData = assignments || [];
      }
      
      // If we have assignments, fetch user details separately
      let assignedUsers = ['Unassigned'];
      if (assignmentData.length > 0) {
        try {
          const userIds = assignmentData.map(a => a.user_id);

          //fetch from profiles table
          const {data:profiles} = await supabase
          .from('profiles')
          .select('id, email, name')
          .in('id', userIds);

          if (profiles && profiles.length > 0) {
            assignedUsers = profiles.map(p => ({
              id: p.id,
              emial: p.email,
              name: p.name || p.email.split('@')[0]
            }));
          }
        } catch (userErr) {
          console.warn('Could not fetch user details:', userErr);
          
          // fall back to just shwoing user IDs
          assignedUsers = assignmentData.map(a => ({
            id: a.user_id,
            email: a.user_id,
            name: 'User'
          }));
        }
      }
      
      // Format the response
      const formattedClient = {
        id: client.id,
        name: client.name,
        email: client.email,
        status: client.status,
        lastUpdate: client.last_update,
        nextContact: client.next_contact,
        nextGift: client.next_gift,
        followUpHistory: followUpHistory,
        giftStatus: {
          status: giftHistory.length > 0 ? 'Sent' : 'Not Started',
          lastGiftSent: giftHistory.length > 0 ? giftHistory[0].date : null,
          lastGiftDetails: giftHistory.length > 0 ? giftHistory[0].gift_details : null,
          giftHistory: giftHistory.map(item => ({
            date: item.date,
            gift: item.gift_details,
            notes: item.notes
          }))
        },
        assignedTo: assignedUsers
      };
      
      console.log('Client details retrieved successfully');
      return formattedClient;
    } catch (error) {
      console.error('Error in getClientDetails:', error);
      // Instead of throwing, return a partial client to prevent the app from crashing
      return {
        id: clientId,
        name: "Error loading details",
        email: "",
        status: "Unknown",
        lastUpdate: new Date().toISOString(),
        nextContact: new Date().toISOString(),
        nextGift: new Date().toISOString(),
        followUpHistory: [],
        giftStatus: { status: 'Not Started', giftHistory: [] },
        assignedTo: ['Unassigned']
      };
    }
  }
};