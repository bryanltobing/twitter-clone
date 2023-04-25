import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import React from "react";
import { TweetView } from "~/components/TweetView";
import { PageLayout } from "~/components/layout";
import { serverSideHelpers } from "~/server/helpers/serverSideHelpers";
import { api } from "~/utils/api";

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id as string;

  await serverSideHelpers.tweets.getById.prefetch({ id });

  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
      id,
    },
  };
}

export function getStaticPaths(): GetStaticPathsResult {
  return {
    paths: [],
    fallback: "blocking",
  };
}

const SinglePostPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data } = api.tweets.getById.useQuery({ id: props.id });

  if (!data) {
    return <p>You seems lost. Back to home</p>;
  }

  return (
    <>
      <Head>
        <title>
          {data.author.username} on twitter: {data.tweet.content}
        </title>
      </Head>

      <PageLayout>
        <TweetView author={data.author} tweet={data.tweet} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;
