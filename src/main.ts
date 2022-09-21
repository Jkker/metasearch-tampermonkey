import "./styles.scss";
import engines from "./config.js";

function Button({ icon, color, name, display, lightness, href }: any) {
  const a = document.createElement("a");

  a.style.color = color;
  a.href = href;

  if (!display) {
    a.style.display = "none";
  }
  a.title = name;
  a.classList.add("icon-button");
  a.innerHTML = icon;
  const text = document.createElement("span");
  text.innerText = name;

  if (lightness < 0.3) {
    a.classList.add("dark-invert");
  }

  a.append(text);

  return a;
}

const body = document.querySelector("body");

const root = document.createElement("div");

const linkContainer = document.createElement("div");
linkContainer.id = "metasearch-link-container";
root.id = "metasearch-root";

let prevScrollPosition = window.pageYOffset;
window.onscroll = function () {
  const currentScrollPos = window.pageYOffset;
  root.style.bottom = prevScrollPosition > currentScrollPos ? "0" : "-40px";
  prevScrollPosition = currentScrollPos;
};

const getHost = (host) => host.split(".").at(-2);

const currHost = getHost(window.location.host);

let curr = -1;

const q =
  new URLSearchParams(window.location.search).get(engines[curr]?.q ?? "q") ??
  "";

for (const i in engines) {
  const engine = engines[i];

  const button = Button({
    icon: engine.icon,
    color: engine.color,
    name: engine.name,
    display: true,
    lightness: engine.lightness,
    href: engine.url.replaceAll("%s", q),
  });
  linkContainer.appendChild(button);

  if (curr !== -1) continue;

  const U = new URL(engine.url);

  const host = getHost(U.host);

  if (host === currHost) {
    console.log("Found current engine", engine);
    curr = i as any;
  }
}
root.appendChild(linkContainer);

const close = document.createElement("button");
close.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-width="2" d="M3,3 L21,21 M3,21 L21,3"></path></svg>`;
close.classList.add("icon-button");
close.id = "metasearch-close";

close.addEventListener("click", () => {
  root.style.bottom = "-40px";
});

root.appendChild(close);

body.appendChild(root);
