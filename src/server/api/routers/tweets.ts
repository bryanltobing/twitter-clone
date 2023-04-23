import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tweetsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const tweets = await ctx.prisma.tweet.findMany({ take: 100 });
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
        message: "Author for post not found",
      });
    });
  }),
});
