import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyStudentSession } from "@/lib/dal";

export default async function AccountPage() {
  const { name, email } = await verifyStudentSession();

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
