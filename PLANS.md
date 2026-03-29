# Implementation Plan: Complete End-to-End Documentation for Antigravity Web Testing

## Goal
Enhance the existing project document (`src/docs/the-architect-project-document.md`) to be a **complete, self-contained specification** that Antigravity can consume to test the web application end-to-end. Add missing operational details: UI element mapping, validation rules, error catalog, state transitions, test data fixtures, and web testing automation reference.

## Acceptance Criteria
1. Document is complete enough for Antigravity to test the web application
2. Includes full operation details for every feature

## Prior Plan (v0.2.0 — completed)
The previous PLANS.md milestones (M1–M8) for the multi-graph platform have been implemented. All features are live.

---

## Gap Analysis

The existing 772-line document covers architecture, features, use cases, JSON schema, system flows, and Antigravity integration. The following gaps were identified for complete Antigravity web testing:

| Gap | Impact | Section |
|-----|--------|---------|
| No UI element map (selectors, `data-testid` attributes) | Antigravity cannot locate interactive elements for automation | New §10 |
| No validation rules catalog with exact error messages | Testing cannot verify correct error handling | New §11 |
| No state transition documentation | Cannot verify state machine correctness | New §12 |
| No test data fixtures (sample requirements, sample JSON) | No ready-made test inputs | New §13 |
| No complete store API reference | Cannot verify all operations programmatically | Enhance §5 |
| No UI layout/zone documentation for visual testing | Cannot map screen regions to functional areas | New §10 |
| Missing `data-testid` inventory from actual code | Test selectors not documented | New §10 |

---

## Milestones

### M1: UI Element Map & Test Selectors (New Section 10)
**File**: `src/docs/the-architect-project-document.md`
**Action**: Append new section

Document every interactive UI element with:
- Element description and location (sidebar, toolbar, canvas, tabs)
- CSS selector or `data-testid` attribute (from actual code)
- Expected interaction (click, type, drag, double-click)
- Expected result after interaction

**Source files to reference**:
- `src/App.tsx` — layout zones, `data-testid` attributes (`import-json-btn`, `export-json-btn`, `export-png-btn`, `import-file-input`)
- `src/components/RequirementsPanel.tsx` — textarea + Generate button
- `src/components/ComponentPalette.tsx` — 8 component type buttons
- `src/components/PluginPalette.tsx` — 10 plugin component buttons
- `src/components/PropertiesPanel.tsx` — label/description inputs + delete button
- `src/components/GraphTabs.tsx` — tab buttons, "+" button, rename/delete controls
- `src/components/TemplateSelector.tsx` — 4 template buttons
- `src/components/SearchBar.tsx` — search input + results dropdown
- `src/components/ArchitectureCanvas.tsx` — React Flow canvas, MiniMap, Controls
- `src/components/ErrorBoundary.tsx` — fallback UI with reset button

**Layout zones to document**:
```
┌──────────────┬──────────────────────────────────────┐
│              │  Graph Tabs (top)                     │
│  Left        ├──────────────────────────────────────┤
│  Sidebar     │  Toolbar (stats + search + buttons)   │
│  (w-72)      ├──────────────────────────────────────┤
│              │  Canvas (React Flow)                   │
│              │                                        │
└──────────────┴──────────────────────────────────────┘
```

### M2: Validation Rules & Error Catalog (New Section 11)
**File**: `src/docs/the-architect-project-document.md`
**Action**: Append new section

Document every validation rule and error message:

**Import validation** (from `src/engine/importService.ts`):
| Validation | Error Message |
|------------|---------------|
| Invalid JSON syntax | `"Invalid JSON"` |
| Not an object | `"JSON must be an object"` |
| Missing components array | `"Missing or invalid "components" array"` |
| Missing connections array | `"Missing or invalid "connections" array"` |
| Invalid component at index N | `"Invalid component at index {N}"` |
| Invalid connection at index N | `"Invalid connection at index {N}"` |
| Unknown source reference | `"Connection "{id}" references unknown source "{source}"` |
| Unknown target reference | `"Connection "{id}" references unknown target "{target}"` |

