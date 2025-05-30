import Link from 'next/link';

export default function Home() {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex gap-3xl list-none p-0 m-0">
        <li>
          <Link href="/admin">Admin</Link>
        </li>
        <li>
          <Link href="/chat">Chat</Link>
        </li>
        <li>
          <Link href="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
}
