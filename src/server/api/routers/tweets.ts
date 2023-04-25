import { clerkClient } from "@clerk/nextjs/server";
import type { Tweet } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addAuthorToTweets = async (tweets: Tweet[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: tweets.map((tweet) => tweet.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return tweets.map((tweet) => {
    const author = users.find((user) => user.id === tweet.authorId);

    if (author && author.username) {
      return {
        tweet,
        author: { ...author, username: author.username },
      };
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for tweet not found",
    });
  });
};

// create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const tweetsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tweets = await ctx.prisma.tweet.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });
    return addAuthorToTweets(tweets);
  }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tweet = await ctx.prisma.tweet.findFirst({
        where: { id: input.id },
      });

      if (!tweet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hmm. You seems lost. There is not tweet here",
        });
      }

      const [oneTweet] = await addAuthorToTweets([tweet]);

      return oneTweet;
    }),
  getAllByAuthorId: publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.tweet.findMany({
        where: { authorId: input.authorId },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Slow down in a bit and try again",
        });
      }

      const tweet = await ctx.prisma.tweet.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return tweet;
    }),
});
