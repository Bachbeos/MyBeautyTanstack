import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "@/components/form/hooks";

export const Route = createFileRoute("/form")({
  component: LoginPage
});

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters")
});

export type LoginInput = z.infer<typeof loginSchema>;

function LoginPage() {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: ""
    } satisfies LoginInput,
    validators: {
      onSubmit: loginSchema
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="email">{(f) => <f.Input label="Email" />}</form.AppField>

      <form.AppField name="password">{(f) => <f.Input label="Password" />}</form.AppField>

      <button type="submit">Login</button>
    </form>
  );
}
