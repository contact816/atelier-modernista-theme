(() => {
  "use strict";

  const SELECTORS = {
    section: "[data-atelier-circle]",
    form: "[data-atelier-circle-form]",
    email: "[data-atelier-circle-email]",
    consent: "[data-atelier-circle-consent]",
    submit: "[data-atelier-circle-submit]",
    error: "[data-atelier-circle-error]",
    success: "[data-atelier-circle-success]",
    modal: "[data-atelier-circle-modal]",
    modalBackdrop: "[data-atelier-circle-modal-backdrop]",
    modalDialog: "[data-atelier-circle-modal-dialog]",
    modalClose: "[data-atelier-circle-modal-close]"
  };

  const REQUEST_TIMEOUT_MS = 8000;

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

      this.modal = section.querySelector(SELECTORS.modal);
      this.modalBackdrop = this.modal
        ? this.modal.querySelector(SELECTORS.modalBackdrop)
        : null;
      this.modalDialog = this.modal
        ? this.modal.querySelector(SELECTORS.modalDialog)
        : null;
      this.modalClose = this.modal
        ? this.modal.querySelector(SELECTORS.modalClose)
        : null;

      this.klaviyoPublicKey = section.dataset.klaviyoPublicKey;
      this.klaviyoListId = section.dataset.klaviyoListId;
      this.customerTag = section.dataset.customerTag || "Atelier Circle";

      this.originalButtonText = this.submitButton
        ? this.submitButton.textContent.trim()
        : "Join the Circle";

      this.handleKeydown = this.handleKeydown.bind(this);

      this.bindEvents();
    }

    bindEvents() {
      this.form.addEventListener("submit", (event) => {
        this.handleSubmit(event);
      });

      if (this.modalClose) {
        this.modalClose.addEventListener("click", () => this.closeModal());
      }

      if (this.modalBackdrop) {
        this.modalBackdrop.addEventListener("click", () => this.closeModal());
      }
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

    // Wraps fetch with a hard timeout so a stalled request can never
    // leave the button stuck on "Activating membership…" forever.
    async fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    }

    async subscribeShopify(email) {
      const body = new URLSearchParams();

      body.append("form_type", "customer");
      body.append("utf8", "✓");
      body.append("contact[tags]", `newsletter,${this.customerTag}`);
      body.append("contact[email]", email);
      body.append("contact[accepts_marketing]", "true");

      const response = await this.fetchWithTimeout("/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error("Shopify registration failed.");
      }
    }

    // Klaviyo is best-effort: it drives email flows, not membership
    // status. If it's blocked (ad blockers commonly block a.klaviyo.com
    // as a tracker) or times out, we log it but do NOT block the
    // success state — the Shopify tag above is what actually grants
    // membership and free shipping.
    async subscribeKlaviyo(email) {
      if (!this.klaviyoPublicKey || !this.klaviyoListId) {
        console.warn("Atelier Circle: Klaviyo configuration is missing.");
        return;
      }

      const endpoint =
        "https://a.klaviyo.com/client/subscriptions/" +
        `?company_id=${encodeURIComponent(this.klaviyoPublicKey)}`;

      try {
        const response = await this.fetchWithTimeout(endpoint, {
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
          console.warn(
            "Atelier Circle: Klaviyo subscription responded with",
            response.status
          );
        }
      } catch (error) {
        // Swallow: Klaviyo failing (timeout, blocked, offline) must
        // never prevent the customer from seeing a successful signup.
        console.warn(
          "Atelier Circle: Klaviyo subscription failed silently.",
          error
        );
      }
    }

    handleKeydown(event) {
      if (event.key === "Escape") {
        this.closeModal();
      }
    }

    openModal() {
      if (!this.modal) return;

      this.modal.hidden = false;
      this.modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", this.handleKeydown);

      if (this.modalDialog) {
        this.modalDialog.focus();
      }
    }

    closeModal() {
      if (!this.modal) return;

      this.modal.hidden = true;
      this.modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", this.handleKeydown);
    }

    showSuccess() {
      Array.from(this.form.children).forEach((element) => {
        if (element !== this.successMessage && element !== this.errorMessage) {
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

      // Always reset the button state, even though it's now hidden —
      // guards against any future markup change re-exposing it.
      this.setSubmitting(false);

      // The celebratory popup is the primary moment; the inline
      // message above remains underneath as a persistent confirmation
      // once the popup is closed.
      this.openModal();
    }

    async handleSubmit(event) {
      event.preventDefault();
      this.clearMessages();

      const email = this.validate();

      if (!email) return;

      this.setSubmitting(true);

      try {
        // Shopify is the source of truth for membership — it must
        // succeed before we show success at all.
        await this.subscribeShopify(email);

        // Klaviyo runs alongside but can never block or fail the flow.
        await this.subscribeKlaviyo(email);

        this.showSuccess();
      } catch (error) {
        console.error("Atelier Circle signup error:", error);

        const message =
          error && error.name === "AbortError"
            ? "That took longer than expected. Please check your connection and try again, or email antonia@ateliermodernista.com."
            : "We could not activate your membership. Please try again, or email antonia@ateliermodernista.com.";

        this.showError(message);
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