// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Anvil Protocol",
  tagline: "Mint a promise",
  url: "https://docs.nftanvil.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/anvillogo.svg",
  organizationName: "VVV DAO", // Usually your GitHub org/user name.
  projectName: "anvildocs", // Usually your repo name.
  themes: ["@docusaurus/theme-live-codeblock"],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          //editUrl: false
          //"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },

        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
      },
      navbar: {
        title: "Anvil Protocol",
        logo: {
          alt: "Anvil Logo",
          src: "img/anvillogo.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Intro",
          },
          {
            type: "doc",
            docId: "sdk/motoko",
            position: "left",
            label: "Motoko",
          },
          {
            type: "doc",
            docId: "sdk/js",
            position: "left",
            label: "Js",
          },
          {
            type: "doc",
            docId: "sdk/react",
            position: "left",
            label: "React",
          },
          {
            type: "doc",
            docId: "sdk/cli",
            position: "left",
            label: "Cli",
          },
          {
            href: "https://github.com/infu/nftanvil",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Mint",
                to: "https://nftanvil.com/mint",
              },
              {
                label: "Intro",
                to: "/docs/intro",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/apPegYBhBC",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/nftanvil",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Dashboard",
                to: "https://nftanvil.com/dashboard",
              },
              {
                label: "History",
                to: "https://nftanvil.com/history",
              },
              {
                label: "GitHub",
                href: "https://github.com/infu/nftanvil",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VVV DAO`,
      },
      prism: {
        // theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
