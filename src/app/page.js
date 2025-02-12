"use client";
import { use, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import ClientTracker from '@/components/ClientTracker';
import Loading from '@/components/Loading';
import { checkUser } from '@/lib/supabase';

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            const user = await checkUser();
            setUser(user);
            setLoading(false);

            if (!user) {
                window.location.href = '/login';
            }
        };

        initAuth();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <main>
            <ClientTracker user={user} />
        </main>
    );
}