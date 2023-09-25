"use client";
import "../configureAmplify";
import { useState, useEffect } from "react";
import { API, Logger, Storage, graphqlOperation } from "aws-amplify";
import { listPosts } from "../src/graphql/queries";
import Link from "next/link";
import { newOnCreatePost } from "../src/graphql/subscriptions";

const Home = () => {
  const [posts, setPosts] = useState([]);

  let subOnCreate;

  function setUpSubscription() {
    subOnCreate = API.graphql(graphqlOperation(newOnCreatePost)).subscribe({
      next: (postData) => {
        console.log("postData:", postData.value);
      },
    });
    // subOnCreate = API.graphql(graphqlOperation(newOnCreatePost)).subscribe({
    //   next: (posts) => {
    //     console.log("setupsubscribe:", posts);
    //   },
    // });
  }

  useEffect(() => {
    setUpSubscription();
    return () => {
      subOnCreate.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const postData = await API.graphql({
      query: listPosts,
    });
    const { items } = postData.data.listPosts;
    const postWithImages = await Promise.all(
      items.map(async (post) => {
        if (post.coverImage) {
          post.coverImage = await Storage.get(post.coverImage);
        }
        return post;
      })
    );
    setPosts(postWithImages);
  }

  console.log("posts:", posts);
  return (
    <div>
      <h1 className=" text-blue-600 text-3xl font-bold tracking-wide mt-6 mb-2">
        All Posts
      </h1>
      {posts.map((post, index) => (
        <Link key={index} href={`/posts/${post.id}`}>
          <div className="my-6 pb-6 border-b border-gray-300">
            {post.coverImage && (
              <img
                src={post.coverImage}
                className="w-35 h-35 bg-contain bg-center rounded-full sm:mx-0 sm:shrik-0"
                alt="Image"
              />
            )}
            <div className="cursor-pointer mt-2">
              <h2 className="text-xl font-semibold" key={index}>
                {post.title}
              </h2>
              <p className="text-gray-500 mt-2">Author: {post.username}</p>
              {post.comments.items.length > 0 &&
                post.comments.items.map((comment, index) => (
                  <div
                    key={index}
                    className="py-8 px-8 max-w-xl mx-auto bg-white shadow-lg space-y-2 sm:py-1 sm:flex my-6 mx-12 sm:items-center sm:space-y-0 sm:space-x-6 mb-2"
                  >
                    <div>
                      <p className="text-gray-500 mt-2">{comment.message}</p>
                      <p className="text-gray-200 mt-1">{comment.createdBy}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Home;
