// @/routes/_crm/_resource/api-test.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";

import { toId } from "@/lib/types/id";
import type { ResourceListRequest, ResourceUpdateRequest } from "@/lib/types/resource";
import type { ResourceId } from "@/lib/types/resource";
import { resourceMutations, resourceQueries } from "@/lib/tanstack/options/resource";

export const Route = createFileRoute("/api-test")({
  component: RouteComponent
});

function RouteComponent() {
  const params: ResourceListRequest = {
    page: 1,
    limit: 10
  } as ResourceListRequest;

  const listQuery = useQuery(resourceQueries.list(params));

  const resourceId: ResourceId = toId<"Resource", number>(2);

  const detailQuery = useQuery(resourceQueries.detail(resourceId));

  const updateMutation = useMutation(resourceMutations.update());
  const deleteMutation = useMutation(resourceMutations.delete());

  const handleUpdate = () => {
    const body: ResourceUpdateRequest = {
      id: resourceId
    } as ResourceUpdateRequest;

    updateMutation.mutate(body);
  };

  const handleDelete = () => {
    deleteMutation.mutate(resourceId);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Resource API Test</h2>

      <section>
        <h3>List</h3>
        {listQuery.isLoading && <p>Loading list...</p>}
        {listQuery.data && <pre>{JSON.stringify(listQuery.data, null, 2)}</pre>}
      </section>

      <section>
        <h3>Detail</h3>
        {detailQuery.isLoading && <p>Loading detail...</p>}
        {detailQuery.data && <pre>{JSON.stringify(detailQuery.data, null, 2)}</pre>}
      </section>

      <section>
        <h3>Mutations</h3>
        <button onClick={handleUpdate} disabled={updateMutation.isPending}>
          Update
        </button>
        <button onClick={handleDelete} disabled={deleteMutation.isPending}>
          Delete
        </button>
      </section>
    </div>
  );
}
