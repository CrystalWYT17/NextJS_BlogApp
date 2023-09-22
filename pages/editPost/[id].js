import { useEffect, useState, useRef } from "react";
import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

import "easymde/dist/easymde.min.css";
import { updatePost } from "../../src/graphql/mutations";
import { getPost } from "../../src/graphql/queries";
import { v4 as uuid } from "uuid";

function EditPost() {
  const [post, setPost] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  console.log("id:", id);
  useEffect(() => {
    fetchPosts();
    async function fetchPosts() {
      if (!id) return;
      const postData = await API.graphql({
        query: getPost,
        variables: { id },
      });

      setPost(postData.data.getPost);
    }
  }, [id]);

  if (!post) return null;
  console.log("post:", post);
  function onChange(e) {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }));
  }

  const { title, content } = post;
  async function updateCurrentPost() {
    console.log("title:", title);
    console.log("content:", content);
    if (!title || !content) return;
    const postUpdated = {
      id,
      content,
      title,
    };
    console.log("call updateCurrentPost");
    await API.graphql({
      query: updatePost,
      variables: { input: postUpdated },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    router.push("/myPosts");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        Edit Post
      </h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Enter title"
        value={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full text-gray-500 placeholder-gray-500 y-2"
      />
      <SimpleMDE
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <button
        onClick={updateCurrentPost}
        className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
      >
        Update Post
      </button>
    </div>
  );
}

export default EditPost;
