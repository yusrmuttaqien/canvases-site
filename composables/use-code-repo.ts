import { PAGE_TRANSITION_DURATION, CR_PATH } from "~/constants/app";
import type { Ref } from "vue";

export default function useCodeRepo(
  directoryFromRoot: string,
  root: string = CR_PATH,
) {
  const states = useState<{
    repo: string;
    timeout: NodeJS.Timeout | undefined;
  }>("cr-states", () => ({
    repo: "",
    timeout: undefined,
  }));

  onMounted(() => {
    clearTimeout(states.value.timeout);

    states.value.repo = `${root}${directoryFromRoot}`;
  });
  onBeforeUnmount(() => {
    states.value.timeout = setTimeout(() => {
      states.value.repo = "";
    }, PAGE_TRANSITION_DURATION);
  });

  return states;
}
