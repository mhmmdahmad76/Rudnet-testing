import { redirect } from "next/navigation";

import { getPendingDevices } from "../actions";
import { DevicesList, type DeviceSession } from "./devices-list";

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const pending = await getPendingDevices();
  if (!pending) redirect("/sign-in");

  return <DevicesList sessions={pending.sessions as DeviceSession[]} next={next ?? "/dashboard"} />;
}
