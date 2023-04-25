import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";

import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

export async function getStaticProps(
  context: GetStaticPropsContext<{ username: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const username = context.params?.username as string;

  await helpers.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
}

export function getStaticPaths(): GetStaticPathsResult {
  return {
    paths: ["/bryanltobing"],
    fallback: "blocking",
  };
}

export default function ProfilePage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { username } = props;
  // This query will be immediately available as it's prefetched.
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) {
    return <p>No data found</p>;
  }

  return (
    <>
      <h1>{data?.username}</h1>
    </>
  );
}
