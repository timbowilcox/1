import "express-session";

declare module "express-session" {
  interface SessionData {
    /** Set on login/register; the authenticated user's id. */
    userId?: string;
    /**
     * Storage paths this session has legitimately produced (uploads, scrapes,
     * restyle inputs). Used to authorize signed-URL / download requests for
     * transient (pre-save) assets without requiring a logged-in user.
     */
    ownedPaths?: string[];
  }
}
