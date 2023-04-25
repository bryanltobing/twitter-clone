import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSection, Spinner } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { TweetView } from "~/components/TweetView";

dayjs.extend(relativeTime);

const CreateTweetWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isTweeting } = api.tweets.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.tweets.invalidate();
    },
    onError: (err) => {
      if (err.data?.zodError) {
        const errorMessage = err.data.zodError.fieldErrors.content?.[0];
        if (errorMessage) {
          toast.error(errorMessage);
        }
        return;
      }

      const errorMessage = err.shape?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    },
  });

  if (!user) return null;

  const handleSubmitTweet = () => {
    if (input) {
      mutate({ content: input });
    }
  };

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
        value={input}
        onChange={(evt) => setInput(evt.target.value)}
        disabled={isTweeting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmitTweet();
          }
        }}
      />

      <button onClick={handleSubmitTweet} disabled={isTweeting || !input}>
        {isTweeting ? <Spinner size={20} /> : "Tweet"}
      </button>
    </div>
  );
};

const Feed = () => {
  const {
    data: tweets = [],
    isLoading,
    isError,
  } = api.tweets.getAll.useQuery();

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <div>Something went wrong</div>;
  }

  if (!tweets.length) {
    return <div>There is no tweets just yet</div>;
  }

  return (
    <div className="flex flex-col">
      {tweets.map((tweetWithAuthor) => (
        <TweetView {...tweetWithAuthor} key={tweetWithAuthor.tweet.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();

  api.tweets.getAll.useQuery();

  return (
    <>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full overflow-auto border-x border-slate-400 md:max-w-2xl">
          {isLoaded && (
            <div className="border-b border-slate-400 p-4">
              {!isSignedIn ? <SignInButton /> : <CreateTweetWizard />}
            </div>
          )}

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
