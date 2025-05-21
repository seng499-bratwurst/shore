import Link from 'next/link';

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <div className="flex gap-3xl">
        <Link href="/admin">Admin</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/login">Login</Link>
      </div>
    </>
  );
}
