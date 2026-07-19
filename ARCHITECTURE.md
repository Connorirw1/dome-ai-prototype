# Dome prototype architecture

## Product surfaces

- **Dashboard** — a user-scoped alert inbox assembled from issue, client, keyword, bill, and assignment relationships.
- **Issues** — policy workspaces. An issue may represent an industry or a topic and can relate to many clients, keywords, and bills.
- **Clients** — organization workspaces with relationship owners, team assignments, issues, keywords, and tracked bills.
- **Keywords** — reusable tracking rules attached to an issue, a client, or neither. A later version should support Boolean groups and exclusions.
- **Search** — a global discovery surface for bills and legislators. Saved results become tracked bills; search itself should remain broader than a user's assignments.
- **Reports** — client-ready briefings and scheduled digests assembled from live issues, bills, alerts, and annotations.
- **Settings** — organization profile, team access, notification defaults, integrations, and legislative coverage preferences.

## Core domain model

```text
Organization
 └── Objects
      ├── Users ──< Assignments >── Clients
      │                         └── Issues
      ├── Clients >──< Issues
      ├── Keywords ──> Client | Issue | Standalone
      ├── TrackedBills >── Client | Issue
      ├── Reports ──> Client + Issues + Bills
      ├── Relationships ──> Other Objects
      ├── Actions + Comments + Mentions + Followers
      └── ActivityEvents ──> Alerts

Jurisdiction ──< LegislativeSession ──< Bill ──< BillEvent
Legislator ──< Sponsorship >───────────────┘
```

Each domain record remains in a typed table. A shared object registry supplies stable identity, deep links, relationships, permissions, collaboration, and activity behavior without turning domain data into unstructured generic records.

## Product invariants

1. **Everything is linked.** Bills, legislators, issues, clients, keywords, reports, and users have stable object identities and can be opened from every surface where they appear.
2. **Everything is actionable.** Any object can carry priority, followers, comments, mentions, assigned actions, deadlines, tags, and an activity history.
3. **Context is preserved.** Related objects open in a shared detail surface first so users can inspect and act without losing their current list, report, or dashboard position. Full-page routes support deeper work.
4. **Signal precedes detail.** Object views lead with what changed, why it matters, affected clients, and required action. Complete source data remains available through progressive disclosure.
5. **Human and system activity share one model.** Legislative events, keyword matches, comments, mentions, assignments, and report changes produce typed activity events that can feed the personal inbox.

## First-class object catalog

### Workspace and intelligence

- `Client`, `ClientProfile`, `ImpactAssessment`, `Issue`, `Theme`, `Keyword`, `User`
- `Report`, `ReportTemplate`, `SavedSearch`
- `Position` — a client-specific stance on a bill, amendment, regulation, or issue

Themes are reusable organization-owned analytical classifications between Issues and Keywords. Issues provide workspace scope, client relationships, access, and ownership; Themes describe narrower policy concepts; Keywords remain detection rules. Themes may relate to multiple Issues when a concept crosses policy areas.

```text
Issue >──< Theme >──< Keyword
               ├──< Bill
               ├──< Client
               └──< ReportSection
```

Keyword tracking scope (`Organization`, `Client`, or `Issue`) is separate from Theme classification. Bill–Theme assignments retain whether they were manual, keyword-derived, imported, AI-suggested, or user-confirmed.

### Issue analysis workspace

An Issue workspace combines a geographic aggregation with configurable database views. The heatmap is derived from Bill–Issue relationships and can be narrowed by both Theme and Client without duplicating bill records. Selecting a state applies a temporary view filter rather than creating a separate page.

Saved `IssueView` configurations retain the base view type, visible columns, column order, filters, sorting, grouping, and owner or organization visibility. High-level views operate on state-level analytical summaries; detailed views operate on linked bills and other policy actions. Statutory license triggers remain shared legal facts, while client applicability remains a separate assessment.

```text
Issue + optional Theme + optional Client
                    ├── aggregate by Jurisdiction ──> Heatmap
                    ├── StateAnalysisSnapshot ──────> High-level view
                    └── Bill / PolicyAction ─────────> Detailed view
```

### Legislative

- `Bill`, `BillVersion`, `Amendment`
- `Legislator`, `Committee`, `Hearing`, `Vote`
- `Jurisdiction`, `LegislativeSession`, `Chamber`

`LegislativeSession` must support multiple dated periods rather than a single in/out flag. Session periods include regular session, recess, veto session, and special session. The session model also retains convening and adjournment dates, introduction and crossover deadlines, prefiling windows, chamber-specific calendars, announcements, the next important date, source attribution, and last-verified timestamps. The Dashboard exposes a compact states-in-session summary linked to the complete 50-state calendar.

State references use one shared session-status component across bills, alerts, hearings, search filters, calendars, and object details. This keeps the status vocabulary, color treatment, accessible label, next-date tooltip, and source data consistent everywhere a jurisdiction appears.

