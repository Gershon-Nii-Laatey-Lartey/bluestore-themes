import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { action = 'create_worker' } = body
    
    // Handle password change action
    if (action === 'change_password') {
      const { user_id, new_password } = body
      
      try {
        const { error } = await supabaseClient.auth.admin.updateUserById(user_id, {
          password: new_password
        })

        if (error) {
          throw error
        }

        // Log audit event
        await supabaseClient.rpc('log_audit_event', {
          p_action_type: 'CS_WORKER_PASSWORD_CHANGE',
          p_action_description: 'CS worker password changed',
          p_entity_type: 'cs_worker',
          p_entity_id: user_id
        })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error changing CS worker password:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }
    }

    // Handle worker creation
    const { email_head, full_name, phone, password: providedPassword, roles } = body

    // Construct full email
    const email = `${email_head}@bluestoreghana.com`
    
    console.log('Creating CS worker:', { email, full_name, roles })

    // Generate secure random password if not provided
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    // Generate employee ID
    const generateEmployeeId = () => {
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
      return `EMP${timestamp}${random}`
    }

    const generatedPassword = providedPassword || generatePassword()
    const employee_id = generateEmployeeId()

    console.log('Generated employee ID:', employee_id)

    // Create auth user with service role
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user account', details: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create CS worker profile
    const { data: workerProfileData, error: profileError } = await supabaseClient
      .from('cs_workers')
      .insert({
        user_id: authData.user.id,
        email,
        full_name,
        phone: phone || null,
        employee_id,
        generated_password: generatedPassword
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating CS worker profile:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create worker profile', details: profileError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Assign roles
    if (roles && roles.length > 0) {
      const roleInserts = roles.map((role: string) => ({
        cs_worker_id: workerProfileData.id,
        role,
        assigned_by: authData.user.id // Use the created user as assigned_by for now
      }))

      const { error: rolesError } = await supabaseClient
        .from('cs_worker_roles')
        .insert(roleInserts)

      if (rolesError) {
        console.error('Error assigning roles:', rolesError)
        // Don't fail completely, just log the error
      }
    }

    // Send password reset email
    await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    // Log audit event
    await supabaseClient.rpc('log_audit_event', {
      p_action_type: 'CS_WORKER_CREATED',
      p_action_description: `CS worker ${full_name} (${email}) created with employee ID ${employee_id}`,
      p_entity_type: 'cs_worker',
      p_entity_id: workerProfileData.id,
      p_new_values: { email, full_name, employee_id, roles }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        worker: workerProfileData,
        password: generatedPassword
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-cs-worker function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})