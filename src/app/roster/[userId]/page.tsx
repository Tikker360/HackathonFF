import RosterView from "@/components/RosterView";

export default async function Roster({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <RosterView userId={userId} />;
}
