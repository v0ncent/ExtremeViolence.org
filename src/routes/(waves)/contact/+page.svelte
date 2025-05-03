<script lang="ts">
    export let form: any;
    export const prerender = false;
  </script>
  
  <section class="contact-container">
    <h2>Send me a message</h2>
  
    {#if form?.success}
      <p class="success-message">✅ Your message was sent!</p>
    {:else if form?.error}
      <p class="error-message">❌ Error: {form.error}</p>
    {/if}
  
    <form method="POST" class="contact-form">
      <label>
        Email:
        <input type="email" name="email" required />
      </label>
  
      <label>
        Message:
        <textarea name="message" rows="5" required></textarea>
      </label>
  
      <button type="submit">Send Message</button>
    </form>
  </section>
  
  <style>
    .contact-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      font-family: sans-serif;
    }
  
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: black;
    }
  
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    label {
      display: flex;
      flex-direction: column;
      font-weight: bold;
      color: black;
    }
  
    input,
    textarea {
      margin-top: 0.5rem;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid #ccc;
      font-size: 1rem;
    }
  
    button {
      padding: 0.75rem;
      font-size: 1rem;
      border: none;
      border-radius: 6px;
      background-color: #0070f3;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    button:hover {
      background-color: #005fcc;
    }
  
    .success-message {
      color: green;
      text-align: center;
      font-weight: bold;
      margin-bottom: 1rem;
    }
  
    .error-message {
      color: red;
      text-align: center;
      font-weight: bold;
      margin-bottom: 1rem;
    }
  </style>
  