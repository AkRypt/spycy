import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const supabase = createClient()

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    console.log("code:", code)

    const redirectTo = new URL('/lobby', request.url)

    if (code) {
        const { data: exchData, error: exchError } = await supabase.auth.exchangeCodeForSession(code)

        const { data, error } = await supabase.auth.getUser()

        if (data?.user) {
            const { data: newUser, error: newUserError } = await supabase
                .from('users')
                .upsert([{ id: data.user?.id, email: data.user.email }])

            if (error) {
                console.error("Error:", error)
                throw new Error(`Error creating new user: ${JSON.stringify(newUserError)}`)
            }
        }

        return NextResponse.redirect(redirectTo)
    }

    // return the user to an error page with some instructions
    redirectTo.pathname = '/error'
    return NextResponse.redirect(redirectTo)
}