import SharedPreview from "@/components/SharedPreview";

export default async function SharedItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SharedPreview id={id} />;
}