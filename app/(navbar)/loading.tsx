import TyphoonSpinner from "@/lib/components/TyphoonSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-stone-100">
      <TyphoonSpinner size="large" />
    </div>
  );
}
