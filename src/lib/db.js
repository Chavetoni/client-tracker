import {supabase} from './supabase';

export const db = {
  // Simplify this function to just fetch clients without trying to join with client_assignments
  async getClients() {
    try {
      console.log('Fetching clients...');
      const { data, error } = await supabase
        .from('clients')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Clients retrieved:', data);
      
      // Transform the data to match our frontend structure
      const transformedData = data.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        status: client.status || 'New Client',
        lastUpdate: client.last_update,
        nextContact: client.next_contact,
        nextGift: client.next_gift,
        // For now, we'll use a placeholder for assignedTo
        assignedTo: ['Unassigned']
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching clients:', error);
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
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      console.log('Client deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteClient:', error);
      throw error;
    }
  },

  // update the main client record
  async updateClient(clientId, updateFields) {
    try {
      //Call supabase update
      const {data, error} = await supabase
      .from('clients')
      .update(updateFields)
      .eq('id', clientId)
      .select();
    
    if (error) {
      console.error('Error updating client', error);
      throw error;
    }
    return data[0];
  } catch (err) {
    console.error('Error in updateClient', err);
    throw err;
  }
}, 

//insert follow up history record 
async addFollowUpHistory(clientId, type, notes) {
  try {
    const { data, error} = await supabase
    .from('follow_up_history')
    .insert([{clientId, type, notes}])
    .select();

    if (error) {
      console.error('Error adding follow-up history:', error);
      throw error;
    }
    return data[0];
  }catch(err) {
    console.error('error in adding follow-up history', err);
    throw err;
  }
},

//insert gift history (only if gift was sent)
async addGiftHistory(clientId, status, gift_details, notes) {
  try {
    const {data, error} = await supabase
    .from('gift_history')
    .insert([{client_id: clientId, status, gift_details,notes}])
    .select();

    if (error) {
      console.log("Error adding gift history", error);
      throw error;
    }
    return data[0];
  } catch (err) {
    console.error('Error in addGiftHistory:', err);
  }
}

};