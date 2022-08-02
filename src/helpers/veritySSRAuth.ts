import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";

export function verifySSRAuth(fn: GetServerSideProps) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<unknown>> => {
    const { token } = ctx.req.cookies;

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return fn(ctx);
  };
}
