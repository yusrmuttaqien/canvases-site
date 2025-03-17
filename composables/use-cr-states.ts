import { PAGE_TRANSITION_DURATION } from "~/constants/app";

export default function useCRStates(link?: string) {
  const states = useState<{
    repo: string;
    timeout: NodeJS.Timeout | undefined;
  }>("cr-states", () => ({
    repo: "",
    timeout: undefined,
  }));

  onMounted(() => {
    clearTimeout(states.value.timeout);

    if (link) states.value.repo = link;
  });
  onBeforeUnmount(() => {
    states.value.timeout = setTimeout(() => {
      states.value.repo = "";
    }, PAGE_TRANSITION_DURATION);
  });

  return states;
}
