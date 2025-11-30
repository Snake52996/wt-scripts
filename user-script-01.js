import { inject_styles, split_data } from "./user-script-shared";

const internal_state = {
  style: null,
};

export async function run(data) {
  const [tracked, watching] = await split_data(data);
  internal_state.style = inject_styles();

  const list = document.getElementById("search_result_img_box");
  if (list === null) {
    return;
  }
  for (const node of list.children) {
    const id = node.dataset.list_item_product_id;
    if (tracked.has(id)) {
      node.classList.add("tracked");
    } else if (watching.has(id)) {
      node.classList.add("watching");
    }
  }
}
export async function stop() {
  const list = document.getElementById("search_result_img_box");
  if (list === null) {
    return;
  }
  for (const node of list.children) {
    node.classList.remove("tracked", "watching");
  }
  if (internal_state.style !== null) {
    internal_state.style.parentElement.removeChild(internal_state.style);
    internal_state.style = null;
  }
}
