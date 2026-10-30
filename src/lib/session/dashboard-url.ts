export function getDashboardResetUrl(url: URL): string | null {
  if (
    url.pathname !== "/admin-dashboard" &&
    url.pathname !== "/teacher-dashboard"
  ) {
    return null;
  }

  const query = new URLSearchParams();
  const entity = url.searchParams.get("entity");

  if (entity) {
    query.set("entity", entity);
  }

  const search = query.toString();
  const nextUrl = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  const currentUrl = `${url.pathname}${url.search}${url.hash}`;

  return nextUrl === currentUrl ? null : nextUrl;
}
