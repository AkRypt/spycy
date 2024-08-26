'use server';

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function getDecks() {
    const supabase = createClient()

    const { data, error, status } = await supabase
        .from('<YOUR TABLE NAME>')
        .select("*")

    if (error && status !== 406) {
        console.log(error)
        throw error
    }

    return data
}

export async function signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.log(error)
        throw error
    }

    redirect('/')
}

