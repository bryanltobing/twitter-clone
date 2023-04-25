import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../api/root";
import { prisma } from "../db";
import SuperJSON from "superjson";

export const serverSideHelpers = createServerSideHelpers({
  router: appRouter,
  ctx: { prisma, userId: null },
  transformer: SuperJSON,
});
