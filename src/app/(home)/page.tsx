import { Button } from '@/components/ui/button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';
import { Textarea } from '@/components/ui/textarea/textarea';
import { Label } from '@/components/ui/typography/label';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
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
      <div className="flex flex-col w-full align-center justify-center p-3xl">
        <div className="mt-8 flex gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Error</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Shore</CardTitle>
            <CardDescription>
              An LLM powered interface to data from Ocean Networks Canada's Cambridge Bay Coastal
              Community Observatory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-lg">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="flex flex-col gap-xs">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <div className="flex gap-xs">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button variant="ghost" size="sm">
                Submit
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
