export default function useGSAPStates() {
  return useState("gsap-states", () => ({
    isInitialized: false,
    hmr: {
      last: 0,
      recent: 0,
    },
  }));
}
