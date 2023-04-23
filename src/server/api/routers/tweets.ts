import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const tweetsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tweets = await ctx.prisma.tweet.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: tweets.map((tweet) => tweet.authorId),
        limit: 100,
      })
    ).map((user) => ({
      id: user.id,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
    }));

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
  }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const tweet = await ctx.prisma.tweet.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return tweet;
    }),
});
