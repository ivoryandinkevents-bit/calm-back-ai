# Calm Back — Brand Voice AI service

**Purpose:** Productised offer — Brand Supersheet + AI workflow service
**Status:** Active build
**Stack:** React + TypeScript + Vite

## Critical context

- This is a PAID PRODUCT, not internal Calm Back tooling. Customers buy it.
- Per `project_brand_voice_ai_service` memory: productised Brand Supersheet + AI workflow.
- Voice rules apply — see `~/calmback/CLAUDE.md` — but the product itself is sold to other businesses, so output for customers should match THEIR voice, not Calm Back's.

## Most relevant skills

- `review` / `security-review` for code
- `copy` only for Calm Back-facing product copy (sales page, onboarding emails, etc.) — NOT for the product's customer-facing outputs
- `claude-api` if the product uses the Anthropic SDK
- `high-end-visual-design` for the product UI

## What to never do

- Ship customer-facing output that sounds like Gemma. The product respects each customer's voice.
- Push to production without explicit "ship it".
- Hardcode Gemma's brand colours / fonts into the customer-facing surface. The customer's brand wins.

## Pricing / commercial

See auto-memory `project_calmback_offers` for where this sits in the offer suite and pricing.
