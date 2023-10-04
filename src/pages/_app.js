import "../../styles/globals.css";
import Navbar from "./components/navbar";

import { Amplify } from "aws-amplify";
import config from "../aws-exports";

Amplify.configure({ ...config });

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Navbar />
      <div className="py-8 px-16 bg-slate-100">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
