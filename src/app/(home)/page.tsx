import Link from 'next/link';
import { Button } from '@/components/ui/button/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-50)]  to-[var(--color-primary-300)]  text-text-[var(--color-neutral-900)] flex flex-col items-center justify-center  p-4">
      {/* Main Content */}
      <div className="text-center max-w-[42rem]">
        {/* Purple Title Box */}
        <h1 className="bg-[var(--color-secondary-400)] text-2xl font-bold py-2 px-4 mb-4 items-center ">
          Where Ocean Data Meets Intelligence
        </h1>

        {/* Description Text Box */}
        <p className="text-lg mb-6">
          Our chat-based application answers questions using real-time and historical ocean data from Ocean Networks Canada. It provides accessible, science-backed insights drawn directly from the ocean floor to your fingertips.
        </p>

        {/* Blue Chat Button */}
        <a href="/chat">
          <Button className="bg-[var(--color-primary-400)] text-[var(--color-neutral-900)]  font-semibold py-2 px-6 rounded hover:bg-cyan-600 transition">
            Start Chat Now
          </Button>
        </a>

        {/* Territorial Acknowledgement */}
        <p className="mt-8 text-sm italic max-w-md mx-auto pt-10">
          We acknowledge the unceded territory of the Inuit people and their continued presence in the area, recognizing their stewardship of the land and their cultural ties to the region.
        </p>
      </div>
    </div>
  );
}
