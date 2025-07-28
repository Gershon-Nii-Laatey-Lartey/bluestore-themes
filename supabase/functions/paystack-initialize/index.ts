
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaystackInitializeRequest {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  plan?: string;
  channels?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PaystackInitializeRequest = await req.json();
    
    // Generate reference if not provided
    const reference = body.reference || `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get Paystack keys from environment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const paystackPublicKey = Deno.env.get('PAYSTACK_PUBLIC_KEY');
    
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Paystack configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize payment with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        amount: body.amount * 100, // Convert to kobo
        currency: body.currency || 'GHS',
        reference,
        callback_url: body.callback_url,
        metadata: {
          ...body.metadata,
          user_id: user.id,
        },
        channels: body.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment record
    const { error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: body.amount,
        currency: body.currency || 'GHS',
        provider_reference: reference,
        status: 'pending',
        metadata: body.metadata || {},
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment initialized successfully:', reference);

    // Add public key to response
    const responseData = {
      ...paystackData,
      data: {
        ...paystackData.data,
        public_key: paystackPublicKey
      }
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in paystack-initialize:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
