import {supabase} from './supabase';

export const db = {
   // Transform database field names to match frontend expectations
    async getClients() {
        try {
        const { data, error } = await supabase
            .from('clients')
            .select(`
            *,
            client_assignments (
                user_id,
                users:user_id (
                email,
                user_metadata
                )
            )
            `);

        if (error) throw error;

        // Transform each client object
        const transformedData = data.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            status: client.status,
            lastUpdate: client.last_update,
            nextContact: client.next_contact,
            nextGift: client.next_gift,
            // Handle assignments with user details
            assignedTo: client.client_assignments?.length 
            ? client.client_assignments.map(assignment => ({
                id: assignment.user_id,
                email: assignment.users?.email,
                name: assignment.users?.user_metadata?.full_name || assignment.users?.email
                }))
            : [{ id: null, name: 'Unassigned', email: null }]
        }));

        return transformedData;
        } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
        }
    },

    // Add a new assignment
    async assignClient(clientId, userId) {
        const { data, error } = await supabase
        .from('client_assignments')
        .insert([
            { client_id: clientId, user_id: userId }
        ]);

        if (error) throw error;
        return data;
    },

    // Remove an assignment
    async unassignClient(clientId, userId) {
        const { error } = await supabase
        .from('client_assignments')
        .delete()
        .match({ client_id: clientId, user_id: userId });

        if (error) throw error;
    },
    
    async addClient(clientData) {
        const {data, error} = await supabase
            .from('clients')
            .insert([{
                name: clientData.name,
                email: clientData.email,
                status: 'New Client',
                last_update: new Date().toISOString(),
                next_contact: clientData.nextContact,
                next_gift: clientData.nextGift
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateClient(clientId, updateData) {
        if (!['New Client','Follow-up Soon', 'Updated Recently', 'Need Update', 'Active'].includes(updateData.status)){
            throw new Error('Invalid status value');
        }

        const {data, error} = await supabase
        .from('clients')
        .update({
            status: updateData.status,
            last_update: new Date().toISOString(),
            next_contact: updateData.nextContact,
            next_gift: updateData.nextGift,
            updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

        if (error) throw error;
        return data;
    },


    
};