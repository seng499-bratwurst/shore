export default function Admin() {
  return (
    <>
      <nav aria-label="Admin navigation">
        <ul className="flex gap-3xl list-none p-0 m-0">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/chat">Chat</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
