// inject used css styles into the page, returning the CSS element
import stylesheet from "./style.css" with {type: "text"};
export function inject_styles() {
  const css = document.createElement("style");
  css.textContent = stylesheet;
  document.head.appendChild(css);
  return css;
}
export async function split_data(data) {
  if (data.length === 0) {
    return [new Set(), new Set()];
  }
  const keys = Object.keys(data[0]);
  const hashed_keys = await Promise.all(
    keys.map(async (value) => ({
      value: value,
      hash: new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(
            `${value}f78ecfaf-c392-45e5-ab31-e1128e35e019`
          )
        )
      ).toHex(),
    }))
  );
  const mapping_key = hashed_keys.find(
    ({ hash }) =>
      hash ===
      "8c9b29bb658a40f479274c2e1019316184dc78b3dbee04017b25e2e34e7acda0"
  ).value;
  const checking_key = hashed_keys.find(
    ({ hash }) =>
      hash ===
      "b967dc37c16eb8f5d014aea9a547b6c42ab0d2c90538a41a544e28be53e666b7"
  ).value;
  const reduced_data = await Promise.all(
    data.map(async (item) => ({
      condition: new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(
            `${item[checking_key][0]}4739aa80-ec53-4be9-8eb5-04a317c49ea1`
          )
        )
      ).toHex(),
      result: item[mapping_key],
    }))
  );

  const tracked = new Set(
    reduced_data
      .filter(
        ({ condition }) =>
          condition !==
          "d01737abdd43977c3e61627e5fc5cb4b1b117ae49871dfed79c91bbffc77fb45"
      )
      .map(({ result }) => result)
  );
  const watched = new Set(
    reduced_data
      .filter(
        ({ condition }) =>
          condition ===
          "d01737abdd43977c3e61627e5fc5cb4b1b117ae49871dfed79c91bbffc77fb45"
      )
      .map(({ result }) => result)
  );
  return [tracked, watched];
}
