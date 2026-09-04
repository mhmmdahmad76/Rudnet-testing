import { cookies } from "next/headers";

import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EMAIL_COOKIE, NAME_COOKIE } from "@/lib/session";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const name = cookieStore.get(NAME_COOKIE)?.value ?? "Student";
  const email = cookieStore.get(EMAIL_COOKIE)?.value ?? "student@example.com";

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Account</h1>
      <div className="flex flex-col gap-4">
        <Field label="Full name">
          <Input defaultValue={name} />
        </Field>
        <Field label="Email">
          <Input defaultValue={email} type="email" />
        </Field>
        <Button className="self-start">Save changes</Button>
      </div>
    </div>
  );
}
