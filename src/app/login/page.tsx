import { LoginForm } from '@/features/auth/login/login-form';
import { SignUpForm } from '@/features/auth/sign-up/sign-up-form';
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
      <div className="flex flex-col items-center space-y-4 p-4">
        <LoginForm />
        <SignUpForm />
      </div>
    </>
  );
}
