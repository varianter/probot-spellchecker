# Probot Spellchecker

A simple probot which will spellcheck your PRs. Currently supporting just `.md` files. There's no reason it can't support more filetypes, contributions are welcome!

## Setup

```bash
yarn
yarn build
yarn start
```

When the bot is running, you can navigate to `http://localhost:3000/probot`. If you click "Register GitHub App", this will create the app on GitHub, prefilled with the correct options.

At the same time, an `.env`-file (ignored by git) will be created in the project root. The secrets in this file are used to communicate to GitHub, and should not be shared.

## Deployment

This project is supports deployment to [Vercel](https://vercel.com/home). Add secrets from `.env`-file by using the `vercel`-CLI:

```bash
vercel secrets add app-id <your app id>
vercel secrets add webhook-secret <your webhook secret>
vercel secrets add private-key <your private key>
```

If you're having trouble with the `PRIVATE_KEY` from the `.env`-file breaking in the terminal, then you could copy it to a new file (in this case call key) and run:

```bash
vercel secrets add private-key -- "`< key`"
```

Next run `vercel` to publish the probot. The URL printed after you publish is the one you should set as "Webhook URL" in your created [GitHub Apps settings](https://github.com/settings/apps/).
