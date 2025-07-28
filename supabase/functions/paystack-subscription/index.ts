
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  plan_id: string;
  user_id: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: SubscriptionRequest = await req.json();
    
    // Calculate subscription end date based on plan
    const { data: endDate } = await supabaseClient
      .rpc('calculate_subscription_end_date', { plan_id: body.plan_id });

    if (!endDate) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create subscription record
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: body.plan_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: endDate,
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Subscription created successfully:', subscription.id);

    return new Response(
      JSON.stringify({ 
        status: true, 
        message: 'Subscription created successfully',
        data: subscription
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in paystack-subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
