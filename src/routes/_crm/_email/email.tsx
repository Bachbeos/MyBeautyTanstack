import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { usePermission } from "@/hooks/use-permission";
import { Can } from "@/components/auth/can";
import EmailEditor, { type EditorRef, type EmailEditorProps } from "react-email-editor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import "@/assets/css/email-builder.css";

import { EmailTemplateId, type EmailTemplateDto } from "@/lib/types/email-template";
import { emailTemplateMutations } from "@/lib/tanstack/options/email-template";
import { emailTemplateQueries } from "@/lib/tanstack/options/email-template";
import { mailMutations } from "@/lib/tanstack/options/mail";
import { cn } from "@/lib/utils";
import { useAppForm } from "@/components/form/hooks";

export const Route = createFileRoute("/_crm/_email/email")({
  component: EmailRedirect
});

function EmailRedirect() {
  return <Navigate to="/send" />;
}
