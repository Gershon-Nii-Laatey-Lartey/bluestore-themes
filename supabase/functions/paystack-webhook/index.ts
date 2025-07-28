
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    // Verify webhook signature
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    const expectedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    // Store webhook event
    const { error: webhookError } = await supabaseClient
      .from('webhook_events')
      .insert({
        provider: 'paystack',
        event_type: event.event,
        event_data: event,
      });

    if (webhookError) {
      console.error('Error storing webhook event:', webhookError);
    }

    // Process different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(supabaseClient, event.data);
        break;
      
      case 'subscription.create':
        await handleSubscriptionCreate(supabaseClient, event.data);
        break;
      
      case 'subscription.disable':
        await handleSubscriptionDisable(supabaseClient, event.data);
        break;
      
      case 'invoice.create':
        await handleInvoiceCreate(supabaseClient, event.data);
        break;
      
      default:
        console.log('Unhandled event type:', event.event);
    }

    // Mark webhook as processed
    await supabaseClient
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('event_data->id', event.data.id);

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Error processing webhook', { status: 500, headers: corsHeaders });
  }
});

async function handleChargeSuccess(supabase: any, data: any) {
  console.log('Processing charge success:', data.reference);
  
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      provider_payment_id: data.id.toString(),
      metadata: { ...data, webhook_processed_at: new Date().toISOString() },
    })
    .eq('provider_reference', data.reference);

  if (error) {
    console.error('Error updating payment:', error);
  }
}

async function handleSubscriptionCreate(supabase: any, data: any) {
  console.log('Processing subscription create:', data.subscription_code);
  
  // Update or create subscription record
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: data.customer.metadata?.user_id,
      plan_id: data.plan.plan_code,
      status: 'active',
    });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionDisable(supabase: any, data: any) {
  console.log('Processing subscription disable:', data.subscription_code);
  
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('plan_id', data.plan.plan_code);

  if (error) {
    console.error('Error disabling subscription:', error);
  }
}

async function handleInvoiceCreate(supabase: any, data: any) {
  console.log('Processing invoice create:', data.id);
  
  // Store invoice information in payments table
  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: data.customer.metadata?.user_id,
      amount: data.amount / 100, // Convert from kobo
      currency: data.currency,
      status: 'pending',
      provider_payment_id: data.id.toString(),
      metadata: { ...data, type: 'invoice' },
    });

  if (error) {
    console.error('Error creating invoice payment:', error);
  }
}
