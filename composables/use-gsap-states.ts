export type GSAPStates = {
  isInitialized: boolean;
  hmr: {
    last: number;
    recent: number;
  };
};

export default function useGSAPStates() {
  return useState<GSAPStates>("gsap-states", () => ({
    isInitialized: false,
    hmr: {
      last: 0,
      recent: 0,
    },
  }));
}
