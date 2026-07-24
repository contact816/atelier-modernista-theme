(() => {
  "use strict";

  const SELECTORS = {
    section: "[data-atelier-circle]",
    form: "[data-atelier-circle-form]",
    email: "[data-atelier-circle-email]",
    consent: "[data-atelier-circle-consent]",
    submit: "[data-atelier-circle-submit]",
    error: "[data-atelier-circle-error]",
    success: "[data-atelier-circle-success]"
  };

  class AtelierCircle {
    constructor(section) {
      this.section = section;
      this.form = section.querySelector(SELECTORS.form);

      if (!this.form) return;

      this.emailInput = this.form.querySelector(SELECTORS.email);
      this.consentInput = this.form.querySelector(SELECTORS.consent);
      this.submitButton = this.form.querySelector(SELECTORS.submit);
      this.errorMessage = this.form.querySelector(SELECTORS.error);
      this.successMessage = this.form.querySelector(SELECTORS.success);

      this.klaviyoPublicKey = section.dataset.klaviyoPublicKey;
      this.klaviyoListId = section.dataset.klaviyoListId;
      this.customerTag = section.dataset.customerTag || "Atelier Circle";

      this.originalButtonText = this.submitButton
        ? this.submitButton.textContent.trim()
        : "Join the Circle";

      this.bindEvents();
    }

    bindEvents() {
      this.form.addEventListener("submit", (event) => {
        this.handleSubmit(event);
      });
    }

    showError(message) {
      if (!this.errorMessage) return;

      this.errorMessage.textContent = message;
      this.errorMessage.hidden = false;
    }

    clearMessages() {
      if (this.errorMessage) {
        this.errorMessage.textContent = "";
        this.errorMessage.hidden = true;
      }

      if (this.successMessage) {
        this.successMessage.hidden = true;
      }
    }

    setSubmitting(isSubmitting) {
      if (!this.submitButton) return;

      this.submitButton.disabled = isSubmitting;
      this.submitButton.setAttribute(
        "aria-busy",
        isSubmitting ? "true" : "false"
      );

      this.submitButton.textContent = isSubmitting
        ? "Activating membership…"
        : this.originalButtonText;
    }

    validate() {
      const email = this.emailInput.value.trim();

      if (!email) {
        this.showError("Please enter your email address.");
        this.emailInput.focus();
        return null;
      }

      if (!this.emailInput.checkValidity()) {
        this.showError("Please enter a valid email address.");
        this.emailInput.focus();
        return null;
      }

      if (!this.consentInput.checked) {
        this.showError(
          "Please confirm that you would like to receive Atelier Circle emails."
        );
        this.consentInput.focus();
        return null;
      }

      return email;
    }

    async subscribeShopify(email) {
      const body = new URLSearchParams();

      body.append("form_type", "customer");
      body.append("utf8", "✓");
      body.append(
        "contact[tags]",
        `newsletter,${this.customerTag}`
      );
      body.append("contact[email]", email);
      body.append("contact[accepts_marketing]", "true");

      const response = await fetch("/contact", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error("Shopify registration failed.");
      }
    }

    async subscribeKlaviyo(email) {
      if (!this.klaviyoPublicKey || !this.klaviyoListId) {
        throw new Error("Klaviyo configuration is missing.");
      }

      const endpoint =
        "https://a.klaviyo.com/client/subscriptions/" +
        `?company_id=${encodeURIComponent(this.klaviyoPublicKey)}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          revision: "2026-04-15"
        },
        body: JSON.stringify({
          data: {
            type: "subscription",
            attributes: {
              profile: {
                data: {
                  type: "profile",
                  attributes: {
                    email,
                    properties: {
                      atelier_circle_member: true,
                      atelier_circle_source: "circle-page"
                    },
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: "SUBSCRIBED"
                        }
                      }
                    }
                  }
                }
              }
            },
            relationships: {
              list: {
                data: {
                  type: "list",
                  id: this.klaviyoListId
                }
              }
            }
          }
        })
      });

      if (!response.ok && response.status !== 202) {
        throw new Error("Klaviyo subscription failed.");
      }
    }

    showSuccess() {
      Array.from(this.form.children).forEach((element) => {
        if (
          element !== this.successMessage &&
          element !== this.errorMessage
        ) {
          element.hidden = true;
    element.style.display = "none";
        }
      });

      if (this.errorMessage) {
        this.errorMessage.hidden = true;
      }

      if (this.successMessage) {
        this.successMessage.hidden = false;
        this.successMessage.focus();
      }
    }

    async handleSubmit(event) {
      event.preventDefault();
      this.clearMessages();

      const email = this.validate();

      if (!email) return;

      this.setSubmitting(true);

      try {
        await this.subscribeShopify(email);
        await this.subscribeKlaviyo(email);

        this.showSuccess();
      } catch (error) {
        console.error("Atelier Circle signup error:", error);

        this.showError(
          "We could not activate your membership. Please try again, or email antonia@ateliermodernista.com."
        );

        this.setSubmitting(false);
      }
    }
  }

  function initialise(container = document) {
    const sections = container.querySelectorAll(
      `${SELECTORS.section}:not([data-atelier-circle-ready])`
    );

    sections.forEach((section) => {
      section.dataset.atelierCircleReady = "true";
      new AtelierCircle(section);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initialise();
  });

  document.addEventListener("shopify:section:load", (event) => {
    initialise(event.target);
  });
})();