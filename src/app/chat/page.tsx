import Link from 'next/link';

export default function Chat() {
  return (
    <>
      <h1>Chat</h1>
      <div className="flex gap-3xl">
        <Link href="/">Home</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/login">Login</Link>
      </div>
    </>
  );
}
