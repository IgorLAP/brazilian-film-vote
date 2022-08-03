import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";

import { firebaseAdmin } from "~/lib/firebase-admin";

export function verifySSRAuth(fn: GetServerSideProps) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<unknown>> => {
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
      const auth = firebaseAdmin.auth();
      const { uid } = await auth.verifyIdToken(token);
      const { customClaims } = await auth.getUser(uid);

      if (customClaims?.admin && resolvedUrl !== "/admin") {
        return {
          redirect: {
            destination: "/admin",
            permanent: false,
          },
        };
      }

      if (!customClaims?.admin && resolvedUrl !== "/profile") {
        return {
          redirect: {
            destination: "/profile",
            permanent: false,
          },
        };
      }
    }

    return fn(ctx);
  };
}