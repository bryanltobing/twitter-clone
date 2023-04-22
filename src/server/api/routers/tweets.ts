import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tweetsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.tweet.findMany();
  }),
});
