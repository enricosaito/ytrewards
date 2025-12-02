import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase Admin Client (has elevated permissions)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Define allowed origins for CORS
const allowedOrigins = [
  process.env.VITE_APP_URL || 'http://localhost:8080',
  'https://ytrewards-sigma.vercel.app',
];

// Generate a secure but readable temporary password
function generateTempPassword(): string {
  const prefix = 'ytrewards';
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${prefix}${randomNum}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Optional: Verify webhook signature or API key
    const authHeader = req.headers.authorization;
    const expectedApiKey = process.env.WEBHOOK_SECRET_KEY;
    
    if (expectedApiKey && authHeader !== `Bearer ${expectedApiKey}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email so they can login immediately
      user_metadata: {
        display_name: name || email.split('@')[0]
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ 
          error: 'User already exists',
          message: 'This email is already registered in the system'
        });
      }
      
      return res.status(400).json({ 
        error: 'Failed to create user',
        message: authError.message 
      });
    }

    const userId = authData.user.id;

    // Create profile with requires_password_change flag
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        display_name: name || email.split('@')[0],
        balance: 0,
        withdrawal_goal: 1000,
        daily_reviews_completed: 0,
        total_reviews: 0,
        current_streak: 0,
        requires_password_change: true, // Force password change on first login
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({ 
        error: 'Failed to create user profile',
        message: profileError.message 
      });
    }

    // Send welcome email with credentials
    const appUrl = 'https://ytrewards-sigma.vercel.app';
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'YT Rewards <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to YT Rewards - Your Account is Ready! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to YT Rewards</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                          🎬 Welcome to YT Rewards!
                        </h1>
                        <p style="color: #e0e0ff; margin: 10px 0 0; font-size: 16px;">
                          Your account has been created successfully
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          Hi ${name || 'there'}! 👋
                        </p>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                          Thank you for joining YT Rewards! Your account is ready, and you can start earning rewards by watching and reviewing videos.
                        </p>
                        
                        <!-- Credentials Box -->
                        <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 0 0 30px; border-radius: 4px;">
                          <h2 style="color: #667eea; margin: 0 0 15px; font-size: 18px; font-weight: 600;">
                            🔐 Your Login Credentials
                          </h2>
                          
                          <p style="color: #666666; margin: 0 0 10px; font-size: 14px;">
                            <strong style="color: #333333;">Email:</strong><br>
                            <span style="font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; display: inline-block; margin-top: 5px; border-radius: 4px; border: 1px solid #e0e0e0;">
                              ${email}
                            </span>
                          </p>
                          
                          <p style="color: #666666; margin: 0; font-size: 14px;">
                            <strong style="color: #333333;">Temporary Password:</strong><br>
                            <span style="font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; display: inline-block; margin-top: 5px; border-radius: 4px; border: 1px solid #e0e0e0; font-size: 16px; font-weight: bold; color: #667eea;">
                              ${tempPassword}
                            </span>
                          </p>
                        </div>
                        
                        <!-- Security Note -->
                        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 0 0 30px; border-radius: 4px;">
                          <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                            <strong>⚠️ Important:</strong> For security reasons, you'll be prompted to change your password when you first log in. Please choose a strong password that you haven't used elsewhere.
                          </p>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 0 0 30px;">
                          <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                            Access Your Account →
                          </a>
                        </div>
                        
                        <!-- How It Works -->
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 0 0 20px;">
                          <h3 style="color: #333333; margin: 0 0 15px; font-size: 16px; font-weight: 600;">
                            💡 How YT Rewards Works
                          </h3>
                          <ul style="color: #666666; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
                            <li>Watch 5 videos daily and rate them</li>
                            <li>Earn $5 per video ($25/day when you complete all 5)</li>
                            <li>Build your balance towards your withdrawal goal</li>
                            <li>Withdraw when you reach $1,000</li>
                          </ul>
                        </div>
                        
                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                          If you have any questions or need help, visit our 
                          <a href="${appUrl}/support" style="color: #667eea; text-decoration: none;">support page</a> 
                          or reply to this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
                        <p style="color: #999999; margin: 0 0 10px; font-size: 14px;">
                          YT Rewards - Earn rewards by watching videos
                        </p>
                        <p style="color: #999999; margin: 0; font-size: 12px;">
                          <a href="${appUrl}" style="color: #667eea; text-decoration: none;">${appUrl}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the entire request if email fails - user was created successfully
      return res.status(201).json({
        success: true,
        message: 'User created but email failed to send',
        user: {
          id: userId,
          email,
        },
        tempPassword, // Return password in response so webhook can handle it
        emailError: emailError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User created and welcome email sent',
      user: {
        id: userId,
        email,
      },
      emailId: emailData?.id
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

