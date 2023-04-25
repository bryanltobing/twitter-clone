import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import { type MouseEventHandler } from "react";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

type TweetWithAuthor = RouterOutputs["tweets"]["getAll"][number];

type TweetViewProps = TweetWithAuthor;

export const TweetView = (props: TweetViewProps) => {
  const { author, tweet } = props;

  const router = useRouter();

  const handleClickTweetViewContainer: MouseEventHandler<HTMLDivElement> = (
    evt
  ) => {
    if (evt.currentTarget != evt.target) return;

    router.push(`/${author.username}/status/${tweet.id}`);
  };

  return (
    <div
      className="flex cursor-pointer items-center gap-4 border-b border-slate-400 p-4"
      onClick={handleClickTweetViewContainer}
    >
      <Link href={`/${author.username}`}>
        <Image
          src={author.profileImageUrl}
          alt={`${author.username}'s profile picture`}
          width={48}
          height={48}
          className="rounded-full"
        />
      </Link>

      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link
            href={`/${author.username}`}
            className="hover:font-bold hover:text-white"
          >
            <span>{`@${author.username}`}</span>
          </Link>
          ·<span className="font-thin">{dayjs(tweet.createdAt).fromNow()}</span>
        </div>
        <span className="text-xl">{tweet.content}</span>
      </div>
    </div>
  );
};
