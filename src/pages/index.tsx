import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data: tweets = [] } = api.tweets.getAll.useQuery();

  const user = useUser();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div>{!user.isSignedIn ? <SignInButton /> : <SignOutButton />}</div>
        <div>
          {tweets.map((tweet) => (
            <div key={tweet.id}>{tweet.content}</div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
