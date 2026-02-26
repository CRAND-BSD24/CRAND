/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'static.vecteezy.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false
      };
    }
    
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'encoding': 'encoding',
        'canvas': 'canvas',
        '@tensorflow/tfjs-node': '@tensorflow/tfjs-node'
      });
    }

    config.ignoreWarnings = [
      { module: /node_modules\/@vladmandic\/face-api\/dist\/face-api.esm.js/ }
    ];
    
    return config;
  },
  // No need to transpile these packages with the app directory
  // transpilePackages: [
  //   '@fontsource/geist',
  //   '@fontsource/geist-mono',
  //   '@vladmandic/face-api',
  //   'chart.js',
  //   'react-chartjs-2',
  //   '@radix-ui/react-accordion',
  //   '@radix-ui/react-alert-dialog',
  //   '@radix-ui/react-aspect-ratio',
  //   '@radix-ui/react-avatar',
  //   '@radix-ui/react-checkbox',
  //   '@radix-ui/react-dialog',
  //   '@radix-ui/react-dropdown-menu',
  //   '@radix-ui/react-label',
  //   '@radix-ui/react-popover',
  //   '@radix-ui/react-progress',
  //   '@radix-ui/react-select',
  //   '@radix-ui/react-separator',
  //   '@radix-ui/react-slider',
  //   '@radix-ui/react-slot',
  //   '@radix-ui/react-switch',
  //   '@radix-ui/react-tabs',
  //   '@radix-ui/react-toast',
  //   '@radix-ui/react-tooltip'
  // ]
};

module.exports = nextConfig;
