function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function projectName(prompt: string, title = "") {
  const explicit = title.trim();

  if (
    explicit &&
    explicit.length <= 40 &&
    !/^(build|create|make|generate|design)\b/i.test(explicit)
  ) {
    return slugify(explicit) || "web-studio";
  }

  const text = prompt.split("[IMAGE:")[0].toLowerCase();

  if (/netflix|streaming|movie/.test(text)) {
    return "netflix-arena";
  }

  if (/todo|to-do|to do|task/.test(text)) {
    return "task-nest";
  }

  if (/shop|store|ecommerce|e-commerce/.test(text)) {
    return "shop-orbit";
  }

  if (/portfolio/.test(text)) {
    return "folio-studio";
  }

  if (/dashboard|analytics/.test(text)) {
    return "insight-desk";
  }

  const ignored = new Set([
    "build",
    "create",
    "make",
    "generate",
    "design",
    "a",
    "an",
    "the",
    "website",
    "app",
    "clone",
    "for",
    "me",
    "please",
  ]);

  return (
    slugify(text)
      .split("-")
      .filter((word) => !ignored.has(word))
      .slice(0, 3)
      .join("-")
      .slice(0, 36) || "web-studio"
  );
}