import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = authSchema.extend({
  name: z.string().min(2),
  role: z.enum(["admin", "survey_user"]).optional(),
  phone: z.string().optional(),
  assignedProjects: z.array(z.string()).optional()
});

export const projectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "completed"]).optional(),
  assignedUsers: z.array(z.string()).optional(),
  formDefinition: z.array(
    z.object({
      fieldId: z.string().min(1),
      label: z.string().min(1),
      type: z.enum([
        "text",
        "textarea",
        "number",
        "radio",
        "select",
        "checkbox",
        "date"
      ]),
      required: z.boolean().optional(),
      placeholder: z.string().optional(),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string()
          })
        )
        .optional()
    })
  )
});

