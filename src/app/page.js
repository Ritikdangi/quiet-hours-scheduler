import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen text-center px-6 bg-[#f9fafb]">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
        Quiet Hours Scheduler ⏳
      </h1>
      <p className="text-lg text-gray-600 mb-10 max-w-xl">
        Plan your study blocks, stay focused, and receive timely reminders.
      </p>
      <Link
        href="/auth"
        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
      >
        Get Started → Login
      </Link>
    </div>
  );
}
