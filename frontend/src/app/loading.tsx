import { LottieAnimation } from "@/components/lottie-animation";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          <LottieAnimation
            src="https://lottie.host/ec0730f3-b1c7-4de3-a5da-08b97c6fad99/ow1yY4NNxk.lottie"
            loop
            className="w-full h-full"
          />
        </div>
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
