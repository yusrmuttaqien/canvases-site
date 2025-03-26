import { PAGE_TRANSITION_DURATION } from "~/constants/app";
import type { Ref } from "vue";

export default function useCRStates(link?: Ref<string>) {
  const states = useState<{
    repo: string;
    timeout: NodeJS.Timeout | undefined;
  }>("cr-states", () => ({
    repo: "",
    timeout: undefined,
  }));

  watchEffect(() => {
    clearTimeout(states.value.timeout);

    if (link) states.value.repo = link.value;
  });
  onBeforeUnmount(() => {
    states.value.timeout = setTimeout(() => {
      states.value.repo = "";
    }, PAGE_TRANSITION_DURATION);
  });

  return states;
}
