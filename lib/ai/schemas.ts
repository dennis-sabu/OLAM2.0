import { z } from "zod";

export const parseTaskInputSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, "Task description cannot be empty")
    .max(2000, "Input cannot exceed 2000 characters"),
  currentDate: z.string().optional(),
  timeZone: z.string().optional(),
});

export type ParseTaskInput = z.infer<typeof parseTaskInputSchema>;

export const parsedTaskResponseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["Academics", "Projects", "Personal", "Exams"]).nullable(),
  deadline: z.string().nullable(),
  estimatedMinutes: z.number().int().positive().nullable(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  rawTemporalPhrase: z.string().nullable().optional(),
});

export type ParsedTaskResponse = z.infer<typeof parsedTaskResponseSchema>;

export const breakdownTaskInputSchema = z.object({
  task: z.object({
    title: z.string().trim().min(1, "Task title is required"),
    category: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    estimatedMinutes: z.number().optional().nullable(),
    priority: z.string().optional().nullable(),
  }),
});

export type BreakdownTaskInput = z.infer<typeof breakdownTaskInputSchema>;

export const subtaskSuggestionSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  estimatedMinutes: z.number().int().positive().max(480),
});

export const breakdownTaskResponseSchema = z.object({
  subtasks: z.array(subtaskSuggestionSchema).min(1).max(8),
});

export type BreakdownTaskResponse = z.infer<typeof breakdownTaskResponseSchema>;
