import BottomNav from "@/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24 flex flex-col items-center max-w-md mx-auto w-full relative">
      {/* 
        Max-w-md to keep it mobile-focused on desktop 
        pb-24 gives space for the bottom nav
      */}
      <main className="w-full flex-1 px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
