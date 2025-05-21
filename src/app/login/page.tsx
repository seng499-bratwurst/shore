import Link from 'next/link';

export default function Login() {
  return (
    <>
      <h1>Login</h1>
      <div className="flex gap-3xl">
        <Link href="/admin">Admin</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/">Home</Link>
      </div>
    </>
  );
}
