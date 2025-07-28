
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Plan configuration mapping
const getPlanConfiguration = (planId: string) => {
  const plans: Record<string, any> = {
    'starter': { name: 'Starter Plan', price: 15, duration: 7, adsAllowed: 1 },
    'standard': { name: 'Standard Plan', price: 30, duration: 30, adsAllowed: 1 },
    'rising': { name: 'Rising Seller Plan', price: 50, duration: 14, adsAllowed: 25 },
    'pro': { name: 'Pro Seller Plan', price: 120, duration: 30, adsAllowed: 50 },
    'business': { name: 'Business Plan', price: 250, duration: 90, adsAllowed: 100 },
    'premium': { name: 'Premium Brand Plan', price: 500, duration: 150, adsAllowed: null },
  };
  
  return plans[planId] || { name: 'Unknown Plan', price: 0, duration: 30, adsAllowed: 1 };
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying payment with reference:', reference);

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack verification failed:', paystackData);
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transactionData = paystackData.data;
    console.log('Transaction data:', transactionData);
    
    // Update payment record
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: transactionData.status === 'success' ? 'succeeded' : 'failed',
        provider_payment_id: transactionData.id.toString(),
        metadata: {
          ...transactionData,
          verified_at: new Date().toISOString(),
        },
      })
      .eq('provider_reference', reference)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment successful and has plan metadata, ALWAYS create a NEW subscription
    if (transactionData.status === 'success' && transactionData.metadata?.plan_id) {
      const planId = transactionData.metadata.plan_id;
      console.log('Creating NEW subscription for plan:', planId);
      
      // Get plan configuration
      const planConfig = getPlanConfiguration(planId);
      
      // Ensure planId is one of the valid plan types
      const validPlanTypes = ['free', 'starter', 'standard', 'rising', 'pro', 'business', 'premium'] as const;
      const planType = validPlanTypes.includes(planId as any) ? planId as typeof validPlanTypes[number] : 'starter';
      
      // Calculate dates for the NEW subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);
      
      // ALWAYS create a completely new subscription for EVERY purchase
      // This ensures each purchase is independent and tracked separately
      const subscriptionData = {
        user_id: user.id,
        plan_type: planType,
        plan_name: planConfig.name,
        plan_price: planConfig.price,
        duration_days: planConfig.duration,
        ads_allowed: planConfig.adsAllowed,
        ads_used: 0, // Always start with 0 ads used for new subscription
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        features: {},
        status: 'active'
      };

      console.log('Creating brand new subscription with data:', subscriptionData);

      // Insert new subscription record - NEVER update existing ones
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('user_plan_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subscriptionError) {
        console.error('Subscription creation error:', subscriptionError);
        // Don't fail the payment verification if subscription creation fails
        // The payment was successful, so we should still return success
        console.log('Payment verified successfully but subscription creation failed');
      } else {
        console.log('Brand new subscription created successfully:', subscription);
        
        // Update the payment record to link it with the new subscription
        await supabaseClient
          .from('payments')
          .update({
            subscription_id: subscription.id,
            metadata: {
              ...transactionData,
              verified_at: new Date().toISOString(),
              subscription_created: true,
              subscription_id: subscription.id
            }
          })
          .eq('provider_reference', reference)
          .eq('user_id', user.id);
      }
    }

    console.log('Payment verified successfully:', reference);

    return new Response(
      JSON.stringify({
        ...paystackData,
        subscription_created: transactionData.status === 'success' && transactionData.metadata?.plan_id ? true : false
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in paystack-verify:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
