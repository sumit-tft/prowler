import { z } from "zod";

export const editScanFormSchema = (currentName: string) =>
  z.object({
    scanName: z
      .string()
      .refine((val) => val === "" || val.length >= 3, {
        message: "The alias must be empty or have at least 3 characters.",
      })
      .refine((val) => val !== currentName, {
        message: "The new name must be different from the current one.",
      })
      .optional(),
    scanId: z.string(),
  });

export const onDemandScanFormSchema = () =>
  z.object({
    providerId: z.string(),
    scanName: z.string().optional(),
    scannerArgs: z
      .object({
        checksToExecute: z.array(z.string()),
      })
      .optional(),
  });

export const scheduleScanFormSchema = () =>
  z.object({
    providerId: z.string(),
    scheduleDate: z.string(),
  });

export const addProviderFormSchema = z.object({
  providerType: z.string(),
  providerAlias: z.string(),
  providerId: z.string(),
  awsCredentialsType: z.string().optional(),
});

export const addCredentialsFormSchema = (providerType: string) =>
  z.object(
    providerType === "aws"
      ? {
          aws_access_key_id: z.string(),
          aws_secret_access_key: z.string(),
          aws_session_token: z.string(),
        }
      : providerType === "azure"
        ? {
            client_id: z.string(),
            client_secret: z.string(),
            tenant_id: z.string(),
          }
        : providerType === "gcp"
          ? {
              client_id: z.string(),
              client_secret: z.string(),
              refresh_token: z.string(),
            }
          : {},
  );

export const editProviderFormSchema = (currentAlias: string) =>
  z.object({
    alias: z
      .string()
      .refine((val) => val === "" || val.length >= 3, {
        message: "The alias must be empty or have at least 3 characters.",
      })
      .refine((val) => val !== currentAlias, {
        message: "The new alias must be different from the current one.",
      })
      .optional(),
    providerId: z.string(),
  });
