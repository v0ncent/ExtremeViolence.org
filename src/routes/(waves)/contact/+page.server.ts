import type { Actions } from './$types';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export const prerender = false;

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const message = data.get('message')?.toString();

    if (!email || !message) {
      return { success: false, error: 'Please fill out all fields.' };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.CONTACT_EMAIL,
          pass: env.CONTACT_EMAIL_PASS, 
        },
      });

      await transporter.sendMail({
        from: `"Contact Form" <${env.CONTACT_EMAIL}>`,
        to: env.CONTACT_EMAIL,
        subject: 'New Contact Message',
        text: `From: ${email}\n\n${message}`,
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to send message. Please try again later.' };
    }
  }
};
