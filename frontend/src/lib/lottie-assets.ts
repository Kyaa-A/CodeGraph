/**
 * Central registry of all Lottie animation assets used across the app.
 * Reference these constants instead of hardcoding URLs in components.
 */
export const LOTTIE = {
  /** Login success — confetti burst */
  confetti: "https://lottie.host/857ce841-21aa-42e9-8d41-8f721c0a7f29/BfjTYlOrhM.lottie",

  /** Course/problem completion — trophy */
  trophy: "https://lottie.host/cc5eb273-523d-40fe-a1ed-ace562c57eaa/Vz6dU46MWi.lottie",

  /** Level up overlay animation */
  levelUp: "https://lottie.host/884d0167-164e-4830-ba3e-cd4ea2ae4a57/JovhHlzhef.lottie",

  /** Global loading / auth gate spinner */
  greenLoader: "https://lottie.host/7d8efe42-f289-412f-9144-96c5c9ed9aaa/0KtgBuo0EM.lottie",

  /** 404 not found page */
  notFoundRobot: "https://lottie.host/132950ae-0f3b-4659-a58a-c2091477c5b9/jIsVSY4YGA.lottie",

  /** Hint button — plays on hover */
  lightbulb: "https://lottie.host/e7e37b80-60e9-457c-bba6-9316e75839e3/TgVAsNqb9S.lottie",

  /** Streak calendar fire */
  streakFire: "https://lottie.host/c93e7d82-d61b-4625-bbf3-e05795cb4da2/EDXKgG995W.lottie",

  /** Route loading — hourglass */
  hourglass: "https://lottie.host/2a21930c-0c73-4b8a-b997-59882caa229f/LOhLdidczR.lottie",

  /** Homepage hero coding animation */
  codingHero: "https://lottie.host/a28e7daa-5ade-4ac1-9c91-7353c3cd8f19/brFveAcB21.lottie",

  /** Login/signup side panel illustration */
  authIllustration: "https://lottie.host/2cc81489-2645-4f2f-b980-89f103a9b498/ZzFHFOMOdG.lottie",

  /** Signup success — account created */
  signupSuccess: "https://lottie.host/d7ccf5c8-cba7-41a7-b5fe-c39238aaf512/cdHuCUZYri.lottie",

  /** Problem solved celebration */
  problemSuccess: "https://lottie.host/49aa1eee-3c18-4d9a-9792-139e222839bb/jH7cKeQa9r.lottie",
} as const;