**Component validation rules**:
- Each component must have: `id` (string), `type` (string), `label` (string), `description` (string), `x` (number), `y` (number)
- Each connection must have: `id` (string), `source` (string), `target` (string), `label` (string)

**UI validation / disabled states**:
- Export JSON/PNG buttons disabled when `graph.components.length === 0`
- Delete graph: if last graph deleted, workspace creates new "Untitled"
- Keyboard shortcuts disabled on `<input>`, `<textarea>`, `contentEditable`

### M3: State Transitions & Store API Reference (New Section 12)
**File**: `src/docs/the-architect-project-document.md`
**Action**: Append new section

Document complete state machine:

**Store State Shape** (from `src/store/graphStore.ts`):
```typescript
{
  graphs: GraphEntry[]          // All workspace graphs
  activeGraphId: string | null  // Currently displayed graph
  selectedComponentId: string | null  // Currently selected node (transient)
}
```

**All Store Actions** (complete API — 16 actions):
| Action | Signature | Effect |
|--------|-----------|--------|
| createGraph | `(name, graph?) → id` | Adds graph, sets active, clears selection |
| deleteGraph | `(id)` | Removes graph, falls back to first remaining |
| renameGraph | `(id, name)` | Updates name and `updatedAt` |
| setActiveGraph | `(id)` | Switches active graph, clears selection |
| duplicateGraph | `(id)` | Deep clones graph with "(copy)" suffix |
| setGraph | `(graph)` | Replaces active graph data |
| addComponent | `(type, label, x, y)` | Adds component to active graph |
| removeComponent | `(id)` | Removes component + its connections, clears selection if removed |
| updateComponent | `(id, updates)` | Partial update label/description |
| updatePosition | `(id, x, y)` | Updates node position |
| addConnection | `(source, target, label)` | Adds edge to active graph |
| removeConnection | `(connectionId)` | Removes edge |
| setSelectedComponent | `(id \| null)` | Sets/clears selection |
| importGraph | `(name, graph) → id` | Creates new graph entry from import data |
| undo | (via zundo temporal) | Reverts last state change |
| redo | (via zundo temporal) | Re-applies reverted change |

**State Transition Diagram**:
```
[Empty Workspace] →createGraph→ [1 graph, active]
[N graphs] →createGraph→ [N+1 graphs, new active]
[N graphs] →deleteGraph→ [N-1 graphs, fallback active]
[Graph selected] →addComponent→ [Graph with N+1 components]
[Component selected] →removeComponent→ [Component removed, selection cleared]
[Any mutation] →zundo→ [Previous state snapshot saved, max 50]
[Any state change] →persist→ [localStorage updated]
```

### M4: Test Data Fixtures & Sample Payloads (New Section 13)
**File**: `src/docs/the-architect-project-document.md`
**Action**: Append new section

Provide ready-to-use test data:

1. **Sample requirements text** — 3 examples (simple, medium, complex) showing input → expected component output
2. **Sample valid JSON for import** — minimal and full examples
3. **Sample invalid JSON for import** — one per validation rule (8 examples)
4. **Expected component counts per template** — exact numbers for verification
5. **localStorage key and expected shape** — for state inspection during testing

### M5: Update Existing Sections
**File**: `src/docs/the-architect-project-document.md`
**Action**: Enhance existing content

1. **Section 5.6 Testing** — add complete test file inventory with what each test file covers
2. **Section 1** — verify version matches package.json (0.2.0 ✓)
3. **Section 9 Antigravity Guide** — add reference to new sections (UI map, validation catalog, test fixtures)

### M6: Governance Updates
**Files to update**:
- `RELEASE.md` — Add `v0.2.0-complete-docs` entry documenting the documentation enhancement
- `context.md` — Add note about documentation-as-specification approach for Antigravity testing

**Files that do NOT need updating**:
- `docs/architecture/components.md` — No new code components added (documentation only)

