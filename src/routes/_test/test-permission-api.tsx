import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { toId } from "@/lib/types/id";
import type { RoleId } from "@/lib/types/role";
import type { ResourceId } from "@/lib/types/permission";
import type {
  PermissionInfoRequest,
  PermissionCreateRequest,
  PermissionUpdateRequest
} from "@/lib/types/permission";

import { permissionQueries, permissionMutations } from "@/lib/tanstack/options/permission";

export const Route = createFileRoute("/_test/test-permission-api")({
  component: RouteComponent
});

function RouteComponent() {
  const roleId: RoleId = toId<"Role", number>(1);
  const resourceId: ResourceId = toId<"Resource", number>(29);

  const infoParams: PermissionInfoRequest = {
    roleId
  };

  const infoQuery = useQuery(permissionQueries.info(infoParams));
  const myResourcesQuery = useQuery(permissionQueries.myResources());

  const addMutation = useMutation(permissionMutations.add());
  const updateMutation = useMutation(permissionMutations.update());
  const removeMutation = useMutation(permissionMutations.remove());

  const handleAdd = () => {
    const body: PermissionCreateRequest = {
      actions: '["VIEW"]',
      roleId,
      resourceId
    };

    addMutation.mutate(body);
  };

  const handleUpdate = () => {
    const body: PermissionUpdateRequest = {
      roleId,
      resourceId,
      actions: '["VIEW", "ADD"]'
    };

    updateMutation.mutate(body);
  };

  const handleRemove = () => {
    const body: PermissionUpdateRequest = {
      roleId,
      resourceId,
      actions: '["ADD"]'
    };

    removeMutation.mutate(body);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Permission API Test</h2>

      <section>
        <h3>Permission Info (by Role)</h3>
        {infoQuery.isLoading && <p>Loading permission info...</p>}
        {infoQuery.isError && <p>Error loading permission info</p>}
        {infoQuery.data && <pre>{JSON.stringify(infoQuery.data, null, 2)}</pre>}
      </section>

      <section>
        <h3>My Resources</h3>
        {myResourcesQuery.isLoading && <p>Loading my resources...</p>}
        {myResourcesQuery.isError && <p>Error loading my resources</p>}
        {myResourcesQuery.data && <pre>{JSON.stringify(myResourcesQuery.data, null, 2)}</pre>}
      </section>

      <section>
        <h3>Mutations</h3>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleAdd} disabled={addMutation.isPending}>
            Add
          </button>

          <button onClick={handleUpdate} disabled={updateMutation.isPending}>
            Update
          </button>

          <button onClick={handleRemove} disabled={removeMutation.isPending}>
            Remove
          </button>
        </div>

        {(addMutation.isSuccess || updateMutation.isSuccess || removeMutation.isSuccess) && (
          <p style={{ marginTop: 12 }}>Mutation success</p>
        )}

        {(addMutation.isError || updateMutation.isError || removeMutation.isError) && (
          <p style={{ marginTop: 12 }}>Mutation error</p>
        )}
      </section>
    </div>
  );
}
