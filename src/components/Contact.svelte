<script>
  import whatsappIcon from "../assets/icons/whatsapp.svg";
</script>

<section class="contact-section">
  <h2>Contact Us</h2>
  <p>Have a question about our holiday rental? Get in touch.</p>
  <div class="contact-options">
    <a href="tel:+447956370285" class="contact-option">
      <span class="icon">📞</span>
      <span class="label">Call</span>
      <span class="value">07956 370285</span>
    </a>
    <a href="sms:+447956370285" class="contact-option sms">
      <span class="icon">💬</span>
      <span class="label">Text</span>
      <span class="value">07956 370285</span>
    </a>
    <a href="https://wa.me/447956370285" class="contact-option whatsapp">
      <img src={whatsappIcon} alt="WhatsApp" class="icon" />
      <span class="label">WhatsApp</span>
      <span class="value">07956 370285</span>
    </a>
    <a href="mailto:jackypyne@gmail.com" class="contact-option email">
      <span class="icon">✉️</span>
      <span class="label">Email</span>
      <span class="value">jackypyne@gmail.com</span>
    </a>
  </div>
</section>

<style>
  .contact-section {
    margin-top: 1rem;
    padding: 3rem 2rem;
    background-color: var(--bg-secondary, #f9f9f9);
    text-align: center;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 1rem;
  }

  .contact-section h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 600;
  }

  .contact-section p {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary, #606770);
  }

  .contact-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  .contact-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    text-decoration: none;
    color: inherit;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s,
      box-shadow 0.2s,
      border-color 0.2s;
  }

  .contact-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: var(--hover-border, #646cff);
  }

  .contact-option .icon {
    font-size: 1.5rem;
  }

  .contact-option .icon[src] {
    font-size: inherit;
    line-height: 1.5rem;
    width: 1.5rem;
    height: 1.5rem;
  }

  .contact-option .label {
    font-weight: 600;
    min-width: 80px;
  }

  .contact-option .value {
    font-family: monospace;
    color: var(--text-secondary, #606770);
    font-size: 0.95rem;
    min-width: 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .contact-option.email .value {
    min-width: 120px;
    text-align: left;
    padding-right: 1rem;
  }

  .contact-option.email {
    text-align: left;
  }

  .contact-option.whatsapp:hover {
    border-color: #25d366;
  }

  .contact-option.sms:hover {
    border-color: #25d366;
  }

  .contact-option.email:hover {
    border-color: #646cff;
  }

  @media (min-width: 600px) {
    .contact-section {
      padding: 3rem 4rem;
    }

    .contact-options {
      flex-direction: row;
    }

    .contact-option {
      width: auto;
      min-width: 200px;
    }
  }

  @media (prefers-color-scheme: dark) {
    .contact-section {
      background-color: #1a1a1a;
      border-radius: 0;
    }

    .contact-option {
      background-color: #242424;
      border-color: rgba(255, 255, 255, 0.1);
    }

    .contact-option .value {
      color: rgba(255, 255, 255, 0.7);
    }
  }
</style>
