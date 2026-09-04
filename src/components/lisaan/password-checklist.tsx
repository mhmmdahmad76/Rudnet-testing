import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Live requirement checklist — never a strength meter. */
function PasswordChecklist({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
  ];

  return (
    <ul className="flex flex-col gap-1">
      {checks.map((check) => (
        <li
          key={check.label}
          className={cn(
            "t-body-xs flex items-center gap-1.5",
            check.met ? "text-fg-success" : "text-fg-tertiary",
          )}
        >
          {check.met ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <X className="size-3.5" aria-hidden />
          )}
          {check.label}
        </li>
      ))}
    </ul>
  );
}

export { PasswordChecklist };
