import { inject_styles, split_data } from "./user-script-shared";
(() => {
  async function run(data) {
    // collect data
    const [tracked, watching] = await split_data(data);

    // prepare CSS styles
    inject_styles();

    // prepare observer
    function move_up(node, step) {
      let target = node;
      for (let i = 0; i < step; i++) {
        target = target.parentElement;
      }
      return target;
    }
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.classList === undefined) {
            return;
          }
          if (!node.classList.contains("q-img__content")) {
            return;
          }
          const work_id = node.querySelector(".q-chip__content").innerText;
          const container_node = move_up(node, 5);
          if (tracked.has(work_id)) {
            container_node.classList.add("tracked");
          } else if (watching.has(work_id)) {
            container_node.classList.add("watching");
          }
        });
      });
    });

    // setup location change watcher
    function handle_url_change(old_url, new_url) {
      function get_class_name(url) {
        const pathname = url.pathname;
        if (pathname.startsWith("/work/")) {
          return "work";
        }
        if (pathname === "/works") {
          return "list";
        }
        return "";
      }
      const old_class = get_class_name(old_url);
      const new_class = get_class_name(new_url);
      if (old_class !== new_class) {
        // we are changing classes
        if (old_class === "list") {
          // pause the observer
          observer.disconnect();
        }
      }
      if (old_class === "work") {
        document.body.classList.remove("tracked");
        document.body.classList.remove("watching");
      }
      if (new_class === "work") {
        // check what should we do for this work
        const work_id = (() => {
          const path = new_url.pathname;
          const candidate = path.endsWith("/")
            ? path.substring(0, path.length - 1)
            : path;
          return candidate.substring(candidate.lastIndexOf("/") + 1);
        })();
        if (tracked.has(work_id)) {
          document.body.classList.add("tracked");
        } else if (watching.has(work_id)) {
          document.body.classList.add("watching");
        }
      } else if (new_class === "list") {
        observer.observe(document, { subtree: true, childList: true });
      }
    }

    // watch for changed URLs
    (() => {
      let last_url = new URL(window.location.href);
      window.addEventListener("popstate", () => {
        const new_url = new URL(window.location.href);
        if (last_url.href !== new_url.href) {
          handle_url_change(last_url, new_url);
        }
        last_url = new_url;
      });
      const saved_push_state = window.history.pushState;
      const saved_replace_state = window.history.replaceState;
      const implement_builder = (saved_implementation) => {
        return (...args) => {
          const result = saved_implementation.apply(window.history, args);
          const [state, unused, path] = args;
          const new_url = new URL(path, window.location);
          if (last_url.href !== new_url.href) {
            handle_url_change(last_url, new_url);
          }
          last_url = new_url;
          return result;
        };
      };
      window.history.pushState = implement_builder(saved_push_state);
      window.history.replaceState = implement_builder(saved_replace_state);
    })();

    // bootstrap
    handle_url_change(new URL("https://example.com/"), window.location);
  }

  return {
    run: run,
  };
})();
