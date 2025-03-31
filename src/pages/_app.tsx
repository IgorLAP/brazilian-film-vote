import "react-toastify/dist/ReactToastify.css";

import React from "react";

import { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";

import { App } from "~/components/App";
import { Provider } from "~/components/ui/provider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <App>
        <Component {...pageProps} />
      </App>
      <ToastContainer newestOnTop />
    </Provider>
  );
}

export default MyApp;
