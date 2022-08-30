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

        if (resolvedUrl.includes("/profile")) return fn(ctx);
        if (resolvedUrl.includes("/list/")) return fn(ctx);

        if (customClaims?.admin && !resolvedUrl.includes("/admin")) {
          return {
            redirect: {
              destination: "/admin",
              permanent: false,
            },
          };
        }

        if (!customClaims?.admin && !resolvedUrl.includes("/user")) {
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
      destroyCookie(ctx, "token");
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  };
}
