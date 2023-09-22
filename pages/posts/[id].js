import { API } from "aws-amplify";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import "../../configureAmplify";
import { listPosts, getPost } from "../../src/graphql/queries";

export default function Post({ post }) {
  console.log("doing Post function");
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading.....</div>;
  }

  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
      <p className="text-sm font-light my-4">By {post.username}</p>
      <div className="mt-8">
        <p reactmarkdown="prose">{post.content}</p>
        {/* <ReactMarkdown className="prose" children={post.content} /> */}
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