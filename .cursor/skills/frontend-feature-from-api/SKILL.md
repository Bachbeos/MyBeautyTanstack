---
name: frontend-feature-from-api
description: Design and implement frontend CRUD flows from API endpoints, response shapes, and type definitions. Use when the user provides an API, response payload, DTOs, or required fields and wants a new frontend feature built consistently with the existing app.
disable-model-invocation: true
---

# Frontend Feature From API

## When to use this skill

Use this skill when the user gives:
- an API endpoint or endpoint group
- response/request types or DTOs
- required fields, validation rules, and business states
- an existing flow to mirror on the frontend

Goal: turn backend contracts into a complete frontend implementation plan and code structure that matches the current app patterns.

## Core workflow

1. Read the existing flow end-to-end before changing anything.
2. Identify the data model, required fields, optional fields, defaults, and any hidden fields that must still round-trip through edit/detail mode.
3. Split the feature by responsibility:
   - list/table view
   - detail view
   - add/edit form
   - delete action
   - status toggle or other fast actions
   - selector data sources for related entities
4. Map each API to a frontend responsibility:
   - query for list/detail/infinite list
   - mutation for create/update/delete/status changes
   - form validation for required fields and format checks
   - one mutation per semantic action when the API behavior differs
5. Reuse existing project conventions for:
   - TanStack Query options with keys, success messages, and invalidation metadata
   - modals/offcanvas forms with a single form id for submit buttons
   - table columns, filters, and debounced search
   - permission checks and conditional rendering
   - async loading, empty state, and retry boundaries
6. Prefer composability over duplication:
   - extract shared option builders for infinite selects
   - normalize API values once at the boundary
   - keep presentation components thin
   - keep form schemas close to the form that uses them
7. Only ask for missing API or type information when the contract is incomplete.

## What to extract from the API contract

When the user provides types or sample responses, identify:
- entity name and display label
- primary key field and ID type
- list parameters: `page`, `limit`, `keyword`, `status`, filters
- response wrapper shape: `result.items`, `result.total`, or other meta fields
- required fields for create and update
- optional fields and default values
- derived UI fields, labels, badges, and status text
- fields that need transformation in the UI
- fields that should be hidden from the form but preserved in detail/edit state
- selector dependencies such as parent/owner/role/category/source data

## Required field handling

Treat `required` as a contract, not only a UI hint.

For each field:
- mark it required in the form when the API needs it
- add validation for presence and format
- choose safe defaults for optional fields
- normalize values before submit when the API expects numbers, IDs, or trimmed strings
- keep `0`, `false`, and empty strings distinct when the API uses them intentionally

## Implementation pattern

Prefer this structure:

- `src/lib/types/<entity>.ts`
- `src/lib/api/<entity>.ts`
- `src/lib/tanstack/options/<entity>.ts`
- `src/components/features/<entity>/form.tsx`
- `src/components/features/<entity>/modal.tsx`
- `src/routes/.../<entity>.tsx`

## Reusable frontend patterns observed in this codebase

Use these patterns when they fit the feature instead of rewriting ad hoc logic:

- **Modal state**: keep `{ type, item }` plus a separate `shown` flag for animated open/close.
- **Close helpers**: use a dedicated close hook so modal reset and animation stay consistent.
- **Permissions**: guard page visibility with `canView`; guard create actions with `Can I="ADD"`.
- **Table filters**: use `columnFilters` + debounced search + reset page index when search changes.
- **Pagination**: use manual pagination and calculate page number as `pageIndex + 1`.
- **Status badges**: make badges clickable when a quick toggle API exists; keep the mutation separate when semantics differ.
- **Selectors**: use `useInfiniteQuery` for large dropdown sources and `fetchNextPage` for load-more behavior.
- **Stable defaults**: hydrate edit/detail forms from the selected DTO and normalize values before submit.
- **File upload**: isolate upload logic, enforce size limits, and keep the UI disabled while uploading.
- **Fallback avatars**: generate a safe avatar fallback URL when a row has no image.
- **Export actions**: keep Excel/PDF export outside table logic and pass the current table instance into export helpers.
- **Async boundaries**: wrap list content in a loading/error boundary before rendering the table.
- **Extra workflows**: if a row opens a secondary flow, keep it in a separate modal rather than bloating the base form.

## Frontend build checklist

Before coding, confirm:
- list columns and searchable fields
- create/update form sections
- detail-only fields
- delete confirmation copy
- status labels and toggle logic
- upload/select dependencies
- permission scope if the app uses RBAC

## React Query guidance

Use query and mutation options consistently:
- list query for table data
- infinite query for selector options or lazy-loaded lists
- detail query only when needed
- mutation meta for success messages and invalidation targets
- typed query keys per entity and action

