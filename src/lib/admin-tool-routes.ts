export function getAdminToolBasePath(type: "software" | "online") {
  return type === "software" ? "/admin/software" : "/admin/online-tools";
}

export function getAdminToolEditPath(type: "software" | "online", id: string) {
  return `${getAdminToolBasePath(type)}/${id}`;
}

export function getAdminToolNewPath(type: "software" | "online") {
  return getAdminToolEditPath(type, "new");
}
