import { success, z } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator } from "@hono/zod-validator";

export class ApplicationValidator {
  public static validate<
    T extends z.ZodType,
    Target extends keyof ValidationTargets,
  >(target: Target, schema: T) {
    return zValidator(target, schema, this.onValidate.bind(this));
  }

  public static onValidate(result: {
    success: boolean;
    error?: unknown;
  }): void {
    if (!result.success) {
      throw result.error;
    }
  }
}