After mutations:
- close the modal/offcanvas
- refetch or invalidate the relevant list/detail queries
- keep status toggle mutations separate if they have different API semantics
- avoid refetching everything when a targeted invalidation is enough

## Form guidance

When building a form:
- initialize defaults from the selected item in edit/detail mode
- use explicit schema validation
- transform API values on submit only once
- keep view-only mode read-only without changing validation rules
- split large forms into logical sections when it improves clarity

## Output expected from this skill

When asked to create a feature from API + response + type, provide:
1. a short contract summary
2. required vs optional fields
3. inferred UI behavior
4. file-by-file implementation plan
5. code changes that follow the project's existing patterns
6. example code templates that can be moved to another project

## Code examples to include in responses

When the user asks for implementation help, include reusable code templates instead of project-specific imports. Keep them generic and adaptable.

### 1) Query options template

```typescript
import { queryOptions, mutationOptions } from "@tanstack/react-query";

export const featureKeys = {
  all: ["feature"] as const,
  list: (params: Record<string, unknown>) => ["feature", "list", params] as const,
  detail: (id: number) => ["feature", "detail", id] as const,
  create: () => ["feature", "create"] as const,
  update: () => ["feature", "update"] as const,
  delete: () => ["feature", "delete"] as const
};

export const featureQueries = {
  list: (params: Record<string, unknown>) =>
    queryOptions({
      queryKey: featureKeys.list(params),
      queryFn: () => api.list(params)
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: featureKeys.detail(id),
      queryFn: () => api.detail(id),
      enabled: !!id
    })
};

export const featureMutations = {
  create: () =>
    mutationOptions({
      mutationKey: featureKeys.create(),
      mutationFn: (body: unknown) => api.create(body)
    })
};
```

### 2) Form schema and normalization template

```typescript
import { z } from "zod";

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Required"),
  status: z.number().default(1),
  ownerId: z.number().optional(),
  parentId: z.number().optional()
});

type FormValues = z.input<typeof schema>;

type SubmitValues = z.output<typeof schema>;

function normalizeSubmit(values: SubmitValues) {
  return {
    ...values,
    ownerId: values.ownerId || undefined,
    parentId: values.parentId || undefined
  };
}
```

### 3) Modal + form template

```tsx
function FeatureModal({ type, shown, item, onClose, onSubmit }: Props) {
  if (!type && !shown) return null;

  if (type === "delete") {
    return (
      <BaseModal title="Delete item" shown={shown} size="sm" onClose={onClose}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={/* delete */ undefined}>Confirm</button>
      </BaseModal>
    );
  }

  return (
    <BaseOffcanvas title="Feature" shown={shown} onClose={onClose} size="lg">
      <FeatureForm mode={type} item={item} onSubmit={onSubmit} />
    </BaseOffcanvas>
  );
}
```

### 4) List route template

```tsx
const params = useMemo(
  () => ({
    page: pageIndex + 1,
    limit: pageSize,
    keyword: debouncedKeyword || undefined
  }),
  [pageIndex, pageSize, debouncedKeyword]
);

const query = useQuery(featureQueries.list(params));
const createMutation = useMutation(featureMutations.create());

const handleSubmit = async (values: SubmitValues) => {
  if (modal.type === "add") await createMutation.mutateAsync(values);
  if (modal.type === "edit") await updateMutation.mutateAsync(values);
  closeModal();
  query.refetch();
};
```

### 5) Infinite select options template

```tsx
const sourceQuery = useInfiniteQuery(sourceQueries.infinite({ limit: 10, status: 1 }));

const options = useMemo(
  () =>
    sourceQuery.data?.pages.flatMap((page) => page.result?.items ?? []).map((item) => ({
      label: String(item.name),
      value: Number(item.id)
    })) ?? [],
  [sourceQuery.data]
);

const loadMore = () => {
  if (sourceQuery.hasNextPage && !sourceQuery.isFetchingNextPage) {
    return sourceQuery.fetchNextPage();
  }
};
```

## Example output format

When the user gives a new API contract, answer in this order:

```markdown
### 1. Contract summary
- entity
- list endpoint
- detail endpoint
- create/update/delete/status endpoints

### 2. Required fields
- field A: required, validation
- field B: optional, default

### 3. Recommended frontend structure
- types
- api
- query options
- form
- modal
- route

### 4. Reusable code templates
[include generic code blocks]
```

## If information is missing

Ask only for the missing pieces needed to implement safely:
- full request body shape
- response example
- required fields
- enum/status meanings
- list pagination/filter contract
- permission key if applicable
- upload constraints or file type limits if file fields exist
- whether a secondary modal/flow is required for nested actions
