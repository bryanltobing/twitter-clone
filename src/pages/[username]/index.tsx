import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";

import { LoadingSection } from "~/components/Loading";
import { TweetView } from "~/components/TweetView";
import { PageLayout } from "~/components/layout";
import { serverSideHelpers } from "~/server/helpers/serverSideHelpers";
import { api } from "~/utils/api";

export async function getStaticProps(
  context: GetStaticPropsContext<{ username: string }>
) {
  const username = context.params?.username as string;

  await serverSideHelpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
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

  const { data: tweets = [], isLoading: isLoadingTweets } =
    api.tweets.getAllByAuthorId.useQuery({
      authorId: data.id,
    });

  if (isLoadingTweets) {
    return <LoadingSection />;
  }

  if (!tweets.length) {
    return <p>User has not tweet any tweet</p>;
  }

  return (
    <>
      <Head>
        <title>{`(@${data.username})`} / Twitter</title>
      </Head>

      <PageLayout>
        <div className="h-32 bg-slate-600"></div>

        <Image
          src={data.profileImageUrl}
          alt={`${data.username}'s profile pic`}
          width={128}
          height={128}
          className="-mt-16 ml-8 rounded-full border-2 border-black bg-black"
        />

        <div className="border-b border-slate-400 p-4">
          <h1 className="text-2xl font-bold">{`@${data?.username}`}</h1>
        </div>

        <div className="flex flex-col">
          {tweets.map((tweet) => (
            <TweetView tweet={tweet} author={data} key={tweet.id} />
          ))}
        </div>
      </PageLayout>
    </>
  );
}
