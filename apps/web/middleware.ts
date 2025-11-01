export { default } from "next-auth/middleware";

// Protect both workspace and builder routes
export const config = {
  matcher: ["/workspace", "/builder"],
};
