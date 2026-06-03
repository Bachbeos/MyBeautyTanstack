# Examples

## 1) Query options template

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

## 2) Form schema and normalization template

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

## 3) Modal + form template

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

## 4) List route template

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

## 5) Infinite select options template

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

## 6) File upload template

```tsx
async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    e.target.value = "";
    return;
  }

  setUploading(true);
  try {
    const response = await uploadFile(file);
    if (response?.result) {
      form.setFieldValue("avatar", response.result);
    }
  } finally {
    setUploading(false);
    e.target.value = "";
  }
}
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
