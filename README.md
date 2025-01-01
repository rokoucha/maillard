# Maillard

Browning reaction / inspired by ci7lus/caramelize.

![Maillard](https://scrapbox.io/files/672f98e8d5e96e3e960cc1a4.png)

Cosense [なのに] knowledge base

Description: [Maillard: Re Caramelize](https://rokoucha.net/Maillard:%20Re%20Caramelize)

## How to build

- `git clone https://github.com/rokoucha/maillard.git`
- `cd maillard`
- `pnpm i`
- Set environments
- `pnpm run build`

## Environments

| name                  | required? | description                    |
| --------------------- | --------- | ------------------------------ |
| BASE_URL              | ○         | Base URL of Maillard to deploy |
| SCRAPBOX_API_URL      |           | Scrapbox API URL               |
| SCRAPBOX_COLLECT_PAGE |           | Page title of to collect       |
| SCRAPBOX_CONNECT_SID  |           | Scrapbox session cookie        |
| SCRAPBOX_INDEX_PAGE   | ○         | Page title of index page       |
| SCRAPBOX_PROJECT      | ○         | Project name of Cosense        |
| SCRAPBOX_PROXY_TTL    |           | TTL of proxying Scrapbox API   |
| SITE_LANG             |           | Language of site               |
| SITE_NAME             | ○         | Name of site                   |
| WEBHOOK_URL           |           | Webhook URL                    |
| WEBHOOK_TIMEOUT       |           | Timeout of webhook(ms)         |

## License

Copyright (c) 2023 Rokoucha

Released under the MIT license, see LICENSE.
