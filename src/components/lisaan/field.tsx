import * as React from "react";

import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}

/**
 * The wrapper every form control sits in. Error text replaces help text —
 * it never stacks below it, and the field's height must not change when
 * validation fails.
 */
function Field({ label, help, error, required, htmlFor, children, className, ...props }: FieldProps) {
  const generatedId = React.useId();
  const controlId = htmlFor ?? generatedId;
  const messageId = `${controlId}-message`;
  const message = error ?? help;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <label htmlFor={controlId} className="t-label-md text-fg-primary">
        {label}
        {required && (
          <span className="text-fg-danger" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              id: controlId,
              "aria-describedby": message ? messageId : undefined,
              "aria-invalid": Boolean(error) || undefined,
            },
          )
        : children}
      {message && (
        <p
          id={messageId}
          className={cn("t-body-sm", error ? "text-fg-danger" : "text-fg-tertiary")}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export { Field };
