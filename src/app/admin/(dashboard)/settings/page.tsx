import { Field } from "@/components/lisaan/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="t-h2 text-fg-primary">Settings</h1>
      <div className="flex flex-col gap-4">
        <Field label="Instructor name">
          <Input defaultValue="Owner" />
        </Field>
        <Field label="Email">
          <Input defaultValue="owner@lisaan.app" type="email" />
        </Field>
        <Button className="self-start">Save changes</Button>
      </div>
    </div>
  );
}
