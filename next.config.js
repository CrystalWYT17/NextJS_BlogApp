/** @type {import('next').NextConfig} */
const nextConfig = {};

(module.exports = nextConfig),
  {
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: "worker-loader" },
        },
      ],
    },
  };
