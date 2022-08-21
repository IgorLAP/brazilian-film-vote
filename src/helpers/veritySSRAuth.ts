import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie } from "nookies";

import { auth } from "~/lib/firebase-admin";

export function verifySSRAuth(fn: GetServerSideProps) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<unknown>> => {
    try {
      const { token } = ctx.req.cookies;
      const { resolvedUrl } = ctx;

      if (!token && resolvedUrl !== "/") {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }

      if (token) {
        const { uid } = await auth.verifyIdToken(token);
        const { customClaims } = await auth.getUser(uid);

        if (customClaims?.admin && !resolvedUrl.includes("/admin")) {
          return {
            redirect: {
              destination: "/admin",
              permanent: false,
            },
          };
        }

        if (!customClaims?.admin && !resolvedUrl.includes("/user")) {
          if (resolvedUrl.includes("/profile")) return fn(ctx);

          return {
            redirect: {
              destination: "/user",
              permanent: false,
            },
          };
        }
      }

      return fn(ctx);
    } catch (err) {
      if (err.code === "auth/id-token-expired") {
        destroyCookie(ctx, "token");
        return fn(ctx);
      }
      throw Error(err.message);
    }
  };
}
