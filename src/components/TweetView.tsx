import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type TweetWithAuthor = RouterOutputs["tweets"]["getAll"][number];

type TweetViewProps = TweetWithAuthor;

export const TweetView = (props: TweetViewProps) => {
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
          <Link
            href={`/${author.username}`}
            className="hover:font-bold hover:text-white"
          >
            <span>{`@${author.username}`}</span>
          </Link>
          ·
          <Link
            href={`/${author.username}/status/${tweet.id}`}
            className="hover:font-bold hover:text-white"
          >
            <span className="font-thin">
              {dayjs(tweet.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-xl">{tweet.content}</span>
      </div>
    </div>
  );
};
