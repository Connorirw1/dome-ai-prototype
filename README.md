# Dome AI Prototype

A local, dependency-free prototype of a 50-state legislative tracking workspace for multi-client lobbying and public-affairs firms.

## Prototype surfaces

- Personal dashboard and legislative alerts
- Issue workspaces with themes, clients, a 50-state heatmap, configurable views, and change review
- Client and keyword management
- Legislative search and bill previews
- Full bill workspaces with history, text, client impact, stakeholders, and collaboration
- Reports and settings
- Resumable firm setup from Settings: clients, issues and themes, keywords, state coverage, invitation drafts, and a review step
- Shared, actionable object model for bills, legislators, committees, clients, issues, themes, users, and related records

## Run locally

Open `index.html` in a modern browser. The prototype uses static HTML, CSS, and JavaScript and does not require a build step.

Most sample data and changes are stored in memory. Firm setup drafts and the records created by setup persist in this browser using local storage; issue-table edits also persist locally. Browser storage is separate for local files, localhost, and the hosted prototype.

## Firm setup

Open Settings → Start firm setup, or navigate to `#setup`. The six-step flow saves progress automatically and supports Save & exit, optional steps, and editing before completion. Finishing adds clients, issues, themes, keywords, and initial client profiles to the existing demo dataset without clearing it. Matching names reuse existing records; repeated completion does not duplicate them. Revisiting setup is additive, so removing a selection does not delete an existing workspace object.

The dashboard shows the completed configuration and sample bill suggestions filtered by selected issues and states. Suggestions do not confirm client relevance or start tracking. Invitation drafts do not send email or grant access. Firm coverage is a saved preference used for these suggestions, not a live ingestion configuration. Authentication, actual invitations, live matching, and organization-wide persistence are future backend work.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the proposed production domain model, application layers, AI foundation, change-event system, and implementation sequence.
