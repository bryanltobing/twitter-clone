import { type AppType } from "next/app";
import { useEffect, useState } from "react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { Router } from "next/router";
import { LoadingSection } from "~/components/Loading";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const start = () => {
      console.log("start");
      setIsLoading(true);
    };
    const end = () => {
      console.log("findished");
      setIsLoading(false);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Twitter Clone</title>
        <meta name="description" content="Just another clone of twitter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="bottom-center" />

      {isLoading ? <LoadingSection /> : <Component {...pageProps} />}
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
