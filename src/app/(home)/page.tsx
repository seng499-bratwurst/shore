import { Button } from '@/components/ui/button/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-200 dark:from-primary-900 dark:to-primary-700 dark:from-primary-900 dark:to-primary-950 text-foreground flex flex-col items-center justify-center p-4">
      {/* Main Content */}
      <div className="text-center max-w-[42rem]">
        {/* Purple Title Box */}
        <h1 className="bg-secondary text-2xl font-bold py-2 px-4 mb-4 items-center text-secondary-foreground">
          Where Ocean Data Meets Intelligence
        </h1>

        {/* Description Text Box */}
        <p className="text-lg mb-6">
          Our chat-based application answers questions using real-time and historical ocean data
          from Ocean Networks Canada. It provides accessible, science-backed insights drawn directly
          from the ocean floor to your fingertips.
        </p>

        {/* Blue Chat Button */}
        <Link href="/chat">
          <Button size="lg" className="font-bold">
            Start Chat Now
          </Button>
        </Link>

        {/* Territorial Acknowledgement */}
        <p className="mt-8 italic pt-14">
          We acknowledge with respect that the Cambridge Bay coastal community observatory is
          located on the lands and in the waters of the Inuit, in Iqaluktuuttiaq (Cambridge Bay) in
          the Kitikmeot Region of Nunavut.{' '}
        </p>
      </div>
    </div>
  );
}
