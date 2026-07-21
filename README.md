# Trailcraft: The Living Landscape

A browser strategy simulation about planning, negotiating, building and managing sustainable recreational trails in Ireland.

## Play

https://andrewlinn957.github.io/trailcraft/

## Current systems

- interactive route drawing, closure, rerouting and later adaptation
- uncertain surveys, hidden ownership and construction-cost ranges
- stateful landowner negotiations and binding commitments
- segment-level trail classes and whole-trail grading
- commission objectives, planning deadlines and funding consequences
- separate capital and operating budgets, including contingency and sunk costs
- construction programmes with mobilisation, parallel crews, facility critical paths, weather allowances and sensitive-season holds
- temporary event closures that expire on schedule, create visible reopening tasks and can be inspected and reopened early
- visitors, demand, weather, defects, incidents and reputation
- inspections, drainage, repairs and preventable maintenance failures
- conditional events and repeatable five-year management cycles
- desktop, mobile and keyboard-accessible map controls

## Construction and closure update

Construction is no longer instantaneous. Initial works and retrofits add programme weeks, display a critical-path estimate before approval and affect delivery or adaptation downtime. Corridor work and trailhead facilities can proceed concurrently, while sensitive sites can trigger seasonal holds and high-risk routes carry weather allowance.

Event-driven closures now have an explicit duration. One-season closures reopen automatically after that season; longer closures appear in the Operations panel with time remaining and an early-reopening inspection action. Manual closures remain open until the player resolves them. All closures are counted in management history, and unresolved closures reduce final Management, Standards and Appeal scores.

## Files

- `index.html` – GitHub Pages entry point
- `loader.js` – reconstructs the self-contained production bundle
- `styles.css` and `v3.css` – application styling
- `data/v3-01.txt` … `data/v3-12.txt` – compressed production game payload

No server or database is required.

## Content basis

This is an original educational adaptation based on the supplied 2026 trail-planning training deck and *A Guide to Planning and Developing Recreational Trails in Ireland*. It is not an official Sport Ireland assessment or accreditation tool.
