import Link from "next/link";

export default function Admin() {
  return (
    <>
      <h1>Admin</h1>
      <Link href="/">Home</Link>
      <Link href="/chat">Chat</Link>
      <Link href="/login">Login</Link>
    </>
  );
}
