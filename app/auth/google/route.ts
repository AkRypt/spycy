import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    let options: { redirectTo: string; scopes?: string } = {
        redirectTo: `${new URL(req.url).origin}/auth/callback`,
    };

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options,
    })

    if (error) throw error;

    return NextResponse.redirect(data.url);
}