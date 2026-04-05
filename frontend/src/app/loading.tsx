import { LottieAnimation } from "@/components/lottie-animation";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          <LottieAnimation
            src="https://lottie.host/embed/7d8efe42-f289-412f-9144-96c5c9ed9aaa/0KtgBuo0EM.lottie"
            loop
            className="w-full h-full"
          />
        </div>
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
