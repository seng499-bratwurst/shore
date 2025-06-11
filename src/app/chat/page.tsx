import { GraphChat } from '@/features/graph-chat/graph-chat';
import Link from 'next/link';

export default function Chat() {
  return (
    <>
      <nav aria-label="Chat navigation">
        <ul className="flex gap-3xl list-none p-0 m-0">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
        </ul>
      </nav>
      <GraphChat />
    </>
  );
}
