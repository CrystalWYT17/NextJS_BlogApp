"use client";
import Link from "next/link";
import React from "react";
import "../../configureAmplify";
import { useEffect, useState } from "react";
import { Auth, Hub } from "aws-amplify";
import { useRouter } from "next/router";

const Navbar = () => {
  const [signedUser, setSignedUser] = useState(false);
  const myRouter = useRouter();
  const paths = [
    ["Home", "/"],
    ["Create Post", "/createPost"],
    ["Profile", "/profile"],
  ];

  useEffect(() => {
    authListener();
  }, []);

  async function authListener() {
    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signIn":
          return setSignedUser(true);
        case "signOut":
          return setSignedUser(false);
      }
    });
    try {
      await Auth.currentAuthenticatedUser();
      setSignedUser(true);
    } catch (e) {}
  }

  return (
    <nav className="flex justify-center pt-3 pb-3 space-x-4 border-b bg-cyan-500 border-gray-300">
      {paths.map(([title, url], index) => {
        const handleLinkClick = (event) => {
          event.preventDefault();
          myRouter.push(url);
        };

        return (
          <Link href={url} key={index}>
            <a
              onClick={handleLinkClick}
              className="round-lg px-3 py-2 text-slate-700 font-medium hover:bg-slage-100 hover:text-slate-900"
            >
              {title}
            </a>
          </Link>
        );
      })}
      {signedUser && (
        <Link href="/myPosts">
          <a className="round-lg px-3 py-2 text-slate-700 font-medium hover:bg-slage-100 hover:text-slate-900">
            My Posts
          </a>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
