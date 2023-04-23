import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { type RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CreateTweetWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        width={48}
        height={48}
        className="rounded-full"
      />
      <input
        placeholder="What's happening?"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type TweetWithAuthor = RouterOutputs["tweets"]["getAll"][number];

const TweetView = (props: TweetWithAuthor) => {
  const { author, tweet } = props;

  return (
    <div className="flex items-center gap-4 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`${author.username}'s profile picture`}
        width={48}
        height={48}
        className="rounded-full"
      />

      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>·
          <span className="font-thin">{dayjs(tweet.createdAt).fromNow()}</span>
        </div>
        <span>{tweet.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const {
    data: tweets = [],
    isLoading,
    isError,
  } = api.tweets.getAll.useQuery();

  const user = useUser();

  if (isLoading) {
    return <div>Loading the data...</div>;
  }

  if (isError) {
    return <div>Something went wrong</div>;
  }

  if (!tweets.length) {
    return <div>There is no tweets just yet</div>;
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            {!user.isSignedIn ? <SignInButton /> : <CreateTweetWizard />}
          </div>
          <div className="flex flex-col">
            {tweets.map((tweetWithAuthor) => (
              <TweetView {...tweetWithAuthor} key={tweetWithAuthor.author.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
