# Restore: Atelier Circle (v2)

- **Branch:** `hide-atelier-circle-v2`
- **Built from:** `claude/sweet-sagan-591h1g` at `74ccab3` (the live theme's branch)
- Nothing was deleted. Everything below can be put back.

**Quickest full restore:** revert these four commits (newest first):

```bash
git revert 26c7248 384a4e3 99e87d2 869c68c
```

---

## Job 1: Product page points box (`869c68c`)

**`snippets/am-products-points.liquid`**
- **What was done:** the whole box (link, copy and script) is wrapped in `{% if false %} ... {% endif %}`, with a `CIRCLE-HIDDEN` comment on the line above.
- **Effect:** this hides the box in both places it appeared:
  - under Add to Bag (via `snippets/buy-buttons.liquid`)
  - the separate "points box" block (via `sections/main-product.liquid`)
- **To restore:** delete the `CIRCLE-HIDDEN` comment line, the `{% if false %}` line and the final `{% endif %}` line.

**`templates/product.product-style.json`**
- **What was done:** block `am_points_box` got `"disabled": true`, so it no longer leaves an empty wrapper on the page.
- **To restore:** remove that line, or switch the block back on in the theme editor.

No wording changed in this job.

## Job 2: Cart points box (`99e87d2`)

**`snippets/am-cart-points.liquid`**
- **What was done:** the box is wrapped in `{% if false %} ... {% endif %}`, with a `CIRCLE-HIDDEN` comment above it.
- **Where it showed:** the cart page and the cart drawer.
- **To restore:** delete those three lines.

No wording changed in this job.

## Job 3: Product-style sign-up block (no commit)

The "Join The Atelier Circle" sign-up block (`custom_liquid_hRWYcw`) is **already gone from live**. No product template contains it, so nothing needed changing.

## Job 4: Delivery wording (`384a4e3`)

All prices and the threshold still come from **Theme settings > Delivery**. No figures were hard-coded.

### `snippets/am-delivery-line.liquid`

**Short style (line 27)**

Original:
```liquid
{%- if am_threshold != blank -%}Free on orders of {{ am_threshold }} or more, and for Atelier Circle members.{%- else -%}Free for Atelier Circle members.{%- endif -%}
```

New:
```liquid
{%- if am_threshold != blank -%}Free on orders of {{ am_threshold }} or more.{%- endif -%}
```

**Full style (line 39), used in the product Shipping tab**

Original:
```liquid
{%- if am_threshold != blank -%}Free on orders of {{ am_threshold }} or more, and always free for Atelier Circle members (free to join).{%- else -%}Always free for Atelier Circle members (free to join).{%- endif -%}
```

New:
```liquid
{%- if am_threshold != blank -%}Free on orders of {{ am_threshold }} or more.{%- endif -%}
```

**Text style (line 46), used in the FAQ, its JSON-LD and the gift guide pages**

Original:
```liquid
{%- if am_threshold != blank %} Free on orders of {{ am_threshold }} or more, and always free for Atelier Circle members (free to join).{%- else %} Always free for Atelier Circle members (free to join).{%- endif -%}
```

New:
```liquid
{%- if am_threshold != blank %} Free on orders of {{ am_threshold }} or more.{%- endif -%}
```

### `locales/en.default.json` (9 keys)

**Keys changed:**
- `products.product.shipping_policy_html` (line 191)
- `sections.cart.*` (lines 307–314):
  - `duties_and_taxes_included_shipping_at_checkout_with_policy_html`
  - `duties_and_taxes_included_shipping_at_checkout_without_policy`
  - `taxes_included_shipping_at_checkout_with_policy_html`
  - `taxes_included_shipping_at_checkout_without_policy`
  - `duties_included_taxes_at_checkout_shipping_at_checkout_with_policy_html`
  - `duties_included_taxes_at_checkout_shipping_at_checkout_without_policy`
  - `taxes_at_checkout_shipping_at_checkout_with_policy_html`
  - `taxes_at_checkout_shipping_at_checkout_without_policy`

**Original (all 9):**
```
{{ standard_price }} standard delivery. Free on orders of {{ free_threshold }} or more, and for Atelier Circle members.
```
The four `_with_policy_html` cart keys also end with ` <a href="{{ link }}">Shipping policy</a>`. That link was kept unchanged.

**New (all 9):**
```
{{ standard_price }} standard delivery. Free on orders of {{ free_threshold }} or more.
```

## Job 5: Homepage strip (`26c7248`)

**`templates/index.json`**
- **Section:** `am_circle_strip_hp01` (type `am-circle-strip`, named "AM — Circle Strip" in the editor)
- **What was done:** added `"disabled": true` (line 695).
- **Position:** the section stays in the homepage order, between "Explore By Colour" and "Own A Miró".
- **Untouched:** its settings and the file `sections/am-circle-strip.liquid`.
- No wording changed. For reference, the strip's live text was:
  - Heading: "Join the Atelier Circle"
  - Body: "£10 off, free standard UK shipping, and a handwritten note from Antonia. Free to join."
  - Button: "Join free"

**To turn it back on, use any one of these:**

1. **Theme editor (no code):**
   1. Go to Online Store > Themes.
   2. On this theme, click Customize.
   3. Open the Home page.
   4. In the left sidebar, find "AM — Circle Strip". It shows a crossed-out eye.
   5. Click the eye to show it.
   6. Click Save.
2. **Code:** in `templates/index.json`, delete the line `"disabled": true,` directly under `"type": "am-circle-strip",`.
3. **Git:** run `git revert 26c7248`.

---

## Deliberately not touched

- `templates/page.nw3.json`
- `templates/page.atelier-modernista-alb.json`
- The Circle page: `templates/page.atelier-circle.json`, `sections/atelier-circle.liquid`, `sections/am-circle-rewards.liquid`
- `layout/theme.liquid`
- Everything wishlist-related
- Other Circle mentions found on live, listed separately and still unchanged:
  - `am-gift-guide` default copy
  - the nav bar default
  - unused sections
