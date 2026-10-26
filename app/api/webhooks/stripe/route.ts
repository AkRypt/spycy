import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { SPY_TABLES } from '@/app/constants'
import { getAdminDb } from '@/utils/firebase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  try {
    const event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret)

    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object as Stripe.Checkout.Session
        const topicId = parseInt(session.metadata?.topic_id ?? '', 10)
        const custEmail = session.customer_details?.email

        if (!custEmail || Number.isNaN(topicId)) {
          console.error('Missing email or topic_id on checkout session')
          return NextResponse.json({ status: 'Failed', error: 'Missing metadata' })
        }

        const db = getAdminDb()
        const query = await db
          .collection(SPY_TABLES.USERS)
          .where('email', '==', custEmail)
          .limit(1)
          .get()

        if (query.empty) {
          console.error('User not found for email:', custEmail)
          return NextResponse.json({ status: 'Failed', error: 'User not found' })
        }

        const doc = query.docs[0]
        const current = (doc.data().purchased_topics as number[]) || []
        const updated = current.includes(topicId) ? current : [...current, topicId]
        await doc.ref.update({ purchased_topics: updated })
      } catch (error) {
        console.error(error)
        return NextResponse.json({ status: 'Failed', error })
      }
    }

    return NextResponse.json({
      status: 'Success',
      eventType: event.type,
    })
  } catch (err: unknown) {
    console.log('err:', err)
    return NextResponse.json({ status: 'Failed', err })
  }
}