### Bill workspace

Selecting a Bill opens the shared object preview first so users retain their dashboard, issue table, report, or search context. The preview owns the current signal, next event, compact client impacts, three most recent legislative events, and workflow actions. A stable full-page Bill route supports deeper work.

The full Bill workspace separates information by ownership: Overview contains the current interpretation and metadata; History contains legislative actions; Text & Versions contains source language, amendments, and comparisons; Clients & Positions contains client-specific analysis; Stakeholders contains people, committees, hearings, and engagements; Activity contains team comments, assignments, decisions, and audit events. The same fact is referenced rather than copied between tabs.

```text
Bill
├── BillVersion ──< Amendment
├── LegislativeAction ──> Hearing / Vote / ExecutiveAction
├── Sponsor ──< Committee
├── Issue ──< Theme
├── ImpactAssessment ──> ClientProfileVersion
├── ClientPosition
└── Action / Comment / ActivityEvent / Document
```

### People and organizations

- `Person` as shared identity, with typed profiles for legislators, legislative staff, agency officials, client contacts, and external stakeholders
- `Organization` with roles such as client, government body, agency, coalition, advocacy group, trade association, or partner

### Workflow and evidence

- `Action`, `Engagement`, `Document`, `Comment`
- Engagement types include meetings, calls, emails, testimony, outreach, coalition meetings, and client briefings
- Documents retain source, version, publication date, permissions, and relationships to the objects they support

Comments and mentions are linkable collaboration records, but do not require the same full detail-page treatment as bills, committees, hearings, positions, engagements, or documents.

### Expansion-ready policy objects

- `Agency`, `Regulation`, `Rulemaking`, `ExecutiveOrder`
- `BallotMeasure`, `AttorneyGeneralAction`, `CourtCase`
- `Ordinance`, `ProcurementOpportunity`

These types should use the same object identity, relationship, collaboration, and activity contracts when product scope expands beyond state legislation. They do not need production tables until their corresponding data sources and workflows are in scope.

## AI intelligence architecture

AI output is represented as versioned, evidence-backed, reviewable domain objects. It is never stored only as ephemeral prose.

### Client context

`ClientProfile` is a versioned object containing structured facts about industry, business model, products and services, markets, customers, operations, key competencies, regulated activities, strategic priorities, policy sensitivities, and risk preferences. Each fact retains its source, author, verification status, effective date, confidentiality, confidence, and last-reviewed timestamp.

### Client impact assessment

```text
ClientProfileVersion ──┐
BillVersion ───────────┼──> ImpactAssessment
Themes + Evidence ─────┘          ├── AssessmentFindings
                                  ├── Evidence + Assumptions
                                  ├── Human Review + Feedback
                                  ├── Actions + Comments
                                  └── ReportSections + Alerts
```

`ImpactAssessment` is a first-class object connecting one Client and one specific BillVersion. Structured fields include direction, materiality, likelihood, time horizon, affected business areas, operational/financial/compliance/competitive/reputational impact, opportunities, recommendations, confidence, and review state.

Assessment lifecycle:

```text
Candidate → Queued → Generated → Needs review → Approved | Dismissed → Stale
```

An assessment becomes stale when its BillVersion, ClientProfileVersion, evidence set, model configuration, or prompt configuration changes.

### Assessment pipeline

1. Candidate matching uses jurisdiction, Issue, Theme, Keyword, client market, regulatory exposure, and existing Position relationships.
2. Only candidates above a configurable relevance threshold receive a full assessment.
3. Retrieval is restricted to sources the current user and client context are authorized to access.
4. Generated output must pass a structured schema and cite bill language plus client-profile facts for every material finding.
5. A human reviewer approves, edits, or dismisses findings before they are used as organizational analysis or client advice.
6. Approved findings may produce Alerts, Actions, dashboard signals, search facets, and versioned ReportSections.

Every generation retains model and prompt versions, input object versions, retrieved evidence, validation results, trigger, timestamps, cost metadata, and an input fingerprint. Human corrections are stored as structured feedback without implying permission to train on client data.

Tenant isolation applies before retrieval. Client context may never cross client or organization permission boundaries merely because objects share an Issue or Theme.

## Change awareness and issue freshness

Issue workspaces use an event-backed change model so “new” is personal, explainable, and reviewable rather than a transient visual badge.

- `ChangeEvent` records the affected object and field, previous and current values, change category, effective time, ingestion time, actor, source, and provenance. Legislative source changes, schedule changes, team edits, and approved AI findings share this contract.
- `ObjectVersion` preserves restorable snapshots for important user-authored analysis, state summaries, positions, notes, and report content.
- `UserReadState` stores each user’s latest reviewed event cursor by Issue and saved view. Opening an Issue does not automatically mark every event as reviewed.
- `Subscription` connects a user to the Issues, Themes, Clients, states, bills, and event categories they follow. This scopes summaries and notifications to assigned work.
- `Notification` represents delivery of a relevant event to an inbox, digest, or future external channel without duplicating the underlying change.
- `DataSync` records provider health, source timestamps, synchronization runs, validation results, and errors so every derived freshness indicator can be explained.

