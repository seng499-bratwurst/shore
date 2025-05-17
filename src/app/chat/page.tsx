import Link from "next/link";

export default function Chat() {
  return (
    <>
      <h1>Chat</h1>
      <Link href="/">Home</Link>
      <Link href="/admin">Admin</Link>
      <Link href="/login">Login</Link>
    </>
  );
}
