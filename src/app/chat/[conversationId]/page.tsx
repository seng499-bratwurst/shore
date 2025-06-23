import { GraphChat } from '@/features/graph-chat/components/graph-chat';

export default async function Page({
  params,
}: {
  params: Promise<{ conversationId: number | undefined }>;
}) {
  const { conversationId } = await params;
  return <GraphChat conversationId={conversationId} />;
}