Incoming changes are staged while a user is actively viewing a table. The client receives a new-event count and applies the refreshed result set on request, preventing rows from reordering underneath the user. Heatmap badges, table-row markers, field-level diffs, and the Issue update feed are projections of the same `ChangeEvent` records and `UserReadState` cursor.

## Recommended application layers

1. **Ingestion** — normalize bill, vote, hearing, legislator, and session data from a commercial 50-state source. Preserve the provider's source IDs and raw payload references.
2. **Policy intelligence** — keyword matching, relevance scoring, issue classification, deduplication, and material-change detection.
3. **Workspace** — organizations, users, roles, clients, issues, assignments, notes, tags, and tracked bills.
4. **Alerts** — convert bill events and keyword matches into user-scoped inbox items; add email and digest delivery later.
5. **Search** — use a dedicated search index for full-text bill and legislator search, facets, highlighting, and saved queries.
6. **Object platform** — stable object identity, typed relationships, activity events, comments, mentions, actions, priorities, followers, permissions, and deep links.
7. **Reporting** — reusable templates, composable sections, client-bound data rules, immutable published versions, export, scheduling, and delivery.
8. **Web application** — keep shared navigation, object surfaces, and design primitives separate from route-level features; use one data-access layer so mock records can be replaced by APIs without rewriting views.
9. **AI orchestration** — candidate retrieval, governed model access, structured generation, evidence resolution, human review, feedback, evaluation, and monitoring.

## Suggested first production schema

- `organizations`, `users`, `memberships`
- `clients`, `issues`, `client_issues`
- `themes`, `issue_themes`, `theme_keywords`, `bill_themes`, `client_themes`
- `assignments` with `user_id`, `assignable_type`, `assignable_id`
- `keywords` with `scope_type`, `scope_id`, `match_type`, `expression`
- `jurisdictions`, `sessions`, `legislators`, `bills`, `bill_events`, `sponsorships`
- `chambers`, `committees`, `committee_memberships`, `committee_staff`
- `hearings`, `hearing_bills`, `hearing_participants`
- `bill_versions`, `amendments`, `votes`, `vote_records`
- `tracked_bills` with optional `client_id` and `issue_id`
- `keyword_matches`, `alerts`, `alert_reads`
- `objects`, `object_relationships`, `object_permissions`
- `comments`, `mentions`, `actions`, `tags`, `object_tags`, `followers`, `activity_events`
- `change_events`, `object_versions`, `user_read_states`, `subscriptions`, `notifications`
- `data_sources`, `data_sync_runs`, `data_sync_errors`
- `people`, `person_roles`, `organizations`, `organization_roles`, `organization_people`
- `positions`, `engagements`, `engagement_participants`, `documents`, `document_versions`
- `saved_searches`, `saved_search_shares`
- `report_templates`, `report_template_sections`, `reports`, `report_sections`
- `report_versions`, `report_exports`, `report_deliveries`
- `client_profiles`, `client_profile_versions`, `client_profile_facts`, `client_profile_sources`
- `client_markets`, `client_capabilities`, `client_policy_interests`
- `impact_assessments`, `assessment_findings`, `assessment_evidence`, `assessment_assumptions`
- `assessment_runs`, `assessment_reviews`, `assessment_feedback`
- `ai_workflow_configs`, `model_configs`, `prompt_versions`, `evaluation_cases`, `evaluation_results`

Every workspace-owned table should include `organization_id`. Authorization should enforce organization isolation first, then role and assignment-based access.

## Prototype behavior

The current build is intentionally local and dependency-free. Sample records live in `app.js`. Create, edit, delete, comments, priorities, and actions mutate in-memory state; refreshing restores the sample dataset. Hash routes make primary surfaces and object detail states directly addressable. The shared object drawer demonstrates relationship traversal and collaboration without losing list context. The next implementation step is to move the domain and collaboration records behind a typed API and persistent database while preserving these view contracts.

## Build sequence

1. Add authentication, organizations, roles, typed object identity, and stable full-page routes.
2. Persist clients, issues, keywords, relationships, assignments, comments, actions, mentions, priorities, and activity events.
3. Persist tracked bills and ship the first client → issue → bill → action → report vertical slice.
4. Build the initial report builder with templates, modular sections, drafts, and immutable versions.
5. Connect one legislative data provider and build jurisdiction/session normalization, keyword matches, and inbox alerts.
6. Add full-text search, saved searches, email digests, exports, scheduling, and client-facing sharing.
