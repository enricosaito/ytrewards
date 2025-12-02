import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define the allowed origin(s) for CORS
const allowedOrigins = [
  process.env.VITE_APP_URL || 'http://localhost:8080',
  'https://ytrewards-sigma.vercel.app', // Update with your actual Vercel domain
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'YT Rewards Support <onboarding@resend.dev>', // Update this after verifying your domain
      to: process.env.SUPPORT_EMAIL || 'your-email@example.com', // Your support email
      replyTo: email, // User's email for easy replies
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request from YT Rewards</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      id: data?.id 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      error: 'Failed to send email. Please try again later.' 
    });
  }
}

