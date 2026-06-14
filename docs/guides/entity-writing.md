# Entity Writing Guide

## Goal

Write entities in the right place first. For this project, that means:

- product entities go in the database
- minimal ownership state goes onchain
- API connects the two

Do not try to put the whole product model into Solidity.

## 1. Split the system first

Before writing any schema or contract, split responsibilities into 3 layers.

### Database

Put these in DB:

- `User`
- `Collection`
- `Card`
- `CardVersion`
- `OwnershipHistory`
- `ClaimRequest`
- scan logs
- anti-counterfeit verification logs

Why:

- these are product entities
- they need flexible queries
- they will change often
- some contain private or operational data

### Onchain

Put only minimal shared truth onchain:

- `tokenId`
- `owner`
- `issuer`
- `currentVersion`
- optional replacement / active status

Why:

- this is the verifiable ownership layer
- this state should be small and stable

### API / Backend

Use backend to handle:

- Google login session
- claim approval
- lost report
- replacement flow
- gas sponsorship / relayer
- authenticity check
- DB <-> chain sync

## 2. Write the DB entities first

Start with only these 3:

1. `Card`
2. `CardVersion`
3. `OwnershipHistory`

This is the smallest useful core.

### Card

Meaning:

- one collectible identity inside a collection
- example: `SGP-2026 #001/099`

What it should represent:

- the long-lived identity of the card
- not one physical print

Write fields like this:

- `id`: DB primary key
- `collection_id`: which collection it belongs to
- `token_id`: linked onchain NFT id
- `serial_number`: numeric serial like `1`
- `serial_display`: display serial like `001/099`
- `edition_size`: total supply like `99`
- `current_owner_user_id`: current product owner
- `current_version_id`: currently valid physical version
- `status`: business lifecycle status
- `claim_status`: whether user already claimed it
- `created_at`
- `updated_at`

Recommended extra fields:

- `public_slug`
- `minted_at`
- `claimed_at`
- `last_transfer_at`
- `last_scanned_at`

Rule:

- one `Card` must survive claim, transfer, loss, and replacement

### CardVersion

Meaning:

- one physical version of the card
- example: original card is `v1`, replacement card is `v2`

Write fields like this:

- `id`
- `card_id`
- `version_number`
- `nfc_tag_uid`
- `nfc_url`
- `status`
- `printed_at`
- `activated_at`
- `replaced_at`

If you want anti-counterfeit support later, reserve:

- `nfc_serial`
- `chip_public_key`
- `anti_clone_mode`

Rule:

- replacement creates a new `CardVersion`, not a new `Card`

### OwnershipHistory

Meaning:

- append-only event log for ownership and state transitions

Write fields like this:

- `id`
- `card_id`
- `from_user_id`
- `to_user_id`
- `event_type`
- `tx_hash`
- `price_amount`
- `price_token`
- `card_version_id`
- `created_at`
- `memo`

Recommended `event_type` values:

- `mint`
- `claim`
- `transfer`
- `lost_report`
- `replacement`

Rule:

- never overwrite history rows
- only append new events

## 3. Then write minimal onchain state

After DB entities are clear, write the contract around the DB model, not the other way around.

Minimal Solidity state should look conceptually like:

- `tokenId => owner`
- `tokenId => issuer`
- `tokenId => currentVersion`

Optional:

- `tokenId => replaced`

Minimal actions:

- issuer mint
- issuer-assisted claim
- owner transfer
- issuer replacement version update

Do not put these fully onchain:

- Google account identity
- claim request workflow
- scan history
- issuer dashboard data
- anti-counterfeit logs

## 4. Writing order

Use this order.

1. Write `Card`
2. Write `CardVersion`
3. Add foreign key from `Card.current_version_id`
4. Write `OwnershipHistory`
5. Only then design the contract state

This avoids the common mistake of designing the contract too early.

## 5. Practical rule for this project

If a field answers:

- "what does the product UI need?"
- "what does ops/admin need?"
- "what should we filter/search/audit?"

it probably belongs in DB.

If a field answers:

- "what must be publicly verifiable?"
- "what affects token ownership truth?"

it may belong onchain.

## 6. What you should write next

Your next writing task should be:

1. a Prisma version of `Card`
2. a Prisma version of `CardVersion`
3. a Prisma version of `OwnershipHistory`
4. a note mapping `Card.token_id` to Solidity `tokenId`

After that, write the minimal Solidity storage design.
