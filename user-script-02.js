import { inject_styles, split_data } from "./user-script-shared";

const internal_state = {
  style: null,
};

export async function run(data) {
  const [tracked, watching] = await split_data(data);
  internal_state.style = inject_styles();
  for (const toplevel of document.getElementsByTagName("article")) {
    const title =
      toplevel.firstElementChild?.firstElementChild?.innerText ?? "";
    const match = title.match(/.+\[([^\]]+)\]$/);
    if (match === null) {
      continue;
    }
    const id = match[1];
    if (tracked.has(id)) {
      toplevel.classList.add("tracked");
    } else if (watching.has(id)) {
      toplevel.classList.add("watching");
    }
  }
}
export async function stop() {
  for (const toplevel of document.getElementsByTagName("article")) {
    toplevel.classList.remove("tracked", "watching");
  }
  if (internal_state.style !== null) {
    internal_state.style.parentElement.removeChild(internal_state.style);
    internal_state.style = null;
  }
}