---

## File Change Summary

| File | Action | Scope |
|------|--------|-------|
| `src/docs/the-architect-project-document.md` | **Modify** — append sections 10-13, enhance sections 5.6 and 9 | ~300-400 new lines |
| `RELEASE.md` | **Modify** — add v0.2.0-complete-docs entry | ~15 lines |
| `context.md` | **Modify** — add documentation-as-spec decision | ~5 lines |
| `PLANS.md` | **Modify** — this file (already done) | — |

**No new files created.** All changes are enhancements to existing files within allowed scope (`src/**`).

---

## Approach & Rationale

### Why enhance the existing document (not create new files)?
Per `docs/architecture/components.md`, this is a **client-side-only SPA**. A single comprehensive document is the correct format for Antigravity integration — it can be parsed as a specification. Per Lesson 21, document tasks must produce actual files. Per §7 (architectural alignment), no new components are being added so `components.md` does not need updating.

### Why these specific sections?
Antigravity needs to **test the web application**. That requires:
1. **Finding elements** → UI element map with selectors (M1)
2. **Knowing what's valid/invalid** → Validation rules & error catalog (M2)
3. **Understanding state** → State transitions & API reference (M3)
4. **Having test inputs** → Ready-to-use test data fixtures (M4)

The existing document covers *what* the app does. The new sections cover *how to test* it.

---

## Tests

This is a **documentation-only** change. No new code functionality is added.

**Verification**:
- [ ] Document renders correctly as Markdown
- [ ] All `data-testid` values match actual code
- [ ] All error messages match actual code in `importService.ts`
- [ ] All store actions match actual API in `graphStore.ts`
- [ ] Sample JSON fixtures pass/fail import validation as expected
- [ ] `npm run build` still succeeds (no code changes)
- [ ] `npm run test` still passes (no code changes)

---

## Risks & Considerations

| Risk | Mitigation |
|------|------------|
| Document becomes stale if code changes | Reference specific source file + line for each documented element |
| Document too large for Antigravity to parse | Keep new sections factual and structured (tables, not prose) |
| `data-testid` attributes incomplete in code | Document what exists; note which elements lack testids |
| localStorage inspection not portable | Document key name and JSON shape, not browser-specific access |

---

## Architectural Impact

**None.** This is a documentation-only enhancement. No new components, no new dependencies, no code changes, no behavior changes. The architecture described in `docs/architecture/components.md` remains unchanged.

---

## RELEASE.md Entry

```markdown
## v0.2.0-complete-docs — Complete End-to-End Documentation for Antigravity Web Testing

### Summary
Enhanced the project document with UI element mapping, validation rules catalog, state transition documentation, and test data fixtures — providing a complete specification for Antigravity web application testing.

### Changes
- **Section 10: UI Element Map & Test Selectors** — Interactive element inventory with `data-testid` attributes, CSS selectors, layout zones, and expected interactions
- **Section 11: Validation Rules & Error Catalog** — Complete import validation rules with exact error messages, UI disabled states, and component field requirements
- **Section 12: State Transitions & Store API** — Full Zustand store API reference (16 actions), state shape, and transition diagram
- **Section 13: Test Data Fixtures** — Sample requirements text, valid/invalid JSON payloads, template component counts, and localStorage inspection guide
- **Enhanced Section 5.6** — Complete test file inventory
- **Enhanced Section 9** — Cross-references to new testing sections

### Architecture Impact
- No new modules or dependencies
- No code changes

### Risk Level
**Low** — Documentation-only change. No impact on application behavior.
```

---

## context.md Entry

```markdown
### Documentation-as-Specification for Antigravity (v0.2.0-complete-docs)
The project document (`src/docs/the-architect-project-document.md`) serves as both human documentation and a machine-parseable specification for Antigravity web testing. It includes UI element selectors, validation rules with exact error messages, state machine documentation, and test data fixtures. When code changes affect UI elements, store API, or validation logic, the document must be updated to maintain specification accuracy.
```
