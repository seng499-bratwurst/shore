import Link from 'next/link';

export default function Login() {
  return (
    <>
      <nav aria-label="Login navigation">
        <ul className="flex gap-3xl list-none p-0 m-0">
          <li>
            <Link href="/admin">Admin</Link>
          </li>
          <li>
            <Link href="/chat">Chat</Link>
          </li>
          <li>
            <Link href="/">Home</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
