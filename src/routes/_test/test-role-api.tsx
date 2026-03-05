import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { toId } from "@/lib/types/id";
import type {
  RoleId,
  RoleListRequest,
  RoleCreateRequest,
  RoleUpdateRequest
} from "@/lib/types/role";
import { roleQueries, roleMutations } from "@/lib/tanstack/options/role";

export const Route = createFileRoute("/_test/test-role-api")({
  component: RouteComponent
});

function RouteComponent() {
  const [page] = useState(1);
  const [limit] = useState(10);
  const [selectedId] = useState<RoleId>(toId<"Role", number>(4));

  const params: RoleListRequest = {
    page,
    limit
  } as RoleListRequest;

  const listQuery = useQuery(roleQueries.list(params));

  const createMutation = useMutation(roleMutations.create());
  const updateMutation = useMutation(roleMutations.update(selectedId));
  const deleteMutation = useMutation(roleMutations.delete());

  const handleCreate = () => {
    const body: RoleCreateRequest = {
      name: "New Role"
    } as RoleCreateRequest;

    createMutation.mutate(body);
  };

  const handleUpdate = () => {
    const body: RoleUpdateRequest = {
      id: selectedId,
      name: "Updated Role"
    } as RoleUpdateRequest;

    updateMutation.mutate(body);
  };

  const handleDelete = () => {
    deleteMutation.mutate(selectedId);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Role API Test (Using Query/Mutation Options)</h2>

      <section>
        <h3>List</h3>
        {listQuery.isLoading && <p>Loading roles...</p>}
        {listQuery.isError && <p>Error loading roles</p>}
        {listQuery.data && <pre>{JSON.stringify(listQuery.data, null, 2)}</pre>}
      </section>

      <section>
        <h3>Mutations</h3>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={handleCreate} disabled={createMutation.isPending}>
            Create
          </button>

          <button onClick={handleUpdate} disabled={updateMutation.isPending}>
            Update
          </button>

          <button onClick={handleDelete} disabled={deleteMutation.isPending}>
            Delete
          </button>
        </div>

        {(createMutation.isSuccess || updateMutation.isSuccess || deleteMutation.isSuccess) && (
          <p style={{ marginTop: 12 }}>Mutation success</p>
        )}

        {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
          <p style={{ marginTop: 12 }}>Mutation error</p>
        )}
      </section>
    </div>
  );
}
