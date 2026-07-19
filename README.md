# Dome AI Prototype

A local, dependency-free prototype of a 50-state legislative tracking workspace for multi-client lobbying and public-affairs firms.

## Prototype surfaces

- Personal dashboard and legislative alerts
- Issue workspaces with themes, clients, a 50-state heatmap, configurable views, and change review
- Client and keyword management
- Legislative search and bill previews
- Full bill workspaces with history, text, client impact, stakeholders, and collaboration
- Reports and settings
- Shared, actionable object model for bills, legislators, committees, clients, issues, themes, users, and related records

## Run locally

Open `index.html` in a modern browser. The prototype uses static HTML, CSS, and JavaScript and does not require a build step.

Sample data and changes are stored in memory, so refreshing the browser restores the original dataset.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the proposed production domain model, application layers, AI foundation, change-event system, and implementation sequence.
