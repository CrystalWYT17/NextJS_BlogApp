import { API, Auth, Hub, Storage } from "aws-amplify";
import { useRouter } from "next/router";
// import "../../configureAmplify";
import { listPosts, getPost } from "../../graphql/queries";
import { Children, useEffect, useState } from "react";
import { createComment } from "../../graphql/mutations";
import dynamic from "next/dynamic";
import { v4 as uuid } from "uuid";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = { message: "" };

export default function Post({ post }) {
  const [signedInUser, setSignedInUser] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [comment, setComment] = useState(initialState);
  const [showMe, setShowMe] = useState(false);
  const myRouter = useRouter();
  const { message } = comment;

  function toggle() {
    setShowMe(!showMe);
  }

  useEffect(() => {
    authListener();
    updateCoverImage();
  });

  async function authListener() {
    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signIn":
          return setSignedInUser(true);
        case "signOut":
          return setSignedInUser(false);
      }
    });
    try {
      await Auth.currentAuthenticatedUser();
      setSignedInUser(true);
    } catch (err) {}
  }

  async function updateCoverImage() {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage);
      setCoverImage(imageKey);
    }
  }

  console.log("doing Post function");
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading.....</div>;
  }

  async function createAComment() {
    if (!message) return;
    const id = uuid();
    comment.id = id;

    try {
      await API.graphql({
        query: createComment,
        variables: { input: comment },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    } catch (error) {
      console.log(error);
    }

    router.push("/myPosts");
  }

  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
      {coverImage && <img src={coverImage} className="mt-4" alt="Image" />}
      <p className="text-sm font-light my-4">By {post.username}</p>
      <div className="mt-8">
        <p reactmarkdown="prose">{post.content}</p>
        {/* <ReactMarkdown className="prose">
          <Children>{post.conent}</Children>
        </ReactMarkdown> */}
      </div>
      <div>
        {signedInUser && (
          <button
            type="button"
            className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg"
            onClick={toggle}
          >
            Write A Comment
          </button>
        )}
        {
          <div style={{ display: showMe ? "block" : "none" }}>
            <SimpleMDE
              value={comment.message}
              onChange={(value) =>
                setComment({ ...comment, message: value, postID: post.id })
              }
            />
            <button
              type="button"
              onClick={createAComment}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Save
            </button>
          </div>
        }
      </div>
    </div>
  );
}
export async function getStaticPaths() {
  console.log("doing getStaticPaths");
  const postData = await API.graphql({
    query: listPosts,
  });
  const paths = postData.data.listPosts.items.map((post) => ({
    params: {
      id: post.id,
    },
  }));
  return {
    paths,
    fallback: true,
  };
}

// export async function getServerSideProps(context) {
//   console.log("doing getServerSideProps");
//   const { id } = context.params;
//   const postData = await API.graphql({
//     query: getPost,
//     variables: { id },
//   });
//   return {
//     props: {
//       post: postData.data.getPost,
//     },
//     // revalidate: 1,
//   };
// }

export async function getStaticProps({ params }) {
  console.log("doing getStaticProps");
  const { id } = params;
  const postData = await API.graphql({
    query: getPost,
    variables: { id },
  });
  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 1,
  };
}
