# Restore: Atelier Circle

Branch: `hide-atelier-circle`. Nothing was deleted. Everything below can be put back.

**Quickest full restore:** revert these six commits (newest first):

```bash
git revert 30d4ec0 66d5752 879192b f080692 ba6636c db7cd5a
```

New delivery line used in this work:
> Free UK delivery on orders over £75. £2.95 standard UK delivery under £75.

---

## 1. Product page points box (`db7cd5a`)

- **File:** `snippets/am-products-points.liquid`
- **What was done:** the whole box (link, copy and script) is wrapped in `{% if false %} ... {% endif %}`, with a `CIRCLE-HIDDEN` comment on the line above.
- **To restore:** delete the `CIRCLE-HIDDEN` comment line, the `{% if false %}` line and the final `{% endif %}` line.
- No wording changed.

## 2. Cart points box (`ba6636c`)

- **File:** `snippets/am-cart-points.liquid`
- **What was done:** same as job 1. The box is wrapped in `{% if false %} ... {% endif %}` with a `CIRCLE-HIDDEN` comment above it.
- **To restore:** delete those three lines.
- No wording changed.

## 3. Product-style sign-up block (`f080692`)

- **File:** `templates/product.product-style.json`
- **Block:** `custom_liquid_hRWYcw` (the "Join The Atelier Circle" box)
- **What was done:** added `"disabled": true`.
- **To restore:** remove that line, or switch the block back on in the theme editor.
- No wording changed.

## 4. Delivery text on product pages (`879192b`)

### FAQ answer 5 (`faq_a5`)

Files: `product.product-style.json`, `product.jewellery.json`, `product.earrings.json`, `product.designers.json`

**Original:**
> Orders dispatch within 1-2 days. Standard UK delivery costs £3.95, or is free for Atelier Circle members, and arrives within 1-4 days of dispatch. Express UK delivery is available for £7.95.

**New:**
> Orders dispatch within 1-2 days. Free UK delivery on orders over £75. £2.95 standard UK delivery under £75. Delivery arrives within 1-4 days of dispatch. Express UK delivery is available for £7.95.

### Shipping tab (`collapsible_tab_Qga4GX`)

File: `product.product-style.json`

**Original:**
```html
<p>Free standard UK delivery for Atelier Circle members. £3.95 UK standard delivery for non-members.</p><p>Delivery in 1-4 days.</p><p>Express delivery available for £7.95.</p>
```

**New:**
```html
<p>Free UK delivery on orders over £75. £2.95 standard UK delivery under £75.</p><p>Delivery in 1-4 days.</p><p>Express delivery available for £7.95.</p>
```

## 5. Cart note (`66d5752`)

- **File:** `locales/en.default.json`, under `sections.cart`
- **Changed (8 keys):**
  - `duties_and_taxes_included_shipping_at_checkout_with_policy_html`
  - `duties_and_taxes_included_shipping_at_checkout_without_policy`
  - `taxes_included_shipping_at_checkout_with_policy_html`
  - `taxes_included_shipping_at_checkout_without_policy`
  - `duties_included_taxes_at_checkout_shipping_at_checkout_with_policy_html`
  - `duties_included_taxes_at_checkout_shipping_at_checkout_without_policy`
  - `taxes_at_checkout_shipping_at_checkout_with_policy_html`
  - `taxes_at_checkout_shipping_at_checkout_without_policy`

**Original:**
> Free standard UK delivery for Atelier Circle members. £3.95 UK standard delivery for non-members.

The four `_with_policy_html` keys also end with ` <a href="{{ link }}">Shipping policy</a>`. That link was kept unchanged.

**New:**
> Free UK delivery on orders over £75. £2.95 standard UK delivery under £75.

## 6. Featured-product line (`30d4ec0`)

- **File:** `locales/en.default.json`
- **Key:** `products.product.shipping_policy_html`

**Original:**
> Free UK Shipping.

**New:**
> Free UK delivery over £75.

---

## Not touched (still mention the Circle)

- `templates/page.nw3.json`
- `templates/page.atelier-modernista-alb.json`
- The Circle page: `templates/page.atelier-circle.json`, `sections/atelier-circle.liquid`, `sections/am-circle-rewards.liquid`
- The subscription collection
- The Arsenal page
- The "Free gift wrap over £75" line
- `layout/theme.liquid`
- Everything wishlist-related
