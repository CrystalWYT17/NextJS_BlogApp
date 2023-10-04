import { postsByUsername } from "../graphql/queries";
import { API, Auth, Storage } from "aws-amplify";
import Link from "next/link";
import { useEffect, useState } from "react";
import Moment from "moment";
import { deletePost as deletePostMutations } from "../graphql/mutations";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { username } = await Auth.currentAuthenticatedUser();
    console.log("username", username);
    const postData = await API.graphql({
      query: postsByUsername,
      variables: { username },
    });
    const { items } = postData.data.postsByUsername;

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

  async function deletePost(id) {
    await API.graphql({
      query: deletePostMutations,
      variables: { input: { id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    fetchPosts();
  }

  console.log("posts: ", posts);
  return (
    <div>
      <h1 className=" text-blue-600 text-3xl font-bold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {/* <Link key={index} href={`/posts/${post.id}`}>
          <div className="cursor-pointer border-b border-gray-300 mt-8 pb-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-500 mt-2">{post.content}</p>
          </div>
        </Link> */}

      {posts.map((post, index) => (
        <div
          className="py-8 px-8 max-w-xxl mx-auto bg-white roundeed-sm:items-center sm:space-y-0 sm:space-x-6 mb-2"
          key={index}
        >
          {post.coverImage && (
            <img
              className="w-36 h-36 bg-contain bg-center rounded-sm"
              alt="image"
              src={post.coverImage}
            />
          )}
          <div className="text-center space-y-2 sm:text-left">
            <div className="space-y-0.5">
              <p className="text-lg text-black font-semibold">{post.title}</p>
              <p className="text-slate-500 font-medium">
                Created on: {Moment(post.createdAt).format("ddd, MMM hh:mm a")}
              </p>
            </div>
            <div className="sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-1">
              <p className="px-4 py-1 text-sm text-purple-600 font hover:text-white hover:bg-purple-600 hover:border-transparent focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                <Link href={`/editPost/${post.id}`}>Edit Post</Link>
              </p>
              <p className="px-4 py-1 text-sm text-purple-600 font hover:text-white hover:bg-purple-600 hover:border-transparent focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                <Link href={`/posts/${post.id}`}>View Post</Link>
              </p>
              <button
                className="text-sm mr-4 text-red-500"
                onClick={() => deletePost(post.id)}
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
